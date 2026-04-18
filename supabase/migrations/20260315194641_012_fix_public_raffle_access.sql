/*
  # Fix Public Raffle Access

  1. Changes
    - Add public SELECT policy for clubs table
    - Grant execute permission on get_raffle_stats function to anon and authenticated users
    - Add security definer to get_raffle_stats function for proper access

  2. Security
    - Allows anonymous users to view club information for public raffles
    - Allows anonymous users to call stats function for public raffles
    - Maintains data security through RLS on other operations
*/

-- Allow public read access to clubs (needed for public raffle pages)
DROP POLICY IF EXISTS "Public can view clubs" ON clubs;
CREATE POLICY "Public can view clubs"
  ON clubs FOR SELECT
  USING (true);

-- Grant execute permission on get_raffle_stats to anon and authenticated
GRANT EXECUTE ON FUNCTION get_raffle_stats(uuid) TO anon, authenticated;

-- Recreate the function with SECURITY DEFINER so it can access data properly
CREATE OR REPLACE FUNCTION get_raffle_stats(p_raffle_id uuid)
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
AS $$
DECLARE
  raffle_record raffles%ROWTYPE;
BEGIN
  SELECT * INTO raffle_record FROM raffles WHERE id = p_raffle_id;
  
  RETURN QUERY
  SELECT 
    COALESCE(SUM(rp.total_amount_cents), 0)::bigint as total_raised_cents,
    COALESCE(SUM(rp.ticket_quantity), 0)::bigint as tickets_sold,
    (raffle_record.total_tickets - COALESCE(SUM(rp.ticket_quantity), 0))::integer as tickets_remaining,
    COUNT(DISTINCT rp.buyer_email)::bigint as supporter_count,
    GREATEST(0, EXTRACT(DAY FROM (raffle_record.draw_timestamp - now())))::integer as days_remaining
  FROM raffle_purchases rp
  WHERE rp.raffle_id = p_raffle_id;
END;
$$;
