-- ============================================================================
-- Check Avatar URL in Database
-- ============================================================================
-- Run this in Supabase SQL Editor to check your avatar_url field
-- ============================================================================

-- Check your specific user's avatar_url
SELECT 
    id,
    email,
    first_name,
    last_name,
    avatar_url,
    CASE 
        WHEN avatar_url IS NULL THEN '❌ NULL'
        WHEN avatar_url = '' THEN '⚠️ EMPTY STRING'
        ELSE '✅ HAS VALUE'
    END as avatar_status
FROM users
WHERE id = '228624ae-1c23-4557-9984-cca1c0bb86f7';

-- Check all users with empty avatars
SELECT 
    id,
    email,
    first_name,
    last_name,
    avatar_url,
    created_at
FROM users
WHERE avatar_url IS NULL OR avatar_url = ''
ORDER BY created_at DESC
LIMIT 10;

-- Check all users WITH avatars
SELECT 
    id,
    email,
    first_name,
    last_name,
    avatar_url,
    created_at
FROM users
WHERE avatar_url IS NOT NULL AND avatar_url != ''
ORDER BY created_at DESC
LIMIT 10;

-- Count avatar statistics
SELECT 
    COUNT(*) as total_users,
    COUNT(avatar_url) as users_with_avatar_field,
    COUNT(CASE WHEN avatar_url != '' THEN 1 END) as users_with_avatar_value,
    COUNT(CASE WHEN avatar_url IS NULL OR avatar_url = '' THEN 1 END) as users_without_avatar
FROM users;
