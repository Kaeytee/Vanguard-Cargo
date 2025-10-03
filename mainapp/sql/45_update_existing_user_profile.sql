-- =====================================================
-- UPDATE EXISTING USER PROFILE WITH METADATA
-- =====================================================
-- This script updates the existing user profile to extract data
-- from auth.users.raw_user_meta_data that wasn't properly extracted
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-02
-- =====================================================

-- ============================================
-- 1. SHOW CURRENT STATE
-- ============================================

-- Show what data is available in auth metadata vs profile
SELECT 
    'BEFORE_UPDATE' as status,
    au.email,
    au.raw_user_meta_data->>'phone_number' as metadata_phone,
    au.raw_user_meta_data->>'street_address' as metadata_street,
    au.raw_user_meta_data->>'city' as metadata_city,
    au.raw_user_meta_data->>'country' as metadata_country,
    au.raw_user_meta_data->>'postal_code' as metadata_postal,
    pu.phone_number as profile_phone,
    pu.street_address as profile_street,
    pu.city as profile_city,
    pu.country as profile_country,
    pu.postal_code as profile_postal
FROM auth.users au
JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'austinbediako5@gmail.com';

-- ============================================
-- 2. UPDATE THE USER PROFILE
-- ============================================

-- Update the specific user with data from auth metadata
UPDATE public.users 
SET 
    phone_number = COALESCE(
        (SELECT raw_user_meta_data->>'phone_number' 
         FROM auth.users 
         WHERE auth.users.id = public.users.id), 
        phone_number
    ),
    whatsapp_number = COALESCE(
        (SELECT raw_user_meta_data->>'phone_number' 
         FROM auth.users 
         WHERE auth.users.id = public.users.id), 
        whatsapp_number
    ),
    street_address = COALESCE(
        (SELECT raw_user_meta_data->>'street_address' 
         FROM auth.users 
         WHERE auth.users.id = public.users.id), 
        street_address
    ),
    city = COALESCE(
        (SELECT raw_user_meta_data->>'city' 
         FROM auth.users 
         WHERE auth.users.id = public.users.id), 
        city
    ),
    country = COALESCE(
        (SELECT raw_user_meta_data->>'country' 
         FROM auth.users 
         WHERE auth.users.id = public.users.id), 
        country
    ),
    postal_code = COALESCE(
        (SELECT raw_user_meta_data->>'postal_code' 
         FROM auth.users 
         WHERE auth.users.id = public.users.id), 
        postal_code
    ),
    updated_at = NOW()
WHERE email = 'austinbediako5@gmail.com'
    AND EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = public.users.id 
        AND raw_user_meta_data->>'phone_number' IS NOT NULL
    );

-- ============================================
-- 3. VERIFY THE UPDATE
-- ============================================

-- Show the updated profile
SELECT 
    'AFTER_UPDATE' as status,
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
    updated_at
FROM public.users 
WHERE email = 'austinbediako5@gmail.com';

-- ============================================
-- 4. UPDATE THE TRIGGER FOR FUTURE USERS
-- ============================================

-- Update the trigger to handle the actual field names being sent
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
    
    -- Extract user data from auth metadata - handle actual field names being sent
    user_first_name := COALESCE(
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'firstName',
        'User'
    );
    
    user_last_name := COALESCE(
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'lastName',
        'Name'
    );
    
    -- Handle phone number - the frontend is actually sending 'phone_number'
    user_phone := COALESCE(
        NEW.raw_user_meta_data->>'phone_number',
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'phoneNumber',
        NULL
    );
    
    -- Handle address fields - frontend sends 'street_address' not 'streetAddress'
    user_street_address := COALESCE(
        NEW.raw_user_meta_data->>'street_address',
        NEW.raw_user_meta_data->>'streetAddress',
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
        NEW.raw_user_meta_data->>'postal_code',
        NEW.raw_user_meta_data->>'postalCode',
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
-- 5. FINAL VERIFICATION
-- ============================================

SELECT 
    'UPDATE_COMPLETE' as status,
    'Existing user profile updated and trigger fixed for future users' as message,
    'Phone numbers and addresses should now be properly saved' as result;
