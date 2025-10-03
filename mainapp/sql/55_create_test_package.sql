-- Create Test Package for Current User
-- This will create a sample package that you can test the Process button with
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @created 2025-10-03

-- First, let's see what users exist
SELECT id, email, first_name, last_name, suite_number FROM users LIMIT 5;

-- If no users exist, create one first
INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    role,
    suite_number,
    status,
    email_verified,
    created_at,
    updated_at
) VALUES (
    '7a6e0e5a-11e8-48f2-b0e3-e645e9367ae4',
    'test@vanguardcargo.com',
    'Test',
    'User',
    'client',
    'VC-001',
    'active',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create a test package for the test user
INSERT INTO packages (
    id,
    package_id,
    tracking_number,
    user_id,
    status,
    description,
    weight,
    declared_value,
    store_name,
    vendor_name,
    notes,
    intake_date,
    created_at,
    updated_at
) VALUES (
    '493ff33e-ed1e-4650-91d8-8bafcfb1a0e5', -- Using the ID from your error
    'PKG250001',
    'VC250001',
    '7a6e0e5a-11e8-48f2-b0e3-e645e9367ae4', -- Test user ID
    'received',
    'Electronics',
    5.72, -- Weight in kg
    125.99,
    'Amazon',
    'Apple',
    'Test package for Process button functionality',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    updated_at = NOW();

-- Verify the package was created
SELECT 
    id,
    package_id,
    tracking_number,
    user_id,
    status,
    description,
    store_name
FROM packages 
WHERE id = '493ff33e-ed1e-4650-91d8-8bafcfb1a0e5';

-- Also show the user info for verification
SELECT 
    u.id as user_id,
    u.email,
    u.suite_number,
    p.package_id,
    p.status
FROM users u
JOIN packages p ON u.id = p.user_id
WHERE p.id = '493ff33e-ed1e-4650-91d8-8bafcfb1a0e5';
