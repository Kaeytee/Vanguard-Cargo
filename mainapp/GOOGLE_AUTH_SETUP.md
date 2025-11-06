# Google OAuth Authentication Setup Guide

This guide will walk you through configuring Google OAuth authentication for Vanguard Cargo.

## 🎯 Overview

Google OAuth has been integrated into the application on both the **Register** and **Login** pages. Users can now sign up or sign in with their Google account with a single click.

## 📋 Prerequisites

- Supabase project with authentication enabled
- Google Cloud Console account

## 🔧 Supabase Configuration

### Step 1: Enable Google OAuth Provider

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list of providers
4. Click **Enable**

### Step 2: Configure Google Cloud Console

1. **Create a Google Cloud Project** (if you don't have one):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click "Select a project" → "New Project"
   - Name it (e.g., "Vanguard Cargo Auth")
   - Click "Create"

2. **Enable Google+ API**:
   - In the Google Cloud Console, go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click on it and press **Enable**

3. **Configure OAuth Consent Screen**:
   - Go to **APIs & Services** → **OAuth consent screen**
   - Select **External** (unless you have a Google Workspace)
   - Fill in the required fields:
     - App name: `Vanguard Cargo`
     - User support email: Your email
     - Developer contact email: Your email
   - Click **Save and Continue**
   - Skip the Scopes section (click **Save and Continue**)
   - Add test users if needed (for testing before publishing)
   - Click **Save and Continue**

4. **Create OAuth Credentials**:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Vanguard Cargo Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (for development)
     - `https://yourdomain.com` (your production domain)
   - **Authorized redirect URIs**:
     - `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
     - Replace `YOUR_SUPABASE_PROJECT_ID` with your actual Supabase project reference ID
   - Click **Create**
   - Copy the **Client ID** and **Client Secret**

### Step 3: Add Credentials to Supabase

1. Go back to **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. Paste your **Client ID** (from Google Cloud Console)
3. Paste your **Client Secret** (from Google Cloud Console)
4. Click **Save**

### Step 4: Configure Redirect URLs in Supabase

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Add your redirect URLs:
   - Development: `http://localhost:5173/app/dashboard`
   - Production: `https://yourdomain.com/app/dashboard`
3. Click **Save**

## 🚀 How It Works

### User Flow

1. **User clicks "Continue with Google"** button
2. **Redirect to Google** for authentication
3. **User authorizes** the app in Google
4. **Google redirects back** to your app with auth token
5. **Profile auto-creation**: 
   - App checks if user profile exists in database
   - If not, creates profile automatically using Google metadata (name, email)
   - Generates suite number and sets account to active status
6. **User is logged in** and redirected to dashboard

### Technical Details

- **OAuth Provider**: Google
- **OAuth Scopes**: `email`, `profile` (automatically requested)
- **Refresh Token**: Requested with `access_type: 'offline'`
- **Profile Creation**: Automatic via `authService.handleOAuthSignIn()`
- **Session Management**: Handled by Supabase Auth

## 🔍 Testing

### Development Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the register or login page
3. Click "Continue with Google" or "Sign up with Google"
4. You should be redirected to Google
5. After authorizing, you'll be redirected back to `/app/dashboard`
6. Check browser console for logs:
   - `✅ Google OAuth initiated`
   - `✅ OAuth user profile created successfully`
   - `✅ Login fulfilled - Setting auth state`

### Production Testing

1. Deploy your application
2. Update Google Cloud Console redirect URIs with production domain
3. Update Supabase redirect URLs with production domain
4. Test the same flow on production

## 🐛 Troubleshooting

### Issue: "Redirect URI mismatch"

**Solution**: Make sure the redirect URI in Google Cloud Console exactly matches the Supabase callback URL:
```
https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
```

### Issue: "Access blocked: This app's request is invalid"

**Solution**: 
- Ensure Google+ API is enabled
- OAuth consent screen is configured
- Add your email as a test user (if app is not published)

### Issue: User is authenticated but profile not created

**Solution**: 
- Check Supabase logs for errors
- Verify `create_user_profile_secure` RPC function exists in database
- Check browser console for error messages

### Issue: "Profile not found" error

**Solution**: 
- OAuth profile creation happens automatically in `initializeAuth`
- Check that `authService.handleOAuthSignIn()` is being called
- Verify RPC function has correct permissions

## 📝 Code Changes Made

### New Files
- `/src/components/auth/GoogleAuthButton.tsx` - Reusable Google OAuth button component

### Modified Files
- `/src/landing/register/register.tsx` - Added Google OAuth button
- `/src/landing/login/login.tsx` - Added Google OAuth button
- `/src/services/authService.ts` - Added `handleOAuthSignIn()` method
- `/src/store/slices/authSlice.ts` - Updated `initializeAuth` to handle OAuth

## 🎨 UI Components

The Google OAuth button includes:
- Google logo (SVG)
- Loading state with spinner
- Error handling and display
- Consistent styling with your existing forms
- Accessible markup with ARIA labels

## 🔐 Security Notes

- OAuth tokens are handled securely by Supabase
- Refresh tokens requested for long-term sessions
- Profile creation uses secure RPC function
- Account status checked on every login
- Session validated on app initialization

## 📧 Support

If you encounter any issues:
1. Check Supabase logs (Dashboard → Logs)
2. Check browser console for error messages
3. Verify Google Cloud Console configuration
4. Test with different Google accounts

## 🎉 Benefits

- **Reduced Friction**: Users can sign up/in with one click
- **No Password Management**: Users don't need to remember another password
- **Trusted Provider**: Users trust Google for authentication
- **Auto-filled Profile**: Name and email automatically populated
- **Faster Conversion**: Eliminates form completion barriers

---

**Branch**: `googleauth`
**Status**: ✅ Ready for testing
**Next Steps**: Configure Supabase Google OAuth provider and test the flow
