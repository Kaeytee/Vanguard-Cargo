# Table Name Fix - user_profiles → users ✅

## 🐛 Error Fixed

```
XHR GET https://rsxxjcsmcrcxdmyuytzc.supabase.co/rest/v1/user_profiles
[HTTP/2 404 395ms]
```

---

## 🔍 Problem

The app was querying a table called `user_profiles` which **doesn't exist** in your Supabase database.

**Actual database table:** `users`  
**Code was looking for:** `user_profiles`

---

## ✅ Solution

### **Fixed File:** `src/services/preferencesService.ts`

**Before (❌):**
```typescript
const { data, error } = await supabase
  .from('user_profiles')  // ❌ Wrong table name
  .select(...)
```

**After (✅):**
```typescript
const { data, error } = await supabase
  .from('users')  // ✅ Correct table name
  .select(...)
```

---

## 📝 Changes Made

1. ✅ **getUserPreferences()** - Changed from `user_profiles` to `users`
2. ✅ **updateUserPreferences()** - Changed from `user_profiles` to `users`

Both methods now query the correct table!

---

## 🎯 What This Fixes

**Before:**
- ❌ 404 errors when loading preferences
- ❌ Settings page not loading
- ❌ User preferences not saving

**After:**
- ✅ Preferences load correctly
- ✅ Settings page works
- ✅ User preferences save properly

---

## 🧪 Test It

1. **Clear browser cache**: `Ctrl+Shift+Delete`
2. **Reload the page**: `F5`
3. **Go to Settings page**
4. **Check console**: Should be no 404 errors
5. **Try updating preferences**: Should save successfully

---

## 📊 Your Database Schema

Your Supabase `users` table has these fields:
```sql
- id
- email
- first_name
- last_name
- phone_number
- role
- status
- suite_number
- avatar_url
- preferred_language  ✅
- timezone            ✅
- currency            ✅
- email_notifications ✅
- whatsapp_notifications ✅
- sms_notifications   ✅
- push_notifications  ✅
- two_factor_enabled  ✅
- marketing_consent   ✅
```

All preference fields are in the `users` table, not a separate `user_profiles` table.

---

## ✅ Summary

**Fixed:** Table name mismatch in preferences service  
**Changed:** `user_profiles` → `users`  
**Result:** No more 404 errors! 🎉

---

**Your app should now load preferences correctly!**
