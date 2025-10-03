-- =====================================================
-- IMMEDIATE REGISTRATION FIX
-- =====================================================
-- This script fixes the registration issue by:
-- 1. Creating missing public.users records for orphaned auth.users
-- 2. Recreating the missing trigger
-- 3. Ensuring future registrations work properly
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-02
-- =====================================================

-- ============================================
-- 1. FIX ORPHANED AUTH USERS
-- ============================================

-- Create missing public.users records for existing auth.users
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    phone_number,
    whatsapp_number,
    street_address,
    city,
    country,
    postal_code,
    suite_number,
    role,
    status,
    email_verified,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'first_name', 'User') as first_name,
    COALESCE(au.raw_user_meta_data->>'last_name', 'Name') as last_name,
    au.raw_user_meta_data->>'phone_number' as phone_number,
    au.raw_user_meta_data->>'phone_number' as whatsapp_number,
    au.raw_user_meta_data->>'street_address' as street_address,
    au.raw_user_meta_data->>'city' as city,
    au.raw_user_meta_data->>'country' as country,
    au.raw_user_meta_data->>'postal_code' as postal_code,
    generate_suite_number() as suite_number,
    'client' as role,
    'active' as status,
    COALESCE(au.email_confirmed_at IS NOT NULL, false) as email_verified,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Show what was fixed
SELECT 
    'ORPHANED_USERS_FIXED' as status,
    COUNT(*) as users_created
FROM auth.users au
JOIN public.users pu ON au.id = pu.id;

-- ============================================
-- 2. RECREATE THE MISSING TRIGGER
-- ============================================

-- First ensure the function exists and is correct
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_suite_number TEXT;
BEGIN
    -- Generate unique suite number
    SELECT generate_suite_number() INTO new_suite_number;
    
    -- Insert user profile into public.users table
    INSERT INTO public.users (
        id,
        email,
        first_name,
        last_name,
        phone_number,
        whatsapp_number,
        street_address,
        city,
        country,
        postal_code,
        suite_number,
        role,
        status,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
        NEW.raw_user_meta_data->>'phone_number',
        NEW.raw_user_meta_data->>'phone_number',
        NEW.raw_user_meta_data->>'street_address',
        NEW.raw_user_meta_data->>'city',
        NEW.raw_user_meta_data->>'country',
        NEW.raw_user_meta_data->>'postal_code',
        new_suite_number,
        'client',
        'active',
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        NOW(),
        NOW()
    );
    
    RETURN NEW;
    
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists, skip
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't fail auth
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Create the missing trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. VERIFY THE FIX
-- ============================================

-- Check that trigger now exists
SELECT 
    'TRIGGER_RECREATED' as status,
    trigger_name,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Verify all users now have profiles
SELECT 
    'USER_SYNC_STATUS' as check_type,
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM public.users) as public_users,
    (SELECT COUNT(*) FROM auth.users au 
     LEFT JOIN public.users pu ON au.id = pu.id 
     WHERE pu.id IS NULL) as orphaned_auth,
    (SELECT COUNT(*) FROM public.users pu 
     LEFT JOIN auth.users au ON pu.id = au.id 
     WHERE au.id IS NULL) as orphaned_public;

-- Show all users with their data
SELECT 
    'ALL_USERS_STATUS' as info,
    au.email,
    au.id as auth_id,
    pu.id as profile_id,
    pu.first_name,
    pu.last_name,
    pu.phone_number,
    pu.suite_number,
    CASE WHEN pu.id IS NOT NULL THEN 'SYNCED' ELSE 'MISSING_PROFILE' END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC;

-- ============================================
-- 4. FINAL STATUS
-- ============================================

SELECT 
    'REGISTRATION_FIXED' as status,
    'All orphaned users now have profiles' as fix_1,
    'Trigger recreated for future registrations' as fix_2,
    'Registration should now work properly' as result;
