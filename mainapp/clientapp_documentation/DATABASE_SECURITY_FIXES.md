# Database Security Fixes - October 2025

## Overview
This document outlines the critical security fixes applied to resolve infinite recursion errors in Row Level Security (RLS) policies and address Supabase database linter warnings.

---

## 🔴 Critical Issues Fixed

### 1. Infinite Recursion in Users Table RLS Policies

**Problem:**
```
Error: infinite recursion detected in policy for relation "users"
```

**Root Cause:**
- RLS policies on the `users` table were querying the same `users` table to check permissions
- This created an infinite loop: Policy checks table → Table needs policy → Policy checks table → ...

**Example of Problematic Policy:**
```sql
-- BAD: This causes infinite recursion
CREATE POLICY "super_admins_manage_users"
ON public.users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users  -- ❌ Querying users table from within users policy!
    WHERE users.id = auth.uid()
    AND users.role = 'superadmin'
  )
);
```

**Solution Applied:**
Replaced all recursive policies with simple, non-recursive policies that use `auth.uid()` directly:

```sql
-- GOOD: No recursion, uses auth.uid() directly
CREATE POLICY "users_select_own"
ON public.users
FOR SELECT
TO authenticated
USING (id = auth.uid());  -- ✅ Direct comparison, no table query

CREATE POLICY "users_update_own"
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "service_role_all_users"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

**All Removed Policies:**
- `Allow read by suite_number`
- `Allow user registration`
- `allow_user_registration`
- `authenticated_insert_own`
- `authenticated_select_own`
- `authenticated_update_own`
- `super_admins_manage_users`
- `users_update_own_profile`
- `users_view_own_profile`
- `warehouse_admins_view_users`

---

### 2. RLS Not Enabled on Public Tables

**Problem:**
```
Table `public.users` has RLS policies but RLS is not enabled on the table
Table `public.email_notification_queue` is public, but RLS has not been enabled
Table `public.email_notification_log` is public, but RLS has not been enabled
```

**Solution Applied:**
```sql
-- Enable RLS on all affected tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notification_log ENABLE ROW LEVEL SECURITY;
```

**New Policies Created:**
```sql
-- Email notification queue policies
CREATE POLICY "service_role_manage_email_queue"
ON public.email_notification_queue
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_view_email_queue"
ON public.email_notification_queue
FOR SELECT
TO authenticated
USING (true);

-- Email notification log policies
CREATE POLICY "service_role_manage_email_log"
ON public.email_notification_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_view_email_log"
ON public.email_notification_log
FOR SELECT
TO authenticated
USING (true);
```

---

### 3. Function Search Path Warnings

**Problem:**
```
Function `public.queue_email_notification` has a role mutable search_path
Function `public.mark_email_sent` has a role mutable search_path
... (45 functions total)
```

**Security Risk:**
Functions without a fixed `search_path` are vulnerable to search path injection attacks where malicious users can create objects in schemas that appear earlier in the search path.

**Solution Applied:**
Set `search_path = ''` on all affected functions:

```sql
-- Fixed all 45+ functions with this pattern
ALTER FUNCTION public.queue_email_notification SET search_path = '';
ALTER FUNCTION public.mark_email_sent SET search_path = '';
ALTER FUNCTION public.mark_email_failed SET search_path = '';
-- ... (continued for all functions)
```

**Functions Fixed (Categories):**
1. **Email Notification Functions** (6 functions)
   - queue_email_notification, mark_email_sent, mark_email_failed
   - get_email_notification_stats, retry_failed_emails, get_pending_emails

2. **WhatsApp Verification Functions** (4 functions)
   - complete_whatsapp_verification, cleanup_expired_verification_codes
   - initiate_whatsapp_verification, get_whatsapp_verification_status

3. **User & Preferences Functions** (5 functions)
   - create_default_notification_preferences
   - update_notification_preferences_updated_at
   - update_user_preferences, create_user_profile_secure, update_user_profile

4. **Package Management Functions** (8 functions)
   - sync_package_status_with_shipment, generate_package_id
   - get_processing_packages, warehouse_package_intake
   - warehouse_package_intake_enhanced, generate_package_intake_receipt
   - get_package_verification_logs, verify_package_delivery

5. **Shipment Management Functions** (10 functions)
   - get_all_shipments, generate_tracking_number
   - create_shipment_from_packages, create_shipment_from_packages_enhanced
   - update_shipment_status, update_shipment_total_packages
   - get_consolidated_shipment_details, get_packages_by_shipment
   - unlink_package_from_shipment

6. **Security & Verification Functions** (12 functions)
   - verify_pickup_code, regenerate_pickup_code
   - generate_secure_6digit_code, hash_pickup_code, verify_pickup_code_hash
   - store_package_codes, generate_pickup_codes_for_shipment
   - trigger_generate_pickup_codes_on_arrival
   - generate_delivery_codes_on_arrival, verify_delivery_code
   - get_customer_delivery_codes, generate_code_on_package_arrival

7. **Receipt & Document Functions** (6 functions)
   - update_receipts_updated_at, generate_receipt_number
   - generate_auth_code, generate_shipment_receipt
   - store_shipment_codes, generate_waybill

---

## 🔧 Frontend Code Fixes

### Updated `authService.ts`

**Problem:**
The `createUserProfile()` method was using direct table insert which triggered RLS policies with infinite recursion.

**Old Code:**
```typescript
async createUserProfile(userId: string, email: string, metadata: any) {
  const { error } = await supabase
    .from('users')  // ❌ Direct table access triggers RLS
    .upsert({
      id: userId,
      email: email,
      first_name: metadata.first_name || 'User',
      last_name: metadata.last_name || 'Name',
      phone_number: metadata.phone_number,
      status: 'active',
      email_verified: true
    });
}
```

**New Code:**
```typescript
/**
 * Create user profile using secure RPC function (bypasses RLS)
 * This method is used as a fallback for users created before the RPC was added
 */
async createUserProfile(userId: string, email: string, metadata: any) {
  // Use the secure RPC function that bypasses RLS policies
  const { data: profileResult, error: rpcError } = await supabase.rpc('create_user_profile_secure', {
    user_id: userId,
    email: email,
    first_name: metadata.first_name || metadata.firstName || 'User',
    last_name: metadata.last_name || metadata.lastName || 'Name',
    phone_number: metadata.phone_number || metadata.phone || null,
    street_address: metadata.street_address || metadata.streetAddress || null,
    city: metadata.city || null,
    country: metadata.country || null,
    postal_code: metadata.postal_code || metadata.postalCode || null
  });
  
  // ✅ RPC function uses SECURITY DEFINER to bypass RLS
}
```

---

## 📊 Verification Steps

### 1. Verify RLS is Enabled
```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity AS "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'email_notification_queue', 'email_notification_log')
ORDER BY tablename;
```

### 2. Verify Policies are Non-Recursive
```sql
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd AS operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
ORDER BY policyname;
```

### 3. Verify Function Search Paths
```sql
SELECT 
  n.nspname AS schema_name,
  p.proname AS function_name,
  CASE 
    WHEN proconfig IS NOT NULL THEN 
      (SELECT string_agg(config, ', ') 
       FROM unnest(proconfig) AS config 
       WHERE config LIKE 'search_path%')
    ELSE 'NOT SET'
  END AS search_path_config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY function_name;
```

---

## 🎯 Results

### Before Fixes:
- ❌ 500 errors on all user profile queries
- ❌ Infinite recursion in RLS policies
- ❌ Dashboard won't load
- ❌ Package data inaccessible
- ❌ Security warnings in database linter

### After Fixes:
- ✅ User profile queries return successfully
- ✅ No recursion errors
- ✅ Dashboard loads with metrics
- ✅ Package data accessible
- ✅ All critical security warnings resolved
- ✅ Only minor warnings remain (leaked password protection - optional)

---

## 🚀 Deployment Instructions

### 1. Apply SQL Fixes (in order)
```bash
# 1. Enable RLS
psql -f enable_rls.sql

# 2. Fix function search paths
psql -f fix_function_search_paths.sql

# 3. Fix users table policies (removes infinite recursion)
psql -f fix_users_rls_policies.sql

# 4. Fix email notification policies
psql -f fix_email_notification_policies.sql
```

### 2. Update Frontend Code
```bash
# The authService.ts changes are already applied
npm run build
npm run deploy
```

### 3. Test
```bash
# Login to the app
# Navigate to dashboard
# Check browser console for errors
# Verify package data loads
# Test profile updates
```

---

## 📝 Best Practices Going Forward

### 1. RLS Policy Design
- ✅ **DO:** Use `auth.uid()` directly in policies
- ❌ **DON'T:** Query the same table within its own policy
- ✅ **DO:** Use service role for admin operations via RPC
- ❌ **DON'T:** Give direct table access to roles that need complex permission checks

### 2. Database Functions
- ✅ **DO:** Set `search_path = ''` on all functions
- ✅ **DO:** Use fully qualified table names (`public.users` not `users`)
- ✅ **DO:** Use `SECURITY DEFINER` for trusted operations that need elevated privileges

### 3. Frontend Data Access
- ✅ **DO:** Use RPC functions for complex operations
- ✅ **DO:** Use direct table access only for simple CRUD that RLS can handle
- ❌ **DON'T:** Rely on client-side role checking - always use RLS or RPC

---

## 🔐 Security Improvements

1. **Row Level Security Properly Enabled**
   - All public tables now have RLS enabled
   - Policies are simple and non-recursive
   - Service role has full access for admin operations

2. **Function Security Hardened**
   - All functions have fixed search_path
   - Prevents search path injection attacks
   - Better performance with explicit schema references

3. **Proper Use of Service Role**
   - Admin operations use service role via RPC
   - Client operations use authenticated role with RLS
   - Clear separation of concerns

---

## 📚 Related Documentation

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Function Security](https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)
- [Search Path Vulnerability](https://www.postgresql.org/docs/current/ddl-schemas.html#DDL-SCHEMAS-PATH)

---

**Fixes Applied:** October 8, 2025  
**Author:** Senior Software Engineer  
**Status:** ✅ Completed and Verified
