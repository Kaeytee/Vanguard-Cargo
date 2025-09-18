-- =====================================================
-- 06_ADDRESS_UPDATES.SQL
-- Update existing addresses and warehouse details
-- 
-- PURPOSE: Change warehouse addresses and update existing customer addresses
-- WHEN TO RUN: When you need to update addresses
-- SAFE TO RE-RUN: Be careful - these modify existing data
-- =====================================================

-- =====================================================
-- PREVIEW CURRENT ADDRESSES
-- Always check current state before making changes
-- =====================================================

SELECT 'CURRENT WAREHOUSE ADDRESS CONFIGURATION:' as section;

-- Show current warehouse addresses in use
SELECT DISTINCT
    street_address,
    city,
    state,
    postal_code,
    country,
    COUNT(*) as customers_using_this_address,
    MIN(assigned_at) as first_assigned,
    MAX(updated_at) as last_updated
FROM public.us_shipping_addresses
WHERE is_active = true
GROUP BY street_address, city, state, postal_code, country
ORDER BY customers_using_this_address DESC;

-- Show sample customer addresses before changes
SELECT 'SAMPLE ADDRESSES BEFORE CHANGES:' as section;
SELECT 
    usa.suite_number,
    up.first_name || ' ' || up.last_name as customer_name,
    up.first_name || ' ' || up.last_name || ' (' || usa.suite_number || ')' || E'\n' ||
    usa.street_address || E'\n' ||
    usa.suite_number || E'\n' ||
    usa.city || ', ' || usa.state || ' ' || usa.postal_code || E'\n' ||
    usa.country as current_address_format
FROM public.user_profiles up
JOIN public.us_shipping_addresses usa ON up.us_shipping_address_id = usa.id
WHERE up.role = 'customer'
AND usa.is_active = true
ORDER BY usa.suite_number
LIMIT 3;

-- =====================================================
-- WAREHOUSE ADDRESS UPDATES
-- =====================================================

-- METHOD 1: Update complete warehouse address for ALL customers
-- This is the recommended method for warehouse moves
-- 🔄 CUSTOMIZE THESE VALUES BEFORE UNCOMMENTING:

-- SELECT 'UPDATING WAREHOUSE ADDRESS FOR ALL CUSTOMERS...' as action;
-- SELECT update_master_warehouse_address(
--     '456 New Warehouse Street',    -- 🔄 Your new street address
--     'Miami',                       -- 🔄 Your new city
--     'FL',                         -- 🔄 Your new state  
--     '33137',                      -- 🔄 Your new ZIP code
--     'USA'                         -- 🔄 Your country
-- ) as customers_updated_count;

-- METHOD 2: Update individual address components
-- Use these if you only need to change specific parts

-- Update only street address for all customers
-- UPDATE public.us_shipping_addresses 
-- SET street_address = '789 Updated Street Name',  -- 🔄 CHANGE THIS
--     updated_at = NOW()
-- WHERE is_active = true;

-- Update only city for all customers
-- UPDATE public.us_shipping_addresses 
-- SET city = 'New City Name',  -- 🔄 CHANGE THIS
--     updated_at = NOW()
-- WHERE is_active = true;

-- Update state and ZIP code for all customers
-- UPDATE public.us_shipping_addresses 
-- SET state = 'CA',           -- 🔄 CHANGE THIS
--     postal_code = '90210',  -- 🔄 CHANGE THIS  
--     updated_at = NOW()
-- WHERE is_active = true;

-- Update country for all customers (for international moves)
-- UPDATE public.us_shipping_addresses 
-- SET country = 'Canada',  -- 🔄 CHANGE THIS
--     updated_at = NOW()
-- WHERE is_active = true;

-- =====================================================
-- SPECIFIC CUSTOMER ADDRESS UPDATES
-- =====================================================

-- Update address for a specific customer (by suite number)
-- Replace 'VC-10001' and address details before uncommenting
-- UPDATE public.us_shipping_addresses 
-- SET street_address = 'Special Customer Address',  -- 🔄 CHANGE THIS
--     city = 'Special City',                        -- 🔄 CHANGE THIS
--     state = 'NY',                                 -- 🔄 CHANGE THIS
--     postal_code = '10001',                        -- 🔄 CHANGE THIS
--     updated_at = NOW()
-- WHERE suite_number = 'VC-10001';                  -- 🔄 CHANGE THIS

-- Update address for a specific customer (by email)
-- UPDATE public.us_shipping_addresses 
-- SET street_address = 'Updated Address',
--     city = 'Updated City',
--     updated_at = NOW()
-- WHERE user_id = (
--     SELECT id FROM public.user_profiles 
--     WHERE email = 'customer@example.com'  -- 🔄 CHANGE THIS
-- );

-- =====================================================
-- BATCH UPDATES BY CRITERIA
-- =====================================================

-- Update addresses for customers in specific suite number range
-- UPDATE public.us_shipping_addresses 
-- SET street_address = 'Range Specific Address'
-- WHERE CAST(SUBSTRING(suite_number FROM 'VC-([0-9]+)') AS INTEGER) 
--       BETWEEN 10001 AND 10050  -- 🔄 CHANGE RANGE
-- AND is_active = true;

-- Update addresses for customers assigned before a certain date
-- UPDATE public.us_shipping_addresses 
-- SET street_address = 'Legacy Customer Address',
--     city = 'Legacy City'
-- WHERE assigned_at < '2025-01-01'  -- 🔄 CHANGE DATE
-- AND is_active = true;

-- Update addresses for customers registered after a certain date
-- UPDATE public.us_shipping_addresses 
-- SET street_address = 'New Customer Warehouse'
-- WHERE user_id IN (
--     SELECT id FROM public.user_profiles 
--     WHERE created_at >= '2025-09-01'  -- 🔄 CHANGE DATE
--     AND role = 'customer'
-- ) AND is_active = true;

-- =====================================================
-- SUITE NUMBER MANAGEMENT
-- =====================================================

-- Change a specific customer's suite number
-- (Use with caution - make sure new suite number doesn't exist)
-- UPDATE public.us_shipping_addresses 
-- SET suite_number = 'VC-99999',  -- 🔄 CHANGE TO NEW SUITE
--     updated_at = NOW()
-- WHERE suite_number = 'VC-10001'  -- 🔄 CHANGE TO OLD SUITE
-- AND is_active = true;

-- Swap suite numbers between two customers (advanced)
-- This requires a temporary suite number to avoid conflicts
-- DO $$
-- BEGIN
--     -- Step 1: Move first customer to temporary suite
--     UPDATE public.us_shipping_addresses 
--     SET suite_number = 'VC-TEMP1' 
--     WHERE suite_number = 'VC-10001';  -- 🔄 First customer's current suite
--     
--     -- Step 2: Move second customer to first customer's old suite  
--     UPDATE public.us_shipping_addresses 
--     SET suite_number = 'VC-10001'     -- 🔄 First customer's old suite
--     WHERE suite_number = 'VC-10002';  -- 🔄 Second customer's current suite
--     
--     -- Step 3: Move first customer to second customer's old suite
--     UPDATE public.us_shipping_addresses 
--     SET suite_number = 'VC-10002'     -- 🔄 Second customer's old suite
--     WHERE suite_number = 'VC-TEMP1';
--     
--     RAISE NOTICE 'Suite numbers swapped successfully!';
-- END $$;

-- =====================================================
-- VERIFICATION AFTER UPDATES
-- Run these after making changes to verify success
-- =====================================================

-- Verify warehouse address updates
SELECT 'VERIFICATION: UPDATED WAREHOUSE ADDRESSES' as section;
SELECT DISTINCT
    street_address,
    city,
    state,
    postal_code,
    country,
    COUNT(*) as customers_now_using_this_address,
    MAX(updated_at) as last_updated_time
FROM public.us_shipping_addresses
WHERE is_active = true
GROUP BY street_address, city, state, postal_code, country
ORDER BY customers_now_using_this_address DESC;

-- Show sample updated addresses
SELECT 'VERIFICATION: SAMPLE UPDATED ADDRESSES' as section;
SELECT 
    usa.suite_number,
    up.first_name || ' ' || up.last_name as customer_name,
    up.first_name || ' ' || up.last_name || ' (' || usa.suite_number || ')' || E'\n' ||
    usa.street_address || E'\n' ||
    usa.suite_number || E'\n' ||
    usa.city || ', ' || usa.state || ' ' || usa.postal_code || E'\n' ||
    usa.country as updated_address_format,
    usa.updated_at as last_modified
FROM public.user_profiles up
JOIN public.us_shipping_addresses usa ON up.us_shipping_address_id = usa.id
WHERE up.role = 'customer'
AND usa.is_active = true
ORDER BY usa.updated_at DESC
LIMIT 5;

-- Check for any inconsistencies after updates
SELECT 'VERIFICATION: CONSISTENCY CHECK' as section;
WITH address_counts AS (
    SELECT 
        street_address || '|' || city || '|' || state || '|' || postal_code as address_key,
        COUNT(*) as customer_count
    FROM public.us_shipping_addresses
    WHERE is_active = true
    GROUP BY street_address, city, state, postal_code
)
SELECT 
    CASE 
        WHEN COUNT(DISTINCT address_key) = 1 
        THEN '✅ SUCCESS: All customers use the same warehouse address'
        ELSE '⚠️ WARNING: ' || COUNT(DISTINCT address_key) || ' different warehouse addresses found'
    END as consistency_status,
    COUNT(*) as total_address_variations
FROM address_counts;

-- =====================================================
-- ROLLBACK TEMPLATES
-- Use these if you need to undo changes
-- =====================================================

-- Rollback to previous warehouse address (if you know the old values)
-- SELECT update_master_warehouse_address(
--     'OLD STREET ADDRESS',  -- 🔄 Previous street address
--     'OLD CITY',           -- 🔄 Previous city
--     'OLD STATE',          -- 🔄 Previous state
--     'OLD ZIP',            -- 🔄 Previous ZIP
--     'OLD COUNTRY'         -- 🔄 Previous country
-- );

-- Rollback suite number change
-- UPDATE public.us_shipping_addresses 
-- SET suite_number = 'VC-ORIGINAL'  -- 🔄 Original suite number
-- WHERE suite_number = 'VC-CHANGED'  -- 🔄 Changed suite number
-- AND updated_at > '2025-09-14';     -- 🔄 Only recent changes

-- =====================================================
-- COMMON UPDATE SCENARIOS
-- =====================================================

-- SCENARIO 1: Moving from Atlanta to Miami warehouse
-- SELECT update_master_warehouse_address('456 Miami Logistics Center', 'Miami', 'FL', '33137', 'USA');

-- SCENARIO 2: Moving from USA to Canada warehouse  
-- SELECT update_master_warehouse_address('789 Toronto Warehouse St', 'Toronto', 'ON', 'M5V 3A8', 'Canada');

-- SCENARIO 3: Just changing street address (same city)
-- UPDATE public.us_shipping_addresses SET street_address = 'New Building Address' WHERE is_active = true;

-- SCENARIO 4: Updating ZIP code due to postal service changes
-- UPDATE public.us_shipping_addresses SET postal_code = 'NEW-ZIP' WHERE postal_code = 'OLD-ZIP' AND is_active = true;

SELECT 'ADDRESS UPDATE QUERIES READY!' as status;
SELECT '⚠️ IMPORTANT: Always test updates on a small subset first!' as warning;
SELECT '💡 TIP: Run verification queries after each update to confirm success' as tip;
