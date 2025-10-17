# Trustpilot Environment Variables Setup

## 🔒 **Security Update**

All Trustpilot secret keys have been **removed from the codebase** and moved to environment variables for security.

---

## 📝 **Add These to Your `.env` File**

Open your `.env` file (or create one from `.env.example`) and add:

```env
# ============================================================================
# Trustpilot Integration
# ============================================================================

# Your Trustpilot Business Unit ID
VITE_TRUSTPILOT_BUSINESS_UNIT_ID=68f141bf4d60358202835d95

# Enable Trustpilot integration
VITE_TRUSTPILOT_ENABLED=true

# Review Collector Token
VITE_TRUSTPILOT_REVIEW_COLLECTOR_TOKEN=e58a2d5dd-c9a7-44a8-84e9-cabc9c8b8d8b
```

---

## 🚀 **Quick Setup**

### **Step 1: Create/Update .env File**

```bash
# Navigate to project root
cd "/home/kaeytee/Desktop/Codes/Vanguard Cargo Client App/mainapp"

# If .env doesn't exist, copy from example
cp .env.example .env

# Then edit .env and add the Trustpilot variables above
```

### **Step 2: Restart Development Server**

```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

### **Step 3: Verify**

Open your browser console and check:
```javascript
console.log(import.meta.env.VITE_TRUSTPILOT_BUSINESS_UNIT_ID);
// Should output: 68f141bf4d60358202835d95
```

---

## 🌐 **Production Setup (Vercel/Netlify)**

### **Vercel:**
1. Go to **Project Settings** → **Environment Variables**
2. Add each variable:
   - Name: `VITE_TRUSTPILOT_BUSINESS_UNIT_ID`
   - Value: `68f141bf4d60358202835d95`
   - Environment: Production
3. Repeat for other variables
4. Redeploy

### **Netlify:**
1. Go to **Site Settings** → **Environment Variables**
2. Add the same variables
3. Trigger new deploy

---

## ✅ **Variables Explained**

| Variable | Purpose | Where to Find |
|----------|---------|---------------|
| `VITE_TRUSTPILOT_BUSINESS_UNIT_ID` | Your unique Trustpilot business identifier | Trustpilot Business Dashboard > Settings > Integrations |
| `VITE_TRUSTPILOT_ENABLED` | Enable/disable Trustpilot widgets | Set to `true` or `false` |
| `VITE_TRUSTPILOT_REVIEW_COLLECTOR_TOKEN` | Token for review collector widget | Trustpilot Business > TrustBox > Review Collector |

---

## 🔍 **Troubleshooting**

### **Widgets Not Showing?**

**Check:**
1. ✅ Variables are in `.env` file
2. ✅ `.env` file is in project root (same level as `package.json`)
3. ✅ Development server was restarted after adding variables
4. ✅ No typos in variable names (must match exactly)

**Test in Browser Console:**
```javascript
// Should NOT be undefined or empty
console.log(import.meta.env.VITE_TRUSTPILOT_BUSINESS_UNIT_ID);
```

### **Still Not Working?**

1. **Clear build cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

2. **Check `.env` format:**
   - No spaces around `=`
   - No quotes needed
   - One variable per line

---

## 🛡️ **Security Best Practices**

✅ **DO:**
- Keep `.env` in `.gitignore` (already done)
- Use `.env.example` for documentation
- Set production variables in hosting dashboard
- Never commit `.env` to Git

❌ **DON'T:**
- Hardcode secrets in source code
- Share `.env` file publicly
- Commit sensitive keys to repository

---

## 📊 **Current Configuration**

**File:** `/src/config/trustpilot.ts`

```typescript
export const TRUSTPILOT_CONFIG = {
  // ✅ Now from .env (secure)
  BUSINESS_UNIT_ID: import.meta.env.VITE_TRUSTPILOT_BUSINESS_UNIT_ID || '',
  
  // ✅ Now from .env (secure)
  REVIEW_COLLECTOR_TOKEN: import.meta.env.VITE_TRUSTPILOT_REVIEW_COLLECTOR_TOKEN || '',
  
  ENABLED: import.meta.env.VITE_TRUSTPILOT_ENABLED !== 'false',
  LOCALE: 'en-US',
  THEME: 'light' as const,
  FALLBACK_RATING: 4.9,
  FALLBACK_REVIEW_COUNT: 5000,
};
```

All sensitive data is now loaded from environment variables! 🔒

---

## 📚 **Related Documentation**

- **General Setup:** `/TRUSTPILOT_SETUP.md`
- **AFS Integration:** `/TRUSTPILOT_AFS_INTEGRATION.md`
- **Review Collector:** `/TRUSTPILOT_REVIEW_COLLECTOR.md`
- **Example Variables:** `/.env.example`

---

**Last Updated:** October 2025
