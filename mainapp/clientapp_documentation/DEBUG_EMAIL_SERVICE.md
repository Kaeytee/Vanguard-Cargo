# 🔍 Email Service Debugging Guide

## Problem: Email notifications not working

This guide helps debug the email notification system for package status updates.

---

## 📋 Common Issues & Solutions

### 1. ❌ **RESEND_API_KEY Not Configured**
**Symptom:** Console error: `RESEND_API_KEY is not configured`

**Solution:**
1. Go to [Resend.com](https://resend.com) and create an account
2. Generate an API key
3. Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
4. Add secret: `RESEND_API_KEY` = `your-api-key`
5. Redeploy the edge function

---

### 2. ❌ **Email Domain Not Verified**
**Symptom:** Error from Resend API: `Domain not verified`

**Solution:**
1. Go to Resend Dashboard → Domains
2. Add domain: `vanguardcargo.co`
3. Add the DNS records provided by Resend to your domain
4. Wait for verification (can take up to 72 hours)
5. **Quick Fix:** Use Resend's test domain (`onboarding@resend.dev`) temporarily

**Temporary Fix (for testing):**
```typescript
// In supabase/functions/send-package-status-email/index.ts
// Line 217 - Change from:
from: 'Vanguard Cargo <noreply@vanguardcargo.co>',
// To:
from: 'Vanguard Cargo <onboarding@resend.dev>',
```

---

### 3. ❌ **Edge Function Not Deployed**
**Symptom:** Console error: `Function not found` or `404`

**Solution:**
Deploy the edge function to Supabase:

```bash
# Navigate to project root
cd /home/kaeytee/Desktop/Codes/Vanguard\ Cargo\ Client\ App/mainapp

# Login to Supabase (if not already)
npx supabase login

# Link to your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
npx supabase functions deploy send-package-status-email
```

---

### 4. ❌ **CORS Issues**
**Symptom:** Browser error: `CORS policy blocked`

**Solution:**
The edge function already has CORS headers configured. If still seeing issues:
1. Check browser console for exact error
2. Verify the function URL matches your Supabase project URL
3. Ensure `Access-Control-Allow-Origin: *` is in response headers

---

### 5. ❌ **Database Table Missing**
**Symptom:** Error: `relation "email_notifications_log" does not exist`

**Solution:**
Create the logging table in Supabase SQL Editor:

```sql
-- Create email notifications log table
CREATE TABLE IF NOT EXISTS public.email_notifications_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id TEXT NOT NULL,
    email_type TEXT NOT NULL,
    status TEXT NOT NULL,
    message_id TEXT,
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_email_notifications_user_id ON public.email_notifications_log(user_id);
CREATE INDEX idx_email_notifications_sent_at ON public.email_notifications_log(sent_at DESC);

-- Enable RLS
ALTER TABLE public.email_notifications_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own email logs"
ON public.email_notifications_log
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role can insert email logs"
ON public.email_notifications_log
FOR INSERT
TO service_role
WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.email_notifications_log TO authenticated;
GRANT ALL ON public.email_notifications_log TO service_role;
```

---

## 🧪 Testing the Email Service

### Test 1: Check if Edge Function is Deployed
```bash
# List all deployed functions
npx supabase functions list
```

You should see `send-package-status-email` in the list.

### Test 2: Test Edge Function Directly
Run this in your browser console (replace with your Supabase URL):

```javascript
const response = await fetch('https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-package-status-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  },
  body: JSON.stringify({
    userEmail: 'your-test-email@example.com',
    userName: 'Test User',
    packageId: 'TEST-001',
    trackingNumber: 'TEST-123456',
    storeName: 'Test Store',
    oldStatus: 'received',
    newStatus: 'processing',
    suiteNumber: 'VC-001'
  })
});

const result = await response.json();
console.log('Test result:', result);
```

### Test 3: Use Built-in Test Function
```typescript
import { emailNotificationService } from './services/emailNotificationService';

const result = await emailNotificationService.testEmailService();
console.log('Email service test:', result);
```

---

## 🔍 Debugging Checklist

- [ ] **RESEND_API_KEY is configured** in Supabase Secrets
- [ ] **Email domain is verified** in Resend (or using test domain)
- [ ] **Edge function is deployed** to Supabase
- [ ] **email_notifications_log table exists** in database
- [ ] **Browser console shows no CORS errors**
- [ ] **User email exists** in users table
- [ ] **Package status change triggers email** (check logs)

---

## 📊 Check Logs

### Check Supabase Edge Function Logs
1. Go to Supabase Dashboard
2. Navigate to Edge Functions → send-package-status-email
3. Click "Logs" tab
4. Look for errors or successful executions

### Check Browser Console Logs
When updating package status, you should see:
```
✅ Email notification sent successfully for package PKG-XXX, messageId: abc123
```

If you see:
```
❌ Failed to send email notification for package PKG-XXX: [error message]
```
This indicates the issue.

---

## 🚀 Quick Fix Script

Run this to test the entire email flow:

```bash
# Navigate to project
cd /home/kaeytee/Desktop/Codes/Vanguard\ Cargo\ Client\ App/mainapp

# Deploy edge function
npx supabase functions deploy send-package-status-email

# Serve locally to test (optional)
npx supabase functions serve send-package-status-email
```

---

## 📝 Environment Variables Needed

In Supabase Edge Functions Secrets:
- `RESEND_API_KEY` - Your Resend API key

---

## 🆘 Still Not Working?

If emails still don't work after following this guide:

1. **Share the exact error message** from browser console
2. **Check Supabase Edge Function logs** for server-side errors
3. **Verify Resend account status** (free tier limits: 100 emails/day)
4. **Check spam folder** - emails might be delivered but filtered

---

## 📧 Resend Account Setup

1. Sign up at [resend.com](https://resend.com)
2. Free tier includes:
   - 100 emails/day
   - 1 domain
   - API access
3. For production:
   - Verify custom domain
   - Upgrade plan for higher limits
   - Set up SPF/DKIM records

---

## ✅ Expected Flow

1. User updates package status in app
2. `packageService.updatePackageStatus()` is called
3. Email notification is triggered via `emailNotificationService.sendPackageStatusEmail()`
4. Service fetches user email from database
5. Service calls Supabase Edge Function `send-package-status-email`
6. Edge Function sends email via Resend API
7. Email log is saved to `email_notifications_log` table
8. Success message appears in console

---

## 🔧 Manual Fix for Domain Issue

If you can't verify the domain immediately, update the edge function:

```bash
# Edit the function
nano supabase/functions/send-package-status-email/index.ts

# Change line 217 to use Resend test domain:
from: 'Vanguard Cargo <onboarding@resend.dev>',

# Save and redeploy
npx supabase functions deploy send-package-status-email
```

This allows immediate testing while domain verification is pending.

---

**Last Updated:** October 8, 2025
**Service:** Email Notification System
**Dependencies:** Supabase Edge Functions, Resend API
