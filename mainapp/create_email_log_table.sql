-- ============================================================================
-- CREATE EMAIL NOTIFICATIONS LOG TABLE
-- ============================================================================
-- This table tracks all email notifications sent by the system
-- Run this in Supabase SQL Editor if emails are not working
-- 
-- Author: Senior Software Engineer
-- Date: October 8, 2025
-- ============================================================================

-- Step 1: Create email notifications log table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.email_notifications_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id TEXT NOT NULL,
    email_type TEXT NOT NULL CHECK (email_type IN (
        'status_change',
        'welcome',
        'delivery_alert',
        'system_notification'
    )),
    status TEXT NOT NULL,
    message_id TEXT,
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id 
ON public.email_notifications_log(user_id);

CREATE INDEX IF NOT EXISTS idx_email_notifications_sent_at 
ON public.email_notifications_log(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_notifications_success 
ON public.email_notifications_log(success);

-- Step 3: Enable RLS
-- ============================================================================
ALTER TABLE public.email_notifications_log ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies (if any)
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own email logs" ON public.email_notifications_log;
DROP POLICY IF EXISTS "Service role can insert email logs" ON public.email_notifications_log;
DROP POLICY IF EXISTS "Service role full access" ON public.email_notifications_log;

-- Step 5: Create RLS policies
-- ============================================================================

-- Policy 1: Users can view their own email logs
CREATE POLICY "Users can view their own email logs"
ON public.email_notifications_log
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Service role can insert email logs
CREATE POLICY "Service role can insert email logs"
ON public.email_notifications_log
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy 3: Service role has full access
CREATE POLICY "Service role full access"
ON public.email_notifications_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Step 6: Grant permissions
-- ============================================================================
GRANT SELECT ON public.email_notifications_log TO authenticated;
GRANT ALL ON public.email_notifications_log TO service_role;

-- Step 7: Verification queries
-- ============================================================================

-- Check table exists
SELECT 
    tablename,
    schemaname
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'email_notifications_log';

-- Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity AS "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'email_notifications_log';

-- Check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd AS operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'email_notifications_log'
ORDER BY policyname;

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'email_notifications_log';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ EMAIL LOG TABLE CREATED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Table: email_notifications_log';
    RAISE NOTICE 'RLS: Enabled';
    RAISE NOTICE 'Policies: Created';
    RAISE NOTICE 'Indexes: Created';
    RAISE NOTICE '';
    RAISE NOTICE 'Email notifications will now be logged for audit trail.';
END $$;
