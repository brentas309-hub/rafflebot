/*
  # Fix All Recursive Admin Role Checks

  1. **Problem**
     - Multiple RLS policies check admin role by querying the users table
     - This creates potential for infinite recursion in policies
     - Affected policies: raffles (insert/update), orders (select), draw_audit (select/insert)

  2. **Solution**
     - Add a PostgreSQL function that safely checks admin role
     - Use a security definer function to bypass RLS when checking role
     - Update all policies to use this function instead of direct queries

  3. **Security**
     - The function is marked as SECURITY DEFINER to bypass RLS
     - It only returns a boolean and cannot be exploited to read user data
     - All policies remain restrictive and secure
*/

-- Create a secure function to check if current user is admin
-- SECURITY DEFINER allows it to bypass RLS when checking the users table
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing policies that use recursive checks
DROP POLICY IF EXISTS "Admins can create raffles" ON raffles;
DROP POLICY IF EXISTS "Admins can update raffles" ON raffles;
DROP POLICY IF EXISTS "Orders readable by own user or admin" ON orders;
DROP POLICY IF EXISTS "Draw audit readable by admins" ON draw_audit;
DROP POLICY IF EXISTS "Draw audit writable by service functions" ON draw_audit;

-- Recreate raffles policies using the safe function
CREATE POLICY "Admins can create raffles"
  ON raffles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update raffles"
  ON raffles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Recreate orders policy using the safe function
CREATE POLICY "Orders readable by own user or admin"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) OR is_admin());

-- Recreate draw_audit policies using the safe function
CREATE POLICY "Draw audit readable by admins"
  ON draw_audit
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Draw audit writable by service functions"
  ON draw_audit
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());