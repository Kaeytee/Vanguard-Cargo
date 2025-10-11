-- ============================================================================
-- Test Notification Creation Script
-- ============================================================================
-- Description: Create test notifications to verify toast system
-- Purpose: Testing real-time notification toasts
-- Usage: Replace USER_ID_HERE with actual user ID from users table
-- ============================================================================

-- ============================================================================
-- STEP 1: Get your user ID
-- ============================================================================
-- Run this first to get your user ID:
SELECT id, email, first_name, last_name 
FROM users 
WHERE email = 'YOUR_EMAIL_HERE';
-- Copy the 'id' value and use it below

-- ============================================================================
-- STEP 2: Create Test Notifications
-- ============================================================================

-- Test 1: Simple System Notification
INSERT INTO notifications (user_id, title, message, type, read_status)
VALUES (
  'USER_ID_HERE',  -- Replace with your user ID
  'System Update',
  'Your dashboard has new features available!',
  'in_app',
  false
);

-- Test 2: Package Status Notification
INSERT INTO notifications (user_id, title, message, type, read_status)
VALUES (
  'USER_ID_HERE',  -- Replace with your user ID
  'Package Status Update',
  'Your package from Amazon (TRK123456) has been received at our warehouse.',
  'in_app',
  false
);

-- Test 3: Shipment Notification
INSERT INTO notifications (user_id, title, message, type, read_status)
VALUES (
  'USER_ID_HERE',  -- Replace with your user ID
  'Shipment Shipped',
  'Your shipment to John Doe (SHP789012) has been shipped and is on its way.',
  'in_app',
  false
);

-- Test 4: Urgent Alert
INSERT INTO notifications (user_id, title, message, type, read_status)
VALUES (
  'USER_ID_HERE',  -- Replace with your user ID
  'Action Required',
  'Please update your delivery address for pending shipment.',
  'in_app',
  false
);

-- Test 5: Delivery Confirmation
INSERT INTO notifications (user_id, title, message, type, read_status)
VALUES (
  'USER_ID_HERE',  -- Replace with your user ID
  'Package Delivered',
  'Your package has been delivered successfully at 2:30 PM today.',
  'in_app',
  false
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Check created notifications:
SELECT 
  id,
  title,
  message,
  type,
  read_status,
  created_at
FROM notifications
WHERE user_id = 'USER_ID_HERE'  -- Replace with your user ID
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- CLEANUP (Optional)
-- ============================================================================
-- To delete test notifications:
-- DELETE FROM notifications 
-- WHERE user_id = 'USER_ID_HERE' 
-- AND title LIKE 'Test%';

-- ============================================================================
-- REALTIME TESTING
-- ============================================================================
-- To test real-time toasts:
-- 1. Make sure you're logged in to the app
-- 2. Keep the app open in your browser
-- 3. Open Supabase SQL Editor in another tab
-- 4. Run ONE of the INSERT statements above
-- 5. Switch back to app - toast should appear immediately!

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================
-- If toasts don't appear:

-- 1. Check if realtime is enabled for notifications table:
SELECT * FROM pg_publication_tables WHERE tablename = 'notifications';
-- Should return a row if enabled

-- 2. Enable realtime if needed:
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 3. Set replica identity:
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- 4. Check RLS policies allow SELECT:
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'notifications';

-- ============================================================================
-- NOTES
-- ============================================================================
-- - Toast notifications appear for 6 seconds by default
-- - Click on toast to navigate to notifications page
-- - Toasts show immediately when notification is created
-- - Works on all pages of the application
-- - Only shows notifications for logged-in user
-- ============================================================================
