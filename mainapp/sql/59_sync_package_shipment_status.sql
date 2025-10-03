-- ============================================================================
-- Package-Shipment Status Synchronization
-- ============================================================================
-- 
-- This script creates a trigger function to automatically sync package statuses
-- with their associated shipment statuses via the junction table.
-- 
-- When a shipment status is updated, all packages linked to that shipment
-- will automatically have their status updated to match.
-- 
-- Created: 2025-10-03
-- Author: Senior Software Engineer
-- ============================================================================

-- Create function to sync package status with shipment status via junction table
CREATE OR REPLACE FUNCTION sync_package_status_with_shipment()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Update all packages linked to this shipment via junction table
        UPDATE packages 
        SET 
            status = NEW.status,
            updated_at = NOW()
        FROM package_shipments ps
        WHERE packages.id = ps.package_id 
        AND ps.shipment_id = NEW.id;
        
        -- Log the update for debugging purposes
        RAISE NOTICE 'Updated packages for shipment % (ID: %) from % to %', 
            NEW.tracking_number, NEW.id, OLD.status, NEW.status;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on shipments table
-- Drop existing trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS trigger_sync_package_status ON shipments;

-- Create the trigger to fire after status updates
CREATE TRIGGER trigger_sync_package_status
    AFTER UPDATE OF status ON shipments
    FOR EACH ROW
    EXECUTE FUNCTION sync_package_status_with_shipment();

-- ============================================================================
-- Usage Notes:
-- ============================================================================
-- 
-- This trigger ensures that:
-- 1. When a shipment status changes, all associated packages are updated
-- 2. Package and shipment statuses remain synchronized
-- 3. The updated_at timestamp is properly maintained
-- 4. Changes are logged for debugging purposes
-- 
-- Status Flow:
-- - Shipments: processing → shipped → in_transit → arrived → delivered
-- - Packages: Will automatically sync to match shipment status
-- 
-- ============================================================================
