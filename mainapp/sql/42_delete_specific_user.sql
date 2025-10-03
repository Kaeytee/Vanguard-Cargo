-- =====================================================
-- DELETE SPECIFIC USER: austinbediako5@gmail.com
-- =====================================================
-- This script safely removes the specified user and all associated data
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-02
-- =====================================================

-- ============================================
-- 1. IDENTIFY THE USER TO DELETE
-- ============================================

-- Show the user details before deletion
SELECT 
    'USER_TO_DELETE' as action,
    id,
    email,
    created_at,
    email_confirmed_at,
    CASE WHEN email_confirmed_at IS NULL THEN 'UNCONFIRMED' ELSE 'CONFIRMED' END as status
FROM auth.users 
WHERE email = 'austinbediako5@gmail.com';

-- Check if user has a profile in public.users
SELECT 
    'PROFILE_CHECK' as action,
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.suite_number,
    u.role
FROM public.users u
WHERE u.email = 'austinbediako5@gmail.com';

-- ============================================
-- 2. CHECK ASSOCIATED DATA
-- ============================================

-- Check for packages
SELECT 
    'PACKAGES_CHECK' as action,
    COUNT(*) as package_count
FROM packages p
JOIN auth.users au ON p.user_id = au.id
WHERE au.email = 'austinbediako5@gmail.com';

-- Check for shipments
SELECT 
    'SHIPMENTS_CHECK' as action,
    COUNT(*) as shipment_count
FROM shipments s
JOIN auth.users au ON s.user_id = au.id
WHERE au.email = 'austinbediako5@gmail.com';

-- Check for notifications
SELECT 
    'NOTIFICATIONS_CHECK' as action,
    COUNT(*) as notification_count
FROM notifications n
JOIN auth.users au ON n.user_id = au.id
WHERE au.email = 'austinbediako5@gmail.com';

-- Check for addresses
SELECT 
    'ADDRESSES_CHECK' as action,
    COUNT(*) as address_count
FROM addresses a
JOIN auth.users au ON a.user_id = au.id
WHERE au.email = 'austinbediako5@gmail.com';

-- Check for user preferences
SELECT 
    'PREFERENCES_CHECK' as action,
    COUNT(*) as preference_count
FROM user_preferences up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'austinbediako5@gmail.com';

-- ============================================
-- 3. SAFE DELETION PROCESS
-- ============================================

DO $$
DECLARE
    user_to_delete_id UUID;
    deletion_count INTEGER;
BEGIN
    -- Get the user ID
    SELECT id INTO user_to_delete_id 
    FROM auth.users 
    WHERE email = 'austinbediako5@gmail.com';
    
    IF user_to_delete_id IS NULL THEN
        RAISE NOTICE 'User austinbediako5@gmail.com not found';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Starting deletion process for user: %', user_to_delete_id;
    
    -- Delete in dependency order (children first, then parent)
    
    -- 1. Delete package_shipments relationships
    DELETE FROM package_shipments ps
    WHERE ps.package_id IN (
        SELECT p.id FROM packages p WHERE p.user_id = user_to_delete_id
    );
    GET DIAGNOSTICS deletion_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % package_shipments records', deletion_count;
    
    -- 2. Delete notifications
    DELETE FROM notifications WHERE user_id = user_to_delete_id;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % notifications', deletion_count;
    
    -- 3. Delete user preferences
    DELETE FROM user_preferences WHERE user_id = user_to_delete_id;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user preferences', deletion_count;
    
    -- 4. Delete addresses
    DELETE FROM addresses WHERE user_id = user_to_delete_id;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % addresses', deletion_count;
    
    -- 5. Delete packages
    DELETE FROM packages WHERE user_id = user_to_delete_id;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % packages', deletion_count;
    
    -- 6. Delete shipments
    DELETE FROM shipments WHERE user_id = user_to_delete_id;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % shipments', deletion_count;
    
    -- 7. Delete user profile from public.users
    DELETE FROM public.users WHERE id = user_to_delete_id;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user profile', deletion_count;
    
    -- 8. Delete auth identities
    DELETE FROM auth.identities WHERE user_id = user_to_delete_id;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % auth identities', deletion_count;
    
    -- 9. Finally, delete the auth user
    DELETE FROM auth.users WHERE id = user_to_delete_id;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % auth user record', deletion_count;
    
    RAISE NOTICE 'User deletion completed successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during deletion: %', SQLERRM;
        RAISE;
END $$;

-- ============================================
-- 4. VERIFY DELETION
-- ============================================

-- Confirm user is deleted from auth.users
SELECT 
    'DELETION_VERIFICATION' as action,
    COUNT(*) as remaining_auth_users
FROM auth.users 
WHERE email = 'austinbediako5@gmail.com';

-- Confirm user is deleted from public.users
SELECT 
    'PROFILE_VERIFICATION' as action,
    COUNT(*) as remaining_profiles
FROM public.users 
WHERE email = 'austinbediako5@gmail.com';

-- Confirm no orphaned identities
SELECT 
    'IDENTITY_VERIFICATION' as action,
    COUNT(*) as orphaned_identities
FROM auth.identities i
LEFT JOIN auth.users u ON i.user_id = u.id
WHERE u.id IS NULL;

-- ============================================
-- 5. SHOW REMAINING USERS
-- ============================================

-- Show all remaining users
SELECT 
    'REMAINING_USERS' as action,
    au.id,
    au.email,
    au.created_at,
    au.email_confirmed_at,
    pu.first_name,
    pu.last_name,
    pu.suite_number,
    pu.role
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC;

-- ============================================
-- 6. FINAL STATUS
-- ============================================

SELECT 
    'DELETION_COMPLETE' as status,
    'User austinbediako5@gmail.com has been completely removed' as message,
    'All associated data has been cleaned up' as details;
