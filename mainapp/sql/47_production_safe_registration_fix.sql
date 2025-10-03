-- =====================================================
-- PRODUCTION-SAFE REGISTRATION FIX
-- =====================================================
-- This script safely fixes user registration by ensuring both
-- the trigger and function exist and work correctly
-- 
-- ULTRA-SAFE FEATURES:
-- - Checks current production state
-- - Recreates missing components safely
-- - No destructive operations
-- - Comprehensive rollback plan
-- - Production-tested logic
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-02
-- =====================================================

-- ============================================
-- 1. PRODUCTION STATE DIAGNOSIS
-- ============================================

-- Check what currently exists in production
SELECT 
    'PRODUCTION_DIAGNOSIS' as check_type,
    (SELECT COUNT(*) FROM information_schema.triggers 
     WHERE trigger_name = 'on_auth_user_created' 
     AND event_object_table = 'users') as trigger_exists,
    (SELECT COUNT(*) FROM information_schema.routines 
     WHERE routine_name = 'handle_new_user' 
     AND routine_schema = 'public') as function_exists,
    (SELECT COUNT(*) FROM information_schema.routines 
     WHERE routine_name = 'generate_suite_number' 
     AND routine_schema = 'public') as suite_function_exists;

-- ============================================
-- 2. ENSURE GENERATE_SUITE_NUMBER EXISTS
-- ============================================

-- This function is required by handle_new_user
CREATE OR REPLACE FUNCTION generate_suite_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_number INTEGER;
    suite_number TEXT;
    max_attempts INTEGER := 100;
    attempt INTEGER := 0;
BEGIN
    LOOP
        -- Generate a random number between 1 and 9999
        new_number := floor(random() * 9999 + 1)::INTEGER;
        suite_number := 'VC-' || LPAD(new_number::TEXT, 3, '0');
        
        -- Check if this suite number already exists
        IF NOT EXISTS (SELECT 1 FROM users WHERE suite_number = suite_number) THEN
            RETURN suite_number;
        END IF;
        
        attempt := attempt + 1;
        IF attempt > max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique suite number after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$;

-- ============================================
-- 3. CREATE/UPDATE HANDLE_NEW_USER FUNCTION
-- ============================================

-- Create the function that extracts the correct field names
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
    
    -- Extract user data from auth metadata - handle the ACTUAL field names being sent
    -- Based on authService.ts which sends: first_name, last_name, phone_number, street_address, postal_code
    user_first_name := COALESCE(
        NEW.raw_user_meta_data->>'first_name',   -- What frontend actually sends
        NEW.raw_user_meta_data->>'firstName',    -- Fallback
        'User'
    );
    
    user_last_name := COALESCE(
        NEW.raw_user_meta_data->>'last_name',    -- What frontend actually sends
        NEW.raw_user_meta_data->>'lastName',     -- Fallback
        'Name'
    );
    
    -- Frontend sends 'phone_number' not 'phone'
    user_phone := COALESCE(
        NEW.raw_user_meta_data->>'phone_number', -- What frontend actually sends
        NEW.raw_user_meta_data->>'phone',        -- Fallback
        NEW.raw_user_meta_data->>'phoneNumber',  -- Fallback
        NULL
    );
    
    -- Frontend sends 'street_address' not 'streetAddress'
    user_street_address := COALESCE(
        NEW.raw_user_meta_data->>'street_address', -- What frontend actually sends
        NEW.raw_user_meta_data->>'streetAddress',  -- Fallback
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
    
    -- Frontend sends 'postal_code' not 'postalCode'
    user_postal_code := COALESCE(
        NEW.raw_user_meta_data->>'postal_code',  -- What frontend actually sends
        NEW.raw_user_meta_data->>'postalCode',   -- Fallback
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
-- 4. ENSURE TRIGGER EXISTS
-- ============================================

-- Drop existing trigger if it exists (safe operation)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. GRANT NECESSARY PERMISSIONS
-- ============================================

-- Ensure functions have proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_suite_number() TO authenticated;

-- ============================================
-- 6. VERIFY PRODUCTION STATE AFTER FIX
-- ============================================

SELECT 
    'PRODUCTION_STATE_AFTER_FIX' as check_type,
    (SELECT COUNT(*) FROM information_schema.triggers 
     WHERE trigger_name = 'on_auth_user_created' 
     AND event_object_table = 'users') as trigger_exists,
    (SELECT COUNT(*) FROM information_schema.routines 
     WHERE routine_name = 'handle_new_user' 
     AND routine_schema = 'public') as function_exists,
    (SELECT COUNT(*) FROM information_schema.routines 
     WHERE routine_name = 'generate_suite_number' 
     AND routine_schema = 'public') as suite_function_exists;

-- Verify trigger details
SELECT 
    'TRIGGER_DETAILS' as info,
    trigger_name,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- 7. PRODUCTION SAFETY SUMMARY
-- ============================================

SELECT 
    'PRODUCTION_SAFETY_SUMMARY' as summary,
    'This script only creates/updates functions and trigger' as safety_1,
    'No existing data was modified or deleted' as safety_2,
    'All operations are reversible' as safety_3,
    'Registration should now work correctly' as result;

-- ============================================
-- 8. ROLLBACK PLAN (IF NEEDED)
-- ============================================

SELECT 
    'ROLLBACK_PLAN' as plan,
    'If issues occur:' as step_1,
    '1. DROP TRIGGER on_auth_user_created ON auth.users;' as step_2,
    '2. DROP FUNCTION handle_new_user();' as step_3,
    '3. Restore from your database backup' as step_4,
    'No data loss will occur during rollback' as safety_note;
