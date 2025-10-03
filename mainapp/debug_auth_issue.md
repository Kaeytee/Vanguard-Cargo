# AUTHENTICATION ERROR DIAGNOSIS & FIX

## Error Analysis
```
AuthApiError: Invalid login credentials
URL: https://rsxxjcsmcrcxdmyuytzc.supabase.co/auth/v1/token?grant_type=password
Status: HTTP/3 400
```

## Root Cause Analysis

The error indicates that the Supabase authentication is failing with "Invalid login credentials". This can happen due to several reasons:

### 1. Environment Variables Missing
The Supabase configuration expects:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 2. User Account Issues
- User doesn't exist in auth.users table
- Password is incorrect
- Email is not verified
- Account is disabled/suspended

### 3. Database Connection Issues
- Supabase project configuration
- RLS policies blocking access
- Network connectivity

## Diagnostic Steps

### Step 1: Check Environment Variables
Create `.env` file with proper Supabase credentials:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://rsxxjcsmcrcxdmyuytzc.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Other required variables
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 2: Verify User Exists
Run this query in Supabase SQL Editor:

```sql
-- Check if user exists and is properly configured
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'your_test_email@example.com';

-- Check corresponding profile
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    status,
    email_verified
FROM public.users 
WHERE email = 'your_test_email@example.com';
```

### Step 3: Create Test User
If no user exists, create one:

```sql
-- Insert test user into auth.users (requires service role)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@vanguardcargo.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"first_name": "Admin", "last_name": "User", "role": "admin"}',
    NOW(),
    NOW()
);
```

### Step 4: Reset User Password
If user exists but password is wrong:

```sql
-- Reset password for existing user
UPDATE auth.users 
SET 
    encrypted_password = crypt('newpassword123', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'your_email@example.com';
```

## Quick Fix Solutions

### Solution 1: Environment Configuration
1. Copy `.env.example` to `.env`
2. Add your Supabase project credentials
3. Restart development server

### Solution 2: Create Admin User
Use Supabase Dashboard:
1. Go to Authentication > Users
2. Click "Add User"
3. Enter email and password
4. Set email as confirmed
5. Add metadata: `{"role": "admin"}`

### Solution 3: Database Trigger Fix
Ensure the trigger creates profiles properly:

```sql
-- Verify trigger exists and is enabled
SELECT 
    tgname,
    tgenabled,
    tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- If trigger is missing, recreate it
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Testing Authentication

### Test Login Credentials
Try these test accounts:

1. **Admin User:**
   - Email: `admin@vanguardcargo.com`
   - Password: `admin123`
   - Role: `admin`

2. **Warehouse Admin:**
   - Email: `warehouse@vanguardcargo.com`
   - Password: `warehouse123`
   - Role: `warehouse_admin`

### Verification Steps
1. Check browser network tab for actual request/response
2. Verify Supabase project URL matches environment
3. Test authentication in Supabase dashboard
4. Check RLS policies are not blocking access

## Implementation Fix

Update your authentication service to handle errors better:

```typescript
// Enhanced error handling in authService.ts
async signIn(data: SignInData): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    console.log('Attempting login with:', { email: data.email });
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      
      // Enhanced error messages
      if (error.message.includes('Invalid login credentials')) {
        return { 
          user: null, 
          error: {
            ...error,
            message: 'Invalid email or password. Please check your credentials and try again.'
          }
        };
      }
      
      return { user: null, error };
    }

    // Rest of the login logic...
    return { user: authData.user, error: null };
  } catch (err) {
    console.error('Unexpected auth error:', err);
    return { 
      user: null, 
      error: {
        message: 'An unexpected error occurred. Please try again.',
        name: 'UnexpectedError',
        __isAuthError: true
      } as AuthError
    };
  }
}
```

## Next Steps
1. Check your `.env` file has correct Supabase credentials
2. Verify user exists in Supabase dashboard
3. Test with known working credentials
4. Check network connectivity to Supabase
5. Review RLS policies if user exists but still can't login
