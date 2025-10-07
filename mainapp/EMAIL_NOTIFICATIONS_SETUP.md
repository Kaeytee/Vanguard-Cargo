# 📧 Email Notifications Setup Guide

This guide will help you set up professional email notifications for package status changes using Supabase Edge Functions and Resend email service.

## 🎯 Features

- ✅ **Professional Email Templates** - Beautiful, responsive HTML emails for each status
- ✅ **Automatic Notifications** - Emails sent automatically when package status changes
- ✅ **Custom Domain** - Emails sent from `noreply@vanguardcargo.co`
- ✅ **Audit Trail** - Complete logging of all email notifications
- ✅ **Error Handling** - Robust error handling and retry logic
- ✅ **Clean Architecture** - OOP principles with TypeScript support

## 📋 Prerequisites

1. **Supabase Project** - Your existing Supabase project
2. **Resend Account** - Sign up at [resend.com](https://resend.com)
3. **Domain Verification** - Verify `vanguardcargo.co` domain in Resend
4. **Supabase CLI** - Install Supabase CLI for deploying functions

## 🚀 Setup Instructions

### Step 1: Create Resend Account and Get API Key

1. Go to [resend.com](https://resend.com) and create an account
2. Verify your domain `vanguardcargo.co` in the Resend dashboard
3. Create an API key in the Resend dashboard
4. Copy the API key (starts with `re_`)

### Step 2: Set Up Environment Variables

In your Supabase project dashboard:

1. Go to **Settings** → **Edge Functions**
2. Add the following environment variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key (e.g., `re_xxxxxxxxxx`)

### Step 3: Deploy the Edge Function

```bash
# Navigate to your project directory
cd "/home/kaeytee/Desktop/Codes/Vanguard Cargo Client App/mainapp"

# Deploy the email function
supabase functions deploy send-package-status-email

# Verify deployment
supabase functions list
```

### Step 4: Create Database Table

Run the SQL script to create the email notifications log table:

```bash
# Run the SQL script
supabase db reset --linked
# OR manually run the SQL file
psql -h your-db-host -U postgres -d postgres -f sql/59_create_email_notifications_log.sql
```

### Step 5: Test the Email Service

You can test the email service using the built-in test method:

```typescript
import { emailNotificationService } from './src/services/emailNotificationService';

// Test email connectivity
const testResult = await emailNotificationService.testEmailService();
console.log('Email service test:', testResult);
```

## 📧 Email Templates

The system includes professional email templates for each package status:

### 📦 Package Received
- **Subject**: `📦 Package Received - [Tracking Number]`
- **Content**: Confirmation that package arrived at warehouse
- **Color**: Blue (#3B82F6)

### ⚡ Package Processing
- **Subject**: `⚡ Package Processing - [Tracking Number]`
- **Content**: Package is being processed and prepared
- **Color**: Amber (#F59E0B)

### 🚚 Package Shipped
- **Subject**: `🚚 Package Shipped - [Tracking Number]`
- **Content**: Package has been shipped and is on the way
- **Color**: Green (#10B981)

### ✅ Package Delivered
- **Subject**: `✅ Package Delivered - [Tracking Number]`
- **Content**: Package has been delivered successfully
- **Color**: Emerald (#059669)

## 🔧 Technical Architecture

### Email Notification Service
- **Location**: `/src/services/emailNotificationService.ts`
- **Pattern**: Singleton pattern for efficient resource usage
- **Features**: User data fetching, error handling, audit logging

### Supabase Edge Function
- **Location**: `/supabase/functions/send-package-status-email/index.ts`
- **Runtime**: Deno with TypeScript
- **Features**: Professional HTML templates, CORS handling, error management

### Package Service Integration
- **Location**: `/src/services/packageService.ts`
- **Integration**: Automatic email sending on status updates
- **Fallback**: Status updates continue even if email fails

## 📊 Monitoring and Logging

### Email Notifications Log Table
All email notifications are logged in the `email_notifications_log` table:

```sql
SELECT 
  recipient_email,
  email_type,
  status,
  sent_at,
  success,
  message_id
FROM email_notifications_log 
ORDER BY sent_at DESC;
```

### Error Monitoring
Check for failed email notifications:

```sql
SELECT * FROM email_notifications_log 
WHERE success = false 
ORDER BY sent_at DESC;
```

## 🔒 Security Features

- **Row Level Security** - Users can only see their own email logs
- **Admin Access** - Admins can view all email notifications
- **Environment Variables** - API keys stored securely in Supabase
- **CORS Protection** - Proper CORS handling in Edge Functions

## 🧪 Testing

### Test Email Delivery
```typescript
// Test with real package data
const result = await emailNotificationService.sendPackageStatusEmail({
  packageId: 'test-package-id',
  trackingNumber: 'VC-TEST-123',
  storeName: 'Test Store',
  oldStatus: 'received',
  newStatus: 'processing',
  userId: 'user-id-here'
});

console.log('Email result:', result);
```

### Verify Email Templates
1. Check email in recipient's inbox
2. Verify responsive design on mobile
3. Test all status types (received, processing, shipped, delivered)
4. Confirm tracking links work correctly

## 🚨 Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check Resend API key is correct
   - Verify domain is verified in Resend
   - Check Edge Function logs in Supabase

2. **Template Not Loading**
   - Verify Edge Function deployment
   - Check function logs for errors
   - Ensure CORS headers are correct

3. **User Data Not Found**
   - Verify user exists in database
   - Check user has valid email address
   - Ensure RLS policies allow access

### Debug Commands

```bash
# Check Edge Function logs
supabase functions logs send-package-status-email

# Test Edge Function directly
curl -X POST 'https://your-project.supabase.co/functions/v1/send-package-status-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"userEmail":"test@example.com","userName":"Test User","trackingNumber":"TEST-123"}'
```

## 📈 Performance Optimization

- **Async Processing** - Emails sent asynchronously to avoid blocking status updates
- **Error Isolation** - Email failures don't affect package status changes
- **Efficient Queries** - Optimized database queries with proper indexing
- **Singleton Pattern** - Efficient service instantiation

## 🔄 Future Enhancements

- **Email Preferences** - Allow users to customize notification preferences
- **SMS Integration** - Add SMS notifications alongside emails
- **Email Analytics** - Track open rates and click-through rates
- **Template Customization** - Allow admins to customize email templates
- **Batch Processing** - Send multiple notifications in batches

## ✅ Verification Checklist

- [ ] Resend account created and domain verified
- [ ] API key added to Supabase environment variables
- [ ] Edge Function deployed successfully
- [ ] Database table created with proper RLS policies
- [ ] Email service test passes
- [ ] Package status update triggers email
- [ ] Email template renders correctly
- [ ] Audit logging works properly
- [ ] Error handling functions correctly

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review Supabase Edge Function logs
3. Verify Resend dashboard for delivery status
4. Check email notifications log table for errors

---

**🎉 Congratulations!** Your professional email notification system is now ready to keep your customers informed about their package status changes with beautiful, branded emails sent from `noreply@vanguardcargo.co`!
