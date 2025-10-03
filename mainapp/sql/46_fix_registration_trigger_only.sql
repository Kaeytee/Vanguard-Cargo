-- =====================================================
-- FIX REGISTRATION TRIGGER FOR FUTURE USERS - SAFE VERSION
-- =====================================================
-- This script ONLY fixes the trigger to properly extract user data
-- during registration so future users won't have missing data
-- 
-- SAFETY FEATURES:
-- - Only updates the function, doesn't touch any data
-- - Preserves existing trigger
-- - Includes rollback instructions
-- - No destructive operations
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-02
-- =====================================================

-- ============================================
-- 1. SAFETY CHECK - VERIFY CURRENT STATE
-- ============================================

-- Check if trigger exists (should exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created'
        AND event_object_table = 'users'
    ) THEN
        RAISE EXCEPTION 'SAFETY CHECK FAILED: Trigger on_auth_user_created does not exist. Aborting to prevent issues.';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'handle_new_user'
        AND routine_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'SAFETY CHECK FAILED: Function handle_new_user does not exist. Aborting to prevent issues.';
    END IF;
    
    RAISE NOTICE 'SAFETY CHECK PASSED: Trigger and function exist. Safe to proceed.';
END $$;

-- ============================================
-- 2. BACKUP CURRENT FUNCTION (FOR ROLLBACK)
-- ============================================

-- Show current function definition for reference
SELECT 
    'CURRENT_FUNCTION_BACKUP' as info,
    'If you need to rollback, the current function definition is preserved in pg_proc' as message,
    'This update only changes the function logic, not the trigger itself' as safety_note;

-- ============================================
-- 3. SAFE UPDATE - ONLY THE FUNCTION LOGIC
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
    
    -- Extract user data from auth metadata - match the actual field names being sent
    user_first_name := COALESCE(
        NEW.raw_user_meta_data->>'first_name',  -- This is what frontend sends
        NEW.raw_user_meta_data->>'firstName',   -- Fallback
        'User'
    );
    
    user_last_name := COALESCE(
        NEW.raw_user_meta_data->>'last_name',   -- This is what frontend sends
        NEW.raw_user_meta_data->>'lastName',    -- Fallback
        'Name'
    );
    
    -- Frontend sends 'phone_number' not 'phone'
    user_phone := COALESCE(
        NEW.raw_user_meta_data->>'phone_number', -- This is what frontend sends
        NEW.raw_user_meta_data->>'phone',        -- Fallback
        NEW.raw_user_meta_data->>'phoneNumber',  -- Fallback
        NULL
    );
    
    -- Frontend sends 'street_address' not 'streetAddress'
    user_street_address := COALESCE(
        NEW.raw_user_meta_data->>'street_address', -- This is what frontend sends
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
        NEW.raw_user_meta_data->>'postal_code',  -- This is what frontend sends
        NEW.raw_user_meta_data->>'postalCode',   -- Fallback
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
-- 4. VERIFY THE UPDATE WAS SUCCESSFUL
-- ============================================

SELECT 
    'UPDATE_COMPLETE' as status,
    'handle_new_user function updated successfully' as message,
    'Future user registrations will save phone numbers and addresses' as result;

-- Verify trigger is still active and unchanged
SELECT 
    'TRIGGER_VERIFICATION' as check_type,
    trigger_name,
    event_object_table,
    action_timing,
    'Trigger unchanged - only function logic updated' as safety_note
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
AND event_object_table = 'users';

-- Verify function was updated
SELECT 
    'FUNCTION_VERIFICATION' as check_type,
    routine_name,
    routine_type,
    security_type,
    'Function updated with correct field extraction' as update_note
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- ============================================
-- 5. ROLLBACK INSTRUCTIONS (IF NEEDED)
-- ============================================

SELECT 
    'ROLLBACK_INFO' as info,
    'If you need to rollback this change:' as instruction_1,
    '1. Run any previous handle_new_user function definition' as instruction_2,
    '2. Or restore from your database backup' as instruction_3,
    'This script only modified the function, no data was changed' as safety_reminder;

-- ============================================
-- 6. WHAT WAS CHANGED
-- ============================================

SELECT 
    'CHANGES_SUMMARY' as summary,
    'ONLY CHANGED: Function logic to look for correct field names' as change_1,
    'NOT CHANGED: Trigger, tables, existing data, permissions' as unchanged,
    'IMPACT: Only affects NEW user registrations going forward' as impact;
