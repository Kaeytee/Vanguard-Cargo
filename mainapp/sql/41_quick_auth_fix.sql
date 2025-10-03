-- =====================================================
-- QUICK AUTH CONFIGURATION FIX
-- =====================================================
-- Simple fix for the "unable to find user from email identity" error
-- This addresses the most common causes of the signup issue
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-02
-- =====================================================

-- ============================================
-- 1. QUICK DIAGNOSIS
-- ============================================

-- Check current auth state
SELECT 
    'CURRENT_AUTH_STATE' as status,
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM auth.identities) as identities,
    (SELECT COUNT(*) FROM public.users) as profile_users;

-- Check for orphaned data
SELECT 
    'ORPHANED_DATA_CHECK' as status,
    COUNT(*) as orphaned_identities
FROM auth.identities i
LEFT JOIN auth.users u ON i.user_id = u.id
WHERE u.id IS NULL;

-- ============================================
-- 2. CLEAN UP ORPHANED DATA
-- ============================================

-- Remove orphaned identities
DELETE FROM auth.identities 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Remove orphaned profiles
DELETE FROM public.users 
WHERE id NOT IN (SELECT id FROM auth.users);

-- ============================================
-- 3. ENSURE TRIGGER IS ACTIVE
-- ============================================

-- Verify the trigger exists
SELECT 
    'TRIGGER_CHECK' as status,
    COUNT(*) as trigger_count
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
AND event_object_table = 'users';

-- If trigger doesn't exist, create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created'
        AND event_object_table = 'users'
    ) THEN
        -- Create the function if it doesn't exist
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $func$
        DECLARE
            new_suite_number TEXT;
        BEGIN
            -- Generate suite number
            SELECT generate_suite_number() INTO new_suite_number;
            
            -- Create user profile
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
                COALESCE(NEW.raw_user_meta_data->>'firstName', 'User'),
                COALESCE(NEW.raw_user_meta_data->>'lastName', 'Name'),
                NEW.raw_user_meta_data->>'phone',
                NEW.raw_user_meta_data->>'phone',
                new_suite_number,
                'client',
                'active',
                NEW.email_confirmed_at IS NOT NULL,
                NOW(),
                NOW()
            );
            
            RETURN NEW;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE LOG 'Error in handle_new_user: %', SQLERRM;
                RETURN NEW;
        END;
        $func$;
        
        -- Create the trigger
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW 
            EXECUTE FUNCTION public.handle_new_user();
            
        RAISE NOTICE 'Created missing trigger: on_auth_user_created';
    END IF;
END $$;

-- ============================================
-- 4. VERIFY FINAL STATE
-- ============================================

SELECT 
    'CLEANUP_COMPLETE' as status,
    'Auth tables cleaned and trigger verified' as message,
    'Try user registration now' as next_step;
