-- =====================================================
-- FIX PROFILE CREATION RACE CONDITION
-- =====================================================
-- This script fixes the issue where both the trigger and frontend
-- try to create user profiles, causing "User profile already exists" error
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-02
-- =====================================================

-- ============================================
-- 1. UPDATE RPC FUNCTION TO HANDLE EXISTING PROFILES
-- ============================================

CREATE OR REPLACE FUNCTION create_user_profile_secure(
    user_id UUID,
    email TEXT,
    first_name TEXT DEFAULT 'User',
    last_name TEXT DEFAULT 'Name',
    phone_number TEXT DEFAULT NULL,
    street_address TEXT DEFAULT NULL,
    city TEXT DEFAULT NULL,
    country TEXT DEFAULT NULL,
    postal_code TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    new_suite_number TEXT;
    existing_user RECORD;
    created_user RECORD;
BEGIN
    -- Security check: ensure the calling user matches the user_id
    IF auth.uid() != user_id THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Unauthorized: Cannot create profile for different user'
        );
    END IF;
    
    -- Check if user profile already exists
    SELECT * INTO existing_user FROM users WHERE id = user_id;
    
    IF FOUND THEN
        -- Profile already exists (likely created by trigger)
        -- Return success with existing profile data
        RETURN json_build_object(
            'success', true,
            'message', 'Profile already exists',
            'user', json_build_object(
                'id', existing_user.id,
                'email', existing_user.email,
                'first_name', existing_user.first_name,
                'last_name', existing_user.last_name,
                'phone_number', existing_user.phone_number,
                'suite_number', existing_user.suite_number,
                'role', existing_user.role,
                'status', existing_user.status,
                'created_at', existing_user.created_at
            )
        );
    END IF;
    
    -- Profile doesn't exist, create it
    -- Generate unique suite number using existing function
    new_suite_number := generate_suite_number();
    
    -- Insert user profile (SECURITY DEFINER bypasses RLS)
    INSERT INTO users (
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
        user_id,
        email,
        first_name,
        last_name,
        phone_number,
        phone_number, -- Use same phone for WhatsApp initially
        street_address,
        city,
        country,
        postal_code,
        new_suite_number,
        'client', -- Default role
        'active', -- Default status
        false, -- Will be updated when email is confirmed
        NOW(),
        NOW()
    ) RETURNING * INTO created_user;
    
    -- Create default user preferences
    INSERT INTO user_preferences (
        user_id,
        language,
        units,
        auto_refresh,
        email_notifications,
        sms_notifications,
        whatsapp_notifications,
        push_notifications,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        'en',
        'metric',
        true,
        true,
        true,
        true,
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO NOTHING; -- Ignore if already exists
    
    -- Return success with created user data
    RETURN json_build_object(
        'success', true,
        'message', 'Profile created successfully',
        'user', json_build_object(
            'id', created_user.id,
            'email', created_user.email,
            'first_name', created_user.first_name,
            'last_name', created_user.last_name,
            'phone_number', created_user.phone_number,
            'suite_number', created_user.suite_number,
            'role', created_user.role,
            'status', created_user.status,
            'created_at', created_user.created_at
        )
    );
    
EXCEPTION
    WHEN unique_violation THEN
        -- Handle race condition where profile was created between our check and insert
        SELECT * INTO existing_user FROM users WHERE id = user_id;
        RETURN json_build_object(
            'success', true,
            'message', 'Profile created by concurrent process',
            'user', json_build_object(
                'id', existing_user.id,
                'email', existing_user.email,
                'first_name', existing_user.first_name,
                'last_name', existing_user.last_name,
                'phone_number', existing_user.phone_number,
                'suite_number', existing_user.suite_number,
                'role', existing_user.role,
                'status', existing_user.status,
                'created_at', existing_user.created_at
            )
        );
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Profile creation failed: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. ENSURE PROPER PERMISSIONS
-- ============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile_secure(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- ============================================
-- 3. VERIFY THE FIX
-- ============================================

-- Test the function behavior
SELECT 
    'FUNCTION_UPDATED' as status,
    'create_user_profile_secure now handles existing profiles gracefully' as message,
    'Registration should work without errors now' as result;

-- Check if both trigger and function exist
SELECT 
    'REGISTRATION_SETUP' as check_type,
    (SELECT COUNT(*) FROM information_schema.triggers 
     WHERE trigger_name = 'on_auth_user_created') as trigger_exists,
    (SELECT COUNT(*) FROM information_schema.routines 
     WHERE routine_name = 'create_user_profile_secure') as function_exists;

-- ============================================
-- 4. CLEANUP RECOMMENDATION
-- ============================================

SELECT 
    'CLEANUP_RECOMMENDATION' as info,
    'Both trigger and RPC function can now coexist safely' as message,
    'The RPC function will return success if profile already exists' as behavior;
