/*
  # Fix Security Audit Issues

  1. **Function Search Path Security Issue**
     - The `is_admin()` function has a mutable search_path vulnerability
     - Fix: Set search_path explicitly in the function to prevent schema injection attacks
     - Add `SET search_path = public, pg_temp` to lock down the search path

  2. **Leaked Password Protection**
     - Enable HaveIBeenPwned password leak protection in Supabase Auth
     - This prevents users from using compromised passwords
     - Configuration is handled at the Supabase project level

  3. **Security Enhancement**
     - The function remains SECURITY DEFINER but is now protected against search_path attacks
     - This prevents malicious users from creating functions in other schemas that could be executed
*/

-- Fix the is_admin function with secure search_path
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   STABLE
   SET search_path = public, pg_temp;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
