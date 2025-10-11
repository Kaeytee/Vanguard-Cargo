# Account Status Testing Guide 🧪

## Quick Test: Block Account Login

### **Step 1: Create Test User (if needed)**

```sql
-- Run in Supabase SQL Editor
SELECT id, email, status FROM users WHERE email = 'test@example.com';
```

### **Step 2: Set Account to Inactive**

```sql
-- Run in Supabase SQL Editor
UPDATE users 
SET status = 'inactive' 
WHERE email = 'test@example.com';
```

### **Step 3: Try to Login**

1. Go to login page: `http://localhost:5173/login`
2. Enter credentials: `test@example.com` / password
3. Click "Sign In"

### **Expected Result:**

❌ **Login BLOCKED**  
✅ **Error message shown:**  
```
"Your account is currently inactive. Please contact support@vanguardcargo.co for assistance."
```
✅ **User stays on login page**  
✅ **Console shows:**
```
🔐 User signed in: abc-123-def
👤 Profile fetched: Found
🔍 Account status check: inactive
🚫 Account not active - user signed out
❌ Login error: Your account is currently inactive...
```

---

## Test All Status Types

### **Test 1: Suspended Account**

```sql
UPDATE users SET status = 'suspended' WHERE email = 'test@example.com';
```

**Expected Error:**
```
"Your account has been suspended. Please contact support@vanguardcargo.co for assistance."
```

---

### **Test 2: Reported Account**

```sql
UPDATE users SET status = 'reported' WHERE email = 'test@example.com';
```

**Expected Error:**
```
"Your account is under review. Please contact support@vanguardcargo.co for assistance."
```

---

### **Test 3: Pending Verification**

```sql
UPDATE users SET status = 'pending_verification' WHERE email = 'test@example.com';
```

**Expected Error:**
```
"Please verify your email address before logging in. Check your inbox for the verification link."
```

---

### **Test 4: Reactivate Account (Success)**

```sql
UPDATE users SET status = 'active' WHERE email = 'test@example.com';
```

**Expected Result:**
✅ Login successful!  
✅ Redirected to dashboard  
✅ Full access to app  

---

## Test Page Refresh Protection

### **Scenario: Suspend Account While User Is Logged In**

**Step 1: Login with active account**
```sql
-- Ensure account is active
UPDATE users SET status = 'active' WHERE email = 'test@example.com';
```
- Login normally
- Navigate to dashboard

**Step 2: Suspend the account (in different tab/window)**
```sql
-- While user is logged in, run this in Supabase
UPDATE users SET status = 'suspended' WHERE email = 'test@example.com';
```

**Step 3: Refresh page (F5)**

**Expected Result:**
❌ User immediately logged out  
✅ Redirected to login page  
✅ Console shows:
```
🔍 Init - Account status check: suspended
🚫 Account not active - user signed out
```

---

## Test Real-Time Enforcement

### **Scenario: Admin Suspends User Mid-Session**

1. **User A** is logged in and browsing
2. **Admin** runs: `UPDATE users SET status = 'suspended' WHERE id = 'user-a-id';`
3. **User A** clicks any link or refreshes
4. **Result:** User A is immediately logged out

This proves the system checks status in real-time from the database!

---

## Admin Testing Checklist

- [ ] Test "inactive" status blocks login
- [ ] Test "suspended" status blocks login
- [ ] Test "reported" status blocks login
- [ ] Test "pending_verification" blocks login
- [ ] Test "active" status allows login
- [ ] Test suspended user logged out on refresh
- [ ] Test error messages display correctly
- [ ] Test support email shown in messages
- [ ] Test console logging for debugging
- [ ] Test user cannot bypass with browser tricks

---

## Database Queries for Testing

### **Check User Status**
```sql
SELECT id, email, status, created_at 
FROM users 
WHERE email = 'test@example.com';
```

### **Set All Test Users to Active**
```sql
UPDATE users 
SET status = 'active' 
WHERE email LIKE '%@example.com';
```

### **Find All Non-Active Users**
```sql
SELECT id, email, status 
FROM users 
WHERE status != 'active'
ORDER BY status;
```

### **Count Users by Status**
```sql
SELECT status, COUNT(*) as count
FROM users
GROUP BY status
ORDER BY count DESC;
```

---

## ✅ Success Criteria

**System is working correctly if:**

1. ✅ Active accounts can login normally
2. ✅ Inactive accounts are blocked with proper error
3. ✅ Suspended accounts are blocked with proper error
4. ✅ Reported accounts are blocked with proper error
5. ✅ Pending verification is blocked with proper error
6. ✅ Users are signed out immediately when not active
7. ✅ Page refresh doesn't bypass status check
8. ✅ Error messages are user-friendly
9. ✅ Console shows debug logs
10. ✅ No way to bypass via browser manipulation

---

## 🐛 Troubleshooting

### **Issue: User can still login with inactive account**

**Check:**
1. Is the status actually set in database?
   ```sql
   SELECT status FROM users WHERE email = 'test@example.com';
   ```
2. Is the code checking lowercase?
   ```typescript
   const accountStatus = profile.status?.toLowerCase();
   ```
3. Check console logs for status value

### **Issue: Error message not showing**

**Check:**
1. Look at browser console for errors
2. Verify login.tsx catches the error properly
3. Check if error state is being set

### **Issue: User logged in but shouldn't be**

**Check:**
1. Clear browser cache and localStorage
2. Sign out manually
3. Verify database status is actually "inactive"

---

## 🎯 Quick Reset Command

If you need to reset all test accounts to active:

```sql
UPDATE users 
SET status = 'active' 
WHERE email IN (
  'test@example.com',
  'test1@example.com', 
  'test2@example.com'
);
```

---

**Happy Testing!** 🚀
