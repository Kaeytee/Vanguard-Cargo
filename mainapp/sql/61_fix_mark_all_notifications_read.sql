-- ============================================================================
-- FIX MARK ALL NOTIFICATIONS AS READ FUNCTION
-- ============================================================================
-- Description: Creates a reliable database function to mark all notifications as read
-- Author: Senior Software Engineer
-- Date: 2025-10-09
-- ============================================================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS mark_all_notifications_read(UUID);

-- ============================================================================
-- FUNCTION: mark_all_notifications_read
-- ============================================================================
-- Marks all unread notifications for a user as read
-- Returns the count of notifications that were updated
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS TABLE(updated_count INT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
BEGIN
  -- Update all unread notifications for the user
  UPDATE notifications
  SET 
    read_status = true,
    updated_at = NOW()
  WHERE 
    user_id = p_user_id 
    AND read_status = false;
  
  -- Get the count of updated rows
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Log the action
  RAISE NOTICE 'Marked % notifications as read for user %', v_count, p_user_id;
  
  -- Return the count
  RETURN QUERY SELECT v_count;
END;
$$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT EXECUTE ON FUNCTION mark_all_notifications_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read(UUID) TO service_role;

-- ============================================================================
-- FUNCTION COMMENTS
-- ============================================================================
COMMENT ON FUNCTION mark_all_notifications_read(UUID) IS 
'Marks all unread notifications for a specific user as read. Returns the count of notifications updated.';

-- ============================================================================
-- VERIFICATION QUERY (run this to test)
-- ============================================================================
-- SELECT * FROM mark_all_notifications_read('your-user-id-here');

-- ============================================================================
-- ALTERNATIVE: Add updated_at column if it doesn't exist
-- ============================================================================
-- Check if updated_at column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE notifications ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    COMMENT ON COLUMN notifications.updated_at IS 'Timestamp of last update';
  END IF;
END $$;

-- ============================================================================
-- CREATE INDEX for better performance
-- ============================================================================
-- Index on user_id and read_status for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_status 
ON notifications(user_id, read_status) 
WHERE read_status = false;

COMMENT ON INDEX idx_notifications_user_read_status IS 
'Improves performance when querying unread notifications for a user';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ mark_all_notifications_read function created successfully';
  RAISE NOTICE '✅ Performance index created';
  RAISE NOTICE '✅ Permissions granted to authenticated and service_role';
END $$;
