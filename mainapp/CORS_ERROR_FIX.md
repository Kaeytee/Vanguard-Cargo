# CORS Error Fix Guide 🔧

## 🚨 Current Error

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading 
the remote resource at https://rsxxjcsmcrcxdmyuytzc.supabase.co/auth/v1/token
(Reason: CORS request did not succeed). Status code: (null).

TypeError: NetworkError when attempting to fetch resource.
```

---

## 🔍 Root Causes

### **1. Missing Environment Variables**
Your `.env` file might be missing or have incorrect Supabase credentials.

### **2. Supabase CORS Not Configured**
Supabase project doesn't allow `localhost:5173` origin.

### **3. Network/Browser Issues**
Browser extensions or network blocking Supabase requests.

---

## ✅ Solution Steps

### **Step 1: Check Environment Variables**

**Create/Update `.env` file in project root:**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://rsxxjcsmcrcxdmyuytzc.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional
VITE_DISABLE_REALTIME=false
```

**Get your Supabase credentials:**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

### **Step 2: Configure Supabase CORS**

**In Supabase Dashboard:**

1. Go to **Settings** → **API**
2. Scroll to **CORS**
3. Add allowed origins:
   ```
   http://localhost:5173
   http://localhost:3000
   https://your-production-domain.com
   ```
4. Click **Save**

---

### **Step 3: Test Supabase Connection**

**Open browser console (F12) and run:**

```javascript
// Test 1: Check if env variables are loaded
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

// Test 2: Test direct fetch
fetch('https://rsxxjcsmcrcxdmyuytzc.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'YOUR_ANON_KEY_HERE',  // Replace with your actual key
    'Authorization': 'Bearer YOUR_ANON_KEY_HERE'
  }
})
.then(r => console.log('✅ Supabase connected:', r.ok))
.catch(e => console.error('❌ Supabase error:', e));
```

---

### **Step 4: Restart Dev Server**

Environment variables are loaded at build time, so you **must restart**:

```bash
# Stop current server (Ctrl+C)

# Clear cache
rm -rf node_modules/.vite

# Restart
pnpm dev
```

---

## 🔧 Alternative: Use Supabase Service Role (Temporary Debug)

**⚠️ ONLY for debugging - NEVER in production!**

If CORS persists, temporarily test with service role:

```typescript
// In src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://rsxxjcsmcrcxdmyuytzc.supabase.co',
  'YOUR_SERVICE_ROLE_KEY_HERE',  // Service role bypasses CORS
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    }
  }
);
```

**❗ Remember to revert this after testing!**

---

## 🐛 Debugging Checklist

### **Check 1: Environment Variables Loaded**

**Console:**
```javascript
console.table({
  'URL': import.meta.env.VITE_SUPABASE_URL,
  'Key Length': import.meta.env.VITE_SUPABASE_ANON_KEY?.length,
  'Mode': import.meta.env.MODE
});
```

**Expected Output:**
```
URL: https://rsxxjcsmcrcxdmyuytzc.supabase.co
Key Length: 200+ characters
Mode: development
```

---

### **Check 2: Network Tab**

1. Open DevTools → **Network** tab
2. Try to login
3. Look for request to `/auth/v1/token`
4. Check:
   - **Status**: Should be 200, not CORS error
   - **Headers**: Should have `Authorization: Bearer ...`
   - **Response**: Should have user data

---

### **Check 3: Browser Extensions**

Disable these temporarily:
- Ad blockers
- Privacy badger
- CORS blockers
- VPN extensions

---

### **Check 4: Supabase Project Status**

1. Go to Supabase Dashboard
2. Check project is **Active** (not paused)
3. Check **Database** → **Tables** → `users` exists
4. Check **Authentication** → **Policies** → RLS enabled

---

## 🔐 Correct .env File Template

```env
# ============================================================================
# Vanguard Cargo - Environment Variables
# ============================================================================
# Copy this file to .env and fill in your actual values
# NEVER commit .env to git!

# Supabase Configuration
VITE_SUPABASE_URL=https://rsxxjcsmcrcxdmyuytzc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-actual-anon-key-here

# Optional: Disable realtime features if having issues
VITE_DISABLE_REALTIME=false

# Optional: reCAPTCHA (if using)
REACT_APP_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
REACT_APP_ENABLE_RECAPTCHA=true
```

---

## 🚀 Quick Fix Script

**Create this file: `check-supabase.js`**

```javascript
// Run with: node check-supabase.js
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Checking Supabase Configuration...\n');

// Check 1: Environment variables
console.log('1️⃣ Environment Variables:');
console.log('   URL:', SUPABASE_URL || '❌ MISSING');
console.log('   Anon Key:', ANON_KEY ? `✅ ${ANON_KEY.substring(0, 20)}...` : '❌ MISSING');

// Check 2: URL format
if (SUPABASE_URL) {
  const isValid = SUPABASE_URL.startsWith('https://') && SUPABASE_URL.includes('.supabase.co');
  console.log('   URL Format:', isValid ? '✅ Valid' : '❌ Invalid');
}

// Check 3: Key format
if (ANON_KEY) {
  const isValidKey = ANON_KEY.startsWith('eyJ') && ANON_KEY.length > 100;
  console.log('   Key Format:', isValidKey ? '✅ Valid JWT' : '❌ Invalid');
}

console.log('\n✅ If all checks pass, restart your dev server!');
console.log('   pnpm dev\n');
```

---

## 📝 Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Missing .env** | "NetworkError" | Create .env file with keys |
| **Wrong URL** | "NetworkError" | Check URL format |
| **Wrong Key** | "Invalid API key" | Copy anon key from dashboard |
| **Paused Project** | "NetworkError" | Unpause in Supabase dashboard |
| **CORS Not Set** | "CORS blocked" | Add localhost to allowed origins |
| **Cache Issues** | "Old credentials" | Clear cache: `rm -rf node_modules/.vite` |
| **Not Restarted** | "Still failing" | Stop server and restart |

---

## ✅ Success Checklist

After fixing, you should see:

**Console:**
```
🔐 User signed in: [user-id]
👤 Profile fetched: Found
✅ Login successful!
```

**Network Tab:**
- ✅ POST `/auth/v1/token` → Status 200
- ✅ GET `/rest/v1/users` → Status 200
- ✅ No CORS errors

**Redux DevTools:**
- ✅ auth.user: { id: "...", email: "..." }
- ✅ auth.profile: { firstName: "...", lastName: "..." }
- ✅ auth.isAuthenticated: true

---

## 🆘 Still Not Working?

### **1. Check Supabase Status**
Visit: https://status.supabase.com

### **2. Test with cURL**
```bash
curl -X POST 'https://rsxxjcsmcrcxdmyuytzc.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@test.com","password":"test123"}'
```

### **3. Check Firewall/Antivirus**
Temporarily disable and retry.

### **4. Try Different Browser**
Test in incognito or different browser.

### **5. Check Network**
- Are you behind a corporate proxy?
- Is Supabase blocked by your network?
- Try mobile hotspot

---

## 🎯 Most Likely Fix

**99% of CORS errors are solved by:**

1. **Create proper `.env` file** with correct keys
2. **Restart dev server** (env loaded at startup)
3. **Add localhost to CORS** in Supabase dashboard

**Try these three steps first!** 🚀

---

**Need the actual keys? Check your Supabase dashboard → Settings → API** 🔑
