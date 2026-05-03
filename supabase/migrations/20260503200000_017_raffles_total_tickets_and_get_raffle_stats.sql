/*
  # Align raffles with migration 001 and fix get_raffle_stats

  Migration 001 defines the raffle pool size column as `total_tickets` (integer, NOT NULL in a fresh install).
  Some databases were created without this column; get_raffle_stats then fails with:
    column r.total_tickets does not exist (SQLSTATE 42703)

  This migration:
  1. Adds `public.raffles.total_tickets` when it is missing.
  2. Backfills sensible values where possible, then a safe default.
  3. Recreates `public.get_raffle_stats` reading `total_tickets` and `draw_timestamp` from `raffles` per 001.
*/

ALTER TABLE public.raffles
  ADD COLUMN IF NOT EXISTS total_tickets integer;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'raffles'
      AND column_name = 'tickets_remaining'
  )
     AND EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'purchases'
  ) THEN
    UPDATE public.raffles r
    SET total_tickets = GREATEST(
      1,
      COALESCE(
        r.total_tickets,
        COALESCE(r.tickets_remaining, 0) + COALESCE(
          (SELECT SUM(p.quantity)::integer FROM public.purchases p WHERE p.raffle_id = r.id),
          0
        )
      )
    )
    WHERE r.total_tickets IS NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'raffles'
      AND column_name = 'tickets_remaining'
  ) THEN
    UPDATE public.raffles r
    SET total_tickets = GREATEST(1, COALESCE(r.total_tickets, COALESCE(r.tickets_remaining, 0)))
    WHERE r.total_tickets IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'tickets'
  ) THEN
    UPDATE public.raffles r
    SET total_tickets = GREATEST(
      1,
      COALESCE(r.total_tickets, (SELECT COUNT(*)::integer FROM public.tickets t WHERE t.raffle_id = r.id))
    )
    WHERE r.total_tickets IS NULL;
  END IF;

  UPDATE public.raffles
  SET total_tickets = 100
  WHERE total_tickets IS NULL OR total_tickets < 1;
END$$;

ALTER TABLE public.raffles
  ADD COLUMN IF NOT EXISTS draw_timestamp timestamptz;

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
  -- Column names match 001_create_initial_schema.sql (raffles.total_tickets, raffles.draw_timestamp)
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
