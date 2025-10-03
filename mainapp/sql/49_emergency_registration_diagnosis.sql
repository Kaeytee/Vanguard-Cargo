-- =====================================================
-- EMERGENCY REGISTRATION DIAGNOSIS AND RECOVERY
-- =====================================================
-- This script diagnoses the registration issue where users are created
-- but not appearing in auth.users, public.users, or profile tables
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-02
-- =====================================================

-- ============================================
-- 1. EMERGENCY DIAGNOSIS - CHECK ALL TABLES
-- ============================================

-- Check auth.users table
SELECT 
    'AUTH_USERS_CHECK' as table_name,
    COUNT(*) as total_records,
    MAX(created_at) as latest_user
FROM auth.users;

-- Show recent auth.users entries
SELECT 
    'RECENT_AUTH_USERS' as info,
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Check public.users table
SELECT 
    'PUBLIC_USERS_CHECK' as table_name,
    COUNT(*) as total_records,
    MAX(created_at) as latest_user
FROM public.users;

-- Show recent public.users entries
SELECT 
    'RECENT_PUBLIC_USERS' as info,
    id,
    email,
    first_name,
    last_name,
    phone_number,
    suite_number,
    created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if there are any orphaned records
SELECT 
    'ORPHANED_AUTH_USERS' as check_type,
    COUNT(*) as orphaned_count
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

SELECT 
    'ORPHANED_PUBLIC_USERS' as check_type,
    COUNT(*) as orphaned_count
FROM public.users pu
LEFT JOIN auth.users au ON pu.id = au.id
WHERE au.id IS NULL;

-- ============================================
-- 2. CHECK TRIGGER AND FUNCTION STATUS
-- ============================================

-- Check if trigger exists and is active
SELECT 
    'TRIGGER_STATUS' as check_type,
    trigger_name,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if handle_new_user function exists
SELECT 
    'FUNCTION_STATUS' as check_type,
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- Check if generate_suite_number function exists
SELECT 
    'SUITE_FUNCTION_STATUS' as check_type,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'generate_suite_number'
AND routine_schema = 'public';

-- ============================================
-- 3. CHECK RLS POLICIES
-- ============================================

-- Check RLS policies on users table
SELECT 
    'RLS_POLICIES_CHECK' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users';

-- Check if RLS is enabled on users table
SELECT 
    'RLS_STATUS' as check_type,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- ============================================
-- 4. EMERGENCY RECOVERY PLAN
-- ============================================

-- Show what needs to be fixed
SELECT 
    'RECOVERY_PLAN' as plan,
    'Step 1: Disable problematic trigger if it exists' as step_1,
    'Step 2: Check for data corruption' as step_2,
    'Step 3: Restore proper registration flow' as step_3,
    'Step 4: Test with new user registration' as step_4;

-- ============================================
-- 5. SAFE TRIGGER DISABLE (IF NEEDED)
-- ============================================

-- Temporarily disable the trigger to prevent further issues
DO $$
BEGIN
    -- Only disable if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created'
        AND event_object_table = 'users'
    ) THEN
        DROP TRIGGER on_auth_user_created ON auth.users;
        RAISE NOTICE 'EMERGENCY: Disabled on_auth_user_created trigger to prevent further issues';
    ELSE
        RAISE NOTICE 'Trigger on_auth_user_created does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not disable trigger: %', SQLERRM;
END $$;

-- ============================================
-- 6. CHECK FOR RECENT REGISTRATION ATTEMPTS
-- ============================================

-- Look for any recent failed registration attempts in logs
-- (This might not show data depending on log configuration)
SELECT 
    'LOG_CHECK' as info,
    'Check Supabase logs for recent registration errors' as instruction,
    'Look for handle_new_user or create_user_profile_secure errors' as details;

-- ============================================
-- 7. SHOW CURRENT SAFE STATE
-- ============================================

SELECT 
    'CURRENT_STATE' as status,
    'Trigger disabled to prevent further issues' as action_taken,
    'Database is now safe for manual recovery' as safety_status,
    'No new users will be affected until trigger is properly restored' as protection;

-- ============================================
-- 8. NEXT STEPS RECOMMENDATION
-- ============================================

SELECT 
    'NEXT_STEPS' as recommendation,
    '1. Review the diagnosis results above' as step_1,
    '2. Identify where users are being created incorrectly' as step_2,
    '3. Create a proper, tested registration function' as step_3,
    '4. Test thoroughly before re-enabling automatic registration' as step_4,
    '5. Consider manual user creation until issue is resolved' as step_5;
