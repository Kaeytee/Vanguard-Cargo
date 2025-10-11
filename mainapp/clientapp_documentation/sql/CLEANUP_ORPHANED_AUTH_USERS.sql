-- ============================================================================
-- CLEANUP ORPHANED AUTH USERS
-- ============================================================================
-- Purpose: Clean up auth.users entries that don't have corresponding profiles
-- 
-- PROBLEM:
-- When registration fails after auth user creation but before profile creation,
-- we end up with "orphaned" auth users - users in auth.users but not in public.users
--
-- SYMPTOMS:
-- - "User profile already exists" error during registration
-- - User can't register with their email
-- - Email shows as "already registered" but no profile exists
--
-- SOLUTION:
-- Run this script to identify and remove orphaned auth users
-- 
-- ⚠️ WARNING: This requires SUPERADMIN access to Supabase
-- Run this in Supabase SQL Editor with service_role permissions
-- ============================================================================

-- Step 1: IDENTIFY orphaned auth users
-- These are users in auth.users without profiles in public.users
SELECT 
    au.id as auth_user_id,
    au.email,
    au.created_at as auth_created_at,
    au.email_confirmed_at,
    CASE 
        WHEN pu.id IS NULL THEN 'ORPHANED - No Profile'
        ELSE 'OK - Has Profile'
    END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL  -- Only users without profiles
ORDER BY au.created_at DESC;

-- ============================================================================
-- Step 2: DELETE orphaned auth users (CAREFUL!)
-- ============================================================================
-- ⚠️ CAUTION: This will permanently delete auth users without profiles
-- Only run this if you're sure these are test/failed registrations
--
-- Uncomment and modify the WHERE clause to target specific users:

/*
DELETE FROM auth.users
WHERE id IN (
    SELECT au.id 
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id
    WHERE pu.id IS NULL  -- No profile exists
    -- AND au.email LIKE '%test%'  -- Optional: Only delete test users
    AND au.created_at > NOW() - INTERVAL '7 days'  -- Optional: Only recent users
);
*/

-- ============================================================================
-- Step 3: VERIFY cleanup
-- ============================================================================
-- Run the SELECT query again to confirm orphaned users are removed
SELECT 
    COUNT(*) as orphaned_users_remaining
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- ============================================================================
-- Step 4: CREATE PREVENTION FUNCTION (Optional)
-- ============================================================================
-- This function can be called to cleanup orphaned users automatically
-- during registration retry

CREATE OR REPLACE FUNCTION cleanup_orphaned_auth_user(user_email TEXT)
RETURNS BOOLEAN
SECURITY DEFINER -- Run with elevated privileges
SET search_path = public, auth
AS $$
DECLARE
    orphaned_user_id UUID;
BEGIN
    -- Find auth user without profile
    SELECT au.id INTO orphaned_user_id
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id
    WHERE au.email = user_email
    AND pu.id IS NULL;
    
    IF orphaned_user_id IS NOT NULL THEN
        -- Delete orphaned auth user
        DELETE FROM auth.users WHERE id = orphaned_user_id;
        
        -- Log the cleanup
        RAISE NOTICE 'Cleaned up orphaned auth user: % (ID: %)', user_email, orphaned_user_id;
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_orphaned_auth_user(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_orphaned_auth_user(TEXT) TO service_role;

-- ============================================================================
-- USAGE EXAMPLE
-- ============================================================================
-- To manually cleanup an orphaned user:
-- SELECT cleanup_orphaned_auth_user('user@example.com');

-- ============================================================================
-- PREVENTION: Enhanced Error Handling
-- ============================================================================
-- To prevent orphaned users in the future:
--
-- 1. Frontend should validate ALL data BEFORE calling signUp
-- 2. Use proper error handling and rollback mechanisms
-- 3. Monitor registration failures and cleanup orphaned users regularly
-- 4. Consider implementing a registration queue with atomic operations
--
-- ============================================================================
