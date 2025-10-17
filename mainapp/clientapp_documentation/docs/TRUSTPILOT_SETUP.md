# Trustpilot Integration Setup Guide

## Overview
This guide will help you integrate Trustpilot customer reviews and ratings into your Vanguard Cargo website. Trustpilot is a trusted review platform that will display authentic customer feedback and build credibility.

---

## Step 1: Create Your Trustpilot Business Account

### 1.1 Sign Up
1. Go to [Trustpilot Business Signup](https://business.trustpilot.com/signup)
2. Click "Get Started" or "Sign Up"
3. Enter your business information:
   - Company Name: **Vanguard Cargo**
   - Business Email: Your business email address
   - Country: Ghana (or your primary business location)
   - Industry: Logistics & Shipping

### 1.2 Verify Your Email
1. Check your email inbox for verification email from Trustpilot
2. Click the verification link
3. Complete your profile setup

---

## Step 2: Claim or Create Your Business Profile

### 2.1 Search for Existing Profile
1. Log into Trustpilot Business dashboard
2. Search for "Vanguard Cargo" in the company directory
3. If found, follow the claim process
4. If not found, proceed to create a new profile

### 2.2 Create New Business Profile
1. In Trustpilot Business dashboard, go to **Settings** → **Company Profile**
2. Complete all required information:
   - Company Name: **Vanguard Cargo**
   - Website: **https://www.vanguardcargo.co**
   - Logo: Upload your company logo
   - Description: Brief description of your services
   - Address: Your business address
   - Phone: Your business phone number

### 2.3 Verification Process
1. Trustpilot will verify your business (1-3 business days)
2. You may need to provide:
   - Business registration documents
   - Website ownership verification
   - Domain email proof
3. Check your email for verification status updates

---

## Step 3: Get Your Business Unit ID

### 3.1 Locate Business Unit ID
1. Log into [Trustpilot Business Dashboard](https://business.trustpilot.com)
2. Navigate to **Settings** → **Integrations** → **TrustBox**
3. Look for "Business Unit ID" or "Profile ID"
4. Copy the ID (format: `xxxxxxxxxxxxxxxxxxxxxxxx`)
   - Example: `5f8b1c2d3e4f5a6b7c8d9e0f`

### 3.2 Configure Your Website
1. Open your project directory
2. Create or edit `.env` file in the root directory
3. Add the following line:
   ```env
   VITE_TRUSTPILOT_BUSINESS_UNIT_ID=your_business_unit_id_here
   VITE_TRUSTPILOT_ENABLED=true
   ```
4. Replace `your_business_unit_id_here` with your actual Business Unit ID
5. Save the file

**Alternative Configuration:**
If you don't want to use environment variables, you can directly edit:
- File: `/src/config/trustpilot.ts`
- Line: `BUSINESS_UNIT_ID: 'your_business_unit_id_here'`

---

## Step 4: Collect Your First Reviews

### 4.1 As the First Reviewer (You)
1. Go to your Trustpilot business profile page:
   - Navigate to: `https://www.trustpilot.com/review/vanguardcargo.co`
   - Or click "View Public Profile" in your dashboard
2. Click **"Write a Review"** button
3. Log in or create a Trustpilot user account (separate from business account)
4. Rate your service (1-5 stars) - Be honest and professional
5. Write your review:
   ```
   Title: "Excellent Package Forwarding Service"
   
   Review: "As the founder of Vanguard Cargo, I'm proud of the service we provide. 
   Our team ensures fast, reliable delivery from the US to Ghana with competitive 
   pricing and excellent customer support. We're committed to making international 
   shipping accessible and affordable for everyone."
   ```
6. Submit your review

**Note:** Trustpilot may flag this as a "verified review" or "owner review" - this is normal and transparent.

### 4.2 Invite Customers to Review
1. In Trustpilot Business dashboard, go to **Reviews** → **Invitations**
2. Choose invitation method:
   - **Manual:** Upload customer email list (CSV/Excel)
   - **Email:** Send individual invitations
   - **Automatic:** Set up automatic invitations after delivery

### 4.3 Automatic Review Collection (Recommended)
Set up automatic review requests:
1. Go to **Integrations** → **AFS (Automatic Feedback Service)**
2. Configure email templates
3. Set delay after delivery (e.g., 3-7 days)
4. Connect with your order management system
5. Enable automatic sending

---

## Step 5: Enable and Customize TrustBox Widgets

### 5.1 Enable Widgets
1. Go to **TrustBox** section in dashboard
2. Browse available widget styles:
   - **Micro TrustBox:** Compact rating display
   - **Mini TrustBox:** Star rating with review count
   - **Carousel:** Rotating review showcase
   - **Grid/List:** Multiple reviews display
3. Select widgets you want to use
4. Customize colors, language, and style

### 5.2 Widget Locations on Your Website
Your website has been configured to show Trustpilot ratings in these locations:
- **Home Page - Services Section:** Mini TrustBox with stats
- **Services Page - Hero Section:** Mini TrustBox display
- **About Page - Stats Section:** Mini TrustBox with metrics
- **Testimonials Section:** Large rating display (when enabled)

All these locations will automatically show your real Trustpilot rating once configured!

---

## Step 6: Test Your Integration

### 6.1 Development Testing
1. Restart your development server:
   ```bash
   npm run dev
   ```
2. Navigate to your website
3. Check these pages:
   - Home page (http://localhost:5173)
   - Services page (http://localhost:5173/services)
   - About page (http://localhost:5173/about)
4. Look for Trustpilot widgets where "4.9★ Customer Rating" was displayed
5. Verify widgets load correctly (may take a few seconds)

### 6.2 Troubleshooting
**If widgets don't appear:**
1. Check browser console for errors (F12 → Console tab)
2. Verify Business Unit ID is correct in `.env` file
3. Ensure `VITE_TRUSTPILOT_ENABLED=true` is set
4. Clear browser cache and reload
5. Check that Trustpilot profile is verified and active

**If showing fallback rating (4.9★):**
- This means configuration is not detected
- Check environment variables are loaded correctly
- Verify the Business Unit ID format (no extra spaces or quotes)
- Restart development server after `.env` changes

---

## Step 7: Deploy to Production

### 7.1 Add Environment Variable to Hosting Platform

**For Vercel:**
1. Go to your project dashboard
2. Settings → Environment Variables
3. Add:
   - Name: `VITE_TRUSTPILOT_BUSINESS_UNIT_ID`
   - Value: Your Business Unit ID
   - Environment: Production
4. Add:
   - Name: `VITE_TRUSTPILOT_ENABLED`
   - Value: `true`
   - Environment: Production
5. Redeploy your application

**For Netlify:**
1. Site Settings → Build & Deploy → Environment
2. Add variables (same as Vercel above)
3. Trigger a new deploy

**For Other Hosts:**
- Add environment variables in your hosting platform's settings
- Format: `VITE_TRUSTPILOT_BUSINESS_UNIT_ID=your_id`
- Redeploy application

### 7.2 Verify Production Deployment
1. Visit your live website
2. Check all pages with Trustpilot widgets
3. Click on widgets to ensure they link to your profile
4. Test on mobile and desktop

---

## Step 8: Grow Your Reviews

### 8.1 Best Practices
1. **Ask at the Right Time:**
   - Send review requests 3-7 days after successful delivery
   - Don't ask too early (customer hasn't experienced full service)
   - Don't ask too late (customer may forget)

2. **Make it Easy:**
   - Include direct link to review page in emails
   - Add "Review us on Trustpilot" button in customer dashboard
   - Keep invitation message short and friendly

3. **Respond to Reviews:**
   - Reply to all reviews (positive and negative)
   - Thank customers for positive feedback
   - Address concerns in negative reviews professionally
   - Show you value customer feedback

4. **Showcase Reviews:**
   - Share positive reviews on social media
   - Add review widgets to marketing materials
   - Include top reviews in email campaigns

### 8.2 Sample Review Request Email
```
Subject: How was your Vanguard Cargo experience?

Hi [Customer Name],

Thank you for choosing Vanguard Cargo for your package forwarding from the US to Ghana!

We hope your package arrived safely and on time. Your feedback helps us improve our service and helps other customers make informed decisions.

Would you take 2 minutes to share your experience?

[Review Us on Trustpilot Button]

Thank you for your support!

Best regards,
The Vanguard Cargo Team
```

---

## Widget Customization

### Available Widget Templates
Your website uses these Trustpilot templates (configured in `src/config/trustpilot.ts`):

| Template | ID | Use Case |
|----------|-----|----------|
| Micro TrustBox | `5419b6a8b0d04a076446a9ad` | Compact header/footer |
| Mini TrustBox | `53aa8807dec7e10d38f59f32` | Star rating with count |
| Micro Star | `5419b6ffb0d04a076446a9af` | Stars only |
| Horizontal Slider | `54ad5defc6454f065c28af8b` | Rotating reviews |
| Carousel | `53aa8912dec7e10d38f59f36` | Review carousel |

### Customizing Widget Appearance
Edit `/src/components/CustomerRating.tsx` to:
- Change widget size
- Adjust colors (theme: 'light' or 'dark')
- Modify layout
- Add/remove text labels
- Change positioning

---

## Advanced Features

### API Integration
For advanced use cases:
1. Use Trustpilot API to fetch reviews programmatically
2. Display custom review layouts
3. Integrate review data with analytics
4. Create custom dashboards

**API Documentation:** https://developers.trustpilot.com/

### Rich Snippets & SEO
Trustpilot widgets automatically add structured data (schema.org) to improve SEO:
- Star ratings in Google search results
- Review counts visible in SERPs
- Enhanced business listings

---

## Support & Resources

### Trustpilot Resources
- **Help Center:** https://support.trustpilot.com/
- **Community Forum:** https://community.trustpilot.com/
- **Developer Docs:** https://developers.trustpilot.com/
- **Support Email:** support@trustpilot.com

### Vanguard Cargo Integration
- **Configuration File:** `/src/config/trustpilot.ts`
- **Widget Component:** `/src/components/TrustpilotWidget.tsx`
- **Rating Component:** `/src/components/CustomerRating.tsx`
- **Setup Guide:** `/TRUSTPILOT_SETUP.md` (this file)

### Common Issues
| Issue | Solution |
|-------|----------|
| Widgets not loading | Check Business Unit ID, verify account status |
| Wrong reviews showing | Ensure correct domain verification |
| Slow loading | Normal - widgets load async, may take 1-2 seconds |
| No reviews showing | Collect reviews first, minimum 1 review to display |

---

## Quick Start Checklist

- [ ] Create Trustpilot Business account
- [ ] Verify business email
- [ ] Complete company profile
- [ ] Get verified by Trustpilot
- [ ] Copy Business Unit ID
- [ ] Add to `.env` file: `VITE_TRUSTPILOT_BUSINESS_UNIT_ID=your_id`
- [ ] Enable integration: `VITE_TRUSTPILOT_ENABLED=true`
- [ ] Restart development server
- [ ] Write your first review
- [ ] Invite customers to review
- [ ] Test widgets on all pages
- [ ] Deploy to production with environment variables
- [ ] Set up automatic review collection

---

## Next Steps

1. **Immediate:** Complete steps 1-3 to get your Business Unit ID
2. **Today:** Configure `.env` file and test locally
3. **This Week:** Write your first review as the founder
4. **Ongoing:** Invite satisfied customers to leave reviews
5. **Monthly:** Review and respond to customer feedback

---

## Benefits of Trustpilot Integration

✅ **Build Trust:** Display authentic customer reviews
✅ **Increase Conversions:** Social proof boosts sales by up to 270%
✅ **Improve SEO:** Rich snippets in search results
✅ **Gather Feedback:** Understand customer experience
✅ **Competitive Advantage:** Stand out from competitors
✅ **Transparency:** Show commitment to customer satisfaction

---

**Need Help?** Contact the development team or refer to Trustpilot support resources above.

**Last Updated:** October 2025
