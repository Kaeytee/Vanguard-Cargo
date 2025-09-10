# Vanguard Cargo - Client Application

A comprehensive logistics management platform built with React, TypeScript, and Vite, featuring complete customer account management, shipment tracking, and cross-border warehouse integration.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## 📋 Overview

This client application provides a complete logistics management solution for customers to:
- Create and manage accounts with status-based access controls
- Submit and track shipment requests
- View shipment history and real-time tracking
- Manage account settings and preferences
- Access customer support and appeals system

## 🏗️ Project Architecture

```
mainapp/
├── public/                 # Static assets
├── src/
│   ├── app/               # App-specific modules
│   │   ├── dashboard/     # Dashboard components
│   │   ├── profile/       # Profile management
│   │   ├── settings/      # Account settings
│   │   ├── shipmentHistory/ # Shipment history
│   │   ├── submitShipment/  # Shipment submission
│   │   └── support/       # Customer support
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base UI components
│   │   ├── settings/     # Settings components
│   │   └── support/      # Support components
│   ├── context/          # React contexts
│   │   ├── AuthProvider.tsx    # Authentication context
│   │   └── ThemeProvider.tsx   # Theme management
│   ├── hooks/            # Custom hooks
│   ├── landing/          # Landing page components
│   │   ├── home/         # Home page
│   │   ├── about/        # About page
│   │   ├── contact/      # Contact page
│   │   └── forgot-password/ # Password reset
│   ├── lib/              # Utilities and configurations
│   └── images/           # Image assets
└── docs/                 # Documentation
```

## 🔐 Authentication & Account Management

### Account Status System

The application implements a comprehensive account status management system:

**Account Statuses:**
- `active` - Full access to all features
- `suspended` - Limited access, can view history and appeal
- `pending_verification` - Awaiting document verification
- `restricted` - Limited functionality due to compliance issues
- `closed` - Account terminated, read-only access

### Status-Based Route Protection

```typescript
// Route guards based on account status
const protectedRoutes = {
  active: ['dashboard', 'submit', 'history', 'track', 'settings', 'support'],
  suspended: ['history', 'track', 'support', 'appeal'],
  pending_verification: ['dashboard', 'history', 'track', 'settings', 'upload-docs'],
  restricted: ['dashboard', 'history', 'track', 'support'],
  closed: ['history', 'support']
};
```

## 📱 User Flows & Integration Points

### 1. Account Creation Flow

**Frontend Components:**
- `RegisterForm` - User registration with comprehensive data collection
- `EmailVerification` - Email verification process
- `DocumentUpload` - KYC document submission

**Backend Integration:**
```typescript
// Registration API
POST /api/auth/register
{
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string,
  address: {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
  },
  businessInfo?: {
    companyName: string,
    businessType: string,
    taxId: string
  }
}
```

### 2. Login & Authentication Flow

**Frontend Components:**
- `LoginForm` - User authentication
- `TwoFactorAuth` - 2FA verification (if enabled)
- `ProtectedRoute` - Route protection based on auth status

**Backend Integration:**
```typescript
// Login API
POST /api/auth/login
{
  email: string,
  password: string,
  twoFactorToken?: string
}

// Response includes account status for route protection
{
  token: string,
  user: UserProfile,
  accountStatus: AccountStatus,
  permissions: string[]
}
```

### 3. Password Reset Flow

**Frontend Components:**
- `ForgotPasswordForm` - Email submission
- `ResetPasswordForm` - New password setup
- `PasswordResetSuccess` - Confirmation page

**Backend Integration:**
```typescript
// Password reset request
POST /api/auth/forgot-password
{ email: string }

// Password reset confirmation
POST /api/auth/reset-password
{
  token: string,
  newPassword: string
}
```

### 4. Dashboard & Account Status Integration

**Frontend Components:**
- `Dashboard` - Main dashboard with status-aware content
- `AccountStatusBanner` - Status notifications and actions
- `QuickActions` - Status-based action buttons

**Status-Based Dashboard Variants:**
```typescript
// Dashboard content based on account status
const DashboardContent = {
  active: <ActiveDashboard />,
  suspended: <SuspendedDashboard />,
  pending_verification: <PendingVerificationDashboard />,
  restricted: <RestrictedDashboard />,
  closed: <ClosedAccountDashboard />
};
```

### 5. Package Request Submission Flow

**Frontend Components:**
- `PackageOriginForm` - Origin details and sender information
- `PackageForm` - Package details and recipient information
- `ConfirmForm` - Review and confirmation
- `StepIndicator` - Multi-step form progress

**Backend Integration:**
```typescript
// Package request submission
POST /api/shipments/request
{
  origin: {
    senderName: string,
    senderPhone: string,
    senderEmail: string,
    address: AddressData,
    pickupDate: string,
    pickupTime: string
  },
  destination: {
    recipientName: string,
    recipientPhone: string,
    recipientEmail: string,
    address: AddressData
  },
  packages: PackageData[],
  serviceType: 'standard' | 'express' | 'overnight',
  specialInstructions?: string
}
```

### 6. Shipment History & Tracking

**Frontend Components:**
- `ShipmentHistory` - Complete shipment history with filtering
- `TrackingDetails` - Real-time tracking information
- `TrackingTimeline` - Visual tracking progress

**Backend Integration:**
```typescript
// Get shipment history
GET /api/shipments/history?page=1&limit=20&status=all&dateRange=30days

// Real-time tracking
GET /api/shipments/track/:trackingNumber
WebSocket: /ws/tracking/:trackingNumber
```

### 7. Account Settings & Preferences

**Frontend Components:**
- `ProfileSettings` - Personal information management
- `SecuritySettings` - Password and 2FA management
- `NotificationSettings` - Communication preferences
- `AddressBook` - Saved addresses management
- `ProfilePicture` - User avatar management with default fallback

**Backend Integration:**
```typescript
// Update profile
PUT /api/user/profile
{
  firstName: string,
  lastName: string,
  phone: string,
  addresses: AddressData[],
  preferences: UserPreferences
}

// Security settings
POST /api/user/enable-2fa
PUT /api/user/change-password
```

### 8. Customer Support & Appeals

**Frontend Components:**
- `SupportTickets` - Support ticket management
- `LiveChat` - Real-time support chat
- `AppealForm` - Account status appeal submission
- `FAQSection` - Self-service help

**Backend Integration:**
```typescript
// Support ticket creation
POST /api/support/tickets
{
  subject: string,
  description: string,
  category: string,
  priority: 'low' | 'medium' | 'high',
  attachments?: File[]
}

// Account appeal
POST /api/account/appeal
{
  reason: string,
  evidence: string,
  documents: File[]
}
```

## 🔄 Real-Time Features

### WebSocket Integration

```typescript
// Real-time notifications
const useNotifications = () => {
  useEffect(() => {
    const ws = new WebSocket('/ws/notifications');
    
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      handleNotification(notification);
    };
    
    return () => ws.close();
  }, []);
};

// Real-time tracking updates
const useTrackingUpdates = (trackingNumber: string) => {
  useEffect(() => {
    const ws = new WebSocket(`/ws/tracking/${trackingNumber}`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setTrackingData(update);
    };
    
    return () => ws.close();
  }, [trackingNumber]);
};
```

## 🛡️ Security & Compliance

### reCAPTCHA Integration

The application implements Google reCAPTCHA v2 to protect against automated bot access, particularly on the login page.

```typescript
// reCAPTCHA Configuration
export const recaptchaConfig = {
  // Site key from environment variables
  siteKey: getEnvVariable('REACT_APP_RECAPTCHA_SITE_KEY') || 
    (isProduction ? "" : "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"),
  size: "normal" as "normal" | "compact" | "invisible",
  theme: "light" as "light" | "dark",
};

// Login form with reCAPTCHA
const LoginForm = () => {
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  
  const handleCaptchaChange = (value: string | null) => {
    setCaptchaValue(value);
    setFormErrors(prev => ({ ...prev, captcha: !value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate reCAPTCHA before submission
    if (!captchaValue) {
      setFormErrors(prev => ({ ...prev, captcha: true }));
      return;
    }
    
    // Send login request with reCAPTCHA token
    const response = await apiService.login(email, password, captchaValue);
    // Handle response...
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Email and password fields */}
      <ReCAPTCHA
        sitekey={recaptchaConfig.siteKey}
        onChange={handleCaptchaChange}
        theme={recaptchaConfig.theme}
        size={recaptchaConfig.size}
      />
      <button type="submit" disabled={!captchaValue}>
        Login
      </button>
    </form>
  );
};
```

### JWT Token Management

```typescript
// Token refresh logic
const useTokenRefresh = () => {
  useEffect(() => {
    const refreshToken = async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });
        
        if (response.ok) {
          const { token } = await response.json();
          localStorage.setItem('authToken', token);
        }
      } catch (error) {
        // Handle token refresh failure
        logout();
      }
    };
    
    // Set up automatic token refresh
    const interval = setInterval(refreshToken, 15 * 60 * 1000); // 15 minutes
    
    return () => clearInterval(interval);
  }, []);
};
```

### Data Validation

```typescript
// Form validation schemas
const packageRequestSchema = z.object({
  origin: z.object({
    senderName: z.string().min(2, 'Name must be at least 2 characters'),
    senderPhone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number'),
    senderEmail: z.string().email('Invalid email address'),
    address: addressSchema
  }),
  destination: z.object({
    recipientName: z.string().min(2, 'Name must be at least 2 characters'),
    recipientPhone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number'),
    recipientEmail: z.string().email('Invalid email address'),
    address: addressSchema
  }),
  packages: z.array(packageSchema).min(1, 'At least one package is required')
});
```

## 🎨 UI Components & Features

### Default Profile Picture System

The application implements a robust profile picture management system with a default fallback avatar to ensure consistent UI across the application.

```typescript
// Default avatar SVG component
// Located at: /src/assets/default-avatar.svg
// A custom SVG with brand colors is used instead of external services for reliability

// Implementation in components (AppNavbar.tsx, Sidebar.tsx)
import defaultAvatar from '../assets/default-avatar.svg';

const UserAvatar = ({ user }: { user: UserProfile }) => {
  const userData = user || {
    name: "Guest User",
    email: "guest@example.com",
    image: "",
  };
  
  return (
    <div className="avatar-container">
      <img
        src={userData.image || defaultAvatar}
        alt={`${userData.name}'s Avatar`}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to default avatar on image load error
          const target = e.target as HTMLImageElement;
          target.src = defaultAvatar;
        }}
      />
      <div className="user-info">
        <h4 className="user-name">{userData.name}</h4>
        <p className="user-email">{userData.email}</p>
      </div>
    </div>
  );
};
```

The default avatar system follows these principles:

1. **Reliability**: Uses local SVG asset instead of external services
2. **Consistency**: Same default avatar appears across all components
3. **Performance**: Lightweight SVG optimized for fast loading
4. **Error Handling**: Graceful fallback if user's custom image fails to load
5. **Accessibility**: Proper alt text and semantic HTML

## 📊 State Management

### Context Providers

```typescript
// Auth Context
interface AuthContextType {
  user: User | null;
  accountStatus: AccountStatus;
  permissions: string[];
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// Shipment Context
interface ShipmentContextType {
  currentRequest: ShipmentRequest | null;
  updateRequest: (data: Partial<ShipmentRequest>) => void;
  submitRequest: () => Promise<void>;
  clearRequest: () => void;
}
```

## 🧪 Testing Strategy

### Component Testing

```typescript
// Example component test
describe('PackageForm', () => {
  it('should validate package dimensions', async () => {
    render(<PackageForm onNext={mockOnNext} />);
    
    // Test form validation
    fireEvent.change(screen.getByLabelText('Length'), { target: { value: '-1' } });
    fireEvent.click(screen.getByText('Next'));
    
    expect(screen.getByText('Length must be positive')).toBeInTheDocument();
  });
  
  it('should calculate shipping cost correctly', async () => {
    render(<PackageForm onNext={mockOnNext} />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText('Weight'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Length'), { target: { value: '10' } });
    
    // Verify cost calculation
    await waitFor(() => {
      expect(screen.getByText(/Estimated Cost: \$\d+/)).toBeInTheDocument();
    });
  });
});
```

### Integration Testing

```typescript
// API integration tests
describe('Authentication Flow', () => {
  it('should handle complete login flow', async () => {
    // Mock API responses
    mockApi.post('/api/auth/login').reply(200, {
      token: 'mock-token',
      user: mockUser,
      accountStatus: 'active'
    });
    
    render(<LoginForm />);
    
    // Simulate user login
    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'user@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Password'), { 
      target: { value: 'password123' } 
    });
    fireEvent.click(screen.getByText('Login'));
    
    // Verify successful login
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
```

## 🚀 Deployment & Configuration

### Environment Variables

```bash
# .env.production
VITE_API_BASE_URL=https://api.Vanguard.com
VITE_WS_URL=wss://api.Vanguard.com/ws
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_GOOGLE_MAPS_API_KEY=...
```

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          'utils-vendor': ['date-fns', 'zod', 'react-hook-form']
        }
      }
    }
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});
```

## 📋 Implementation Checklist

### Phase 1: Core Authentication (Week 1-2)
- [ ] Set up authentication context and providers
- [ ] Implement login/register forms with validation
- [ ] Create password reset flow
- [ ] Add JWT token management
- [ ] Implement route protection
- [ ] Add account status integration

### Phase 2: Dashboard & Navigation (Week 2-3)
- [ ] Create status-aware dashboard components
- [ ] Implement navigation with permission checks
- [ ] Add account status banners and notifications
- [ ] Create user profile management
- [ ] Add quick action buttons

### Phase 3: Package Request System (Week 3-4)
- [ ] Build multi-step package request form
- [ ] Implement form validation and data persistence
- [ ] Add address book integration
- [ ] Create cost calculation logic
- [ ] Add file upload for package photos

### Phase 4: Tracking & History (Week 4-5)
- [ ] Implement shipment history with filtering
- [ ] Create real-time tracking components
- [ ] Add tracking timeline visualization
- [ ] Implement WebSocket for live updates
- [ ] Add export functionality for history

### Phase 5: Settings & Support (Week 5-6)
- [ ] Build comprehensive settings pages
- [ ] Implement 2FA setup and management
- [ ] Create support ticket system
- [ ] Add live chat integration
- [ ] Build appeal submission form

### Phase 6: Advanced Features (Week 6-7)
- [ ] Add push notifications
- [ ] Implement offline support
- [ ] Add data export features
- [ ] Create analytics dashboard
- [ ] Add accessibility improvements

### Phase 7: Testing & Optimization (Week 7-8)
- [ ] Write comprehensive unit tests
- [ ] Add integration tests for critical flows
- [ ] Implement end-to-end testing
- [ ] Performance optimization
- [ ] Security audit and fixes

## 🔧 Development Tools

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- Husky for pre-commit hooks
- TypeScript for type safety

### Testing
- Vitest for unit testing
- React Testing Library for component testing
- MSW for API mocking
- Playwright for E2E testing

### Development
- Vite for fast development and building
- Tailwind CSS for styling
- Radix UI for accessible components
- React Hook Form for form management

## ⚙️ ESLint Configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## 📚 Additional Resources

- [Backend API Documentation](./clientapp.md) - Complete backend integration guide
- [Component Documentation](./src/components/README.md) - UI component library
- [Testing Guide](./docs/testing.md) - Testing strategies and examples
- [Deployment Guide](./docs/deployment.md) - Production deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Note**: This README provides the complete frontend implementation guide for the Vanguard Cargo client application. For detailed backend integration information, refer to the [clientapp.md](./clientapp.md) documentation.
