-- Fix Package Update Permissions for Users
-- Allow users to update status of their own packages
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-03

-- Add policy to allow users to update their own packages
CREATE POLICY "Users can update own packages" ON packages
    FOR UPDATE USING (auth.uid() = user_id);

-- Verify the policies are in place
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'packages'
ORDER BY policyname;
