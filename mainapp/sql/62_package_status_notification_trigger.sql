-- Package Status Notification Trigger
-- This trigger automatically creates notifications when package statuses are updated

-- First, create a function to generate user-friendly status messages
CREATE OR REPLACE FUNCTION get_package_status_message(status TEXT)
RETURNS TEXT AS $$
BEGIN
  CASE status
    WHEN 'pending' THEN RETURN 'is awaiting processing';
    WHEN 'received' THEN RETURN 'has been received at our warehouse';
    WHEN 'processing' THEN RETURN 'is being processed for shipment';
    WHEN 'shipped' THEN RETURN 'has been shipped and is on its way';
    WHEN 'delivered' THEN RETURN 'has been delivered successfully';
    WHEN 'on_hold' THEN RETURN 'has been placed on hold';
    ELSE RETURN 'status has been updated to ' || status;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create the notification trigger function
CREATE OR REPLACE FUNCTION notify_package_status_change()
RETURNS TRIGGER AS $$
DECLARE
  status_message TEXT;
  notification_title TEXT;
  notification_message TEXT;
  store_name_display TEXT;
  tracking_display TEXT;
BEGIN
  -- Only send notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- Get user-friendly status message
    status_message := get_package_status_message(NEW.status);
    
    -- Prepare display values with fallbacks
    store_name_display := COALESCE(NEW.store_name, 'Unknown Store');
    tracking_display := COALESCE(NEW.tracking_number, NEW.package_id, 'Package');
    
    -- Create notification title and message
    notification_title := 'Package Status Update';
    notification_message := 'Your package from ' || store_name_display || 
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
    RAISE NOTICE 'Package status notification created for user % - Package % status changed from % to %', 
                 NEW.user_id, NEW.package_id, OLD.status, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS package_status_notification_trigger ON packages;
CREATE TRIGGER package_status_notification_trigger
  AFTER UPDATE ON packages
  FOR EACH ROW
  EXECUTE FUNCTION notify_package_status_change();

-- Add comments for documentation
COMMENT ON FUNCTION get_package_status_message(TEXT) IS 'Converts package status codes to user-friendly messages';
COMMENT ON FUNCTION notify_package_status_change() IS 'Trigger function that creates notifications when package status changes';
COMMENT ON TRIGGER package_status_notification_trigger ON packages IS 'Automatically creates notifications when package status is updated';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_package_status_message(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION notify_package_status_change() TO authenticated;

-- Test the trigger with a sample update (commented out for production)
-- UPDATE packages SET status = 'processing' WHERE id = 'some-test-id';

RAISE NOTICE 'Package status notification trigger installed successfully';
