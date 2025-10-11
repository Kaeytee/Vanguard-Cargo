-- ============================================================================
-- Package Status Notification Trigger
-- ============================================================================
-- Description: Automatically create notifications when package status changes
-- Purpose: Ensure users receive notifications even when packages are updated
--          directly (not through update_package_status function)
-- Created: 2025-10-11
-- ============================================================================

-- ============================================================================
-- DROP EXISTING TRIGGER AND FUNCTION (if exists)
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_notify_package_status_change ON packages;
DROP FUNCTION IF EXISTS notify_package_status_change();

-- ============================================================================
-- CREATE TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION notify_package_status_change()
RETURNS TRIGGER AS $$
DECLARE
    notification_title TEXT;
    notification_message TEXT;
    status_description TEXT;
BEGIN
    -- Only create notification if status actually changed
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        
        -- Map status to user-friendly description
        CASE NEW.status
            WHEN 'pending' THEN
                status_description := 'is pending receipt at our warehouse';
            WHEN 'received' THEN
                status_description := 'has been received at our warehouse';
            WHEN 'processing' THEN
                status_description := 'is being processed';
            WHEN 'shipped' THEN
                status_description := 'has been shipped and is on its way';
            WHEN 'delivered' THEN
                status_description := 'has been delivered successfully';
            WHEN 'on_hold' THEN
                status_description := 'has been placed on hold';
            ELSE
                status_description := 'status has been updated to ' || NEW.status;
        END CASE;
        
        -- Build notification title
        notification_title := 'Package Status Update';
        
        -- Build notification message
        IF NEW.tracking_number IS NOT NULL AND NEW.tracking_number != '' THEN
            notification_message := 'Your package (' || NEW.tracking_number || ') ' || status_description || '.';
        ELSIF NEW.description IS NOT NULL AND NEW.description != '' THEN
            notification_message := 'Your package "' || NEW.description || '" ' || status_description || '.';
        ELSE
            notification_message := 'Your package ' || status_description || '.';
        END IF;
        
        -- Create notification
        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            is_read,
            created_at
        ) VALUES (
            NEW.user_id,
            notification_title,
            notification_message,
            'package_update',
            false,
            NOW()
        );
        
        -- Log for debugging
        RAISE NOTICE 'Created notification for user % about package % status change: % -> %', 
            NEW.user_id, NEW.id, OLD.status, NEW.status;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CREATE TRIGGER
-- ============================================================================
-- Trigger fires AFTER UPDATE on packages table
-- Only when status column changes
CREATE TRIGGER trigger_notify_package_status_change
    AFTER UPDATE OF status ON packages
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION notify_package_status_change();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
-- Ensure the function can be executed by the trigger
GRANT EXECUTE ON FUNCTION notify_package_status_change() TO postgres, authenticated, service_role;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify the trigger was created successfully:
-- SELECT trigger_name, event_manipulation, event_object_table, action_statement
-- FROM information_schema.triggers
-- WHERE trigger_name = 'trigger_notify_package_status_change';

-- ============================================================================
-- TESTING
-- ============================================================================
-- Test the trigger with a package status update:
-- 
-- 1. Find a package ID:
--    SELECT id, user_id, status, tracking_number FROM packages LIMIT 1;
--
-- 2. Update the package status:
--    UPDATE packages SET status = 'processing' WHERE id = 'YOUR_PACKAGE_ID';
--
-- 3. Check if notification was created:
--    SELECT * FROM notifications 
--    WHERE user_id = 'YOUR_USER_ID' 
--    ORDER BY created_at DESC LIMIT 1;
--
-- 4. Expected result: A new notification with type 'package_update' should exist
-- ============================================================================

-- ============================================================================
-- NOTES
-- ============================================================================
-- - Trigger only fires when status column changes (not on other column updates)
-- - Notifications are created with type 'package_update' to match frontend
-- - If tracking_number exists, it's included in the notification message
-- - If no tracking_number, uses description or generic message
-- - SECURITY DEFINER ensures trigger has permissions to insert notifications
-- - Works with both function-based updates and direct table updates
-- ============================================================================

COMMENT ON FUNCTION notify_package_status_change() IS 
'Automatically creates user notifications when package status changes. 
Triggered by any UPDATE to packages.status column.';

COMMENT ON TRIGGER trigger_notify_package_status_change ON packages IS 
'Fires after package status updates to create user notifications automatically.';

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
