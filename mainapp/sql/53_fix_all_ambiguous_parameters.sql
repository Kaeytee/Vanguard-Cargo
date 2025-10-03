-- =====================================================
-- FIX ALL AMBIGUOUS PARAMETERS IN RPC FUNCTION
-- =====================================================
-- This script fixes all ambiguous parameter names in create_user_profile_secure
-- by using prefixed parameter names that won't conflict with column names
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-02
-- =====================================================

-- ============================================
-- FIX THE RPC FUNCTION WITH PREFIXED PARAMETERS
-- ============================================

CREATE OR REPLACE FUNCTION create_user_profile_secure(
    p_user_id UUID,
    p_email TEXT,
    p_first_name TEXT DEFAULT 'User',
    p_last_name TEXT DEFAULT 'Name',
    p_phone_number TEXT DEFAULT NULL,
    p_street_address TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_country TEXT DEFAULT NULL,
    p_postal_code TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    generated_suite_number TEXT;
    existing_user RECORD;
    created_user RECORD;
BEGIN
    -- Security check: ensure the calling user matches the user_id
    IF auth.uid() != p_user_id THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Unauthorized: Cannot create profile for different user'
        );
    END IF;
    
    -- Check if user profile already exists
    SELECT * INTO existing_user FROM public.users WHERE id = p_user_id;
    
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
    -- Generate unique suite number
    generated_suite_number := 'VC-' || LPAD(floor(random() * 9999 + 1)::TEXT, 3, '0');
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.users WHERE suite_number = generated_suite_number) LOOP
        generated_suite_number := 'VC-' || LPAD(floor(random() * 9999 + 1)::TEXT, 3, '0');
    END LOOP;
    
    -- Insert user profile
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
        p_user_id,
        p_email,
        p_first_name,
        p_last_name,
        p_phone_number,
        p_phone_number, -- Use same phone for WhatsApp initially
        p_street_address,
        p_city,
        p_country,
        p_postal_code,
        generated_suite_number,
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
        p_user_id,
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
        SELECT * INTO existing_user FROM public.users WHERE id = p_user_id;
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
-- UPDATE FUNCTION PERMISSIONS
-- ============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile_secure(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- ============================================
-- VERIFY THE FIX
-- ============================================

SELECT 
    'RPC_FUNCTION_FIXED' as status,
    'All parameter names prefixed with p_ to avoid ambiguity' as message,
    'Frontend registration should now work without ambiguous column errors' as result;

-- Test the function exists and is accessible
SELECT 
    'FUNCTION_STATUS' as check_type,
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'create_user_profile_secure'
AND routine_schema = 'public';
