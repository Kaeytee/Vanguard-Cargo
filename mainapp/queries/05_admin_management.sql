-- =====================================================
-- 05_ADMIN_MANAGEMENT.SQL
-- Admin interface queries for ongoing management
-- 
-- PURPOSE: Queries for your admin app to manage addresses
-- WHEN TO RUN: As needed for admin operations
-- SAFE TO RE-RUN: Yes, but be careful with UPDATE queries
-- =====================================================

-- =====================================================
-- CUSTOMER LOOKUP AND SEARCH
-- =====================================================

-- Get all customers with their address status (for admin dashboard)
SELECT 
    up.id as customer_id,
    up.first_name,
    up.last_name,
    up.email,
    up.phone,
    up.created_at::date as registered_date,
    usa.suite_number,
    CASE 
        WHEN usa.suite_number IS NOT NULL THEN '✓ Has Address: ' || usa.suite_number
        ELSE '✗ Needs Address' 
    END as address_status,
    usa.assigned_at::date as address_assigned_date,
    usa.is_active
FROM public.user_profiles up
LEFT JOIN public.us_shipping_addresses usa ON up.us_shipping_address_id = usa.id
WHERE up.role = 'customer'
ORDER BY up.created_at DESC;

-- Search customer by email
-- Replace 'customer@example.com' with actual email
SELECT 
    up.id as customer_id,
    up.first_name || ' ' || up.last_name as full_name,
    up.email,
    usa.suite_number,
    usa.street_address,
    usa.city || ', ' || usa.state || ' ' || usa.postal_code as location,
    usa.assigned_at
FROM public.user_profiles up
LEFT JOIN public.us_shipping_addresses usa ON up.us_shipping_address_id = usa.id
WHERE up.email ILIKE '%customer@example.com%'  -- 🔄 CHANGE THIS
AND up.role = 'customer';

-- Search customer by name (partial match)
-- Replace 'John' with actual name search
SELECT 
    up.id as customer_id,
    up.first_name || ' ' || up.last_name as full_name,
    up.email,
    usa.suite_number,
    usa.assigned_at
FROM public.user_profiles up
LEFT JOIN public.us_shipping_addresses usa ON up.us_shipping_address_id = usa.id
WHERE (up.first_name ILIKE '%John%' OR up.last_name ILIKE '%John%')  -- 🔄 CHANGE THIS
AND up.role = 'customer'
ORDER BY up.first_name, up.last_name;

-- Search by suite number
-- Replace 'VC-10001' with actual suite number
SELECT 
    usa.suite_number,
    up.first_name || ' ' || up.last_name as customer_name,
    up.email,
    up.phone,
    usa.assigned_at,
    usa.is_active
FROM public.us_shipping_addresses usa
JOIN public.user_profiles up ON usa.user_id = up.id
WHERE usa.suite_number = 'VC-10001'  -- 🔄 CHANGE THIS
AND usa.is_active = true;

-- =====================================================
-- ADDRESS ASSIGNMENT (for admin interface)
-- =====================================================

-- Assign address to specific customer by email
-- Replace with actual customer email
-- SELECT assign_next_suite_number(
--     (SELECT id FROM public.user_profiles WHERE email = 'customer@example.com')
-- ) as new_suite_assigned;

-- Assign address to specific customer by UUID
-- Replace with actual customer UUID
-- SELECT assign_next_suite_number('REPLACE-WITH-CUSTOMER-UUID') as new_suite_assigned;

-- Get customers who need addresses (for admin assignment interface)
SELECT 
    up.id as customer_id,
    up.first_name,
    up.last_name,
    up.email,
    up.created_at::date as registered_date,
    'SELECT assign_next_suite_number(''' || up.id || ''');' as assignment_command
FROM public.user_profiles up
WHERE up.us_shipping_address_id IS NULL
AND up.role = 'customer'
ORDER BY up.created_at;

-- Preview next available suite numbers
SELECT 
    get_next_suite_number() as next_suite_number,
    'VC-' || LPAD((CAST(SUBSTRING(get_next_suite_number() FROM 'VC-([0-9]+)') AS INTEGER) + 1)::TEXT, 5, '0') as following_suite,
    'VC-' || LPAD((CAST(SUBSTRING(get_next_suite_number() FROM 'VC-([0-9]+)') AS INTEGER) + 2)::TEXT, 5, '0') as third_suite;

-- =====================================================
-- PACKAGE PROCESSING QUERIES
-- =====================================================

-- Find customer by suite number (for incoming packages)
-- Replace 'VC-10001' with suite number from package label
SELECT 
    usa.suite_number,
    up.first_name || ' ' || up.last_name as customer_name,
    up.email,
    up.phone,
    up.first_name || ' ' || up.last_name || ' (' || usa.suite_number || ')' || E'\n' ||
    usa.street_address || E'\n' ||
    usa.suite_number || E'\n' ||
    usa.city || ', ' || usa.state || ' ' || usa.postal_code || E'\n' ||
    usa.country as customer_full_address,
    usa.is_active
FROM public.us_shipping_addresses usa
JOIN public.user_profiles up ON usa.user_id = up.id
WHERE usa.suite_number = 'VC-10001'  -- 🔄 CHANGE THIS: Suite from package
AND usa.is_active = true;

-- Search for similar suite numbers (in case of typos)
-- Replace 'VC-1000' with partial suite number
SELECT 
    usa.suite_number,
    up.first_name || ' ' || up.last_name as customer_name,
    up.email,
    'Similarity: ' || (
        CASE 
            WHEN usa.suite_number ILIKE 'VC-1000%' THEN 'High Match'
            WHEN usa.suite_number ILIKE '%1000%' THEN 'Partial Match'
            ELSE 'Low Match'
        END
    ) as match_quality
FROM public.us_shipping_addresses usa
JOIN public.user_profiles up ON usa.user_id = up.id
WHERE usa.suite_number ILIKE '%1000%'  -- 🔄 CHANGE THIS: Partial suite
AND usa.is_active = true
ORDER BY usa.suite_number;

-- =====================================================
-- ADDRESS MANAGEMENT
-- =====================================================

-- Deactivate a customer's address (if customer closes account)
-- Replace 'VC-10001' with actual suite number
-- UPDATE public.us_shipping_addresses 
-- SET is_active = false, 
--     deactivated_at = NOW(),
--     updated_at = NOW()
-- WHERE suite_number = 'VC-10001';

-- Reactivate a customer's address
-- Replace 'VC-10001' with actual suite number
-- UPDATE public.us_shipping_addresses 
-- SET is_active = true,
--     deactivated_at = NULL,
--     updated_at = NOW()
-- WHERE suite_number = 'VC-10001';

-- Change a customer's suite number (rare, but sometimes needed)
-- Replace old and new suite numbers
-- UPDATE public.us_shipping_addresses 
-- SET suite_number = 'VC-99999',  -- New suite number
--     updated_at = NOW()
-- WHERE suite_number = 'VC-10001';  -- Old suite number

-- =====================================================
-- REPORTING QUERIES
-- =====================================================

-- Daily address assignment report
SELECT 
    assigned_at::date as assignment_date,
    COUNT(*) as addresses_assigned,
    MIN(suite_number) as first_suite_assigned,
    MAX(suite_number) as last_suite_assigned
FROM public.us_shipping_addresses
WHERE assigned_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY assigned_at::date
ORDER BY assignment_date DESC;

-- Monthly customer growth with addresses
SELECT 
    DATE_TRUNC('month', up.created_at) as month,
    COUNT(*) as new_customers,
    COUNT(usa.id) as customers_with_addresses,
    ROUND((COUNT(usa.id)::DECIMAL / COUNT(*)) * 100, 1) as address_assignment_rate
FROM public.user_profiles up
LEFT JOIN public.us_shipping_addresses usa ON up.us_shipping_address_id = usa.id
WHERE up.role = 'customer'
AND up.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', up.created_at)
ORDER BY month DESC;

-- Current warehouse utilization
SELECT 
    COUNT(*) as total_suite_numbers_assigned,
    MIN(CAST(SUBSTRING(suite_number FROM 'VC-([0-9]+)') AS INTEGER)) as lowest_suite_number,
    MAX(CAST(SUBSTRING(suite_number FROM 'VC-([0-9]+)') AS INTEGER)) as highest_suite_number,
    (MAX(CAST(SUBSTRING(suite_number FROM 'VC-([0-9]+)') AS INTEGER)) - 
     MIN(CAST(SUBSTRING(suite_number FROM 'VC-([0-9]+)') AS INTEGER)) + 1) as number_range_used,
    get_next_suite_number() as next_available
FROM public.us_shipping_addresses
WHERE suite_number ~ '^VC-[0-9]+$'
AND is_active = true;

-- =====================================================
-- BULK OPERATIONS
-- =====================================================

-- Assign addresses to all customers without them (bulk operation)
-- Uncomment to run - be careful!
-- DO $$
-- DECLARE
--     customer_record RECORD;
--     assigned_count INTEGER := 0;
-- BEGIN
--     FOR customer_record IN 
--         SELECT id, first_name, last_name, email 
--         FROM public.user_profiles 
--         WHERE us_shipping_address_id IS NULL 
--         AND role = 'customer'
--         ORDER BY created_at
--     LOOP
--         PERFORM assign_next_suite_number(customer_record.id);
--         assigned_count := assigned_count + 1;
--         
--         -- Log progress every 10 assignments
--         IF assigned_count % 10 = 0 THEN
--             RAISE NOTICE 'Assigned % addresses so far...', assigned_count;
--         END IF;
--     END LOOP;
--     
--     RAISE NOTICE 'BULK ASSIGNMENT COMPLETE: % total addresses assigned', assigned_count;
-- END $$;

-- Update all customer addresses to new warehouse (use with extreme caution!)
-- This changes the warehouse address for ALL customers
-- SELECT update_master_warehouse_address(
--     'NEW WAREHOUSE STREET ADDRESS',  -- 🔄 CHANGE ALL THESE
--     'NEW CITY',                      -- 🔄 WITH YOUR NEW
--     'ST',                           -- 🔄 WAREHOUSE DETAILS
--     '12345',                        -- 🔄 BEFORE UNCOMMENTING
--     'USA'
-- ) as customers_updated;

SELECT 'ADMIN QUERIES READY FOR USE!' as status;
SELECT 'Remember to replace placeholder values (marked with 🔄) before running queries' as important_note;
