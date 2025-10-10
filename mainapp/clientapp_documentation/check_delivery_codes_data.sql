-- ============================================================================
-- QUICK DATA CHECK FOR DELIVERY CODES
-- ============================================================================
-- Your user ID from logs: 228624ae-1c23-4557-9984-cca1c0bb86f7
-- Run this in Supabase SQL Editor to see what's actually in the database
-- ============================================================================

-- Step 1: Check if delivery_codes table has ANY data
-- ============================================================================
SELECT 
    COUNT(*) as total_codes,
    COUNT(DISTINCT package_id) as unique_packages
FROM public.delivery_codes;

-- Step 2: Check delivery codes for YOUR user specifically
-- ============================================================================
SELECT 
    dc.*,
    p.package_id,
    p.status as package_status,
    p.user_id as package_owner
FROM public.delivery_codes dc
JOIN public.packages p ON p.id = dc.package_id
WHERE p.user_id = '228624ae-1c23-4557-9984-cca1c0bb86f7'::UUID;

-- Step 3: Check your packages that should have codes
-- ============================================================================
SELECT 
    p.id,
    p.package_id,
    p.tracking_number,
    p.status,
    p.user_id,
    CASE 
        WHEN dc.id IS NOT NULL THEN '✅ HAS CODE'
        ELSE '❌ NO CODE'
    END as has_delivery_code
FROM public.packages p
LEFT JOIN public.delivery_codes dc ON dc.package_id = p.id
WHERE p.user_id = '228624ae-1c23-4557-9984-cca1c0bb86f7'::UUID
ORDER BY p.created_at DESC
LIMIT 10;

-- Step 4: Check what the RPC function returns
-- ============================================================================
SELECT * FROM public.get_customer_delivery_codes('228624ae-1c23-4557-9984-cca1c0bb86f7'::UUID);

-- Step 5: Check if the function even exists
-- ============================================================================
SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments,
    p.prosecdef AS "Security Definer"
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'get_customer_delivery_codes';

-- Step 6: Check the delivery_codes table structure
-- ============================================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'delivery_codes'
ORDER BY ordinal_position;

-- Step 7: Check RLS policies are active
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd AS operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'delivery_codes';

-- ============================================================================
-- INTERPRETATION GUIDE
-- ============================================================================
-- 
-- If Step 1 shows total_codes = 0:
--   → No codes exist in the database at all
--   → Need to check code generation trigger/function
--
-- If Step 2 returns 0 rows but Step 1 shows codes exist:
--   → Codes exist but not for your user
--   → Check if packages belong to correct user
--
-- If Step 3 shows packages with "NO CODE":
--   → Packages exist but codes aren't being generated
--   → Check code generation trigger
--
-- If Step 4 returns empty but Step 2 shows data:
--   → RPC function has issues or doesn't exist
--   → Need to create/fix the function
--
-- If Step 5 returns no rows:
--   → Function doesn't exist - need to create it
--
