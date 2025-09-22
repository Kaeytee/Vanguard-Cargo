-- =====================================================
-- 00_CREATE_MISSING_SEQUENCE.SQL
-- Fix for missing seq_vc_global sequence error
-- 
-- PURPOSE: Creates the missing sequence that's causing user registration failures
-- WHEN TO RUN: Immediately to fix registration errors
-- SAFE TO RE-RUN: Yes, uses IF NOT EXISTS
-- =====================================================

-- Create the missing sequence for VC suite numbers
-- This sequence generates the numeric part of VC-##### suite numbers
CREATE SEQUENCE IF NOT EXISTS public.seq_vc_global
    START WITH 10001          -- Start from VC-10001
    INCREMENT BY 1            -- Increment by 1 for each new user
    MINVALUE 10001           -- Minimum value
    MAXVALUE 99999           -- Maximum value (5-digit limit)
    CACHE 1                  -- Cache 1 value at a time
    NO CYCLE;                -- Don't cycle back to start when max reached

-- Set ownership to ensure proper permissions
ALTER SEQUENCE public.seq_vc_global OWNER TO postgres;

-- Grant usage permissions to authenticated users
GRANT USAGE ON SEQUENCE public.seq_vc_global TO authenticated;
GRANT USAGE ON SEQUENCE public.seq_vc_global TO service_role;

-- If there are existing suite numbers, sync the sequence to the highest value
DO $$
DECLARE
    max_suite_num INTEGER;
BEGIN
    -- Find the highest existing suite number
    SELECT COALESCE(MAX(CAST(SUBSTRING(suite_number FROM 'VC-([0-9]+)') AS INTEGER)), 10000)
    INTO max_suite_num
    FROM public.us_shipping_addresses
    WHERE suite_number ~ '^VC-[0-9]+$';
    
    -- Set sequence to start from the next available number
    PERFORM setval('public.seq_vc_global', max_suite_num + 1, false);
    
    RAISE NOTICE 'Sequence seq_vc_global set to start from: %', max_suite_num + 1;
END $$;

-- Verification query
SELECT 
    'seq_vc_global' as sequence_name,
    last_value as current_value,
    is_called
FROM public.seq_vc_global;

-- Success message
SELECT 'SUCCESS: seq_vc_global sequence created and synchronized!' as status;
SELECT 'NEXT STEP: Try user registration again - it should work now' as next_step;
