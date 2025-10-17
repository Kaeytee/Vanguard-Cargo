# Trustpilot Review Collector Integration

## 🎯 **What Is It?**

The Trustpilot Review Collector is a widget that allows your customers to **leave reviews directly from your website** without being redirected to Trustpilot. This increases review collection rates by making it easy and convenient for customers to share their feedback.

---

## ✅ **Your Configuration**

Your Trustpilot Review Collector is configured and ready to use:

- **Business Unit ID**: `68f141bf4d60358202835d95`
- **Template ID**: `56278e9abfbbba0bdcd568bc`
- **Token**: `e58a2d5dd-c9a7-44a8-84e9-cabc9c8b8d8b`
- **Domain**: `vanguardcargo.co`

---

## 📦 **Components Available**

### **1. Basic Review Collector**
```tsx
import TrustpilotReviewCollector from '../components/TrustpilotReviewCollector';

<TrustpilotReviewCollector />
```

**Use for:**
- Simple review collection
- Minimal layouts
- Embedded in cards

---

### **2. Review Collector Section** (Recommended)
```tsx
import { ReviewCollectorSection } from '../components/TrustpilotReviewCollector';

<ReviewCollectorSection />
```

**Includes:**
- ✅ Heading: "How was your experience?"
- ✅ Description text
- ✅ Review collector widget
- ✅ Privacy notice
- ✅ Beautiful gray background
- ✅ Fully responsive

**Use for:**
- Thank you pages
- Post-purchase confirmation
- Customer dashboard
- Service completion pages

---

### **3. Post-Delivery Review Prompt** (Best for Logistics)
```tsx
import { PostDeliveryReviewPrompt } from '../components/TrustpilotReviewCollector';

<PostDeliveryReviewPrompt 
  trackingNumber="VC-12345"
  deliveryDate="2025-10-16"
/>
```

**Includes:**
- ✅ Delivery confirmation with checkmark
- ✅ Tracking number display
- ✅ Delivery date
- ✅ Review collector
- ✅ Professional gradient background
- ✅ Celebration-style design

**Use for:**
- Delivery confirmation pages
- After marking package as delivered
- Post-delivery emails (with link to page)
- Shipment history details

---

### **4. Compact Review Collector**
```tsx
import { CompactReviewCollector } from '../components/TrustpilotReviewCollector';

<CompactReviewCollector />
```

**Use for:**
- Sidebars
- Footer sections
- Compact layouts
- Secondary CTAs

---

## 🎨 **Integration Examples**

### **Example 1: Delivery Confirmation Page**

Create a new page: `/src/app/pages/DeliveryConfirmation.tsx`

```tsx
import { useParams } from 'react-router-dom';
import { PostDeliveryReviewPrompt } from '../../components/TrustpilotReviewCollector';
import { useEffect, useState } from 'react';
import { packageService } from '../../services/packageService';

export default function DeliveryConfirmation() {
  const { trackingNumber } = useParams();
  const [packageData, setPackageData] = useState(null);

  useEffect(() => {
    // Fetch package details
    const fetchPackage = async () => {
      const data = await packageService.getPackageByTracking(trackingNumber);
      setPackageData(data);
    };
    fetchPackage();
  }, [trackingNumber]);

  if (!packageData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Delivery Confirmation + Review Collector */}
        <PostDeliveryReviewPrompt 
          trackingNumber={packageData.tracking_number}
          deliveryDate={packageData.delivered_at}
        />

        {/* Additional package details */}
        <div className="mt-8 bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Package Details</h3>
          <p>Description: {packageData.description}</p>
          <p>Weight: {packageData.weight} lbs</p>
          {/* Add more details as needed */}
        </div>
      </div>
    </div>
  );
}
```

---

### **Example 2: Customer Dashboard**

Add to: `/src/app/pages/Dashboard.tsx`

```tsx
import { ReviewCollectorSection } from '../../components/TrustpilotReviewCollector';

export default function Dashboard() {
  // Existing dashboard code...

  return (
    <div className="space-y-6">
      {/* Existing dashboard content */}
      {/* ... */}

      {/* Review Collector Section */}
      {userHasRecentDelivery && (
        <ReviewCollectorSection />
      )}
    </div>
  );
}
```

---

### **Example 3: Shipment History Modal**

Update: `/src/app/pages/ShipmentHistory/ShipmentHistoryPopup.tsx`

```tsx
import { CompactReviewCollector } from '../../components/TrustpilotReviewCollector';

// Inside the popup, after delivery details
{shipment.status === 'delivered' && (
  <div className="mt-6 border-t pt-6">
    <h4 className="text-sm font-semibold mb-3">Enjoyed our service?</h4>
    <CompactReviewCollector />
  </div>
)}
```

---

### **Example 4: Footer Section**

Add to: `/src/components/footer.tsx`

```tsx
import { CompactReviewCollector } from './TrustpilotReviewCollector';

// In footer, add new column
<div className="space-y-4">
  <h3 className="text-lg font-semibold text-gray-900">Leave a Review</h3>
  <CompactReviewCollector />
</div>
```

---

## 🚀 **Recommended Placement**

### **High Priority (Implement First)**

1. **✅ Post-Delivery Confirmation Page**
   - Create dedicated page for delivery confirmation
   - Show tracking number, delivery date
   - Include `PostDeliveryReviewPrompt` component
   - Link to this page in delivery emails

2. **✅ Email Delivery Notifications**
   - Include link in delivery confirmation email
   - Button: "Package Delivered - Leave a Review"
   - Links to delivery confirmation page

3. **✅ Shipment History Details**
   - Show review collector for delivered packages
   - Use `CompactReviewCollector` in popup/modal

### **Medium Priority (Implement Soon)**

4. **Customer Dashboard**
   - Show for users with recent deliveries
   - Use `ReviewCollectorSection`
   - Conditional: only if delivered in last 30 days

5. **Profile/Settings Page**
   - Tab: "Leave Feedback"
   - Use `ReviewCollectorSection`

### **Low Priority (Nice to Have)**

6. **Footer**
   - Use `CompactReviewCollector`
   - Always visible to all users

7. **Contact/Support Thank You**
   - After submitting support ticket
   - Show for positive interactions

---

## 📊 **Best Practices**

### **Timing**
- ✅ Show review collector **3-7 days after delivery**
- ✅ Don't ask immediately (customer hasn't experienced full service)
- ✅ Don't ask too late (customer forgets)

### **Placement**
- ✅ Show in **high-intent pages** (delivery confirmation, thank you)
- ✅ Make it **prominent but not annoying**
- ✅ Include **context** (delivery details, tracking number)

### **Messaging**
- ✅ Be **grateful**: "We'd love your feedback"
- ✅ Be **specific**: Mention the package/service
- ✅ Be **honest**: "Help others make informed decisions"
- ✅ Show **value**: "Takes less than 1 minute"

### **Don't**
- ❌ Don't show to users with unresolved issues
- ❌ Don't show multiple times to same user
- ❌ Don't interrupt critical workflows
- ❌ Don't beg or plead for reviews

---

## 🔧 **Customization**

### **Change Widget Size**

```tsx
<TrustpilotReviewCollector 
  height="80px"    // Default: 52px
  width="600px"    // Default: 100%
/>
```

### **Custom Styling**

```tsx
<TrustpilotReviewCollector 
  className="my-8 shadow-lg rounded-lg p-4"
/>
```

### **Conditional Display**

```tsx
// Only show for delivered packages
{packageStatus === 'delivered' && (
  <TrustpilotReviewCollector />
)}

// Only show if not already reviewed
{!user.hasReviewedUs && (
  <ReviewCollectorSection />
)}

// Only show for recent deliveries (last 30 days)
{isRecentDelivery(deliveryDate) && (
  <PostDeliveryReviewPrompt 
    trackingNumber={tracking}
    deliveryDate={deliveryDate}
  />
)}
```

---

## 📈 **Tracking & Monitoring**

### **In Trustpilot Dashboard**

1. Go to **Reviews** → **Invitations**
2. Filter by **Source**: "Service Review Link"
3. See reviews collected via widget
4. Track conversion rate (views → reviews)

### **Analytics Events** (Optional)

Add tracking when widget is displayed:

```tsx
useEffect(() => {
  // Track widget view
  gtag('event', 'review_collector_view', {
    tracking_number: trackingNumber,
    page_location: window.location.href
  });
}, []);
```

---

## 🎯 **Implementation Checklist**

- [x] TrustBox script added to `index.html`
- [x] Trustpilot config updated with Business Unit ID
- [x] Review Collector components created
- [ ] **TODO**: Create delivery confirmation page
- [ ] **TODO**: Add review collector to shipment history
- [ ] **TODO**: Include link in delivery emails
- [ ] **TODO**: Add to customer dashboard
- [ ] **TODO**: Test review submission flow
- [ ] **TODO**: Monitor first reviews in Trustpilot dashboard

---

## 🧪 **Testing**

### **Test 1: Widget Loads**

1. Add `<TrustpilotReviewCollector />` to any page
2. Open page in browser
3. Verify widget appears (blue "Write a review" button)
4. Check browser console for errors

### **Test 2: Review Submission**

1. Click "Write a review" button
2. Verify Trustpilot popup opens
3. Rate service (1-5 stars)
4. Write review text
5. Submit review
6. Check Trustpilot dashboard for new review

### **Test 3: Responsive Design**

1. Test on mobile (iPhone, Android)
2. Test on tablet (iPad)
3. Test on desktop (various browsers)
4. Verify widget scales properly

---

## 💡 **Pro Tips**

1. **Personalize It**: Include customer name, tracking number
2. **Show Value**: Mention specific service they used
3. **Make It Easy**: One-click access, no login required
4. **Follow Up**: Send reminder email if no review after 7 days
5. **Respond**: Reply to all reviews within 24 hours
6. **Showcase**: Display reviews on website and social media
7. **Incentivize**: Consider small discount for leaving review (optional)

---

## 🔗 **Resources**

- **Trustpilot Business Dashboard**: https://business.trustpilot.com
- **Review Collector Guide**: https://support.trustpilot.com/hc/en-us/articles/115004149487
- **Widget Documentation**: https://developers.trustpilot.com/
- **Your Trustpilot Profile**: https://www.trustpilot.com/review/vanguardcargo.co

---

## 🎉 **Summary**

Your Trustpilot Review Collector is **ready to use**! 

**Next Steps:**
1. Create delivery confirmation page
2. Add `PostDeliveryReviewPrompt` component
3. Include link in delivery emails
4. Test with first delivery
5. Monitor reviews in Trustpilot dashboard

**Questions?** Check Trustpilot support docs or contact their support team.

**Last Updated:** October 2025
