# Troubleshooting: Pre-Login Status Check 🔧

## 🐛 Issue: Modal Not Showing, Redux Error Instead

### **Symptoms:**
- Redux shows: `'Your account is currently inactive. Please contact support@vanguardcargo.co for assistance.'`
- Beautiful modal doesn't appear
- Login attempt happens (shouldn't happen if inactive)

---

## 🔍 Root Cause Analysis

The pre-login check is likely failing due to one of these reasons:

### **1. RLS Policy Issue** ⚠️ (Most Likely)
**Problem:** Supabase RLS (Row Level Security) is blocking anonymous reads of the `users` table.

**How to Check:**
Open browser console and look for:
```
🔍 checkAccountStatus: Querying database for email: your@email.com
⚠️ checkAccountStatus: Database error: <error message>
```

**Solution:** Run the SQL script to fix RLS policies.

### **2. Email Case Sensitivity**
**Problem:** Email in database might have different casing than login attempt.

**How to Check:** Console shows:
```
ℹ️ checkAccountStatus: No user found with that email
```

**Solution:** SQL script converts email to lowercase for comparison.

---

## ✅ Solution Steps

### **Step 1: Run SQL Script to Fix RLS Policies**

**File:** `sql/60_fix_users_read_policy.sql`

**What it does:**
- Allows anonymous (anon) role to SELECT from `users` table
- Only exposes: `status`, `first_name`, `email` (no sensitive data)
- Keeps data secure while enabling pre-login check

**How to run:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `sql/60_fix_users_read_policy.sql`
4. Click "Run"
5. Should see: "Success. No rows returned"

---

### **Step 2: Test with Console Logs**

**Login with your inactive account and check console:**

#### **Expected Console Output (Working):**

```javascript
// Pre-check starts
🔍 Pre-login: Checking account status for austinbediako4@gmail.com

// Database query
🔍 checkAccountStatus: Querying database for email: austinbediako4@gmail.com

// Query successful
📊 checkAccountStatus: Query result: {
  found: true,
  error: undefined,
  status: "inactive",
  firstName: "Austin"
}

// Status check result
📊 Pre-login status check result: {
  status: "inactive",
  canLogin: false,
  hasMessage: true,
  firstName: "Austin"
}

// Modal shown
🚫 Pre-login: Account not active - inactive
```

**Result:** ✅ Beautiful modal appears, no authentication attempt

---

#### **Current Console Output (Not Working):**

**Scenario A: RLS Blocking Query**
```javascript
🔍 Pre-login: Checking account status for austinbediako4@gmail.com
🔍 checkAccountStatus: Querying database for email: austinbediako4@gmail.com
⚠️ checkAccountStatus: Database error: permission denied for table users
📊 Pre-login status check result: {
  status: null,
  canLogin: true,  // ❌ Proceeds to auth
  hasMessage: false,
  firstName: undefined
}
✅ Pre-login: Account is active - proceeding with authentication
❌ Login error: Your account is currently inactive...
```

**Result:** ❌ No modal, authentication attempted, Redux error shown

**Fix:** Run SQL script to fix RLS policies

---

**Scenario B: Email Not Found**
```javascript
🔍 checkAccountStatus: Querying database for email: austinbediako4@gmail.com
📊 checkAccountStatus: Query result: {
  found: false,  // ❌ User not found
  error: undefined,
  status: undefined,
  firstName: undefined
}
ℹ️ checkAccountStatus: No user found with that email
```

**Result:** ❌ Pre-check thinks email doesn't exist, proceeds to auth

**Fix:** Check if email in database matches exactly (case-insensitive comparison already added)

---

### **Step 3: Verify RLS Policies**

**Test Query in Supabase SQL Editor:**

```sql
-- This should return your user data
SELECT status, first_name, email 
FROM users 
WHERE email = 'austinbediako4@gmail.com';
```

**Expected Result:** Should see your user row

**If empty:** Email doesn't match or user doesn't exist in database

**If permission error:** RLS policies need fixing (run SQL script)

---

### **Step 4: Verify Fallback is Working**

Even if pre-check fails, the fallback should catch the Redux error:

**Console Output:**
```javascript
❌ Login error: Your account is currently inactive. Please contact...
⚠️ Account status error caught in fallback - showing modal
```

**Result:** Modal should appear via fallback

**If not working:** Check that the error message contains "inactive", "suspended", or "reported"

---

## 🧪 Quick Test Script

Run this in browser console after trying to login:

```javascript
// Test the checkAccountStatus method directly
const { authService } = await import('/src/services/authService');
const result = await authService.checkAccountStatus('austinbediako4@gmail.com');
console.log('Direct test result:', result);
```

**Expected Output:**
```javascript
{
  status: "inactive",
  canLogin: false,
  message: "Hi Austin, your account is currently inactive...",
  firstName: "Austin"
}
```

---

## 📋 Diagnostic Checklist

Run through this checklist:

- [ ] **SQL script executed** in Supabase dashboard
- [ ] **No RLS errors** in console logs
- [ ] **User found** in database query (console shows `found: true`)
- [ ] **Status correct** in database (check with SQL query)
- [ ] **Console shows pre-check logs** (🔍, 📊 emojis)
- [ ] **Modal state set** (check React DevTools)
- [ ] **Fallback catching errors** (⚠️ emoji in console)

---

## 🔐 Security Note

The SQL script allows **anonymous reads** of the users table, but only these fields:
- `status` - Account status (inactive, active, etc.)
- `first_name` - For personalized greeting
- `email` - For query matching

**Not exposed:**
- Passwords (stored in auth.users, separate table)
- Phone numbers
- Addresses
- Any sensitive data

This is **safe and necessary** for pre-login status checks.

---

## 🎯 Expected Behavior After Fix

### **1. Inactive Account Login:**
```
User enters credentials
   ↓
Click "Sign In"
   ↓
🔍 Pre-check database (0.2s)
   ↓
📊 Status: "inactive" ❌
   ↓
✨ Beautiful modal appears
   ↓
No authentication attempt
   ↓
User sees: "Hi Austin, your account is inactive..."
```

### **2. Active Account Login:**
```
User enters credentials
   ↓
Click "Sign In"
   ↓
🔍 Pre-check database (0.2s)
   ↓
📊 Status: "active" ✅
   ↓
Proceeds with authentication
   ↓
Login successful
   ↓
Navigate to dashboard
```

---

## 🚨 If Still Not Working

1. **Check browser console** for ALL logs
2. **Run SQL script** (most common fix)
3. **Verify email** matches database exactly
4. **Check React DevTools** - is `showStatusWarning` being set to `true`?
5. **Check if modal is rendering** - inspect DOM for the modal component
6. **Clear cache and try again**

---

## 📞 Support

If issue persists:

1. **Capture full console logs** from login attempt
2. **Run SQL verification query** and capture result
3. **Check React DevTools** state for `showStatusWarning` and `accountStatusInfo`
4. **Share console output** for debugging

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Console shows: `🚫 Pre-login: Account not active - inactive`
2. ✅ Beautiful modal appears immediately
3. ✅ No Redux login error in console
4. ✅ No authentication attempt made
5. ✅ User stays on login page with modal

---

**Most common fix: Run the SQL script to fix RLS policies!** 🔧
