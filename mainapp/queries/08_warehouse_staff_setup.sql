-- Create warehouse admin account (auth user + identity + profile + staff assignment)
-- Replace password and UUIDs if you want different values.

-- 1) Auth user
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'warehouse.admin@vanguardcargo.com',
    crypt('temp123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2) Auth identity
INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    '{"sub":"44444444-4444-4444-4444-444444444444","email":"warehouse.admin@vanguardcargo.com"}',
    'email',
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 3) Ensure warehouse exists (id matches staff assignment below)
INSERT INTO public.warehouses (
    id,
    name,
    code,
    street_address,
    city,
    state,
    postal_code,
    country,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Atlanta Main Warehouse',
    'ATL-MAIN',
    '1000 Warehouse Blvd',
    'Atlanta',
    'GA',
    '30309',
    'USA',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 4) Upsert user profile (links to auth.users via id)
INSERT INTO public.user_profiles (
    id,
    email,
    role,
    status,
    first_name,
    last_name,
    phone,
    country,
    preferred_language,
    timezone,
    currency,
    created_at,
    updated_at
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    'warehouse.admin@vanguardcargo.com',
    'admin',
    'active',
    'James',
    'Wilson',
    '+14045550004',
    'USA',
    'en',
    'America/New_York',
    'USD',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    country = EXCLUDED.country,
    preferred_language = EXCLUDED.preferred_language,
    timezone = EXCLUDED.timezone,
    currency = EXCLUDED.currency,
    updated_at = NOW();

-- 5) Upsert staff assignment for warehouse admin
INSERT INTO public.staff_assignments (
    id,
    user_id,
    warehouse_id,
    position,
    is_active,
    start_date,
    can_receive_packages,
    can_ship_packages,
    can_modify_packages,
    can_manage_inventory,
    created_at,
    updated_at
) VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '44444444-4444-4444-4444-444444444444',
    '550e8400-e29b-41d4-a716-446655440001',
    'Warehouse Administrator',
    true,
    CURRENT_DATE,
    true,
    true,
    true,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    position = EXCLUDED.position,
    is_active = EXCLUDED.is_active,
    can_receive_packages = EXCLUDED.can_receive_packages,
    can_ship_packages = EXCLUDED.can_ship_packages,
    can_modify_packages = EXCLUDED.can_modify_packages,
    can_manage_inventory = EXCLUDED.can_manage_inventory,
    updated_at = NOW();

-- 6) Verification (returns counts)
SELECT 'profiles' as item, COUNT(*) FROM public.user_profiles WHERE email = 'warehouse.admin@vanguardcargo.com';
SELECT 'assignments' as item, COUNT(*) FROM public.staff_assignments WHERE user_id = '44444444-4444-4444-4444-444444444444';