-- Add shipped_at timestamp field to packages table
-- This field tracks when a package was moved to 'shipped' status
-- Used by the auto-move service when packages are moved from processing
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-03

-- Add shipped_at column to packages table
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the field
COMMENT ON COLUMN packages.shipped_at IS 'Timestamp when package status was changed to shipped. Set automatically after 112 hours in processing or manually by staff.';

-- Create index for efficient querying of shipped packages
CREATE INDEX IF NOT EXISTS idx_packages_shipped_at 
ON packages (shipped_at) 
WHERE status = 'shipped' AND shipped_at IS NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'packages' AND column_name = 'shipped_at';
