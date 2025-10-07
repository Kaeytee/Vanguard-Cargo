-- Shipment Status Notification Trigger
-- This trigger automatically creates notifications when shipment statuses are updated

-- Create a function to generate user-friendly shipment status messages
CREATE OR REPLACE FUNCTION get_shipment_status_message(status TEXT)
RETURNS TEXT AS $$
BEGIN
  CASE status
    WHEN 'pending' THEN RETURN 'has been created and is being prepared';
    WHEN 'processing' THEN RETURN 'is being processed for shipping';
    WHEN 'shipped' THEN RETURN 'has been shipped and is on its way';
    WHEN 'in_transit' THEN RETURN 'is currently in transit';
    WHEN 'delivered' THEN RETURN 'has been delivered successfully';
    WHEN 'delayed' THEN RETURN 'has been delayed - we apologize for the inconvenience';
    WHEN 'cancelled' THEN RETURN 'has been cancelled';
    ELSE RETURN 'status has been updated to ' || status;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create the shipment notification trigger function
CREATE OR REPLACE FUNCTION notify_shipment_status_change()
RETURNS TRIGGER AS $$
DECLARE
  status_message TEXT;
  notification_title TEXT;
  notification_message TEXT;
  recipient_display TEXT;
  tracking_display TEXT;
BEGIN
  -- Only send notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- Get user-friendly status message
    status_message := get_shipment_status_message(NEW.status);
    
    -- Prepare display values with fallbacks
    recipient_display := COALESCE(NEW.recipient_name, 'recipient');
    tracking_display := COALESCE(NEW.tracking_number, NEW.id, 'Shipment');
    
    -- Create notification title based on status
    notification_title := CASE 
      WHEN NEW.status = 'shipped' THEN 'Shipment Shipped'
      WHEN NEW.status = 'delivered' THEN 'Shipment Delivered'
      WHEN NEW.status = 'delayed' THEN 'Shipment Delayed'
      WHEN NEW.status = 'cancelled' THEN 'Shipment Cancelled'
      ELSE 'Shipment Update'
    END;
    
    notification_message := 'Your shipment to ' || recipient_display || 
                           ' (' || tracking_display || ') ' || status_message || '.';
    
    -- Insert notification into notifications table
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      read_status,
      created_at
    ) VALUES (
      NEW.user_id,
      notification_title,
      notification_message,
      'in_app',
      false,
      NOW()
    );
    
    -- Log the notification creation
    RAISE NOTICE 'Shipment status notification created for user % - Shipment % status changed from % to %', 
                 NEW.user_id, NEW.id, OLD.status, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS shipment_status_notification_trigger ON shipments;
CREATE TRIGGER shipment_status_notification_trigger
  AFTER UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION notify_shipment_status_change();

-- Add comments for documentation
COMMENT ON FUNCTION get_shipment_status_message(TEXT) IS 'Converts shipment status codes to user-friendly messages';
COMMENT ON FUNCTION notify_shipment_status_change() IS 'Trigger function that creates notifications when shipment status changes';
COMMENT ON TRIGGER shipment_status_notification_trigger ON shipments IS 'Automatically creates notifications when shipment status is updated';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_shipment_status_message(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION notify_shipment_status_change() TO authenticated;

-- Test the trigger with a sample update (commented out for production)
-- UPDATE shipments SET status = 'shipped' WHERE id = 'some-test-id';

RAISE NOTICE 'Shipment status notification trigger installed successfully';
