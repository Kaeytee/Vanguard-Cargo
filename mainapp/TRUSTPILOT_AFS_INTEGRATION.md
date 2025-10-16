# Trustpilot AFS Integration Guide
## Automatic Feedback Service Setup for Vanguard Cargo

---

## 📧 **Your Trustpilot AFS Email**

```
vanguardcargo.co+8dee62a535@invite.trustpilot.com
```

**What is this?** This is your unique Trustpilot Automatic Feedback Service (AFS) email address. When you BCC this email in delivery confirmation emails, Trustpilot automatically sends review invitations to your customers.

---

## 🎯 **How It Works**

```
Customer Package Delivered
        ↓
Send Email to Customer
        ↓
BCC: vanguardcargo.co+8dee62a535@invite.trustpilot.com
        ↓
Trustpilot Receives Notification
        ↓
Waits 3-7 Days (Configurable in Trustpilot)
        ↓
Sends Review Invitation to Customer
        ↓
Customer Leaves Review
        ↓
Appears on Your Trustpilot Profile & Website Widgets!
```

---

## ✅ **Implementation Complete!**

I've created a complete integration for your Vanguard Cargo system:

### **1. Supabase Edge Function Created**
**Location:** `/supabase/functions/send-delivery-notification/index.ts`

**What it does:**
- Sends professional delivery confirmation emails
- Automatically BCCs Trustpilot AFS email
- Triggers review invitations
- Fully documented and production-ready

### **2. Frontend Service Created**
**Location:** `/src/services/deliveryNotificationService.ts`

**What it provides:**
- `sendDeliveryNotification()` - Send delivery email with Trustpilot trigger
- `sendDeliveryNotificationFromPackage()` - Auto-extract package data
- `triggerTrustpilotReview()` - Manually trigger for past deliveries
- Full TypeScript support

---

## 🚀 **Setup Instructions**

### **Step 1: Deploy the Edge Function**

```bash
# Navigate to your project directory
cd /home/kaeytee/Desktop/Codes/Vanguard\ Cargo\ Client\ App/mainapp

# Deploy the function to Supabase
supabase functions deploy send-delivery-notification

# Set your Resend API key (if you haven't already)
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

### **Step 2: Integrate with Package Delivery**

Update your package status update logic to send notifications when delivered:

```typescript
// In your package service or admin dashboard where you mark packages as delivered

import DeliveryNotificationService from '../services/deliveryNotificationService';

// When package status changes to 'delivered'
async function markPackageAsDelivered(packageId: string) {
  // Update package status in database
  const { data: package, error } = await supabase
    .from('packages')
    .update({ 
      status: 'delivered',
      delivered_at: new Date().toISOString()
    })
    .eq('id', packageId)
    .select()
    .single();

  if (error) {
    console.error('Error updating package:', error);
    return;
  }

  // 🎯 Send delivery notification with Trustpilot trigger
  const notificationResult = await DeliveryNotificationService
    .sendDeliveryNotificationFromPackage(package);

  if (notificationResult.success) {
    console.log('✅ Delivery notification sent!');
    console.log('✅ Trustpilot review invitation triggered!');
  } else {
    console.error('❌ Failed to send notification:', notificationResult.error);
  }
}
```

---

## 💻 **Integration Points**

### **Option A: Admin Dashboard (Recommended)**

When admin marks package as delivered in the admin panel:

```typescript
// In your admin package management component
import DeliveryNotificationService from '../../services/deliveryNotificationService';

const handleDeliveryConfirmation = async (packageId: string) => {
  try {
    // Update package status
    await updatePackageStatus(packageId, 'delivered');
    
    // Get package data
    const packageData = await getPackageById(packageId);
    
    // Send delivery notification with Trustpilot trigger
    const result = await DeliveryNotificationService
      .sendDeliveryNotificationFromPackage(packageData);
    
    if (result.success) {
      toast.success('Package marked as delivered and customer notified!');
      toast.success('Trustpilot review invitation will be sent in 3-7 days');
    }
  } catch (error) {
    toast.error('Failed to send delivery notification');
  }
};
```

### **Option B: Automatic Status Update**

In your existing auto-move service or status update logic:

```typescript
// In PackageAutoMoveService or similar
import DeliveryNotificationService from '../services/deliveryNotificationService';

async function updatePackageToDelivered(packageId: string) {
  const { data, error } = await supabase
    .from('packages')
    .update({ status: 'delivered', delivered_at: new Date().toISOString() })
    .eq('id', packageId)
    .select('*, users!inner(email, full_name)')
    .single();

  if (!error && data) {
    // Trigger delivery notification with Trustpilot
    await DeliveryNotificationService.sendDeliveryNotificationFromPackage(data);
  }
}
```

### **Option C: Database Trigger (Advanced)**

Create a Postgres trigger that automatically sends notifications:

```sql
-- Create function to handle delivery notifications
CREATE OR REPLACE FUNCTION notify_delivery()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if status changed to 'delivered'
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    -- Call Edge Function via pg_net (requires pg_net extension)
    PERFORM net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/send-delivery-notification',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object(
        'packageId', NEW.id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on packages table
CREATE TRIGGER on_package_delivered
AFTER UPDATE ON packages
FOR EACH ROW
EXECUTE FUNCTION notify_delivery();
```

---

## 📋 **Testing Your Integration**

### **Test 1: Manual Trigger**

```typescript
// Test the delivery notification service
import DeliveryNotificationService from './services/deliveryNotificationService';

// Send test delivery notification
const testResult = await DeliveryNotificationService.sendDeliveryNotification({
  customerEmail: 'your-test-email@example.com', // Use your email for testing
  customerName: 'Test Customer',
  trackingNumber: 'TEST-12345',
  packageDescription: 'Test Package - iPhone 15',
  deliveryDate: '2025-10-16',
  deliveryAddress: 'Accra, Ghana'
});

console.log(testResult);
// Expected: { success: true, trustpilotTriggered: true, emailId: '...' }
```

### **Test 2: Check Trustpilot Dashboard**

1. Log into your Trustpilot Business account
2. Go to **Reviews** → **Invitations** → **Activity**
3. You should see the invitation triggered
4. Check the customer email you used in the test

### **Test 3: Verify Email Delivery**

1. Check that customer receives delivery confirmation email
2. Verify Trustpilot BCC was included (check email headers if possible)
3. Wait 3-7 days to confirm customer receives review invitation

---

## ⚙️ **Configuration Options**

### **Customize Review Invitation Timing**

In your Trustpilot Business dashboard:
1. Go to **AFS Settings**
2. Adjust **Invitation Delay** (recommended: 3-7 days after delivery)
3. Customize email template
4. Set reminder schedule

### **Customize Email Template**

Edit the HTML template in:
`/supabase/functions/send-delivery-notification/index.ts`

Modify the `emailHtml` variable to match your branding.

### **Add More Triggers**

You can BCC the Trustpilot AFS email in other scenarios:
- ✅ Package delivered (implemented)
- ✅ Shipment completed
- ✅ Customer completes order
- ✅ Subscription renewal
- ✅ Service completion

---

## 🎨 **Email Template Features**

The delivery confirmation email includes:
- ✅ Professional Vanguard Cargo branding
- ✅ Delivery confirmation badge
- ✅ Tracking number
- ✅ Package description
- ✅ Delivery date and address
- ✅ CTA button to track more packages
- ✅ Company contact information
- ✅ Mobile-responsive design

---

## 📊 **Monitoring & Analytics**

### **Track Review Invitations**

```typescript
// Add logging to your delivery notification service
console.log('📧 Delivery notification sent to:', customerEmail);
console.log('🔔 Trustpilot review invitation triggered');
console.log('📅 Customer will receive invitation in 3-7 days');
```

### **Trustpilot Dashboard Metrics**

Monitor in Trustpilot Business:
- **Invitations Sent**: How many triggered
- **Response Rate**: How many customers reviewed
- **Average Rating**: Overall satisfaction
- **Review Timeline**: When reviews are received

---

## 🔧 **Troubleshooting**

### **Issue: Emails not sending**

**Check:**
1. ✅ RESEND_API_KEY is set in Supabase secrets
2. ✅ Edge Function is deployed successfully
3. ✅ FROM_EMAIL domain is verified in Resend
4. ✅ Customer email is valid

**Solution:**
```bash
# Verify Edge Function is deployed
supabase functions list

# Check Edge Function logs
supabase functions logs send-delivery-notification

# Test Edge Function directly
supabase functions invoke send-delivery-notification --data '{"customerEmail":"test@example.com","customerName":"Test","trackingNumber":"TEST-123","packageDescription":"Test","deliveryDate":"2025-10-16","deliveryAddress":"Ghana"}'
```

### **Issue: Trustpilot not receiving BCC**

**Check:**
1. ✅ BCC email address is exact: `vanguardcargo.co+8dee62a535@invite.trustpilot.com`
2. ✅ Email service (Resend) supports BCC
3. ✅ AFS is enabled in Trustpilot dashboard

**Solution:**
- Log into Trustpilot Business → AFS Settings
- Verify AFS is active
- Check Activity log for received emails

### **Issue: Customers not receiving review invitations**

**Check:**
1. ✅ Customer email is valid
2. ✅ 3-7 day delay hasn't passed yet
3. ✅ Customer hasn't already reviewed
4. ✅ Invitation settings are correct in Trustpilot

**Solution:**
- Wait for configured delay period
- Check Trustpilot Invitations Activity log
- Verify customer email didn't bounce
- Check spam folder

---

## 🎯 **Best Practices**

### **1. Timing**
- ✅ Send delivery notification immediately when package is delivered
- ✅ Let Trustpilot handle the 3-7 day delay
- ✅ Don't send review invitations too early (bad UX)

### **2. Email Quality**
- ✅ Use professional, branded email templates
- ✅ Include all delivery details
- ✅ Make emails mobile-responsive
- ✅ Provide value beyond just asking for review

### **3. Customer Experience**
- ✅ Only send to successfully delivered packages
- ✅ Don't spam customers with multiple invitations
- ✅ Make unsubscribe option clear
- ✅ Respond to all reviews (positive and negative)

### **4. Monitoring**
- ✅ Track invitation send rates
- ✅ Monitor response rates
- ✅ Analyze review sentiment
- ✅ Use feedback to improve service

---

## 📝 **Next Steps**

1. ✅ **Deploy Edge Function** (5 minutes)
   ```bash
   supabase functions deploy send-delivery-notification
   ```

2. ✅ **Add Integration to Package Delivery** (15 minutes)
   - Update status change handlers
   - Import DeliveryNotificationService
   - Call when marking as delivered

3. ✅ **Test with Real Package** (30 minutes)
   - Mark a test package as delivered
   - Verify email is sent
   - Check Trustpilot dashboard

4. ✅ **Monitor First Week** (Ongoing)
   - Track invitations sent
   - Watch for first reviews
   - Adjust timing if needed

5. ✅ **Respond to Reviews** (Ongoing)
   - Set up email alerts for new reviews
   - Respond within 24-48 hours
   - Thank positive reviewers
   - Address negative feedback professionally

---

## 🔗 **Related Documentation**

- **Trustpilot Setup Guide**: `/TRUSTPILOT_SETUP.md`
- **Edge Function Code**: `/supabase/functions/send-delivery-notification/index.ts`
- **Service Code**: `/src/services/deliveryNotificationService.ts`
- **Trustpilot AFS Docs**: https://support.trustpilot.com/hc/en-us/articles/115004149487

---

## 💡 **Pro Tips**

1. **Test First**: Always test with your own email before going live
2. **Monitor Closely**: Watch first week of invitations carefully
3. **Respond Fast**: Reply to reviews within 24 hours
4. **Learn from Feedback**: Use reviews to improve your service
5. **Share Reviews**: Feature positive reviews on your website and social media

---

## 🎉 **You're Ready!**

Your Trustpilot AFS integration is complete and ready to use. Every time you mark a package as delivered, your customer will automatically receive a professional review invitation from Trustpilot!

**Questions?** Check the Trustpilot support docs or contact their support team.

**Last Updated:** October 2025
