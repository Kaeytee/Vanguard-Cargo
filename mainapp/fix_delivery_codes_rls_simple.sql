-- ============================================================================
-- SIMPLIFIED FIX FOR DELIVERY CODES RLS
-- ============================================================================
-- This script fixes RLS on the delivery_codes table specifically
-- Run this in Supabase SQL Editor
-- 
-- Author: Senior Software Engineer
-- Date: October 8, 2025
-- ============================================================================

-- Step 1: Enable RLS on delivery_codes table
-- ============================================================================
ALTER TABLE public.delivery_codes ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing policies
-- ============================================================================
DROP POLICY IF EXISTS "users_select_own_codes" ON public.delivery_codes;
DROP POLICY IF EXISTS "Users can view their own delivery codes" ON public.delivery_codes;
DROP POLICY IF EXISTS "authenticated_view_codes" ON public.delivery_codes;
DROP POLICY IF EXISTS "service_role_all_delivery_codes" ON public.delivery_codes;
DROP POLICY IF EXISTS "authenticated_insert_codes" ON public.delivery_codes;

-- Step 3: Create policy for users to SELECT their own codes
-- ============================================================================
CREATE POLICY "users_select_own_codes"
ON public.delivery_codes
FOR SELECT
TO authenticated
USING (
    -- Users can only see codes for packages they own
    package_id IN (
        SELECT id FROM public.packages WHERE user_id = auth.uid()
    )
);

-- Step 4: Create policy for service_role to have full access
-- ============================================================================
CREATE POLICY "service_role_all_delivery_codes"
ON public.delivery_codes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Step 5: Create policy for authenticated users to INSERT codes
-- ============================================================================
CREATE POLICY "authenticated_insert_codes"
ON public.delivery_codes
FOR INSERT
TO authenticated
WITH CHECK (
    -- Users can insert codes for packages they own
    package_id IN (
        SELECT id FROM public.packages WHERE user_id = auth.uid()
    )
);

-- Step 6: Grant permissions
-- ============================================================================
GRANT SELECT, INSERT ON public.delivery_codes TO authenticated;
GRANT ALL ON public.delivery_codes TO service_role;

-- Step 7: Ensure RPC function has SECURITY DEFINER
-- ============================================================================
ALTER FUNCTION public.get_customer_delivery_codes(UUID) SECURITY DEFINER;
ALTER FUNCTION public.get_customer_delivery_codes(UUID) SET search_path = '';
GRANT EXECUTE ON FUNCTION public.get_customer_delivery_codes(UUID) TO authenticated;

-- Step 8: Verify the setup
-- ============================================================================
-- Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity AS "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'delivery_codes';

-- Check policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd AS operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'delivery_codes'
ORDER BY policyname;

-- Check function security
SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    p.prosecdef AS "Security Definer"
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'get_customer_delivery_codes';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ DELIVERY CODES RLS FIX COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Refresh your browser (Ctrl+Shift+R)';
    RAISE NOTICE '2. Go to Package Intake page';
    RAISE NOTICE '3. Check console for delivery codes appearing';
    RAISE NOTICE '4. You should see: dataLength > 0';
END $$;
