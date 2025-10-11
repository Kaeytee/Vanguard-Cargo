-- ============================================================================
-- Test Notification Triggers
-- ============================================================================
-- Description: Test package and shipment notification triggers
-- Usage: Run this after installing the triggers to verify they work
-- ============================================================================

-- ============================================================================
-- STEP 1: Verify Triggers Exist
-- ============================================================================
SELECT 
    trigger_name,
    event_object_table as table_name,
    action_timing,
    event_manipulation as event_type
FROM information_schema.triggers
WHERE trigger_name IN (
    'trigger_notify_package_status_change',
    'trigger_notify_shipment_status_change'
)
ORDER BY trigger_name;

-- Expected: 2 rows showing both triggers

-- ============================================================================
-- STEP 2: Find Your User ID
-- ============================================================================
-- Replace with your actual email
SELECT id, email, first_name, last_name, suite_number
FROM users
WHERE email = 'YOUR_EMAIL_HERE';
-- Copy the 'id' value to use in steps below

-- ============================================================================
-- STEP 3: Test Package Status Trigger
-- ============================================================================

-- 3a. Find a package for your user
SELECT 
    id,
    user_id,
    status,
    tracking_number,
    description
FROM packages
WHERE user_id = 'YOUR_USER_ID_HERE'  -- Replace with your user ID from Step 2
LIMIT 1;
-- Copy the package 'id' for next step

-- 3b. Count notifications before update
SELECT COUNT(*) as notifications_before
FROM notifications
WHERE user_id = 'YOUR_USER_ID_HERE';  -- Replace with your user ID

-- 3c. Update package status (this should trigger notification)
UPDATE packages
SET status = 'processing'
WHERE id = 'YOUR_PACKAGE_ID_HERE';  -- Replace with package ID from 3a
-- Note: Change status to something different from current status

-- 3d. Count notifications after update
SELECT COUNT(*) as notifications_after
FROM notifications
WHERE user_id = 'YOUR_USER_ID_HERE';  -- Replace with your user ID

-- 3e. View the newly created notification
SELECT 
    id,
    title,
    message,
    type,
    is_read,
    created_at
FROM notifications
WHERE user_id = 'YOUR_USER_ID_HERE'  -- Replace with your user ID
ORDER BY created_at DESC
LIMIT 1;

-- Expected:
-- - notifications_after should be 1 more than notifications_before
-- - type should be 'package_update'
-- - message should mention the package
-- - is_read should be false

-- ============================================================================
-- STEP 4: Test Shipment Status Trigger
-- ============================================================================

-- 4a. Find a shipment for your user
SELECT 
    id,
    user_id,
    status,
    tracking_number,
    recipient_name
FROM shipments
WHERE user_id = 'YOUR_USER_ID_HERE'  -- Replace with your user ID
LIMIT 1;
-- Copy the shipment 'id' for next step

-- 4b. Count notifications before update
SELECT COUNT(*) as notifications_before_shipment
FROM notifications
WHERE user_id = 'YOUR_USER_ID_HERE'  -- Replace with your user ID

-- 4c. Update shipment status (this should trigger notification)
UPDATE shipments
SET status = 'in_transit'
WHERE id = 'YOUR_SHIPMENT_ID_HERE';  -- Replace with shipment ID from 4a
-- Note: Change status to something different from current status

-- 4d. Count notifications after update
SELECT COUNT(*) as notifications_after_shipment
FROM notifications
WHERE user_id = 'YOUR_USER_ID_HERE';  -- Replace with your user ID

-- 4e. View the newly created notification
SELECT 
    id,
    title,
    message,
    type,
    is_read,
    created_at
FROM notifications
WHERE user_id = 'YOUR_USER_ID_HERE'  -- Replace with your user ID
ORDER BY created_at DESC
LIMIT 1;

-- Expected:
-- - notifications_after_shipment should be 1 more than notifications_before_shipment
-- - type should be 'shipment_update'
-- - message should mention the shipment and recipient
-- - is_read should be false

-- ============================================================================
-- STEP 5: Test Multiple Status Changes
-- ============================================================================

-- Change package status multiple times and verify each creates a notification
UPDATE packages
SET status = 'received'
WHERE id = 'YOUR_PACKAGE_ID_HERE';  -- Replace with package ID

-- Wait a moment, then change again
UPDATE packages
SET status = 'shipped'
WHERE id = 'YOUR_PACKAGE_ID_HERE';  -- Replace with package ID

-- Check that 2 new notifications were created
SELECT 
    title,
    message,
    type,
    created_at
FROM notifications
WHERE user_id = 'YOUR_USER_ID_HERE'  -- Replace with your user ID
ORDER BY created_at DESC
LIMIT 5;

-- Expected: Multiple notifications with different messages for each status change

-- ============================================================================
-- STEP 6: Verify No Notification for Same Status
-- ============================================================================

-- Count current notifications
SELECT COUNT(*) as count_before_same_status
FROM notifications
WHERE user_id = 'YOUR_USER_ID_HERE';

-- Update to SAME status (should NOT create notification)
UPDATE packages
SET status = 'shipped',  -- Same as current status
    updated_at = NOW()   -- Only timestamp changes
WHERE id = 'YOUR_PACKAGE_ID_HERE';

-- Count again
SELECT COUNT(*) as count_after_same_status
FROM notifications
WHERE user_id = 'YOUR_USER_ID_HERE';

-- Expected: count_after_same_status should equal count_before_same_status
-- (No new notification because status didn't actually change)

-- ============================================================================
-- STEP 7: Test Batch Updates
-- ============================================================================

-- Update multiple packages at once
UPDATE packages
SET status = 'processing'
WHERE user_id = 'YOUR_USER_ID_HERE'  -- Replace with your user ID
  AND status = 'received'
RETURNING id, status;

-- Check that one notification was created for EACH package
SELECT 
    COUNT(*) as notification_count,
    type
FROM notifications
WHERE user_id = 'YOUR_USER_ID_HERE'  -- Replace with your user ID
  AND type = 'package_update'
  AND created_at > NOW() - INTERVAL '1 minute'
GROUP BY type;

-- ============================================================================
-- CLEANUP (Optional)
-- ============================================================================
-- If you want to remove test notifications:

-- DELETE FROM notifications
-- WHERE user_id = 'YOUR_USER_ID_HERE'
--   AND created_at > NOW() - INTERVAL '10 minutes';

-- ============================================================================
-- VERIFICATION CHECKLIST
-- ============================================================================
-- ✅ Step 1: Both triggers exist in information_schema.triggers
-- ✅ Step 3: Package status change creates notification with type 'package_update'
-- ✅ Step 4: Shipment status change creates notification with type 'shipment_update'
-- ✅ Step 5: Multiple status changes create multiple notifications
-- ✅ Step 6: Same status update does NOT create duplicate notification
-- ✅ Step 7: Batch updates create one notification per affected record
-- ============================================================================

-- If all checks pass: ✅ Triggers are working correctly!
-- If any check fails: Review trigger installation and check database logs

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- Check if trigger functions exist:
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_name IN (
    'notify_package_status_change',
    'notify_shipment_status_change'
);
-- Expected: 2 rows showing both functions

-- Check recent database notices/warnings:
-- (These appear in Supabase logs or postgres logs)

-- View trigger definition:
SELECT 
    trigger_name,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_notify_package_status_change';

-- ============================================================================
-- END OF TEST SCRIPT
-- ============================================================================
