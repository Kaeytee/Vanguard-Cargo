-- ============================================================================
-- TEST MARK ALL NOTIFICATIONS AS READ FUNCTION
-- ============================================================================
-- Description: Test script to verify mark_all_notifications_read function
-- Author: Senior Software Engineer
-- Date: 2025-10-09
-- ============================================================================

-- ============================================================================
-- STEP 1: Get your actual user ID
-- ============================================================================
-- Run this first to get your user ID (replace with your email)
SELECT 
  id as user_id,
  email,
  first_name,
  last_name
FROM auth.users
WHERE email = 'your-email@example.com';  -- ⚠️ REPLACE WITH YOUR ACTUAL EMAIL

-- Alternative: Get the first user in the system
-- SELECT id as user_id, email FROM auth.users LIMIT 1;

-- ============================================================================
-- STEP 2: Check current unread count
-- ============================================================================
-- Replace 'USER_ID_HERE' with the UUID from Step 1
SELECT COUNT(*) as unread_count
FROM notifications 
WHERE user_id = 'USER_ID_HERE' AND read_status = false;

-- ============================================================================
-- STEP 3: Mark all as read
-- ============================================================================
-- Replace 'USER_ID_HERE' with the UUID from Step 1
SELECT * FROM mark_all_notifications_read('USER_ID_HERE');

-- ============================================================================
-- STEP 4: Verify all are now read
-- ============================================================================
-- Replace 'USER_ID_HERE' with the UUID from Step 1
SELECT COUNT(*) as unread_count
FROM notifications 
WHERE user_id = 'USER_ID_HERE' AND read_status = false;
-- Should return 0

-- ============================================================================
-- BONUS: View all your notifications
-- ============================================================================
-- Replace 'USER_ID_HERE' with the UUID from Step 1
SELECT 
  id,
  title,
  message,
  read_status,
  created_at,
  updated_at
FROM notifications 
WHERE user_id = 'USER_ID_HERE'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- QUICK TEST (ALL IN ONE)
-- ============================================================================
-- Copy this block and replace USER_ID_HERE with your actual UUID from Step 1

/*
DO $$
DECLARE
  v_user_id UUID := 'USER_ID_HERE'; -- ⚠️ REPLACE THIS
  v_unread_before INT;
  v_unread_after INT;
  v_updated_count INT;
BEGIN
  -- Check unread count before
  SELECT COUNT(*) INTO v_unread_before
  FROM notifications 
  WHERE user_id = v_user_id AND read_status = false;
  
  RAISE NOTICE '📊 Unread notifications before: %', v_unread_before;
  
  -- Mark all as read
  SELECT updated_count INTO v_updated_count
  FROM mark_all_notifications_read(v_user_id);
  
  RAISE NOTICE '✅ Marked % notifications as read', v_updated_count;
  
  -- Check unread count after
  SELECT COUNT(*) INTO v_unread_after
  FROM notifications 
  WHERE user_id = v_user_id AND read_status = false;
  
  RAISE NOTICE '📊 Unread notifications after: %', v_unread_after;
  
  -- Verify
  IF v_unread_after = 0 THEN
    RAISE NOTICE '✅ SUCCESS: All notifications are now read!';
  ELSE
    RAISE NOTICE '❌ FAILED: Still have % unread notifications', v_unread_after;
  END IF;
END $$;
*/
