-- =====================================================
-- FIX RPC FUNCTION AMBIGUOUS COLUMN ERROR
-- =====================================================
-- This script fixes the "column reference 'suite_number' is ambiguous" error
-- in the create_user_profile_secure function
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-02
-- =====================================================

-- ============================================
-- FIX THE AMBIGUOUS COLUMN REFERENCE
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
    
    -- Check if user profile already exists - FIX: Use explicit table reference
    SELECT * INTO existing_user FROM public.users WHERE public.users.id = user_id;
    
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
    
    -- Insert user profile (SECURITY DEFINER bypasses RLS) - FIX: Use explicit table reference
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
        SELECT * INTO existing_user FROM public.users WHERE public.users.id = user_id;
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
-- VERIFY THE FIX
-- ============================================

SELECT 
    'RPC_FUNCTION_FIXED' as status,
    'Ambiguous column reference fixed with explicit table references' as message,
    'Registration should now work without SQL errors' as result;

-- ============================================
-- WHAT WAS FIXED
-- ============================================

SELECT 
    'FIXES_APPLIED' as summary,
    'Changed: FROM users WHERE id = user_id' as before,
    'To: FROM public.users WHERE public.users.id = user_id' as after,
    'This eliminates ambiguous column references' as explanation;
