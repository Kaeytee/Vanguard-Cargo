-- =====================================================
-- 02_MASTER_ADDRESS_MANAGEMENT.SQL
-- Set and update warehouse address for all customers
-- 
-- PURPOSE: Manage the master warehouse address that all customers share
-- WHEN TO RUN: After running 01_setup_functions.sql
-- SAFE TO RE-RUN: Yes, will update all customer addresses
-- =====================================================

-- STEP 1: Check current warehouse address (if any)
-- This shows what address customers are currently using
SELECT 'CURRENT WAREHOUSE ADDRESSES:' as step;
SELECT DISTINCT
    street_address,
    city,
    state,
    postal_code,
    country,
    COUNT(*) as customers_using_this_address
FROM public.us_shipping_addresses
WHERE is_active = true
GROUP BY street_address, city, state, postal_code, country
ORDER BY customers_using_this_address DESC;

-- STEP 2: Set your master warehouse address
-- CUSTOMIZE THESE VALUES WITH YOUR ACTUAL WAREHOUSE DETAILS
SELECT update_master_warehouse_address(
    '123 Warehouse Street',  -- 🔄 CHANGE THIS: Your actual warehouse street address
    'Atlanta',               -- 🔄 CHANGE THIS: Your warehouse city  
    'GA',                   -- 🔄 CHANGE THIS: Your warehouse state
    '30309',                -- 🔄 CHANGE THIS: Your warehouse ZIP code
    'USA'                   -- 🔄 CHANGE THIS: Country (if not USA)
) as customers_updated;

-- STEP 3: Verify the update worked
SELECT 'UPDATED WAREHOUSE ADDRESS:' as step;
SELECT DISTINCT
    street_address,
    city,
    state,
    postal_code,
    country,
    COUNT(*) as customers_now_using_this_address,
    MAX(updated_at) as last_updated
FROM public.us_shipping_addresses
WHERE is_active = true
GROUP BY street_address, city, state, postal_code, country;

-- STEP 4: Preview what customers will see
SELECT 'CUSTOMER ADDRESS PREVIEW:' as step;
SELECT 
    up.first_name || ' ' || up.last_name || ' (' || usa.suite_number || ')' as name_line,
    usa.street_address as address_line_1,
    usa.suite_number as address_line_2,
    usa.city || ', ' || usa.state || ' ' || usa.postal_code as city_state_zip_line,
    usa.country as country_line,
    '--- COMPLETE ADDRESS ---' as separator,
    up.first_name || ' ' || up.last_name || ' (' || usa.suite_number || ')' || E'\n' ||
    usa.street_address || E'\n' ||
    usa.suite_number || E'\n' ||
    usa.city || ', ' || usa.state || ' ' || usa.postal_code || E'\n' ||
    usa.country as complete_customer_address
FROM public.user_profiles up
JOIN public.us_shipping_addresses usa ON up.us_shipping_address_id = usa.id
WHERE up.role = 'customer'
AND usa.is_active = true
ORDER BY usa.suite_number
LIMIT 3;

-- =====================================================
-- ALTERNATIVE: Update specific address components only
-- Use these if you only want to change part of the address
-- =====================================================

-- Update only street address for all customers
-- UPDATE public.us_shipping_addresses 
-- SET street_address = 'New Street Address Only',
--     updated_at = NOW()
-- WHERE is_active = true;

-- Update only city for all customers  
-- UPDATE public.us_shipping_addresses 
-- SET city = 'New City Only',
--     updated_at = NOW()
-- WHERE is_active = true;

-- Update only state and ZIP for all customers
-- UPDATE public.us_shipping_addresses 
-- SET state = 'FL',
--     postal_code = '33137',
--     updated_at = NOW()
-- WHERE is_active = true;

-- =====================================================
-- EXAMPLES FOR COMMON WAREHOUSE MOVES
-- Uncomment and customize as needed
-- =====================================================

-- Example 1: Move from Atlanta to Miami
-- SELECT update_master_warehouse_address('456 Miami Warehouse Ave', 'Miami', 'FL', '33137', 'USA');

-- Example 2: Move from Georgia to Texas
-- SELECT update_master_warehouse_address('789 Dallas Logistics Center', 'Dallas', 'TX', '75201', 'USA');

-- Example 3: Move from USA to Canada (international warehouse)
-- SELECT update_master_warehouse_address('123 Toronto Warehouse St', 'Toronto', 'ON', 'M5V 3A8', 'Canada');

-- Success message
SELECT 'SUCCESS: Master warehouse address has been set!' as status;
SELECT 'NEXT STEP: Run 03_customer_address_assignment.sql to assign suite numbers to customers' as next_step;
