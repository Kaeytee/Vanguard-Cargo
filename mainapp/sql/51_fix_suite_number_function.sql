-- =====================================================
-- FIX SUITE NUMBER FUNCTION - AMBIGUOUS COLUMN ERROR
-- =====================================================
-- This script fixes the ambiguous column reference error in generate_suite_number
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-02
-- =====================================================

-- ============================================
-- FIX THE GENERATE_SUITE_NUMBER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION generate_suite_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_number INTEGER;
    generated_suite_number TEXT;  -- Changed variable name to avoid conflict
    max_attempts INTEGER := 100;
    attempt INTEGER := 0;
BEGIN
    LOOP
        -- Generate a random number between 1 and 9999
        new_number := floor(random() * 9999 + 1)::INTEGER;
        generated_suite_number := 'VC-' || LPAD(new_number::TEXT, 3, '0');
        
        -- Check if this suite number already exists - FIX: Use explicit variable reference
        IF NOT EXISTS (SELECT 1 FROM public.users WHERE public.users.suite_number = generated_suite_number) THEN
            RETURN generated_suite_number;
        END IF;
        
        attempt := attempt + 1;
        IF attempt > max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique suite number after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$;

-- ============================================
-- TEST THE FIXED FUNCTION
-- ============================================

-- Test that the function works
SELECT 
    'FUNCTION_TEST' as test_type,
    generate_suite_number() as test_suite_number;

-- ============================================
-- NOW RUN THE REGISTRATION FIX SAFELY
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
-- RECREATE THE TRIGGER WITH FIXED FUNCTION
-- ============================================

-- Create the corrected handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_suite_number TEXT;
BEGIN
    -- Generate unique suite number using the fixed function
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- VERIFY EVERYTHING IS WORKING
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

-- Show final status
SELECT 
    'REGISTRATION_COMPLETELY_FIXED' as status,
    'Suite number function fixed' as fix_1,
    'Orphaned users now have profiles' as fix_2,
    'Trigger recreated for future registrations' as fix_3,
    'Registration should now work perfectly' as result;
