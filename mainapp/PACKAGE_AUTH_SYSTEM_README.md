# 📦 Package Authentication & Receipt System

## Overview

The Vanguard Cargo application now includes a comprehensive package authentication and receipt system that provides customers with secure pickup codes, QR codes, and detailed receipts for their packages.

---

## 🎯 Features

### **1. 6-Digit Authentication Codes**
- Unique codes generated for each package when ready for pickup
- Prominently displayed with security warnings
- Copy-to-clipboard functionality
- Required for package collection at warehouse

### **2. QR Code System**
- Auto-generated QR codes for quick warehouse scanning
- Downloadable for offline access
- Encoded with package tracking information
- High-contrast for reliable scanning

### **3. Receipt Management**
- Digital receipts for package intake
- Comprehensive package and customer information
- Download as text file or print
- Historical receipt access

### **4. Package Collection Interface**
- Complete pickup instructions
- Warehouse location with map integration
- Operating hours and contact information
- Pickup checklist for customers

### **5. Real-time Notifications**
- Instant alerts when packages are ready
- Push notifications with auth codes
- Real-time status updates via Supabase subscriptions

---

## 📁 File Structure

```
src/
├── services/
│   ├── receiptService.ts          # Receipt management
│   ├── qrCodeService.ts           # QR code generation
│   └── packageService.ts          # Updated with new fields
├── components/
│   ├── AuthCodeDisplay.tsx        # 6-digit code display
│   ├── QRCodeDisplay.tsx          # QR code viewer
│   ├── ReceiptViewer.tsx          # Receipt modal
│   ├── PackageCollectionView.tsx  # Pickup interface
│   └── ArrivedPackageBanner.tsx   # Ready alert banner
└── examples/
    └── PackageAuthIntegrationExample.tsx  # Integration examples
```

---

## 🚀 Quick Start

### **Installation**

```bash
# Install required dependencies
npm install qrcode
npm install -D @types/qrcode
```

### **Basic Integration**

```typescript
import AuthCodeDisplay from './components/AuthCodeDisplay';
import QRCodeDisplay from './components/QRCodeDisplay';

// In your package details component
{package.delivery_auth_code && (
  <AuthCodeDisplay
    authCode={package.delivery_auth_code}
    trackingNumber={package.tracking_number}
    size="large"
    showWarnings={true}
  />
)}

{package.qr_code_data && (
  <QRCodeDisplay
    data={package.qr_code_data}
    size={300}
    label="Show at warehouse"
    showDownload={true}
  />
)}
```

---

## 🔧 Components API

### **AuthCodeDisplay**

Displays 6-digit authentication code prominently with security warnings.

**Props:**
```typescript
interface AuthCodeDisplayProps {
  authCode: string;              // 6-digit code
  trackingNumber?: string;       // Package tracking number
  size?: 'small' | 'medium' | 'large';  // Display size
  showWarnings?: boolean;        // Show security warnings
  className?: string;            // Custom CSS class
}
```

**Usage:**
```typescript
<AuthCodeDisplay
  authCode="123456"
  trackingNumber="VC-TRK-001"
  size="large"
  showWarnings={true}
/>
```

---

### **QRCodeDisplay**

Displays QR codes with download functionality.

**Props:**
```typescript
interface QRCodeDisplayProps {
  data: string;                  // QR code data
  size?: number;                 // Size in pixels (default: 300)
  label?: string;                // Label text
  showDownload?: boolean;        // Show download button
  downloadFilename?: string;     // Download filename
  className?: string;            // Custom CSS class
}
```

**Usage:**
```typescript
<QRCodeDisplay
  data="VANGUARD:PKG:VC-TRK-001:AUTH:123456"
  size={300}
  label="Scan at warehouse"
  showDownload={true}
  downloadFilename="package-qr"
/>
```

---

### **ReceiptViewer**

Modal component for viewing and managing receipts.

**Props:**
```typescript
interface ReceiptViewerProps {
  receipt: Receipt | null;       // Receipt object
  onClose: () => void;          // Close callback
  isOpen: boolean;              // Modal visibility
}
```

**Usage:**
```typescript
const [receipt, setReceipt] = useState(null);
const [showReceipt, setShowReceipt] = useState(false);

<ReceiptViewer
  receipt={receipt}
  isOpen={showReceipt}
  onClose={() => setShowReceipt(false)}
/>
```

---

### **PackageCollectionView**

Comprehensive package pickup interface.

**Props:**
```typescript
interface PackageCollectionViewProps {
  package: Package;              // Package object
  className?: string;            // Custom CSS class
}
```

**Usage:**
```typescript
<PackageCollectionView
  package={packageData}
  className="my-custom-class"
/>
```

---

### **ArrivedPackageBanner**

Animated banner for ready packages.

**Props:**
```typescript
interface ArrivedPackageBannerProps {
  package: Package;              // Package object
  onViewDetails: () => void;    // View details callback
  className?: string;            // Custom CSS class
}
```

**Usage:**
```typescript
<ArrivedPackageBanner
  package={readyPackage}
  onViewDetails={() => navigate(`/packages/${readyPackage.id}`)}
/>
```

---

## 📡 Services API

### **receiptService**

Manages receipt operations.

**Methods:**

```typescript
// Generate package intake receipt
await receiptService.generatePackageIntakeReceipt(
  packageId: string,
  staffId: string
): Promise<ApiResponse<ReceiptData>>

// Get user receipts
await receiptService.getUserReceipts(
  userId: string
): Promise<ApiResponse<Receipt[]>>

// Get package receipt
await receiptService.getPackageReceipt(
  packageId: string
): Promise<ApiResponse<Receipt>>

// Download receipt
receiptService.downloadReceipt(
  receipt: Receipt,
  filename?: string
): void

// Print receipt
receiptService.printReceipt(
  receipt: Receipt
): void
```

---

### **qrCodeService**

Handles QR code generation.

**Methods:**

```typescript
// Generate QR code
await qrCodeService.generateQRCode(
  data: string,
  options?: QRCodeOptions
): Promise<string>  // Returns data URL

// Generate package QR code
await qrCodeService.generatePackageQRCode(
  trackingNumber: string,
  authCode?: string
): Promise<string>

// Download QR code
await qrCodeService.downloadQRCode(
  data: string,
  filename: string,
  options?: QRCodeOptions
): Promise<void>

// Parse Vanguard QR code
qrCodeService.parseVanguardQRCode(
  qrCodeData: string
): { type: 'package' | 'shipment', trackingNumber: string, authCode?: string } | null
```

---

## 🔄 Real-time Integration

### **Listen for Auth Code Generation**

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('package-auth-codes')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'packages',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      if (payload.new.delivery_auth_code && !payload.old.delivery_auth_code) {
        // Auth code generated - show notification
        showNotification('Package ready for pickup!');
      }
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, [userId]);
```

### **Listen for New Receipts**

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('receipts')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'receipts',
      filter: `package_id=in.(${packageIds.join(',')})`
    }, (payload) => {
      // New receipt available
      handleNewReceipt(payload.new);
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, [packageIds]);
```

---

## 🎨 Styling Guidelines

### **Status Colors**

```typescript
const statusColors = {
  'pending': 'bg-gray-500',
  'received': 'bg-yellow-500',
  'processing': 'bg-blue-500',
  'ready_for_pickup': 'bg-green-500 animate-pulse',  // Special!
  'shipped': 'bg-purple-500',
  'delivered': 'bg-gray-400'
};
```

### **Auth Code Styling**

```css
.auth-code {
  font-size: 32px;
  font-weight: bold;
  letter-spacing: 0.5em;
  font-family: 'Courier New', monospace;
  color: white;
  background: linear-gradient(135deg, #DC2626, #B91C1C);
  padding: 24px;
  border-radius: 12px;
}
```

### **QR Code Container**

```css
.qr-container {
  background: white;
  border: 4px solid #E5E7EB;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
```

---

## 🔐 Security Best Practices

### **DO:**
✅ Only show auth codes to authenticated users  
✅ Verify user owns the package before displaying code  
✅ Clear sensitive data from memory on logout  
✅ Use HTTPS for all communications  
✅ Implement proper RLS policies in Supabase  
✅ Log all auth code access for audit trails  

### **DON'T:**
❌ Cache auth codes in localStorage  
❌ Send codes via unencrypted channels  
❌ Display codes in publicly accessible areas  
❌ Share codes automatically via email/SMS  
❌ Log codes in plain text  
❌ Expose codes in URL parameters  

---

## 🧪 Testing

### **Unit Tests Example**

```typescript
describe('AuthCodeDisplay', () => {
  it('should display 6-digit code correctly', () => {
    const { getByText } = render(
      <AuthCodeDisplay authCode="123456" />
    );
    expect(getByText('123 456')).toBeInTheDocument();
  });

  it('should copy code to clipboard', async () => {
    const { getByRole } = render(
      <AuthCodeDisplay authCode="123456" />
    );
    const copyButton = getByRole('button', { name: /copy/i });
    await userEvent.click(copyButton);
    expect(await navigator.clipboard.readText()).toBe('123456');
  });
});
```

### **Integration Tests**

```typescript
describe('Package Pickup Flow', () => {
  it('should show auth code when package is ready', async () => {
    const package = {
      ...mockPackage,
      status: 'ready_for_pickup',
      delivery_auth_code: '123456'
    };

    const { getByText } = render(
      <PackageDetailsPage packageId={package.id} />
    );

    expect(getByText('123456')).toBeInTheDocument();
    expect(getByText(/required for pickup/i)).toBeInTheDocument();
  });
});
```

---

## 🐛 Troubleshooting

### **QR Code Not Generating**

**Problem:** QR code component shows error or blank  
**Solution:** Ensure `qrcode` package is installed:
```bash
npm install qrcode @types/qrcode
```

### **Auth Code Undefined**

**Problem:** `package.delivery_auth_code` is null/undefined  
**Solutions:**
1. Check backend RPC function `generate_package_intake_receipt()` was called
2. Verify package status allows code generation
3. Check RLS policies allow reading `delivery_auth_code` field

### **TypeScript Errors**

**Problem:** Type errors for new package fields  
**Solution:** Updated `DbPackage` interface includes:
```typescript
delivery_auth_code: string | null;
qr_code_data: string | null;
barcode_data: string | null;
ready_for_pickup: boolean | null;
```

### **Real-time Not Working**

**Problem:** Subscriptions not triggering  
**Solutions:**
1. Check Supabase real-time is enabled for tables
2. Verify RLS policies allow subscriptions
3. Check filter syntax matches user ID correctly

---

## 📊 Database Schema

### **New Package Fields**

```sql
ALTER TABLE packages ADD COLUMN delivery_auth_code TEXT;
ALTER TABLE packages ADD COLUMN qr_code_data TEXT;
ALTER TABLE packages ADD COLUMN barcode_data TEXT;
ALTER TABLE packages ADD COLUMN ready_for_pickup BOOLEAN DEFAULT FALSE;
```

### **Receipts Table**

```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES packages(id),
  shipment_id UUID REFERENCES shipments(id),
  receipt_number TEXT UNIQUE NOT NULL,
  receipt_type TEXT CHECK (receipt_type IN ('intake', 'shipment')),
  receipt_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🚀 Deployment Checklist

- [ ] Run database migrations for new fields
- [ ] Install `qrcode` dependency
- [ ] Deploy backend RPC functions
- [ ] Update RLS policies
- [ ] Test auth code generation
- [ ] Test QR code display
- [ ] Test receipt viewing
- [ ] Test real-time notifications
- [ ] Verify security measures
- [ ] Test on mobile devices
- [ ] Monitor error logs

---

## 📚 Additional Resources

- [Frontend Implementation Guide](./FRONTEND_IMPLEMENTATION_GUIDE.md)
- [Integration Examples](./src/examples/PackageAuthIntegrationExample.tsx)
- [Backend API Documentation](./API_INTEGRATION.md)
- [Security Guidelines](./SECURITY_GUIDELINES.md)

---

## 🆘 Support

For issues or questions:
- Check the troubleshooting section above
- Review integration examples
- Consult component JSDoc comments
- Contact development team

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-07  
**Status:** Production Ready ✅
