/*
  # Fix RLS Performance and Database Optimization

  1. **RLS Performance Issues**
     - Problem: payment_splits policies re-evaluate auth.uid() for each row
     - Solution: Use (SELECT auth.uid()) to evaluate once per query instead of per row
     - Affected policies: "Admins can view all payment splits" and "Admins can create payment splits"
     - Performance Impact: Significant improvement at scale

  2. **Unused Index Cleanup**
     - Remove 19 unused indexes that consume storage and slow down writes
     - Indexes are not being used by any queries in the current application
     - Tables affected: raffles, tickets, orders, winners, draw_audit, payment_splits, clubs
     - Note: Indexes can be recreated later if query patterns change

  3. **Security**
     - All RLS policies remain restrictive and secure
     - Only optimizing performance, not changing security logic
*/

-- ============================================================================
-- FIX RLS PERFORMANCE ISSUES
-- ============================================================================

-- Drop and recreate payment_splits policies with optimized auth.uid() calls
DROP POLICY IF EXISTS "Admins can view all payment splits" ON payment_splits;
DROP POLICY IF EXISTS "Admins can create payment splits" ON payment_splits;

-- Optimized policy using (SELECT auth.uid()) instead of auth.uid()
-- This evaluates the function once per query instead of once per row
CREATE POLICY "Admins can view all payment splits"
  ON payment_splits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can create payment splits"
  ON payment_splits FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- REMOVE UNUSED INDEXES
-- ============================================================================

-- Raffles table indexes (5 unused)
DROP INDEX IF EXISTS idx_raffles_club_id;
DROP INDEX IF EXISTS idx_raffles_status;
DROP INDEX IF EXISTS idx_raffles_created_by;

-- Tickets table indexes (3 unused)
DROP INDEX IF EXISTS idx_tickets_raffle_id;
DROP INDEX IF EXISTS idx_tickets_status;
DROP INDEX IF EXISTS idx_tickets_user_id;

-- Orders table indexes (2 unused)
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_orders_raffle_id;

-- Winners table indexes (3 unused)
DROP INDEX IF EXISTS idx_winners_raffle_id;
DROP INDEX IF EXISTS idx_winners_ticket_id;
DROP INDEX IF EXISTS idx_winners_user_id;

-- Draw audit table indexes (2 unused)
DROP INDEX IF EXISTS idx_draw_audit_raffle_id;
DROP INDEX IF EXISTS idx_draw_audit_admin_id;

-- Payment splits table indexes (3 unused)
DROP INDEX IF EXISTS idx_payment_splits_order_id;
DROP INDEX IF EXISTS idx_payment_splits_club_id;
DROP INDEX IF EXISTS idx_payment_splits_referrer_club_id;

-- Clubs table indexes (3 unused)
DROP INDEX IF EXISTS idx_clubs_referred_by;
DROP INDEX IF EXISTS idx_clubs_subscription_status;
DROP INDEX IF EXISTS idx_clubs_subscription_ends_at;
