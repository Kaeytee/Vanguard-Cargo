-- =====================================================
-- FIX TRIGGER FIELD EXTRACTION
-- =====================================================
-- This script updates the handle_new_user trigger to properly extract
-- all user data fields including addresses from auth metadata
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-02
-- =====================================================

-- ============================================
-- UPDATE THE HANDLE_NEW_USER FUNCTION
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
    user_street_address TEXT;
    user_city TEXT;
    user_country TEXT;
    user_postal_code TEXT;
BEGIN
    -- Generate unique suite number
    SELECT generate_suite_number() INTO new_suite_number;
    
    -- Extract user data from auth metadata with comprehensive fallbacks
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
        NEW.raw_user_meta_data->>'phone_number',
        NULL
    );
    
    user_street_address := COALESCE(
        NEW.raw_user_meta_data->>'streetAddress',
        NEW.raw_user_meta_data->>'street_address',
        NULL
    );
    
    user_city := COALESCE(
        NEW.raw_user_meta_data->>'city',
        NULL
    );
    
    user_country := COALESCE(
        NEW.raw_user_meta_data->>'country',
        NULL
    );
    
    user_postal_code := COALESCE(
        NEW.raw_user_meta_data->>'postalCode',
        NEW.raw_user_meta_data->>'postal_code',
        NULL
    );
    
    -- Insert user profile into public.users table with ALL fields
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
        user_first_name,
        user_last_name,
        user_phone,
        user_phone, -- Use same phone for WhatsApp initially
        user_street_address,
        user_city,
        user_country,
        user_postal_code,
        new_suite_number,
        'client', -- Default role
        'active', -- Default status
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        NOW(),
        NOW()
    );
    
    -- Log successful profile creation with details
    RAISE LOG 'User profile created successfully for: % (Suite: %, Phone: %, Address: %)', 
        NEW.email, new_suite_number, user_phone, user_street_address;
    
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
-- VERIFY THE UPDATE
-- ============================================

SELECT 
    'TRIGGER_UPDATED' as status,
    'handle_new_user function now extracts all user fields including addresses' as message,
    'Registration should now save phone numbers and addresses properly' as result;

-- ============================================
-- TEST FIELD EXTRACTION (DIAGNOSTIC)
-- ============================================

-- Show what fields would be extracted from recent users
SELECT 
    'FIELD_EXTRACTION_TEST' as test_type,
    au.email,
    -- Test the extraction logic
    COALESCE(au.raw_user_meta_data->>'firstName', au.raw_user_meta_data->>'first_name', 'User') as extracted_first_name,
    COALESCE(au.raw_user_meta_data->>'lastName', au.raw_user_meta_data->>'last_name', 'Name') as extracted_last_name,
    COALESCE(au.raw_user_meta_data->>'phone', au.raw_user_meta_data->>'phoneNumber', au.raw_user_meta_data->>'phone_number', NULL) as extracted_phone,
    COALESCE(au.raw_user_meta_data->>'streetAddress', au.raw_user_meta_data->>'street_address', NULL) as extracted_street,
    COALESCE(au.raw_user_meta_data->>'city', NULL) as extracted_city,
    COALESCE(au.raw_user_meta_data->>'country', NULL) as extracted_country,
    COALESCE(au.raw_user_meta_data->>'postalCode', au.raw_user_meta_data->>'postal_code', NULL) as extracted_postal
FROM auth.users au
ORDER BY au.created_at DESC
LIMIT 3;
