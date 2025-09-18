-- =====================================================
-- 04_VERIFICATION_QUERIES.SQL
-- Verify address system is working correctly
-- 
-- PURPOSE: Check that all addresses are set up properly
-- WHEN TO RUN: After setting up addresses
-- SAFE TO RE-RUN: Yes, these are read-only queries
-- =====================================================

-- OVERVIEW: System Status
SELECT 'SYSTEM OVERVIEW:' as section;

-- Customer address statistics
SELECT 
    COUNT(*) as total_customers,
    COUNT(usa.id) as customers_with_addresses,
    COUNT(*) - COUNT(usa.id) as customers_without_addresses,
    ROUND((COUNT(usa.id)::DECIMAL / COUNT(*)) * 100, 1) as percentage_with_addresses
FROM public.user_profiles up
LEFT JOIN public.us_shipping_addresses usa ON up.us_shipping_address_id = usa.id
WHERE up.role = 'customer';

-- Suite number range
SELECT 
    COUNT(*) as total_addresses,
    MIN(usa.suite_number) as first_suite,
    MAX(usa.suite_number) as last_suite,
    get_next_suite_number() as next_available
FROM public.us_shipping_addresses usa
WHERE usa.suite_number ~ '^VC-[0-9]+$'
AND usa.is_active = true;

-- =====================================================
-- CUSTOMER ADDRESS LISTING
-- =====================================================

SELECT 'CUSTOMER ADDRESS LISTING:' as section;

-- All customers and their addresses
SELECT 
    usa.suite_number,
    up.first_name || ' ' || up.last_name as customer_name,
    up.email,
    usa.street_address,
    usa.city || ', ' || usa.state || ' ' || usa.postal_code as location,
    usa.assigned_at::date as assigned_date,
    CASE WHEN usa.is_active THEN '✓ Active' ELSE '✗ Inactive' END as status
FROM public.user_profiles up
LEFT JOIN public.us_shipping_addresses usa ON up.us_shipping_address_id = usa.id
WHERE up.role = 'customer'
ORDER BY 
    CASE WHEN usa.suite_number IS NOT NULL THEN 0 ELSE 1 END,  -- Put assigned addresses first
    usa.suite_number;

-- =====================================================
-- ADDRESS FORMAT VERIFICATION
-- =====================================================

SELECT 'ADDRESS FORMAT VERIFICATION:' as section;

-- How addresses appear to customers (sample)
SELECT 
    '=== CUSTOMER: ' || up.first_name || ' ' || up.last_name || ' ===' as customer_header,
    'Suite: ' || usa.suite_number as suite_info,
    'Email: ' || up.email as contact_info,
    '--- ADDRESS CUSTOMER SEES ---' as address_header,
    up.first_name || ' ' || up.last_name || ' (' || usa.suite_number || ')' as line_1_name,
    usa.street_address as line_2_street,
    usa.suite_number as line_3_suite,
    usa.city || ', ' || usa.state || ' ' || usa.postal_code as line_4_city_state_zip,
    usa.country as line_5_country,
    '--- COMPLETE COPY-PASTE FORMAT ---' as copy_paste_header,
    up.first_name || ' ' || up.last_name || ' (' || usa.suite_number || ')' || E'\n' ||
    usa.street_address || E'\n' ||
    usa.suite_number || E'\n' ||
    usa.city || ', ' || usa.state || ' ' || usa.postal_code || E'\n' ||
    usa.country as complete_address_format
FROM public.user_profiles up
JOIN public.us_shipping_addresses usa ON up.us_shipping_address_id = usa.id
WHERE up.role = 'customer'
AND usa.is_active = true
ORDER BY usa.suite_number
LIMIT 5;

-- =====================================================
-- WAREHOUSE ADDRESS CONSISTENCY
-- =====================================================

SELECT 'WAREHOUSE ADDRESS CONSISTENCY:' as section;

-- Check that all customers have the same warehouse address
SELECT 
    street_address,
    city,
    state,
    postal_code,
    country,
    COUNT(*) as customers_using_this_address,
    CASE 
        WHEN COUNT(*) = (SELECT COUNT(*) FROM public.us_shipping_addresses WHERE is_active = true) 
        THEN '✓ All customers use same warehouse' 
        ELSE '⚠️ Mixed warehouse addresses detected!' 
    END as consistency_status
FROM public.us_shipping_addresses
WHERE is_active = true
GROUP BY street_address, city, state, postal_code, country
ORDER BY customers_using_this_address DESC;

-- =====================================================
-- SUITE NUMBER VALIDATION
-- =====================================================

SELECT 'SUITE NUMBER VALIDATION:' as section;

-- Check for duplicate suite numbers (should be 0)
SELECT 
    suite_number,
    COUNT(*) as duplicate_count,
    CASE WHEN COUNT(*) > 1 THEN '❌ DUPLICATE!' ELSE '✅ Unique' END as status
FROM public.us_shipping_addresses
WHERE suite_number ~ '^VC-[0-9]+$'
GROUP BY suite_number
HAVING COUNT(*) > 1
ORDER BY suite_number;

-- If no duplicates found, show success message
SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM public.us_shipping_addresses 
            WHERE suite_number ~ '^VC-[0-9]+$'
            GROUP BY suite_number 
            HAVING COUNT(*) > 1
        ) 
        THEN '✅ SUCCESS: All suite numbers are unique!' 
        ELSE '❌ WARNING: Duplicate suite numbers found above!' 
    END as duplicate_check_result;

-- Check suite number format compliance
SELECT 
    suite_number,
    CASE 
        WHEN suite_number ~ '^VC-[0-9]{5}$' THEN '✅ Valid Format' 
        ELSE '❌ Invalid Format' 
    END as format_status
FROM public.us_shipping_addresses
WHERE suite_number IS NOT NULL
AND NOT (suite_number ~ '^VC-[0-9]{5}$')
ORDER BY suite_number;

-- =====================================================
-- CUSTOMERS WITHOUT ADDRESSES
-- =====================================================

SELECT 'CUSTOMERS WITHOUT ADDRESSES:' as section;

-- List customers who still need addresses
SELECT 
    up.id as customer_uuid,
    up.first_name,
    up.last_name,
    up.email,
    up.created_at::date as registered_date,
    '❌ NEEDS ADDRESS' as status,
    'Use: SELECT assign_next_suite_number(''' || up.id || ''');' as fix_command
FROM public.user_profiles up
WHERE up.us_shipping_address_id IS NULL
AND up.role = 'customer'
ORDER BY up.created_at;

-- Count of customers still needing addresses
SELECT 
    CASE 
        WHEN COUNT(*) = 0 
        THEN '✅ SUCCESS: All customers have addresses!' 
        ELSE '⚠️ ' || COUNT(*) || ' customers still need addresses (see above)' 
    END as missing_addresses_status
FROM public.user_profiles up
WHERE up.us_shipping_address_id IS NULL
AND up.role = 'customer';

-- =====================================================
-- FRONTEND COMPATIBILITY CHECK
-- =====================================================

SELECT 'FRONTEND COMPATIBILITY CHECK:' as section;

-- Verify data matches what frontend expects
SELECT 
    'us_shipping_addresses table structure' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'us_shipping_addresses' 
            AND column_name IN ('suite_number', 'street_address', 'city', 'state', 'postal_code', 'country', 'formatted_address')
        ) 
        THEN '✅ Compatible with frontend' 
        ELSE '❌ Missing required columns' 
    END as compatibility_status;

-- Check that formatted_address column is working
SELECT 
    'Formatted address generation' as check_type,
    CASE 
        WHEN COUNT(*) > 0 AND COUNT(CASE WHEN formatted_address IS NOT NULL THEN 1 END) = COUNT(*) 
        THEN '✅ All addresses have formatted versions' 
        ELSE '❌ Some addresses missing formatted_address' 
    END as formatting_status
FROM public.us_shipping_addresses
WHERE is_active = true;

-- =====================================================
-- SYSTEM HEALTH SUMMARY
-- =====================================================

SELECT 'SYSTEM HEALTH SUMMARY:' as section;

WITH health_checks AS (
    SELECT 
        (SELECT COUNT(*) FROM public.user_profiles WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM public.user_profiles up 
         JOIN public.us_shipping_addresses usa ON up.us_shipping_address_id = usa.id 
         WHERE up.role = 'customer' AND usa.is_active = true) as customers_with_addresses,
        (SELECT COUNT(DISTINCT street_address || city || state || postal_code) 
         FROM public.us_shipping_addresses WHERE is_active = true) as unique_warehouse_addresses,
        (SELECT COUNT(*) FROM public.us_shipping_addresses 
         WHERE suite_number ~ '^VC-[0-9]+$' 
         GROUP BY suite_number HAVING COUNT(*) > 1) as duplicate_suites
)
SELECT 
    CASE 
        WHEN total_customers = customers_with_addresses 
             AND unique_warehouse_addresses = 1 
             AND duplicate_suites IS NULL
        THEN '🟢 SYSTEM HEALTHY: All customers have unique addresses at same warehouse'
        WHEN total_customers != customers_with_addresses
        THEN '🟡 NEEDS ATTENTION: ' || (total_customers - customers_with_addresses) || ' customers need addresses'
        WHEN unique_warehouse_addresses > 1
        THEN '🟡 MIXED WAREHOUSES: Multiple warehouse addresses detected'
        WHEN duplicate_suites IS NOT NULL
        THEN '🔴 DUPLICATE SUITES: Suite number duplicates found'
        ELSE '🟢 SYSTEM HEALTHY'
    END as overall_system_status,
    total_customers,
    customers_with_addresses,
    unique_warehouse_addresses,
    COALESCE(duplicate_suites, 0) as duplicate_suite_count
FROM health_checks;

SELECT 'VERIFICATION COMPLETE!' as final_status;
SELECT 'If any issues found above, use 07_troubleshooting.sql to fix them' as next_step;
