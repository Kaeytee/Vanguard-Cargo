-- Debug query to check packages status and data
-- Run this in Supabase SQL editor to see what packages exist

-- 1. Check all packages for the user (replace with your actual user_id)
SELECT 
    id,
    package_id,
    tracking_number,
    status,
    processed_at,
    shipped_at,
    created_at,
    updated_at,
    user_id,
    store_name,
    sender_name,
    description
FROM packages 
WHERE user_id = '06b38658-faf5-4a7e-b3ca-2c8ea1613ca0'  -- Replace with your actual user_id
ORDER BY created_at DESC;

-- 2. Count packages by status
SELECT 
    status,
    COUNT(*) as count
FROM packages 
WHERE user_id = '06b38658-faf5-4a7e-b3ca-2c8ea1613ca0'  -- Replace with your actual user_id
GROUP BY status;

-- 3. Check if processed_at and shipped_at columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'packages' 
AND column_name IN ('processed_at', 'shipped_at');

-- 4. Check packages that should be in shipment history (shipped status)
SELECT 
    id,
    package_id,
    status,
    shipped_at,
    processed_at,
    created_at
FROM packages 
WHERE user_id = '06b38658-faf5-4a7e-b3ca-2c8ea1613ca0'  -- Replace with your actual user_id
AND status = 'shipped';

-- 5. Check packages in processing that might need to be moved
SELECT 
    id,
    package_id,
    status,
    processed_at,
    CASE 
        WHEN processed_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (NOW() - processed_at::timestamp)) / 3600 
        ELSE NULL 
    END as hours_in_processing
FROM packages 
WHERE user_id = '06b38658-faf5-4a7e-b3ca-2c8ea1613ca0'  -- Replace with your actual user_id
AND status = 'processing';
