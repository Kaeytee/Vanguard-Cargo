# Quick Fix Guide: Delivery Codes Not Showing

## ❌ Problem
You're seeing this in your console:
```
📊 Delivery codes response: { success: true, dataLength: 0 }
✅ Successfully loaded delivery codes: 0
```

**This means**: Codes are being created but RLS (Row Level Security) is blocking users from seeing them.

---

## ✅ Quick Fix (5 Minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Fix Script
1. Open the file: `fix_delivery_codes_rls.sql` (in your project root)
2. **Copy the entire contents** of that file
3. **Paste into Supabase SQL Editor**
4. Click **Run** button (or press Ctrl+Enter)

### Step 3: Verify the Fix
1. Look for green checkmarks (✅) in the output
2. You should see messages like:
   ```
   ✅ RLS enabled on package_codes table
   ✅ Created RLS policies for package_codes
   ✅ Updated get_customer_delivery_codes function security settings
   ✅ Granted permissions on package_codes
   ```

### Step 4: Test in Your App
1. **Refresh your browser** (Ctrl+Shift+R or Cmd+Shift+R)
2. Go to the **Package Intake** page
3. Check the console - you should now see:
   ```
   📊 Delivery codes response: { success: true, dataLength: 3 }
   ✅ Successfully loaded delivery codes: 3
   ```
4. The **"Ready for Pickup"** section should display green cards with codes

---

## 🔍 Still Not Working?

### Option A: Run Diagnostic First
If the quick fix didn't work, run the diagnostic script:

1. Open `diagnose_delivery_codes.sql`
2. Copy and paste into Supabase SQL Editor
3. Run it and review the output
4. Share the output with your team or check the troubleshooting section below

### Option B: Manual Verification

#### Check if codes exist in database:
```sql
-- Replace YOUR_USER_ID with your actual user ID from Supabase Auth
SELECT * FROM package_codes 
WHERE user_id = 'YOUR_USER_ID'
LIMIT 5;
```

If you see an error like "relation package_codes does not exist":
```sql
-- Try this instead
SELECT * FROM delivery_codes 
WHERE user_id = 'YOUR_USER_ID'
LIMIT 5;
```

#### Check if RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND (tablename LIKE '%code%' OR tablename LIKE '%delivery%');
```

#### Check existing policies:
```sql
SELECT tablename, policyname, roles 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND (tablename LIKE '%code%' OR tablename LIKE '%delivery%');
```

---

## 🐛 Common Issues

### Issue 1: "Table does not exist"
**Cause**: The table might have a different name than expected

**Fix**:
```sql
-- Find all code-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%code%';
```

Then update the fix script with the correct table name.

---

### Issue 2: "Permission denied for function"
**Cause**: Function doesn't have SECURITY DEFINER set

**Fix**:
```sql
ALTER FUNCTION public.get_customer_delivery_codes(UUID) 
  SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_customer_delivery_codes(UUID) 
  TO authenticated;
```

---

### Issue 3: "Function does not exist"
**Cause**: The RPC function was never created

**Fix**: You'll need to create the function. Here's a template:
```sql
CREATE OR REPLACE FUNCTION public.get_customer_delivery_codes(p_user_id UUID)
RETURNS TABLE (
  package_id TEXT,
  tracking_number TEXT,
  delivery_code TEXT,
  shipment_tracking TEXT,
  status TEXT,
  generated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.package_id,
    p.tracking_number,
    pc.code AS delivery_code,
    s.tracking_number AS shipment_tracking,
    p.status,
    pc.created_at AS generated_at,
    pc.expires_at,
    p.description
  FROM public.packages p
  JOIN public.package_codes pc ON pc.package_id = p.id
  LEFT JOIN public.shipments s ON s.id = p.shipment_id
  WHERE p.user_id = p_user_id
    AND p.status = 'arrived'
    AND pc.code IS NOT NULL;
END;
$$;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION public.get_customer_delivery_codes(UUID) 
  TO authenticated;
```

*Note: Adjust column names based on your actual schema*

---

### Issue 4: Still Getting 0 Results After Fix
**Possible causes**:
1. No packages have `status = 'arrived'`
2. Codes aren't being generated on package arrival
3. The `user_id` field in codes table is NULL

**Debug**:
```sql
-- Check package statuses
SELECT status, COUNT(*) 
FROM packages 
WHERE user_id = 'YOUR_USER_ID'
GROUP BY status;

-- Check if codes have user_id set
SELECT 
  pc.id,
  pc.package_id,
  pc.user_id,
  pc.code,
  p.status
FROM package_codes pc
JOIN packages p ON p.id = pc.package_id
WHERE p.user_id = 'YOUR_USER_ID';
```

---

## 📞 Need Help?

1. **Run the diagnostic script** (`diagnose_delivery_codes.sql`)
2. **Copy the complete output**
3. **Share with your development team** or post in your support channel
4. **Include**:
   - The diagnostic output
   - Your Supabase project ID (if sharing publicly, redact sensitive info)
   - Screenshot of the console errors

---

## 📚 Related Documentation

- [README.md - Delivery Codes Section](./README.md#61-package-delivery-codes--warehouse-pickup)
- [DATABASE_SECURITY_FIXES.md](./DATABASE_SECURITY_FIXES.md)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Success Checklist

After applying the fix, you should have:
- [ ] No console errors about failed delivery code queries
- [ ] `dataLength` greater than 0 in delivery codes response
- [ ] Green "Ready for Pickup" cards visible on Package Intake page
- [ ] 6-digit codes displayed with copy functionality
- [ ] Real-time updates when package status changes to 'arrived'

---

**Last Updated**: October 8, 2025  
**Author**: Senior Software Engineer  
**Version**: 1.0.0
