/*
  # get_raffle_stats: use public.purchases (Bolt / minimal schema)

  Live projects may only have `public.purchases`, not `public.raffle_purchases` (migration 010).

  Column mapping (app / typical Bolt row shape vs migration 010 raffle_purchases):
  - raffle_purchases.ticket_quantity  -> purchases.quantity
  - raffle_purchases.total_amount_cents -> purchases.amount  (treat as integer cents for stats)
  - raffle_purchases.buyer_email      -> purchases.email

  The function return shape is unchanged so callers (e.g. PublicRafflePage) stay compatible.
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
    COALESCE(SUM(p.amount), 0)::bigint AS total_raised_cents,
    COALESCE(SUM(p.quantity), 0)::bigint AS tickets_sold,
    (v_total_tickets - COALESCE(SUM(p.quantity), 0))::integer AS tickets_remaining,
    COUNT(DISTINCT p.email)::bigint AS supporter_count,
    CASE
      WHEN v_draw IS NULL THEN 0
      ELSE GREATEST(0, EXTRACT(DAY FROM (v_draw - now()))::integer)
    END AS days_remaining
  FROM public.purchases p
  WHERE p.raffle_id = p_raffle_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_raffle_stats(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_raffle_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_raffle_stats(uuid) TO service_role;
