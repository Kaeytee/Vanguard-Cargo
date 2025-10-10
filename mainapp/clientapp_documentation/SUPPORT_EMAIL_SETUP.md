# 📧 SUPPORT EMAIL SYSTEM SETUP GUIDE
## Vanguard Cargo - Complete Email Integration

This guide provides step-by-step instructions to set up the complete support email system that automatically sends emails to your mailbox when customers submit support forms.

---

## 🏗️ **SYSTEM ARCHITECTURE**

### **Components Overview**
1. **Support Form** - Customer-facing contact form
2. **Supabase Database** - Stores all support messages
3. **Edge Function** - Processes form submissions and sends emails
4. **Email Service** - Delivers emails to your mailbox (Resend recommended)
5. **Admin Dashboard** - Manage support messages (future enhancement)

### **Email Flow**
```
Customer fills form → Supabase Edge Function → Email Service → Your Mailbox
                   ↓
              Database Storage (support_messages table)
```

---

## 📋 **SETUP REQUIREMENTS**

### **Prerequisites**
- ✅ Supabase project (already configured)
- ✅ Email service account (Resend, SendGrid, or similar)
- ✅ Domain for sending emails (optional but recommended)

---

## 🚀 **STEP-BY-STEP SETUP**

### **Step 1: Create Database Table**

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `Vanguard Cargo`

2. **Run SQL Script**
   - Navigate to: `SQL Editor`
   - Copy and paste the contents of: `/sql/58_create_support_messages_table.sql`
   - Click `Run` to execute

3. **Verify Table Creation**
   ```sql
   SELECT * FROM support_messages LIMIT 1;
   ```

### **Step 2: Set Up Email Service (Resend Recommended)**

#### **Option A: Resend (Recommended)**
1. **Create Resend Account**
   - Go to: https://resend.com
   - Sign up for free account
   - Verify your email address

2. **Get API Key**
   - Navigate to: `API Keys` section
   - Click `Create API Key`
   - Name: `Vanguard Cargo Support`
   - Copy the API key (starts with `re_`)

3. **Add Domain (Optional)**
   - Navigate to: `Domains` section
   - Add your domain: `vanguardcargo.com`
   - Follow DNS verification steps

#### **Option B: SendGrid (Alternative)**
1. **Create SendGrid Account**
   - Go to: https://sendgrid.com
   - Sign up for free account

2. **Get API Key**
   - Navigate to: `Settings` → `API Keys`
   - Create new API key with `Mail Send` permissions
   - Copy the API key

### **Step 3: Deploy Supabase Edge Function**

1. **Install Supabase CLI** (if not already installed)
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link to Your Project**
   ```bash
   supabase link --project-ref rsxxjcsmcrcxdmyuytzc
   ```

4. **Set Environment Variables**
   ```bash
   # Set your email service API key
   supabase secrets set RESEND_API_KEY=re_your_api_key_here
   
   # Set your admin email (where you want to receive messages)
   supabase secrets set ADMIN_EMAIL=your-email@example.com
   
   # Set from email (optional, defaults to noreply@vanguardcargo.com)
   supabase secrets set FROM_EMAIL=support@vanguardcargo.com
   ```

5. **Deploy the Edge Function**
   ```bash
   supabase functions deploy send-support-email
   ```

6. **Verify Deployment**
   ```bash
   supabase functions list
   ```

### **Step 4: Test the System**

1. **Test via Frontend**
   - Go to your support page: `/support`
   - Fill out the contact form
   - Submit the message
   - Check your email inbox

2. **Test via API (Optional)**
   ```bash
   curl -X POST 'https://rsxxjcsmcrcxdmyuytzc.supabase.co/functions/v1/send-support-email' \
     -H 'Authorization: Bearer YOUR_ANON_KEY' \
     -H 'Content-Type: application/json' \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "subject": "Test Message",
       "message": "This is a test message",
       "category": "general"
     }'
   ```

3. **Check Database**
   ```sql
   SELECT * FROM support_messages ORDER BY created_at DESC LIMIT 5;
   ```

---

## ⚙️ **CONFIGURATION OPTIONS**

### **Environment Variables**
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `RESEND_API_KEY` | Resend API key | ✅ Yes | - |
| `ADMIN_EMAIL` | Your email address | ✅ Yes | support@vanguardcargo.com |
| `FROM_EMAIL` | Sender email address | ❌ No | noreply@vanguardcargo.com |

### **Email Templates**
The system includes professional HTML email templates:

1. **Admin Notification Email**
   - Professional design with company branding
   - Customer details and message content
   - Direct reply button
   - Message categorization

2. **Customer Confirmation Email**
   - Confirmation of message receipt
   - Reference ID for tracking
   - Next steps information
   - Contact information

---

## 🔧 **CUSTOMIZATION**

### **Modify Email Templates**
Edit the templates in: `/supabase/functions/send-support-email/index.ts`

```typescript
// Admin email template
function generateAdminEmailTemplate(data: EmailTemplateData): string {
  // Customize HTML template here
}

// Customer confirmation template
function generateCustomerConfirmationTemplate(data: EmailTemplateData): string {
  // Customize HTML template here
}
```

### **Add Custom Fields**
1. **Update Database Schema**
   ```sql
   ALTER TABLE support_messages ADD COLUMN phone_number TEXT;
   ```

2. **Update Interface**
   ```typescript
   interface SupportMessageData {
     // Add new field
     phoneNumber?: string;
   }
   ```

3. **Update Form**
   - Add input field to ContactSection component
   - Update form submission logic

---

## 📊 **MONITORING & ANALYTICS**

### **View Support Messages**
```sql
-- All messages
SELECT * FROM support_messages ORDER BY created_at DESC;

-- Messages by status
SELECT status, COUNT(*) FROM support_messages GROUP BY status;

-- Messages by category
SELECT category, COUNT(*) FROM support_messages GROUP BY category;

-- Recent messages (last 24 hours)
SELECT * FROM support_messages 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### **Email Delivery Status**
```sql
-- Check email delivery success rate
SELECT 
  email_sent,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM support_messages 
GROUP BY email_sent;
```

### **Edge Function Logs**
```bash
# View function logs
supabase functions logs send-support-email

# Follow logs in real-time
supabase functions logs send-support-email --follow
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

#### **1. Emails Not Sending**
**Symptoms:** Form submits successfully but no emails received

**Solutions:**
- Check API key is correct: `supabase secrets list`
- Verify email service account is active
- Check spam/junk folder
- Review function logs: `supabase functions logs send-support-email`

#### **2. Database Errors**
**Symptoms:** Form submission fails with database error

**Solutions:**
- Verify table exists: `SELECT * FROM support_messages LIMIT 1;`
- Check RLS policies are correct
- Ensure user has proper permissions

#### **3. CORS Errors**
**Symptoms:** Form submission blocked by browser

**Solutions:**
- Edge function includes CORS headers (already implemented)
- Check browser console for specific error
- Verify function deployment

#### **4. Function Deployment Issues**
**Symptoms:** Function fails to deploy

**Solutions:**
```bash
# Check Supabase CLI version
supabase --version

# Update CLI
npm update -g supabase

# Re-link project
supabase link --project-ref rsxxjcsmcrcxdmyuytzc

# Deploy with verbose output
supabase functions deploy send-support-email --debug
```

### **Debug Commands**
```bash
# Check function status
supabase functions list

# View recent logs
supabase functions logs send-support-email --limit 50

# Test function locally
supabase functions serve send-support-email

# Check environment variables
supabase secrets list
```

---

## 🔐 **SECURITY CONSIDERATIONS**

### **Data Protection**
- All support messages are stored securely in Supabase
- RLS policies prevent unauthorized access
- Email content is transmitted over HTTPS
- API keys are stored as encrypted secrets

### **Spam Prevention**
- Form includes basic validation
- Rate limiting can be added to Edge Function
- Consider adding CAPTCHA for public forms

### **Access Control**
- Only authenticated admins can view all messages
- Users can only view their own messages
- Support staff roles can be added for message management

---

## 📈 **FUTURE ENHANCEMENTS**

### **Planned Features**
1. **Admin Dashboard**
   - View and manage all support messages
   - Respond to messages directly
   - Message status tracking
   - Analytics and reporting

2. **WhatsApp Integration**
   - Send notifications via WhatsApp
   - Multi-channel support system
   - Customer preference management

3. **Automated Responses**
   - AI-powered response suggestions
   - Template-based quick replies
   - Escalation workflows

4. **Advanced Analytics**
   - Response time tracking
   - Customer satisfaction surveys
   - Support team performance metrics

---

## 📞 **SUPPORT**

If you encounter any issues during setup:

1. **Check the logs first**
2. **Review this documentation**
3. **Test with simple examples**
4. **Contact development team if needed**

---

## ✅ **SETUP CHECKLIST**

- [ ] Database table created (`support_messages`)
- [ ] Email service account created (Resend/SendGrid)
- [ ] API key obtained and configured
- [ ] Edge function deployed successfully
- [ ] Environment variables set
- [ ] Test email sent and received
- [ ] Form integration working
- [ ] Database logging confirmed
- [ ] Error handling tested
- [ ] Documentation reviewed

---

**🎉 Congratulations! Your support email system is now fully operational.**

Customers can now submit support requests through your website, and you'll receive professional email notifications directly in your mailbox. All messages are also stored in your database for future reference and analytics.
