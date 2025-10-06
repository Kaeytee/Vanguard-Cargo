# 🚀 QUICK SETUP COMMANDS
## Support Email System - Ready to Deploy

Since you've already created the database table, here are the exact commands to get your support email system working:

---

## **📋 Prerequisites**

1. **Get Resend API Key** (Recommended - Free tier available)
   - Go to: https://resend.com
   - Sign up and verify email
   - Go to `API Keys` → `Create API Key`
   - Copy the key (starts with `re_`)

2. **Have your admin email ready**
   - This is where support messages will be sent

---

## **⚡ Quick Deploy Commands**

### **Step 1: Install & Login to Supabase CLI**
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login
```

### **Step 2: Link Your Project**
```bash
# Navigate to your project directory
cd "/home/kaeytee/Desktop/Codes/Vanguard Cargo Client App/mainapp"

# Link to your Supabase project
supabase link --project-ref rsxxjcsmcrcxdmyuytzc
```

### **Step 3: Set Environment Variables**
```bash
# Set your Resend API key (replace with your actual key)
supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here

# Set your admin email (replace with your email)
supabase secrets set ADMIN_EMAIL=your-email@example.com

# Optional: Set custom from email
supabase secrets set FROM_EMAIL=support@vanguardcargo.com
```

### **Step 4: Deploy the Edge Function**
```bash
# Deploy the support email function
supabase functions deploy send-support-email
```

### **Step 5: Verify Deployment**
```bash
# Check if function is deployed
supabase functions list

# Check if secrets are set
supabase secrets list

# View function logs
supabase functions logs send-support-email
```

---

## **🧪 Test Your Setup**

### **Method 1: Test via Website**
1. Go to your support page: `http://localhost:5173/support`
2. Fill out the contact form
3. Submit the message
4. Check your email inbox!

### **Method 2: Test via API**
```bash
# Test the function directly
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

### **Method 3: Use the Deployment Script**
```bash
# Make the script executable
chmod +x deploy-support-email.sh

# Run the deployment script
./deploy-support-email.sh
```

---

## **📊 Monitor Your System**

### **View Support Messages in Database**
```sql
-- Check recent support messages
SELECT * FROM support_messages ORDER BY created_at DESC LIMIT 10;

-- Check email delivery status
SELECT email_sent, COUNT(*) FROM support_messages GROUP BY email_sent;
```

### **Monitor Function Logs**
```bash
# View recent logs
supabase functions logs send-support-email --limit 20

# Follow logs in real-time
supabase functions logs send-support-email --follow
```

---

## **🔧 Troubleshooting**

### **If emails aren't sending:**
1. Check API key is correct: `supabase secrets list`
2. Verify Resend account is active
3. Check spam/junk folder
4. View function logs: `supabase functions logs send-support-email`

### **If function deployment fails:**
1. Make sure you're in the project directory
2. Check you're logged in: `supabase status`
3. Re-link project: `supabase link --project-ref rsxxjcsmcrcxdmyuytzc`

### **If form submission fails:**
1. Check browser console for errors
2. Verify database table exists: `SELECT * FROM support_messages LIMIT 1;`
3. Check function is deployed: `supabase functions list`

---

## **✅ Success Checklist**

- [ ] Database table created (`support_messages`)
- [ ] Supabase CLI installed and logged in
- [ ] Project linked successfully
- [ ] Resend API key obtained and set
- [ ] Admin email configured
- [ ] Edge function deployed
- [ ] Test email sent and received
- [ ] Form submission working on website
- [ ] Database logging confirmed

---

## **🎯 What Happens When Someone Submits the Form**

1. **Customer fills out support form** on your website
2. **Form data is sent** to Supabase Edge Function
3. **Message is saved** to `support_messages` table
4. **Two emails are sent**:
   - **Admin notification** → Goes to your mailbox with customer details
   - **Customer confirmation** → Confirms receipt to customer
5. **Success message** is shown to customer

---

## **📧 Email Templates**

Your system includes professional HTML email templates with:

### **Admin Notification Email:**
- ✅ Customer name and email
- ✅ Message subject and content
- ✅ Category classification
- ✅ Submission timestamp
- ✅ Direct reply button
- ✅ Professional company branding

### **Customer Confirmation Email:**
- ✅ Thank you message
- ✅ Message reference ID
- ✅ Next steps information
- ✅ Contact information

---

**🎉 That's it! Your support email system is ready to go!**

Run the commands above and you'll have emails flowing to your mailbox whenever someone submits a support request.
