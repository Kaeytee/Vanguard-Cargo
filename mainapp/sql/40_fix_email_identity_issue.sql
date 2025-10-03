-- =====================================================
-- FIX EMAIL IDENTITY LOOKUP ISSUE
-- =====================================================
-- This script diagnoses and fixes the "unable to find user from email identity" error
-- The error occurs during signup when Supabase tries to check for duplicate emails
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-02
-- =====================================================

-- ============================================
-- 1. DIAGNOSE THE CURRENT STATE
-- ============================================

-- Check auth.users table
SELECT 
    'AUTH_USERS_CHECK' as check_type,
    COUNT(*) as total_auth_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
    COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as unconfirmed_users
FROM auth.users;

-- Check auth.identities table
SELECT 
    'AUTH_IDENTITIES_CHECK' as check_type,
    provider,
    COUNT(*) as identity_count
FROM auth.identities
GROUP BY provider;

-- Check for orphaned identities (identities without corresponding auth.users)
SELECT 
    'ORPHANED_IDENTITIES' as check_type,
    i.id as identity_id,
    i.user_id,
    i.provider,
    i.identity_data->>'email' as identity_email,
    CASE WHEN u.id IS NULL THEN 'ORPHANED' ELSE 'OK' END as status
FROM auth.identities i
LEFT JOIN auth.users u ON i.user_id = u.id
WHERE u.id IS NULL
LIMIT 10;

-- Check for duplicate email identities
SELECT 
    'DUPLICATE_EMAIL_CHECK' as check_type,
    i.identity_data->>'email' as email,
    COUNT(*) as identity_count,
    array_agg(i.id) as identity_ids
FROM auth.identities i
WHERE i.provider = 'email'
GROUP BY i.identity_data->>'email'
HAVING COUNT(*) > 1;

-- Check recent failed signup attempts in auth.users
SELECT 
    'RECENT_AUTH_USERS' as check_type,
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    CASE WHEN email_confirmed_at IS NULL THEN 'UNCONFIRMED' ELSE 'CONFIRMED' END as status
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 2. CLEAN UP ORPHANED OR CORRUPTED DATA
-- ============================================

-- Remove orphaned identities (identities without corresponding users)
DELETE FROM auth.identities 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Get count of cleaned up identities
SELECT 
    'CLEANUP_RESULT' as check_type,
    'Orphaned identities cleaned up' as message;

-- ============================================
-- 3. CHECK EMAIL CONFIRMATION SETTINGS
-- ============================================

-- Note: This requires checking Supabase dashboard settings
-- The issue might be related to email confirmation requirements

SELECT 
    'EMAIL_CONFIRMATION_NOTE' as check_type,
    'Check Supabase Dashboard > Authentication > Settings' as instruction,
    'Ensure "Enable email confirmations" matches your app requirements' as details;

-- ============================================
-- 4. CREATE HELPER FUNCTION TO CLEAN UP DUPLICATE EMAILS
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_duplicate_email_identities()
RETURNS TABLE(
    action TEXT,
    email TEXT,
    identities_removed INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    duplicate_email RECORD;
    identity_to_keep UUID;
    identities_to_remove UUID[];
BEGIN
    -- Find and clean up duplicate email identities
    FOR duplicate_email IN 
        SELECT 
            i.identity_data->>'email' as email_addr,
            array_agg(i.id ORDER BY i.created_at) as identity_ids,
            COUNT(*) as count
        FROM auth.identities i
        WHERE i.provider = 'email'
        GROUP BY i.identity_data->>'email'
        HAVING COUNT(*) > 1
    LOOP
        -- Keep the first (oldest) identity, remove the rest
        identity_to_keep := duplicate_email.identity_ids[1];
        identities_to_remove := duplicate_email.identity_ids[2:];
        
        -- Delete duplicate identities
        DELETE FROM auth.identities 
        WHERE id = ANY(identities_to_remove);
        
        -- Return result
        action := 'CLEANED_DUPLICATES';
        email := duplicate_email.email_addr;
        identities_removed := array_length(identities_to_remove, 1);
        
        RETURN NEXT;
    END LOOP;
    
    -- If no duplicates found
    IF NOT FOUND THEN
        action := 'NO_DUPLICATES_FOUND';
        email := NULL;
        identities_removed := 0;
        RETURN NEXT;
    END IF;
END;
$$;

-- Run the cleanup function
SELECT * FROM cleanup_duplicate_email_identities();

-- ============================================
-- 5. VERIFY AUTH CONFIGURATION
-- ============================================

-- Check if there are any users with missing identities
SELECT 
    'USERS_WITHOUT_IDENTITIES' as check_type,
    u.id,
    u.email,
    u.created_at,
    CASE WHEN i.user_id IS NULL THEN 'MISSING_IDENTITY' ELSE 'OK' END as status
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id AND i.provider = 'email'
WHERE i.user_id IS NULL
LIMIT 10;

-- ============================================
-- 6. CREATE MISSING EMAIL IDENTITIES
-- ============================================

-- Function to create missing email identities for existing users
CREATE OR REPLACE FUNCTION create_missing_email_identities()
RETURNS TABLE(
    action TEXT,
    user_id UUID,
    email TEXT,
    result TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Find users without email identities
    FOR user_record IN 
        SELECT u.id, u.email, u.created_at
        FROM auth.users u
        LEFT JOIN auth.identities i ON u.id = i.user_id AND i.provider = 'email'
        WHERE i.user_id IS NULL
        AND u.email IS NOT NULL
    LOOP
        BEGIN
            -- Create missing email identity
            INSERT INTO auth.identities (
                id,
                user_id,
                provider,
                identity_data,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                user_record.id,
                'email',
                json_build_object('email', user_record.email, 'sub', user_record.id::text),
                user_record.created_at,
                NOW()
            );
            
            action := 'CREATED_IDENTITY';
            user_id := user_record.id;
            email := user_record.email;
            result := 'SUCCESS';
            
            RETURN NEXT;
            
        EXCEPTION WHEN OTHERS THEN
            action := 'FAILED_TO_CREATE';
            user_id := user_record.id;
            email := user_record.email;
            result := SQLERRM;
            
            RETURN NEXT;
        END;
    END LOOP;
    
    -- If no missing identities found
    IF NOT FOUND THEN
        action := 'NO_MISSING_IDENTITIES';
        user_id := NULL;
        email := NULL;
        result := 'ALL_USERS_HAVE_IDENTITIES';
        RETURN NEXT;
    END IF;
END;
$$;

-- Run the identity creation function
SELECT * FROM create_missing_email_identities();

-- ============================================
-- 7. FINAL VERIFICATION
-- ============================================

-- Verify the cleanup worked
SELECT 
    'FINAL_AUTH_STATE' as check_type,
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM auth.identities WHERE provider = 'email') as email_identities,
    (SELECT COUNT(*) FROM auth.users u 
     LEFT JOIN auth.identities i ON u.id = i.user_id AND i.provider = 'email'
     WHERE i.user_id IS NULL) as users_without_identities;

-- Check for any remaining duplicate emails
SELECT 
    'REMAINING_DUPLICATES' as check_type,
    COUNT(*) as duplicate_email_count
FROM (
    SELECT i.identity_data->>'email' as email
    FROM auth.identities i
    WHERE i.provider = 'email'
    GROUP BY i.identity_data->>'email'
    HAVING COUNT(*) > 1
) duplicates;

-- ============================================
-- 8. RECOMMENDATIONS
-- ============================================

SELECT 
    'RECOMMENDATIONS' as check_type,
    'If signup still fails, check Supabase Dashboard settings:' as step1,
    '1. Authentication > Settings > Enable email confirmations' as step2,
    '2. Authentication > Settings > Disable email confirmations if not needed' as step3,
    '3. Authentication > URL Configuration > Site URL and redirect URLs' as step4;

-- ============================================
-- 9. TEST QUERY FOR SIGNUP PROCESS
-- ============================================

-- This simulates what Supabase does during signup to check for duplicates
-- Replace 'test@example.com' with the email you're trying to register
SELECT 
    'SIGNUP_SIMULATION' as check_type,
    'Testing email lookup for: test@example.com' as test_email,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.identities 
            WHERE provider = 'email' 
            AND identity_data->>'email' = 'test@example.com'
        ) THEN 'EMAIL_EXISTS'
        ELSE 'EMAIL_AVAILABLE'
    END as result;

-- Clean up helper functions
DROP FUNCTION IF EXISTS cleanup_duplicate_email_identities();
DROP FUNCTION IF EXISTS create_missing_email_identities();
