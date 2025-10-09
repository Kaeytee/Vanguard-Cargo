-- ============================================================================
-- FIX DELIVERY CODES RLS POLICIES
-- ============================================================================
-- This script fixes Row Level Security (RLS) policies on the package_codes
-- or delivery_codes table to allow users to view their own delivery codes.
-- 
-- PROBLEM: Delivery codes are being created but users can't retrieve them
-- CAUSE: Missing or incorrect RLS policies on the codes table
-- 
-- SOLUTION: 
-- 1. Enable RLS on the table if not enabled
-- 2. Create policies allowing users to read their own codes
-- 3. Allow service_role full access for admin operations
-- 4. Ensure RPC function has proper SECURITY DEFINER setting
-- 
-- Author: Senior Software Engineer
-- Date: October 8, 2025
-- ============================================================================

-- Step 1: Check if package_codes table exists and enable RLS
-- ============================================================================
DO $$
BEGIN
    -- Enable RLS on package_codes if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'package_codes') THEN
        ALTER TABLE public.package_codes ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS enabled on package_codes table';
    END IF;
    
    -- Enable RLS on delivery_codes if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'delivery_codes') THEN
        ALTER TABLE public.delivery_codes ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS enabled on delivery_codes table';
    END IF;
END $$;

-- Step 2: Drop existing policies that might be causing issues
-- ============================================================================
DO $$
BEGIN
    -- Drop policies on package_codes if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'package_codes') THEN
        DROP POLICY IF EXISTS "Users can view their own package codes" ON public.package_codes;
        DROP POLICY IF EXISTS "users_view_own_codes" ON public.package_codes;
        DROP POLICY IF EXISTS "authenticated_view_codes" ON public.package_codes;
        DROP POLICY IF EXISTS "service_role_all_package_codes" ON public.package_codes;
        RAISE NOTICE '✅ Dropped old policies on package_codes';
    END IF;
    
    -- Drop policies on delivery_codes if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'delivery_codes') THEN
        DROP POLICY IF EXISTS "Users can view their own delivery codes" ON public.delivery_codes;
        DROP POLICY IF EXISTS "users_view_own_codes" ON public.delivery_codes;
        DROP POLICY IF EXISTS "authenticated_view_codes" ON public.delivery_codes;
        DROP POLICY IF EXISTS "service_role_all_delivery_codes" ON public.delivery_codes;
        RAISE NOTICE '✅ Dropped old policies on delivery_codes';
    END IF;
END $$;

-- Step 3: Create new RLS policies for package_codes table
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'package_codes') THEN
        
        -- Policy 1: Users can SELECT their own codes (via package relationship)
        CREATE POLICY "users_select_own_codes"
        ON public.package_codes
        FOR SELECT
        TO authenticated
        USING (
            -- Match via package relationship - package_codes links to packages via package_id
            package_id IN (
                SELECT id FROM public.packages WHERE user_id = auth.uid()
            )
        );
        
        -- Policy 2: Service role has full access
        CREATE POLICY "service_role_all_package_codes"
        ON public.package_codes
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
        
        -- Policy 3: Authenticated users can INSERT codes (for code generation)
        CREATE POLICY "authenticated_insert_codes"
        ON public.package_codes
        FOR INSERT
        TO authenticated
        WITH CHECK (
            -- Allow insert if user owns the package
            package_id IN (
                SELECT id FROM public.packages WHERE user_id = auth.uid()
            )
        );
        
        RAISE NOTICE '✅ Created RLS policies for package_codes';
    END IF;
END $$;

-- Step 4: Create new RLS policies for delivery_codes table (if it exists instead)
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'delivery_codes') THEN
        
        -- Policy 1: Users can SELECT their own codes (via package relationship only)
        CREATE POLICY "users_select_own_codes"
        ON public.delivery_codes
        FOR SELECT
        TO authenticated
        USING (
            -- Match via package relationship - delivery_codes links to packages via package_id
            package_id IN (
                SELECT id FROM public.packages WHERE user_id = auth.uid()
            )
        );
        
        -- Policy 2: Service role has full access
        CREATE POLICY "service_role_all_delivery_codes"
        ON public.delivery_codes
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
        
        -- Policy 3: Authenticated users can INSERT codes (for code generation)
        CREATE POLICY "authenticated_insert_codes"
        ON public.delivery_codes
        FOR INSERT
        TO authenticated
        WITH CHECK (
            -- Allow insert if user owns the package
            package_id IN (
                SELECT id FROM public.packages WHERE user_id = auth.uid()
            )
        );
        
        RAISE NOTICE '✅ Created RLS policies for delivery_codes';
    END IF;
END $$;

-- Step 5: Ensure get_customer_delivery_codes function has SECURITY DEFINER
-- ============================================================================
-- This allows the function to bypass RLS and run with elevated privileges
DO $$
BEGIN
    -- Check if function exists and alter it
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'get_customer_delivery_codes'
    ) THEN
        -- Set security definer to run with creator's privileges
        ALTER FUNCTION public.get_customer_delivery_codes(UUID) SECURITY DEFINER;
        
        -- Set search_path for security
        ALTER FUNCTION public.get_customer_delivery_codes(UUID) SET search_path = '';
        
        RAISE NOTICE '✅ Updated get_customer_delivery_codes function security settings';
    ELSE
        RAISE NOTICE '⚠️  Function get_customer_delivery_codes not found - may need to be created';
    END IF;
END $$;

-- Step 6: Grant necessary permissions
-- ============================================================================
DO $$
BEGIN
    -- Grant SELECT on package_codes to authenticated users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'package_codes') THEN
        GRANT SELECT, INSERT ON public.package_codes TO authenticated;
        GRANT ALL ON public.package_codes TO service_role;
        RAISE NOTICE '✅ Granted permissions on package_codes';
    END IF;
    
    -- Grant SELECT on delivery_codes to authenticated users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'delivery_codes') THEN
        GRANT SELECT, INSERT ON public.delivery_codes TO authenticated;
        GRANT ALL ON public.delivery_codes TO service_role;
        RAISE NOTICE '✅ Granted permissions on delivery_codes';
    END IF;
    
    -- Grant EXECUTE on the RPC function to authenticated users
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'get_customer_delivery_codes'
    ) THEN
        GRANT EXECUTE ON FUNCTION public.get_customer_delivery_codes(UUID) TO authenticated;
        RAISE NOTICE '✅ Granted EXECUTE permission on get_customer_delivery_codes';
    END IF;
END $$;

-- Step 7: Verification queries
-- ============================================================================
-- Run these queries to verify the fix worked

-- Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity AS "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('package_codes', 'delivery_codes')
ORDER BY tablename;

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
  AND tablename IN ('package_codes', 'delivery_codes')
ORDER BY tablename, policyname;

-- Check function security settings
SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    p.prosecdef AS "Security Definer",
    CASE 
        WHEN proconfig IS NOT NULL THEN 
            (SELECT string_agg(config, ', ') 
             FROM unnest(proconfig) AS config 
             WHERE config LIKE 'search_path%')
        ELSE 'NOT SET'
    END AS search_path_config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'get_customer_delivery_codes';

-- ============================================================================
-- END OF FIX SCRIPT
-- ============================================================================

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ DELIVERY CODES RLS FIX COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Test by logging in as a regular user';
    RAISE NOTICE '2. Check if delivery codes now appear';
    RAISE NOTICE '3. Check browser console for any remaining errors';
    RAISE NOTICE '4. If still issues, check the verification queries above';
    RAISE NOTICE '';
    RAISE NOTICE 'TROUBLESHOOTING:';
    RAISE NOTICE '- If codes still dont show, the table might have a different name';
    RAISE NOTICE '- Check Supabase Table Editor to see actual table name';
    RAISE NOTICE '- Check if user_id column exists in the codes table';
    RAISE NOTICE '- Verify codes are actually being created with correct user_id';
END $$;
