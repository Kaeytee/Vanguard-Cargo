-- Add processed_at timestamp field to packages table
-- This field tracks when a package was moved to 'processing' status
-- Used for automatic movement to shipment history after 112 hours
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-03

-- Add processed_at column to packages table
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the field
COMMENT ON COLUMN packages.processed_at IS 'Timestamp when package status was changed to processing. Used for automatic movement to shipment history after 112 hours.';

-- Create index for efficient querying of packages ready to move
CREATE INDEX IF NOT EXISTS idx_packages_processed_at 
ON packages (processed_at) 
WHERE status = 'processing' AND processed_at IS NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'packages' AND column_name = 'processed_at';
