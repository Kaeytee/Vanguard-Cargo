# 🔒 API Security Integration Guide

**Quick Reference for Integrating the API Security Layer**

---

## 📋 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Basic Setup](#basic-setup)
3. [Common Use Cases](#common-use-cases)
4. [Advanced Configuration](#advanced-configuration)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 QUICK START

### **Step 1: Initialize Security Layer**

Add to `src/main.tsx` or `src/App.tsx`:

```typescript
import { initializeAPISecurity } from '@/config/apiSecurity';

// Initialize on app startup
initializeAPISecurity();
```

### **Step 2: Replace API Calls**

**Before:**
```typescript
const response = await fetch('/api/packages');
const data = await response.json();
```

**After:**
```typescript
import { secureGet } from '@/utils/api';

const data = await secureGet('/api/packages');
```

**That's it!** ✅ Your API calls now have:
- ✅ Authentication
- ✅ Request validation
- ✅ Response sanitization
- ✅ Rate limiting
- ✅ Automatic retry
- ✅ Error handling

---

## 🔧 BASIC SETUP

### **1. Create API Security Config File**

File: `src/config/apiSecurity.ts` (Already created!)

```typescript
import { initializeAPISecurity } from '@/config/apiSecurity';

// Basic initialization
initializeAPISecurity();

// Or with options
initializeAPISecurity({
  enableValidation: true,
  enableRateLimit: true,
  enableSanitization: true,
  enableSigning: false // Requires setup
});
```

### **2. Initialize in App**

Add to your app entry point (`main.tsx`):

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeAPISecurity } from '@/config/apiSecurity';

// Initialize security
initializeAPISecurity();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 💡 COMMON USE CASES

### **Use Case 1: Simple GET Request**

```typescript
import { secureGet } from '@/utils/api';

async function fetchPackages() {
  try {
    const packages = await secureGet('/api/packages');
    return packages;
  } catch (error) {
    console.error('Failed to fetch packages:', error);
    throw error;
  }
}
```

**Automatic Features:**
- ✅ Auth headers added
- ✅ Rate limit checked
- ✅ Response sanitized
- ✅ Retry on failure

---

### **Use Case 2: POST with Validation**

```typescript
import { securePost, packageCreationSchema } from '@/utils/api';

async function createPackage(packageData: any) {
  try {
    const newPackage = await securePost('/api/packages', packageData);
    return newPackage;
  } catch (error) {
    // Error is already logged and user-friendly
    throw error;
  }
}
```

**With Manual Validation:**
```typescript
import { APIValidator, packageCreationSchema, securePost } from '@/utils/api';

async function createPackageValidated(packageData: any) {
  // Validate first
  const validation = APIValidator.validateRequest(
    { method: 'POST', body: packageData },
    { method: 'POST', bodySchema: packageCreationSchema }
  );
  
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  // Post with sanitized data
  const newPackage = await securePost('/api/packages', validation.sanitizedData);
  return newPackage;
}
```

---

### **Use Case 3: Form Validation**

```typescript
import { useFormValidation, FormValidators } from '@/hooks/useFormValidation';
import { securePost } from '@/utils/api';

function PackageForm() {
  const { 
    values, 
    errors, 
    touched, 
    handleChange, 
    handleBlur, 
    validateForm 
  } = useFormValidation({
    initialValues: {
      tracking_number: '',
      description: '',
      weight: 0
    },
    validationRules: [
      {
        field: 'tracking_number',
        validate: FormValidators.required('Tracking number is required')
      },
      {
        field: 'weight',
        validate: FormValidators.number({ min: 0, max: 10000 })
      }
    ]
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (await validateForm()) {
      try {
        const newPackage = await securePost('/api/packages', values);
        alert('Package created!');
      } catch (error) {
        // Error already handled by error handler
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="tracking_number"
        value={values.tracking_number}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {touched.tracking_number && errors.tracking_number && (
        <span className="error">{errors.tracking_number}</span>
      )}
      
      {/* More fields... */}
      
      <button type="submit">Create Package</button>
    </form>
  );
}
```

---

### **Use Case 4: Error Handling**

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { secureGet } from '@/utils/api';

function PackageList() {
  const { handleError, showError } = useErrorHandler();
  const [packages, setPackages] = useState([]);
  
  useEffect(() => {
    loadPackages();
  }, []);
  
  const loadPackages = async () => {
    try {
      const data = await secureGet('/api/packages');
      setPackages(data);
    } catch (error) {
      // Automatically logs error and shows user-friendly message
      handleError(error);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await secureDelete(`/api/packages/${id}`);
      showError('Package deleted successfully', 'success');
      loadPackages();
    } catch (error) {
      handleError(error);
    }
  };
  
  return (
    <div>
      {packages.map(pkg => (
        <div key={pkg.id}>
          {pkg.tracking_number}
          <button onClick={() => handleDelete(pkg.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

---

### **Use Case 5: Custom Rate Limits**

```typescript
import { configureEndpointLimit } from '@/config/apiSecurity';

// Configure strict limit for payment endpoint
configureEndpointLimit('/api/payment', 5, 60000); // 5 req/min

// Configure relaxed limit for read-only endpoint
configureEndpointLimit('/api/packages/list', 120, 60000); // 120 req/min
```

---

### **Use Case 6: Response Sanitization**

```typescript
import { ResponseSanitizer, sanitizeForLogging } from '@/utils/api';

async function getUserProfile(userId: string) {
  const profile = await secureGet(`/api/users/${userId}`);
  
  // Response is already sanitized (sensitive fields removed)
  // But you can do additional sanitization for logging
  
  console.log('User profile:', sanitizeForLogging(profile));
  // Output: { email: 'j***n@example.com', phone: '+******7890', ... }
  
  return profile;
}
```

---

### **Use Case 7: Request Signing (Advanced)**

**⚠️ Requires Setup:**
1. Set environment variable: `REACT_APP_SIGNING_KEY`
2. Server must verify signatures

```typescript
import { initializeAPISecurity } from '@/config/apiSecurity';

// Enable request signing
initializeAPISecurity({
  enableSigning: true,
  signingKey: process.env.REACT_APP_SIGNING_KEY
});
```

**Automatic Signing:**
```typescript
// All requests now include signature headers:
// X-Signature: <hmac-sha256-hash>
// X-Signature-Timestamp: <timestamp>
// X-Signature-Nonce: <unique-nonce>
// X-Signature-Version: 1.0

const data = await securePost('/api/critical-operation', payload);
```

---

## ⚙️ ADVANCED CONFIGURATION

### **Custom Security Config Per Request**

```typescript
import { APISecurityMiddleware } from '@/utils/api';

const response = await APISecurityMiddleware.executeRequest({
  url: '/api/packages',
  method: 'POST',
  body: packageData,
  securityConfig: {
    validateRequests: true,
    validateResponses: true,
    requireAuth: true,
    enableRateLimit: false, // Bypass rate limit for this request
    sanitizeResponses: true,
    timeout: 60000, // 60 seconds
    retry: {
      maxRetries: 5, // More retries
      retryDelay: 2000,
      retryableStatuses: [429, 500, 502, 503]
    }
  }
});
```

---

### **Custom Interceptors**

```typescript
import { APISecurityMiddleware } from '@/utils/api';

// Add custom logging interceptor
APISecurityMiddleware.registerInterceptor({
  name: 'analytics',
  beforeRequest: async (context) => {
    console.log(`API Call: ${context.method} ${context.url}`);
    context.metadata = { startTime: Date.now() };
    return context;
  },
  afterResponse: async (response) => {
    const duration = Date.now() - response.request.metadata.startTime;
    console.log(`Response received in ${duration}ms`);
    
    // Send to analytics
    analytics.track('api_call', {
      endpoint: response.request.url,
      duration,
      status: response.status
    });
    
    return response;
  },
  onError: async (error, context) => {
    console.error(`API Error: ${context.url}`, error);
    
    // Send error to monitoring service
    errorTracking.logError(error, {
      endpoint: context.url,
      method: context.method
    });
  }
});
```

---

### **Custom Sanitization Rules**

```typescript
import { ResponseSanitizer } from '@/utils/api';

const sanitized = ResponseSanitizer.sanitize(data, {
  removeSensitiveFields: true,
  maskPII: true,
  sanitizeHTML: true,
  blacklist: [
    'internal_*',     // Remove all fields starting with internal_
    '*.password',     // Remove password from any nested object
    '*.token',        // Remove token from any nested object
    'user.ssn'        // Remove specific field
  ],
  customSanitizers: {
    'user.creditCard': (value) => {
      // Custom credit card masking
      return `****-****-****-${value.slice(-4)}`;
    }
  }
});
```

---

### **Rate Limit Statistics**

```typescript
import { APIRateLimiter } from '@/utils/api';

// Get stats for specific endpoint
const stats = APIRateLimiter.getStats('/api/packages');
console.log('Endpoint stats:', {
  totalRequests: stats.totalRequests,
  blockedRequests: stats.blockedRequests,
  blockRate: (stats.blockedRequests / stats.totalRequests * 100).toFixed(2) + '%',
  avgPerMinute: stats.avgRequestsPerMinute
});

// Get all stats
const allStats = APIRateLimiter.getAllStats();
allStats.forEach((stats, endpoint) => {
  console.log(`${endpoint}:`, stats);
});

// Reset specific endpoint
APIRateLimiter.resetEndpoint('/api/packages');

// Reset all
APIRateLimiter.resetAll();
```

---

## 🐛 TROUBLESHOOTING

### **Issue 1: Rate Limit Errors**

**Problem:** Getting "Rate limit exceeded" errors

**Solution:**
```typescript
import { APIRateLimiter } from '@/utils/api';

// Check current status
const status = await APIRateLimiter.checkLimit('/api/packages');
console.log('Rate limit status:', status);
// Output: { allowed: false, remaining: 0, resetIn: 45000 }

// Adjust limit if needed
import { configureEndpointLimit } from '@/config/apiSecurity';
configureEndpointLimit('/api/packages', 120, 60000); // Increase to 120/min
```

---

### **Issue 2: Validation Errors**

**Problem:** Requests failing validation

**Solution:**
```typescript
import { APIValidator, packageCreationSchema } from '@/utils/api';

// Test validation
const result = APIValidator.validateRequest(
  { method: 'POST', body: yourData },
  { method: 'POST', bodySchema: packageCreationSchema }
);

if (!result.valid) {
  console.log('Validation errors:', result.errors);
  console.log('Sanitized data:', result.sanitizedData);
}
```

---

### **Issue 3: Authentication Failures**

**Problem:** Getting 401 Unauthorized errors

**Solution:**
```typescript
import { APIAuth } from '@/utils/api';

// Check authentication status
const isAuth = await APIAuth.isAuthenticated();
console.log('Authenticated:', isAuth);

// Get current token
const token = await APIAuth.getToken();
console.log('Token:', token);

// Force token refresh
const newToken = await APIAuth.refreshToken();
console.log('New token:', newToken);
```

---

### **Issue 4: Timeout Errors**

**Problem:** Requests timing out

**Solution:**
```typescript
import { APISecurityMiddleware } from '@/utils/api';

// Increase timeout for specific request
const response = await APISecurityMiddleware.executeRequest({
  url: '/api/slow-endpoint',
  method: 'GET',
  securityConfig: {
    timeout: 120000 // 2 minutes
  }
});
```

---

### **Issue 5: Response Sanitization Removing Needed Data**

**Problem:** Required fields being removed

**Solution:**
```typescript
import { ResponseSanitizer } from '@/utils/api';

// Use whitelist to keep specific fields
const sanitized = ResponseSanitizer.sanitize(data, {
  removeSensitiveFields: false, // Disable auto-removal
  whitelist: [
    'id',
    'tracking_number',
    'status',
    'user.*' // Keep all user fields
  ]
});
```

---

## 📊 MONITORING

### **Enable Development Logging**

Development logging is automatically enabled in `dev` mode:

```typescript
// Console output in development:
// → POST /api/packages
// ← 201 /api/packages
```

### **Production Monitoring**

```typescript
import { APISecurityMiddleware } from '@/utils/api';

// Add production monitoring interceptor
APISecurityMiddleware.registerInterceptor({
  name: 'production-monitor',
  afterResponse: async (response) => {
    // Send metrics to monitoring service
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.track('api_request', {
        endpoint: response.request.url,
        method: response.request.method,
        status: response.status,
        timestamp: response.timestamp
      });
    }
    return response;
  }
});
```

---

## 📚 ADDITIONAL RESOURCES

### **Documentation Files:**
- `TASK_10_COMPLETE.md` - Complete API security documentation
- `src/utils/api/apiValidator.ts` - Request/response validation
- `src/utils/api/apiAuth.ts` - Authentication helpers
- `src/utils/api/requestSigner.ts` - Request signing
- `src/utils/api/responseSanitizer.ts` - Response sanitization
- `src/utils/api/apiSecurityMiddleware.ts` - Security middleware
- `src/utils/api/apiRateLimiter.ts` - Rate limiting

### **Example Components:**
- `src/components/common/ValidatedInput.tsx` - Validated input examples
- `src/components/common/ErrorAlert.tsx` - Error display examples
- `src/hooks/useFormValidation.ts` - Form validation hook

---

## ✅ CHECKLIST

### **Integration Checklist:**
- [ ] Install dependencies (if any)
- [ ] Initialize security layer in app entry
- [ ] Replace fetch calls with secure versions
- [ ] Add form validation to user inputs
- [ ] Add error handlers to components
- [ ] Configure endpoint rate limits
- [ ] Test authentication flow
- [ ] Test validation with invalid data
- [ ] Test rate limiting
- [ ] Test error handling
- [ ] Monitor in production

### **Optional Features:**
- [ ] Enable request signing (requires server support)
- [ ] Add custom interceptors
- [ ] Configure custom sanitization rules
- [ ] Set up production monitoring
- [ ] Integrate with analytics

---

## 🎯 BEST PRACTICES

1. **Always use secure helpers** (`secureGet`, `securePost`, etc.)
2. **Validate forms** before submission
3. **Handle errors** with `useErrorHandler` hook
4. **Configure rate limits** per endpoint sensitivity
5. **Sanitize logs** before sending to monitoring
6. **Test authentication** flow regularly
7. **Monitor rate limit stats** in production
8. **Keep documentation updated** as you add endpoints

---

**Need Help?** Check `TASK_10_COMPLETE.md` for comprehensive documentation!
