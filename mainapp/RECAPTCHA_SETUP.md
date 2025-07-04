# reCAPTCHA Setup Guide for Ttarius Logistics

## 🚨 IMPORTANT: Current Issue

Your application is currently using test reCAPTCHA keys that only work on `localhost`. This is why you see:
- "This reCAPTCHA is for testing - please report to admin if you see it" on localhost
- Blank page when deployed to Vercel

## ✅ Solution Steps

### 1. Get Production reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Sign in with your Google account
3. Click "Create" or "+" to register a new site
4. Fill in the details:
   - **Label**: `Ttarius Logistics Production`
   - **reCAPTCHA type**: Select "reCAPTCHA v2" → "I'm not a robot" Checkbox
   - **Domains**: Add your production domains:
     - `yourdomain.com` (replace with your actual domain)
     - `www.yourdomain.com`
     - `yourapp.vercel.app` (your Vercel deployment URL)
     - `localhost` (for local development)
   - Accept the Terms of Service
5. Click "Submit"
6. Copy the **Site Key** and **Secret Key**

### 2. Update Environment Variables

#### For Local Development:
Update your `.env.development` file:
```bash
# Replace with your actual site key
REACT_APP_RECAPTCHA_SITE_KEY=your_actual_site_key_here
REACT_APP_RECAPTCHA_SECRET_KEY=your_actual_secret_key_here
```

#### For Production:
Update your `.env.production` file:
```bash
# Replace with your actual site key (same as development)
REACT_APP_RECAPTCHA_SITE_KEY=your_actual_site_key_here
REACT_APP_RECAPTCHA_SECRET_KEY=your_actual_secret_key_here
```

### 3. Configure Vercel Environment Variables

Since Vercel doesn't automatically use your `.env` files, you need to set environment variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add these variables:
   - **Variable Name**: `REACT_APP_RECAPTCHA_SITE_KEY`
   - **Value**: Your actual site key
   - **Environment**: Production (and Preview if you want)
5. Click "Save"
6. Redeploy your application

### 4. Alternative: Using Vercel CLI

You can also set environment variables using Vercel CLI:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Set environment variables
vercel env add REACT_APP_RECAPTCHA_SITE_KEY
# Enter your site key when prompted

# Redeploy
vercel --prod
```

## 🔧 Current Application Improvements

The login component has been updated to handle reCAPTCHA errors gracefully:

- ✅ **Error Handling**: If reCAPTCHA fails to load, users see a warning but can still attempt login
- ✅ **Fallback UI**: Shows a helpful message when reCAPTCHA is unavailable  
- ✅ **No More Blank Pages**: The page will render even if reCAPTCHA fails
- ✅ **Development vs Production**: Automatically uses test keys in development if no environment variables are set

## 🚀 Quick Fix for Immediate Deployment

If you need to deploy immediately without setting up real reCAPTCHA keys:

1. **Option A**: Temporarily disable reCAPTCHA
   - Comment out the reCAPTCHA component in `login.tsx`
   - Update form validation to not require `captchaValue`

2. **Option B**: Use environment variable to conditionally show reCAPTCHA
   - Add `REACT_APP_ENABLE_RECAPTCHA=false` to Vercel environment variables
   - Update component to conditionally render reCAPTCHA based on this flag

## 📝 Test Your Setup

After setting up:

1. **Local Testing**: 
   - `npm run dev` should show your reCAPTCHA without the test message
   
2. **Production Testing**:
   - Deploy to Vercel
   - Visit your production URL
   - Verify reCAPTCHA loads and works correctly

## 🔐 Security Notes

- **Never commit secret keys** to version control
- **Secret keys** should only be used on your backend server for verification
- **Site keys** are safe to include in client-side code
- Consider implementing server-side reCAPTCHA verification for maximum security

## 🆘 Still Having Issues?

If you continue to see blank pages:

1. Check Vercel build logs for errors
2. Check browser console for JavaScript errors
3. Verify environment variables are set correctly in Vercel dashboard
4. Ensure your domain is added to reCAPTCHA admin console
