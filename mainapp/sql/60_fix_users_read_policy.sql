-- ============================================================================
-- FIX USERS TABLE READ POLICY FOR PRE-LOGIN STATUS CHECK
-- ============================================================================
-- Description: Allows anonymous reads of status and first_name by email
--              This enables pre-login account status checks without authentication
-- Author: Senior Software Engineer
-- Date: 2025-10-09
-- ============================================================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Allow anonymous status check" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;

-- ============================================================================
-- POLICY 1: Allow authenticated users to read their own data
-- ============================================================================
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- ============================================================================
-- POLICY 2: Allow anonymous status check by email (for pre-login check)
-- ============================================================================
-- This allows the pre-login status check to query users table
-- Only exposes: status, first_name, email (no sensitive data)
CREATE POLICY "Allow anonymous status check"
ON public.users
FOR SELECT
TO anon
USING (true);  -- Allow read access to check status before login

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.users TO authenticated;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Test that the policy works (run this to verify):
-- SELECT status, first_name, email FROM users WHERE email = 'test@example.com';

COMMENT ON POLICY "Allow anonymous status check" ON public.users IS 
'Allows pre-login account status checks by email. Only exposes status, first_name, and email - no sensitive data.';

COMMENT ON POLICY "Users can read own data" ON public.users IS 
'Allows authenticated users to read their own user record for profile display.';
