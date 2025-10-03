-- =====================================================
-- FIX USER REGISTRATION TRIGGER - EMERGENCY REPAIR
-- =====================================================
-- This script recreates the handle_new_user trigger that was accidentally removed
-- The trigger is essential for automatic user profile creation during signup
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-02
-- =====================================================

-- ============================================
-- 1. RECREATE THE HANDLE_NEW_USER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_suite_number TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
    user_phone TEXT;
BEGIN
    -- Generate unique suite number
    SELECT generate_suite_number() INTO new_suite_number;
    
    -- Extract user data from auth metadata with fallbacks
    user_first_name := COALESCE(
        NEW.raw_user_meta_data->>'firstName',
        NEW.raw_user_meta_data->>'first_name', 
        'User'
    );
    
    user_last_name := COALESCE(
        NEW.raw_user_meta_data->>'lastName',
        NEW.raw_user_meta_data->>'last_name',
        'Name'
    );
    
    user_phone := COALESCE(
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'phoneNumber',
        NULL
    );
    
    -- Insert user profile into public.users table
    INSERT INTO public.users (
        id,
        email,
        first_name,
        last_name,
        phone_number,
        whatsapp_number,
        suite_number,
        role,
        status,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        user_first_name,
        user_last_name,
        user_phone,
        user_phone, -- Use same phone for WhatsApp initially
        new_suite_number,
        'client', -- Default role
        'active', -- Default status
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        NOW(),
        NOW()
    );
    
    -- Log successful profile creation
    RAISE LOG 'User profile created successfully for: % (Suite: %)', NEW.email, new_suite_number;
    
    RETURN NEW;
    
EXCEPTION
    WHEN unique_violation THEN
        -- Handle case where user profile already exists
        RAISE LOG 'User profile already exists for: %', NEW.email;
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log any other errors but don't fail the auth signup
        RAISE LOG 'Error in handle_new_user for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$;

-- ============================================
-- 2. CREATE THE TRIGGER
-- ============================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. VERIFY THE SETUP
-- ============================================

-- Check if trigger was created successfully
SELECT 
    'TRIGGER_STATUS' as check_type,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
AND event_object_table = 'users';

-- Check if function exists
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
-- 4. TEST THE SETUP (DIAGNOSTIC ONLY)
-- ============================================

-- Show recent auth users and their profiles
SELECT 
    'RECENT_USERS' as check_type,
    au.id,
    au.email,
    au.created_at as auth_created,
    u.id as profile_exists,
    u.first_name,
    u.last_name,
    u.suite_number,
    u.created_at as profile_created
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
ORDER BY au.created_at DESC
LIMIT 5;

-- ============================================
-- 5. GRANT NECESSARY PERMISSIONS
-- ============================================

-- Ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_suite_number() TO authenticated;

-- Ensure RLS allows user creation
-- Note: This should already be set up, but adding for safety
DO $$
BEGIN
    -- Check if policy exists before creating
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON public.users
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- ============================================
-- 6. FINAL STATUS CHECK
-- ============================================

SELECT 
    'SETUP_COMPLETE' as status,
    'User registration trigger has been restored' as message,
    'New user signups should now work properly' as next_step;
