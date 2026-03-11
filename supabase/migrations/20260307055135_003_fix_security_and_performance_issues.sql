/*
  # Fix Security and Performance Issues

  1. **Add Missing Foreign Key Indexes**
     - Add index on `draw_audit.admin_id`
     - Add index on `raffles.created_by`
     - Add index on `winners.ticket_id`
     - Add index on `winners.user_id`

  2. **Optimize RLS Policies**
     - Update all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
     - This prevents re-evaluation for each row and improves query performance at scale

  3. **Notes**
     - Unused indexes are kept as they will be needed once the application has production traffic
     - Auth DB connection strategy and leaked password protection must be configured in Supabase Dashboard settings
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_draw_audit_admin_id ON draw_audit(admin_id);
CREATE INDEX IF NOT EXISTS idx_raffles_created_by ON raffles(created_by);
CREATE INDEX IF NOT EXISTS idx_winners_ticket_id ON winners(ticket_id);
CREATE INDEX IF NOT EXISTS idx_winners_user_id ON winners(user_id);

-- Drop existing RLS policies to recreate them with optimized auth checks
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can create raffles" ON raffles;
DROP POLICY IF EXISTS "Admins can update raffles" ON raffles;
DROP POLICY IF EXISTS "Orders readable by own user or admin" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Draw audit readable by admins" ON draw_audit;
DROP POLICY IF EXISTS "Draw audit writable by service functions" ON draw_audit;

-- Recreate users table policies with optimized auth checks
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Recreate raffles policies with optimized auth checks
CREATE POLICY "Admins can create raffles"
  ON raffles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update raffles"
  ON raffles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Recreate orders policies with optimized auth checks
CREATE POLICY "Orders readable by own user or admin"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Recreate draw_audit policies with optimized auth checks
CREATE POLICY "Draw audit readable by admins"
  ON draw_audit
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Draw audit writable by service functions"
  ON draw_audit
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );
