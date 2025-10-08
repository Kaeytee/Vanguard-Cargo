-- ============================================================================
-- DIAGNOSTIC SCRIPT FOR DELIVERY CODES ISSUE
-- ============================================================================
-- This script helps identify why delivery codes are not showing up
-- Run this in Supabase SQL Editor to diagnose the problem
-- 
-- Author: Senior Software Engineer
-- Date: October 8, 2025
-- ============================================================================

-- ============================================================================
-- STEP 1: Find tables related to delivery/package codes
-- ============================================================================
\echo '========================================';
\echo 'STEP 1: Finding tables related to codes';
\echo '========================================';

SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (
    table_name LIKE '%code%'
    OR table_name LIKE '%delivery%'
    OR table_name LIKE '%pickup%'
  )
ORDER BY table_name;

-- ============================================================================
-- STEP 2: Check if specific tables exist
-- ============================================================================
\echo '';
\echo '========================================';
\echo 'STEP 2: Checking specific tables';
\echo '========================================';

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'package_codes') THEN
        RAISE NOTICE '✅ Table "package_codes" EXISTS';
    ELSE
        RAISE NOTICE '❌ Table "package_codes" DOES NOT EXIST';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'delivery_codes') THEN
        RAISE NOTICE '✅ Table "delivery_codes" EXISTS';
    ELSE
        RAISE NOTICE '❌ Table "delivery_codes" DOES NOT EXIST';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pickup_codes') THEN
        RAISE NOTICE '✅ Table "pickup_codes" EXISTS';
    ELSE
        RAISE NOTICE '❌ Table "pickup_codes" DOES NOT EXIST';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: Get table structure for package_codes (if exists)
-- ============================================================================
\echo '';
\echo '========================================';
\echo 'STEP 3: Package Codes Table Structure';
\echo '========================================';

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'package_codes') THEN
        RAISE NOTICE 'Columns in package_codes table:';
    END IF;
END $$;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'package_codes'
ORDER BY ordinal_position;

-- ============================================================================
-- STEP 4: Check RLS status on code tables
-- ============================================================================
\echo '';
\echo '========================================';
\echo 'STEP 4: RLS Status';
\echo '========================================';

SELECT 
    schemaname,
    tablename,
    rowsecurity AS "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND (
    tablename LIKE '%code%'
    OR tablename LIKE '%delivery%'
    OR tablename LIKE '%pickup%'
  )
ORDER BY tablename;

-- ============================================================================
-- STEP 5: Check existing RLS policies
-- ============================================================================
\echo '';
\echo '========================================';
\echo 'STEP 5: Existing RLS Policies';
\echo '========================================';

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd AS operation,
    qual AS using_expression,
    with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    tablename LIKE '%code%'
    OR tablename LIKE '%delivery%'
    OR tablename LIKE '%pickup%'
  )
ORDER BY tablename, policyname;

-- ============================================================================
-- STEP 6: Check if RPC function exists
-- ============================================================================
\echo '';
\echo '========================================';
\echo 'STEP 6: RPC Function Check';
\echo '========================================';

SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments,
    p.prosecdef AS "Security Definer",
    p.provolatile AS volatility,
    CASE 
        WHEN proconfig IS NOT NULL THEN 
            (SELECT string_agg(config, ', ') 
             FROM unnest(proconfig) AS config)
        ELSE 'No config'
    END AS function_config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'get_customer_delivery_codes',
    'generate_delivery_codes_on_arrival',
    'store_package_codes',
    'generate_code_on_package_arrival'
  )
ORDER BY p.proname;

-- ============================================================================
-- STEP 7: Check actual data in codes table(s)
-- ============================================================================
\echo '';
\echo '========================================';
\echo 'STEP 7: Sample Data Check';
\echo '========================================';

-- Check package_codes table
DO $$
DECLARE
    row_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'package_codes') THEN
        EXECUTE 'SELECT COUNT(*) FROM public.package_codes' INTO row_count;
        RAISE NOTICE 'Total rows in package_codes: %', row_count;
        
        IF row_count > 0 THEN
            RAISE NOTICE 'Sample data from package_codes:';
        END IF;
    END IF;
END $$;

-- Show sample data (top 5 rows) - ONLY if table exists
SELECT *
FROM public.package_codes
LIMIT 5;

-- ============================================================================
-- STEP 8: Test as authenticated user
-- ============================================================================
\echo '';
\echo '========================================';
\echo 'STEP 8: Test Query as Authenticated User';
\echo '========================================';
\echo 'Replace YOUR_USER_ID_HERE with actual user ID';

-- Test direct table query
DO $$
DECLARE
    test_user_id UUID := 'YOUR_USER_ID_HERE'::UUID;  -- Replace with actual user ID
    row_count INTEGER;
BEGIN
    -- Try direct query on package_codes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'package_codes') THEN
        -- Count rows for this user
        EXECUTE format(
            'SELECT COUNT(*) FROM public.package_codes WHERE user_id = %L OR package_id IN (SELECT id FROM public.packages WHERE user_id = %L)',
            test_user_id, test_user_id
        ) INTO row_count;
        
        RAISE NOTICE 'Codes visible for user % via direct query: %', test_user_id, row_count;
    END IF;
END $$;

-- ============================================================================
-- STEP 9: Check function definition
-- ============================================================================
\echo '';
\echo '========================================';
\echo 'STEP 9: Function Source Code';
\echo '========================================';

-- Get the function definition
SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'get_customer_delivery_codes';

-- ============================================================================
-- STEP 10: Check grants and permissions
-- ============================================================================
\echo '';
\echo '========================================';
\echo 'STEP 10: Table Permissions';
\echo '========================================';

SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND (
    table_name LIKE '%code%'
    OR table_name LIKE '%delivery%'
    OR table_name LIKE '%pickup%'
  )
  AND grantee IN ('authenticated', 'service_role', 'anon', 'public')
ORDER BY table_name, grantee, privilege_type;

-- ============================================================================
-- DIAGNOSTIC COMPLETE
-- ============================================================================
\echo '';
\echo '========================================';
\echo '✅ DIAGNOSTIC COMPLETE';
\echo '========================================';
\echo '';
\echo 'REVIEW THE OUTPUT ABOVE TO IDENTIFY:';
\echo '1. Which table stores the delivery codes';
\echo '2. If RLS is enabled on that table';
\echo '3. What RLS policies exist (if any)';
\echo '4. If the RPC function exists and has SECURITY DEFINER';
\echo '5. If there is actual data in the codes table';
\echo '6. What columns exist in the codes table';
\echo '';
\echo 'COMMON ISSUES:';
\echo '- RLS enabled but no policy allows users to SELECT their codes';
\echo '- Function lacks SECURITY DEFINER so it runs as calling user';
\echo '- user_id not being set when codes are created';
\echo '- Wrong table or column names in the function';
\echo '';
\echo 'NEXT STEPS:';
\echo '1. Run the fix_delivery_codes_rls.sql script';
\echo '2. If that doesnt work, share the output of this diagnostic';
\echo '3. We may need to recreate the RPC function or table';
