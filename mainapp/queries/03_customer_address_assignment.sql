-- =====================================================
-- 03_CUSTOMER_ADDRESS_ASSIGNMENT.SQL
-- Assign unique suite numbers to customers
-- 
-- PURPOSE: Give each customer a unique suite number for package forwarding
-- WHEN TO RUN: After setting master warehouse address
-- SAFE TO RE-RUN: Yes, will only assign to customers without addresses
-- =====================================================

-- STEP 1: Check which customers need addresses
SELECT 'CUSTOMERS NEEDING ADDRESSES:' as step;
SELECT 
    up.id as customer_uuid,
    up.first_name,
    up.last_name, 
    up.email,
    up.created_at,
    'NEEDS ADDRESS' as status
FROM public.user_profiles up
WHERE up.us_shipping_address_id IS NULL
AND up.role = 'customer'
ORDER BY up.created_at;

-- Count of customers needing addresses
SELECT 
    COUNT(CASE WHEN up.us_shipping_address_id IS NULL THEN 1 END) as customers_needing_addresses,
    COUNT(CASE WHEN up.us_shipping_address_id IS NOT NULL THEN 1 END) as customers_with_addresses,
    COUNT(*) as total_customers
FROM public.user_profiles up
WHERE up.role = 'customer';

-- STEP 2: Preview next suite numbers
SELECT 'NEXT AVAILABLE SUITE NUMBERS:' as step;
SELECT get_next_suite_number() as next_suite_number;

-- Show what suite numbers will be assigned
WITH customers_needing_addresses AS (
    SELECT 
        up.id,
        up.first_name,
        up.last_name,
        up.email,
        ROW_NUMBER() OVER (ORDER BY up.created_at) as assignment_order
    FROM public.user_profiles up
    WHERE up.us_shipping_address_id IS NULL
    AND up.role = 'customer'
),
next_suite_base AS (
    SELECT COALESCE(MAX(CAST(SUBSTRING(suite_number FROM 'VC-([0-9]+)') AS INTEGER)), 10000) as max_suite
    FROM public.us_shipping_addresses
    WHERE suite_number ~ '^VC-[0-9]+$'
)
SELECT 
    cna.first_name,
    cna.last_name,
    cna.email,
    'VC-' || LPAD((nsb.max_suite + cna.assignment_order)::TEXT, 5, '0') as will_get_suite_number
FROM customers_needing_addresses cna
CROSS JOIN next_suite_base nsb
ORDER BY cna.assignment_order
LIMIT 10;

-- STEP 3: Assign suite numbers to all customers without addresses
-- This will assign VC-10001, VC-10002, VC-10003, etc.
SELECT 'ASSIGNING SUITE NUMBERS:' as step;

DO $$
DECLARE
    customer_record RECORD;
    assigned_suite TEXT;
    total_assigned INTEGER := 0;
BEGIN
    -- Loop through all customers without addresses
    FOR customer_record IN 
        SELECT id, first_name, last_name, email 
        FROM public.user_profiles 
        WHERE us_shipping_address_id IS NULL 
        AND role = 'customer'
        ORDER BY created_at
    LOOP
        -- Assign suite number (format: VC-#####)
        SELECT assign_next_suite_number(customer_record.id) INTO assigned_suite;
        
        total_assigned := total_assigned + 1;
        
        RAISE NOTICE 'Assigned % to % % (Email: %)', 
            assigned_suite, 
            customer_record.first_name, 
            customer_record.last_name,
            customer_record.email;
    END LOOP;
    
    RAISE NOTICE 'SUCCESS: Total customers assigned suite numbers: %', total_assigned;
END $$;

-- STEP 4: Verify assignments completed successfully
SELECT 'VERIFICATION - CUSTOMERS WITH ADDRESSES:' as step;
SELECT 
    up.first_name || ' ' || up.last_name as customer_name,
    up.email,
    usa.suite_number,
    usa.assigned_at,
    '✓ HAS ADDRESS' as status
FROM public.user_profiles up
JOIN public.us_shipping_addresses usa ON up.us_shipping_address_id = usa.id
WHERE up.role = 'customer'
AND usa.is_active = true
ORDER BY usa.suite_number;

-- Final count verification
SELECT 
    COUNT(CASE WHEN up.us_shipping_address_id IS NULL THEN 1 END) as customers_still_needing_addresses,
    COUNT(CASE WHEN up.us_shipping_address_id IS NOT NULL THEN 1 END) as customers_with_addresses,
    COUNT(*) as total_customers
FROM public.user_profiles up
WHERE up.role = 'customer';

-- =====================================================
-- MANUAL ASSIGNMENT (if needed)
-- Use these to assign addresses to specific customers
-- =====================================================

-- Assign address to a specific customer by email
-- SELECT assign_next_suite_number(
--     (SELECT id FROM public.user_profiles WHERE email = 'customer@example.com')
-- ) as assigned_suite;

-- Assign address to a specific customer by UUID
-- SELECT assign_next_suite_number('REPLACE-WITH-ACTUAL-UUID') as assigned_suite;

-- Assign addresses to customers created after a specific date
-- DO $$
-- DECLARE
--     customer_record RECORD;
-- BEGIN
--     FOR customer_record IN 
--         SELECT id FROM public.user_profiles 
--         WHERE us_shipping_address_id IS NULL 
--         AND role = 'customer'
--         AND created_at >= '2025-09-01'  -- Change this date
--     LOOP
--         PERFORM assign_next_suite_number(customer_record.id);
--     END LOOP;
-- END $$;

-- Success message
SELECT 'SUCCESS: All customers have been assigned suite numbers!' as status;
SELECT 'NEXT STEP: Run 04_verification_queries.sql to verify everything is working' as next_step;
