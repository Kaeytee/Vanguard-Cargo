-- =====================================================
-- 07_TROUBLESHOOTING.SQL  
-- Debug common issues and fix problems
--
-- PURPOSE: Diagnose and fix common address system problems
-- WHEN TO RUN: When experiencing issues or errors
-- SAFE TO RE-RUN: Yes, these are mostly diagnostic queries
-- =====================================================

-- =====================================================
-- SYSTEM HEALTH DIAGNOSTICS
-- =====================================================

SELECT '🔍 RUNNING SYSTEM DIAGNOSTICS...' as status;

-- Check 1: Verify all tables exist
SELECT '1️⃣ CHECKING TABLES EXIST' as test_name;
SELECT 
    CASE 
        WHEN COUNT(*) = 2 THEN '✅ All required tables exist'
        ELSE '❌ Missing tables! Expected: user_profiles, us_shipping_addresses'
    END as table_status,
    string_agg(table_name, ', ') as existing_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'us_shipping_addresses');

-- Check 2: Verify all functions exist  
SELECT '2️⃣ CHECKING FUNCTIONS EXIST' as test_name;
SELECT 
    CASE 
        WHEN COUNT(*) >= 3 THEN '✅ All address functions exist'
        ELSE '❌ Missing functions! Run 01_setup_functions.sql first'
    END as function_status,
    string_agg(routine_name, ', ') as existing_functions
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('update_master_warehouse_address', 'assign_next_suite_number', 'get_next_suite_number');

-- Check 3: Verify suite number format compliance
SELECT '3️⃣ CHECKING SUITE NUMBER FORMATS' as test_name;
SELECT 
    COUNT(*) as total_addresses,
    COUNT(CASE WHEN suite_number ~ '^VC-[0-9]+$' THEN 1 END) as valid_format_count,
    COUNT(CASE WHEN suite_number !~ '^VC-[0-9]+$' THEN 1 END) as invalid_format_count,
    CASE 
        WHEN COUNT(CASE WHEN suite_number !~ '^VC-[0-9]+$' THEN 1 END) = 0 
        THEN '✅ All suite numbers have valid VC-##### format'
        ELSE '⚠️ ' || COUNT(CASE WHEN suite_number !~ '^VC-[0-9]+$' THEN 1 END) || ' suite numbers have invalid format'
    END as format_status
FROM public.us_shipping_addresses 
WHERE is_active = true;

-- Check 4: Verify no duplicate suite numbers
SELECT '4️⃣ CHECKING FOR DUPLICATE SUITES' as test_name;
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ No duplicate suite numbers found'
        ELSE '❌ ' || COUNT(*) || ' duplicate suite numbers detected!'  
    END as duplicate_status,
    COUNT(*) as duplicate_count
FROM (
    SELECT suite_number, COUNT(*) as usage_count
    FROM public.us_shipping_addresses
    WHERE is_active = true
    GROUP BY suite_number
    HAVING COUNT(*) > 1
) duplicates;

-- Check 5: Verify user-address relationships
SELECT '5️⃣ CHECKING USER-ADDRESS RELATIONSHIPS' as test_name;
WITH relationship_check AS (
    SELECT 
        (SELECT COUNT(*) FROM public.user_profiles WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM public.user_profiles WHERE role = 'customer' AND us_shipping_address_id IS NOT NULL) as customers_with_addresses,
        (SELECT COUNT(*) FROM public.us_shipping_addresses WHERE is_active = true) as active_addresses
)
SELECT 
    total_customers,
    customers_with_addresses,  
    active_addresses,
    CASE 
        WHEN customers_with_addresses = total_customers AND customers_with_addresses = active_addresses
        THEN '✅ All customers have valid addresses'
        WHEN customers_with_addresses < total_customers
        THEN '⚠️ ' || (total_customers - customers_with_addresses) || ' customers missing addresses'
        WHEN active_addresses > customers_with_addresses  
        THEN '⚠️ ' || (active_addresses - customers_with_addresses) || ' orphaned addresses found'
        ELSE '⚠️ Address relationship inconsistency detected'
    END as relationship_status
FROM relationship_check;

-- =====================================================
-- COMMON PROBLEM DIAGNOSTICS
-- =====================================================

SELECT '🔧 CHECKING FOR COMMON PROBLEMS...' as status;

-- Problem 1: Invalid suite number formats
SELECT '❌ INVALID SUITE NUMBER FORMATS FOUND:' as problem_type;
SELECT 
    suite_number as invalid_suite,
    street_address,
    up.first_name || ' ' || up.last_name as customer_name,
    up.email as customer_email,
    usa.assigned_at,
    'Should be VC-##### format' as fix_needed
FROM public.us_shipping_addresses usa
LEFT JOIN public.user_profiles up ON usa.user_id = up.id
WHERE usa.is_active = true
AND usa.suite_number !~ '^VC-[0-9]+$'
ORDER BY usa.assigned_at;

-- Problem 2: Customers without addresses
SELECT '👤 CUSTOMERS WITHOUT ADDRESSES:' as problem_type;  
SELECT 
    up.id as user_id,
    up.first_name || ' ' || up.last_name as customer_name,
    up.email,
    up.created_at as registration_date,
    'Run assign_next_suite_number() to fix' as fix_needed
FROM public.user_profiles up
WHERE up.role = 'customer'
AND up.us_shipping_address_id IS NULL
ORDER BY up.created_at;

-- Problem 3: Orphaned addresses (no associated user)
SELECT '🏠 ORPHANED ADDRESSES (NO USER):' as problem_type;
SELECT 
    usa.id as address_id,
    usa.suite_number,
    usa.street_address,
    usa.assigned_at,
    'Address has no associated user - may need cleanup' as issue
FROM public.us_shipping_addresses usa
LEFT JOIN public.user_profiles up ON usa.user_id = up.id
WHERE usa.is_active = true
AND up.id IS NULL
ORDER BY usa.assigned_at;

-- Problem 4: Duplicate suite numbers
SELECT '🔄 DUPLICATE SUITE NUMBERS:' as problem_type;
SELECT 
    suite_number,
    COUNT(*) as usage_count,
    string_agg(
        COALESCE(up.first_name || ' ' || up.last_name, 'NO USER') || ' (' || up.email || ')', 
        ' | '
    ) as affected_customers
FROM public.us_shipping_addresses usa
LEFT JOIN public.user_profiles up ON usa.user_id = up.id  
WHERE usa.is_active = true
GROUP BY suite_number
HAVING COUNT(*) > 1
ORDER BY suite_number;

-- Problem 5: Inconsistent warehouse addresses
SELECT '🏭 INCONSISTENT WAREHOUSE ADDRESSES:' as problem_type;
SELECT DISTINCT
    street_address || ', ' || city || ', ' || state || ' ' || postal_code as full_address,
    COUNT(*) as customers_using,
    MIN(assigned_at) as first_used,
    MAX(updated_at) as last_updated,
    CASE 
        WHEN COUNT(*) < (SELECT COUNT(*) * 0.8 FROM public.us_shipping_addresses WHERE is_active = true)
        THEN 'Possible outdated warehouse address'
        ELSE 'Current warehouse address'
    END as status
FROM public.us_shipping_addresses
WHERE is_active = true
GROUP BY street_address, city, state, postal_code
ORDER BY customers_using DESC;

-- =====================================================
-- AUTOMATIC FIXES FOR COMMON PROBLEMS
-- =====================================================

SELECT '🔧 AUTOMATIC PROBLEM FIXES...' as status;

-- Fix 1: Assign addresses to customers who don't have them
SELECT '1️⃣ ASSIGNING ADDRESSES TO CUSTOMERS WITHOUT THEM...' as fix_action;
DO $$
DECLARE
    customer_record RECORD;
    assignment_count INTEGER := 0;
BEGIN
    FOR customer_record IN 
        SELECT id, first_name, last_name, email
        FROM public.user_profiles 
        WHERE role = 'customer' 
        AND us_shipping_address_id IS NULL
    LOOP
        PERFORM assign_next_suite_number(customer_record.id);
        assignment_count := assignment_count + 1;
        RAISE NOTICE 'Assigned address to: % % (%)', 
            customer_record.first_name, customer_record.last_name, customer_record.email;
    END LOOP;
    
    RAISE NOTICE 'Assigned addresses to % customers', assignment_count;
END $$;

-- Fix 2: Update suite numbers to valid format (if invalid ones exist)
-- This converts any non-standard suite numbers to proper VC-##### format
-- UNCOMMENT ONLY IF YOU HAVE INVALID FORMATS AND WANT TO FIX THEM:

-- DO $$
-- DECLARE
--     fix_record RECORD;
--     new_suite_number TEXT;
-- BEGIN
--     FOR fix_record IN 
--         SELECT id, suite_number, user_id
--         FROM public.us_shipping_addresses
--         WHERE is_active = true
--         AND suite_number !~ '^VC-[0-9]+$'
--     LOOP
--         -- Generate a new valid suite number
--         SELECT get_next_suite_number() INTO new_suite_number;
--         
--         -- Update to the new valid format
--         UPDATE public.us_shipping_addresses 
--         SET suite_number = new_suite_number,
--             updated_at = NOW()
--         WHERE id = fix_record.id;
--         
--         RAISE NOTICE 'Fixed suite number: % → %', fix_record.suite_number, new_suite_number;
--     END LOOP;
-- END $$;

-- =====================================================
-- DATA CONSISTENCY REPAIRS
-- =====================================================

-- Fix broken user-address relationships
SELECT '🔗 REPAIRING BROKEN RELATIONSHIPS...' as fix_action;
UPDATE public.user_profiles 
SET us_shipping_address_id = usa.id
FROM public.us_shipping_addresses usa
WHERE user_profiles.id = usa.user_id
AND user_profiles.role = 'customer' 
AND user_profiles.us_shipping_address_id IS NULL
AND usa.is_active = true;

-- Fix addresses missing user_id (if user_profile has the relationship)
UPDATE public.us_shipping_addresses
SET user_id = up.id  
FROM public.user_profiles up
WHERE us_shipping_addresses.id = up.us_shipping_address_id
AND us_shipping_addresses.user_id IS NULL
AND us_shipping_addresses.is_active = true;

-- =====================================================
-- PERFORMANCE DIAGNOSTICS
-- =====================================================

SELECT '⚡ PERFORMANCE DIAGNOSTICS...' as status;

-- Check table sizes
SELECT '📊 TABLE SIZES:' as metric_type;
SELECT 
    schemaname,
    tablename,
    attname as column_name,
    n_distinct,
    correlation,
    most_common_vals[1:3] as sample_values
FROM pg_stats 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'us_shipping_addresses')
AND attname IN ('suite_number', 'email', 'role', 'is_active')
ORDER BY tablename, attname;

-- Check for missing indexes
SELECT '📋 INDEX RECOMMENDATIONS:' as metric_type;
SELECT 
    'Consider adding index on us_shipping_addresses.suite_number for faster lookups' as recommendation
WHERE NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'us_shipping_addresses' 
    AND indexdef LIKE '%suite_number%'
);

-- =====================================================
-- EMERGENCY RESET PROCEDURES
-- =====================================================

-- EMERGENCY: Reset all suite numbers (DANGEROUS - USE WITH CAUTION!)
-- This will reassign ALL suite numbers starting from VC-10001
-- ONLY uncomment if you need to completely reset the numbering system:

-- SELECT '🚨 EMERGENCY RESET MODE - REASSIGNING ALL SUITE NUMBERS' as warning;
-- DO $$
-- DECLARE
--     customer_record RECORD;
--     counter INTEGER := 10001;
-- BEGIN
--     FOR customer_record IN 
--         SELECT usa.id, up.first_name, up.last_name
--         FROM public.us_shipping_addresses usa
--         JOIN public.user_profiles up ON usa.user_id = up.id
--         WHERE usa.is_active = true
--         ORDER BY usa.assigned_at
--     LOOP
--         UPDATE public.us_shipping_addresses 
--         SET suite_number = 'VC-' || LPAD(counter::TEXT, 5, '0'),
--             updated_at = NOW()
--         WHERE id = customer_record.id;
--         
--         RAISE NOTICE 'Reset suite for % %: VC-%', 
--             customer_record.first_name, customer_record.last_name, LPAD(counter::TEXT, 5, '0');
--         counter := counter + 1;
--     END LOOP;
-- END $$;

-- =====================================================
-- FINAL SYSTEM HEALTH CHECK
-- =====================================================

SELECT '🏁 FINAL HEALTH CHECK AFTER TROUBLESHOOTING...' as status;

-- Summary of system state after fixes
WITH health_summary AS (
    SELECT 
        (SELECT COUNT(*) FROM public.user_profiles WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM public.user_profiles WHERE role = 'customer' AND us_shipping_address_id IS NOT NULL) as customers_with_addresses,
        (SELECT COUNT(*) FROM public.us_shipping_addresses WHERE is_active = true) as total_active_addresses,
        (SELECT COUNT(*) FROM public.us_shipping_addresses WHERE is_active = true AND suite_number ~ '^VC-[0-9]+$') as valid_format_addresses,
        (SELECT COUNT(DISTINCT suite_number) FROM public.us_shipping_addresses WHERE is_active = true) as unique_suite_numbers,
        (SELECT COUNT(*) FROM public.us_shipping_addresses WHERE is_active = true) as total_suite_assignments
)
SELECT 
    '📊 SYSTEM HEALTH SUMMARY' as report_type,
    total_customers || ' total customers' as customers,
    customers_with_addresses || ' customers with addresses' as addresses,  
    valid_format_addresses || '/' || total_active_addresses || ' valid suite formats' as formats,
    CASE 
        WHEN unique_suite_numbers = total_suite_assignments 
        THEN '✅ No duplicate suites'
        ELSE '❌ ' || (total_suite_assignments - unique_suite_numbers) || ' duplicate suites'
    END as duplicates,
    CASE 
        WHEN customers_with_addresses = total_customers 
        AND valid_format_addresses = total_active_addresses
        AND unique_suite_numbers = total_suite_assignments
        THEN '✅ SYSTEM HEALTHY - All issues resolved!'
        ELSE '⚠️ Some issues remain - review diagnostics above'
    END as overall_status
FROM health_summary;

SELECT '🎯 TROUBLESHOOTING COMPLETE!' as status;
SELECT '💡 TIP: Re-run this file periodically to maintain system health' as tip;
