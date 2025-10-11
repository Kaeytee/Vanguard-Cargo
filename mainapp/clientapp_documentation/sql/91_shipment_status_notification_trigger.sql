-- ============================================================================
-- Shipment Status Notification Trigger
-- ============================================================================
-- Description: Automatically create notifications when shipment status changes
-- Purpose: Ensure users receive notifications for shipment tracking updates
-- Created: 2025-10-11
-- ============================================================================

-- ============================================================================
-- DROP EXISTING TRIGGER AND FUNCTION (if exists)
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_notify_shipment_status_change ON shipments;
DROP FUNCTION IF EXISTS notify_shipment_status_change();

-- ============================================================================
-- CREATE TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION notify_shipment_status_change()
RETURNS TRIGGER AS $$
DECLARE
    notification_title TEXT;
    notification_message TEXT;
    status_description TEXT;
    tracking_info TEXT;
BEGIN
    -- Only create notification if status actually changed
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        
        -- Map status to user-friendly description
        CASE NEW.status
            WHEN 'pending' THEN
                status_description := 'is being prepared';
            WHEN 'in_transit' THEN
                status_description := 'is now in transit';
            WHEN 'shipped' THEN
                status_description := 'has been shipped and is on its way';
            WHEN 'out_for_delivery' THEN
                status_description := 'is out for delivery';
            WHEN 'delivered' THEN
                status_description := 'has been delivered successfully';
            WHEN 'delayed' THEN
                status_description := 'has been delayed - we apologize for the inconvenience';
            WHEN 'cancelled' THEN
                status_description := 'has been cancelled';
            ELSE
                status_description := 'status has been updated to ' || NEW.status;
        END CASE;
        
        -- Build notification title
        notification_title := 'Shipment Status Update';
        
        -- Get tracking info
        IF NEW.tracking_number IS NOT NULL AND NEW.tracking_number != '' THEN
            tracking_info := NEW.tracking_number;
        ELSIF NEW.shipment_code IS NOT NULL AND NEW.shipment_code != '' THEN
            tracking_info := NEW.shipment_code;
        ELSE
            tracking_info := 'Your shipment';
        END IF;
        
        -- Build notification message
        IF NEW.recipient_name IS NOT NULL AND NEW.recipient_name != '' THEN
            notification_message := 'Your shipment to ' || NEW.recipient_name || ' (' || tracking_info || ') ' || status_description || '.';
        ELSE
            notification_message := tracking_info || ' ' || status_description || '.';
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
            'shipment_update',
            false,
            NOW()
        );
        
        -- Log for debugging
        RAISE NOTICE 'Created notification for user % about shipment % status change: % -> %', 
            NEW.user_id, NEW.id, OLD.status, NEW.status;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CREATE TRIGGER
-- ============================================================================
-- Trigger fires AFTER UPDATE on shipments table
-- Only when status column changes
CREATE TRIGGER trigger_notify_shipment_status_change
    AFTER UPDATE OF status ON shipments
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION notify_shipment_status_change();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
-- Ensure the function can be executed by the trigger
GRANT EXECUTE ON FUNCTION notify_shipment_status_change() TO postgres, authenticated, service_role;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify the trigger was created successfully:
-- SELECT trigger_name, event_manipulation, event_object_table, action_statement
-- FROM information_schema.triggers
-- WHERE trigger_name = 'trigger_notify_shipment_status_change';

-- ============================================================================
-- TESTING
-- ============================================================================
-- Test the trigger with a shipment status update:
-- 
-- 1. Find a shipment ID:
--    SELECT id, user_id, status, tracking_number FROM shipments LIMIT 1;
--
-- 2. Update the shipment status:
--    UPDATE shipments SET status = 'in_transit' WHERE id = 'YOUR_SHIPMENT_ID';
--
-- 3. Check if notification was created:
--    SELECT * FROM notifications 
--    WHERE user_id = 'YOUR_USER_ID' 
--    ORDER BY created_at DESC LIMIT 1;
--
-- 4. Expected result: A new notification with type 'shipment_update' should exist
-- ============================================================================

-- ============================================================================
-- NOTES
-- ============================================================================
-- - Trigger only fires when status column changes (not on other column updates)
-- - Notifications are created with type 'shipment_update' to match frontend
-- - If tracking_number exists, it's included in the notification message
-- - Falls back to shipment_code if no tracking_number
-- - Includes recipient_name in message when available
-- - SECURITY DEFINER ensures trigger has permissions to insert notifications
-- - Works with both function-based updates and direct table updates
-- ============================================================================

COMMENT ON FUNCTION notify_shipment_status_change() IS 
'Automatically creates user notifications when shipment status changes. 
Triggered by any UPDATE to shipments.status column.';

COMMENT ON TRIGGER trigger_notify_shipment_status_change ON shipments IS 
'Fires after shipment status updates to create user notifications automatically.';

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
