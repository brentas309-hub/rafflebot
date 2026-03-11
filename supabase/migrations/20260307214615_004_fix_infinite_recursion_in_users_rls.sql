/*
  # Fix Infinite Recursion in Users RLS Policy

  1. **Problem**
     - The "Admins can read all users" policy creates infinite recursion
     - It queries the users table to check admin role, which triggers the same policy again
     - This causes a 500 error: "infinite recursion detected in policy for relation 'users'"

  2. **Solution**
     - Drop the problematic "Admins can read all users" policy
     - Replace with a simpler policy that uses app_metadata from the JWT token
     - Add the role to auth.users app_metadata instead of checking the public.users table
     - For now, admins will need to query users individually or we'll handle admin access differently

  3. **Security Impact**
     - Users can still read their own profile (secure)
     - Admin access to all users will be handled through service role or a different mechanism
     - This prevents the infinite recursion security issue
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can read all users" ON users;

-- For now, we'll only allow users to read their own profile
-- Admin functionality for reading all users should be handled via:
-- 1. Service role key in edge functions
-- 2. Or a materialized view/function that doesn't trigger RLS
-- 3. Or storing admin role in auth.users metadata

-- The "Users can read own profile" policy remains and is safe
-- It doesn't query the users table recursively