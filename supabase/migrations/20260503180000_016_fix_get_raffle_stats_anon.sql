/*
  # Fix get_raffle_stats for anonymous (PostgREST / anon key) callers

  Common causes of failure
  - EXECUTE not granted to role `anon` (PostgREST rejects the call or returns an error).
  - Function is not SECURITY DEFINER, so internal reads on `raffles` / `raffle_purchases`
    still evaluate RLS as the invoker and can fail for anonymous sessions.
  - Missing search_path on SECURITY DEFINER functions (hardening; avoids wrong-schema resolution).

  This migration replaces the function and reapplies grants so ticket stats load on the public page.
*/

CREATE OR REPLACE FUNCTION public.get_raffle_stats(p_raffle_id uuid)
RETURNS TABLE (
  total_raised_cents bigint,
  tickets_sold bigint,
  tickets_remaining integer,
  supporter_count bigint,
  days_remaining integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_total_tickets integer;
  v_draw timestamptz;
BEGIN
  SELECT r.total_tickets, r.draw_timestamp
  INTO v_total_tickets, v_draw
  FROM public.raffles r
  WHERE r.id = p_raffle_id;

  IF NOT FOUND OR v_total_tickets IS NULL THEN
    RETURN QUERY
    SELECT
      0::bigint,
      0::bigint,
      0::integer,
      0::bigint,
      0::integer;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(SUM(rp.total_amount_cents), 0)::bigint AS total_raised_cents,
    COALESCE(SUM(rp.ticket_quantity), 0)::bigint AS tickets_sold,
    (v_total_tickets - COALESCE(SUM(rp.ticket_quantity), 0))::integer AS tickets_remaining,
    COUNT(DISTINCT rp.buyer_email)::bigint AS supporter_count,
    CASE
      WHEN v_draw IS NULL THEN 0
      ELSE GREATEST(0, EXTRACT(DAY FROM (v_draw - now()))::integer)
    END AS days_remaining
  FROM public.raffle_purchases rp
  WHERE rp.raffle_id = p_raffle_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_raffle_stats(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_raffle_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_raffle_stats(uuid) TO service_role;
