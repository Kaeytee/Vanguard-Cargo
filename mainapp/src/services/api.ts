// Simplified API service with automatic mock data toggle
import * as MockData from '../lib/mockShipmentData';
import { shouldUseMockData } from '../config/app';

// Re-export types from mock data for consistency
export type ShipmentData = MockData.MockShipmentData;

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Request types
export interface CreateShipmentRequest {
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  recipientAddress: string;
  originCountry: string;
  originAddress: string;
  packageType: 'DOCUMENT' | 'NON_DOCUMENT';
  deliveryType: 'AIR' | 'GROUND' | 'SEA' | 'EXPRESS';
  packageDescription: string;
  estimatedWeight: string;
  specialInstructions?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Additional API types for user management
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  profileImage?: string;
  emailVerified?: boolean;
  accountStatus?: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'RESTRICTED' | 'BANNED' | 'DORMANT';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  profileImage?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  country: string;
  agreeToMarketing?: boolean; // Marketing communications preference
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface SendVerificationRequest {
  email: string;
}

export interface VerificationResponse {
  message: string;
  success: boolean;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

// Notification settings types
export interface NotificationSettings {
  id: string;
  userId: string;
  shipmentUpdates: boolean;
  deliveryAlerts: boolean;
  delayNotifications: boolean;
  marketingNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationSettingsRequest {
  shipmentUpdates?: boolean;
  deliveryAlerts?: boolean;
  delayNotifications?: boolean;
  marketingNotifications?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
}

// User preferences types
export interface UserPreferences {
  id: string;
  userId: string;
  language: string;
  units: 'metric' | 'imperial';
  autoRefresh: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserPreferencesRequest {
  language?: string;
  units?: 'metric' | 'imperial';
  autoRefresh?: boolean;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  isRead: boolean;
  createdAt: string;
  category: 'shipment' | 'payment' | 'system' | 'security';
  actionUrl?: string;
  userId: string;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  category: 'shipment' | 'payment' | 'system' | 'security';
  actionUrl?: string;
  userId: string;
}

export interface UpdateNotificationRequest {
  isRead?: boolean;
}

// Mock user data for development
const MOCK_USER: UserProfile = {
  id: 'user123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@email.com',
  phone: '+1 (555) 123-4567',
  country: 'United States',
  address: '123 Main St',
  city: 'New York',
  state: 'NY',
  zip: '10001',
  profileImage: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Mock notifications data for development
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Shipment Delivered',
    message: 'Your shipment #SH-2024-001 has been successfully delivered to the destination.',
    type: 'success',
    isRead: false,
    createdAt: '2024-12-30T10:30:00Z',
    category: 'shipment',
    actionUrl: '/app/tracking?id=SH-2024-001',
    userId: 'user123'
  },
  {
    id: 'notif-2',
    title: 'Payment Received',
    message: 'Payment of $450.00 has been confirmed for shipment #SH-2024-002.',
    type: 'success',
    isRead: true,
    createdAt: '2024-12-30T09:15:00Z',
    category: 'payment',
    userId: 'user123'
  },
  {
    id: 'notif-3',
    title: 'Shipment Delayed',
    message: 'Your shipment #SH-2024-003 is experiencing delays due to weather conditions.',
    type: 'warning',
    isRead: false,
    createdAt: '2024-12-30T08:45:00Z',
    category: 'shipment',
    actionUrl: '/app/tracking?id=SH-2024-003',
    userId: 'user123'
  },
  {
    id: 'notif-4',
    title: 'Security Alert',
    message: 'New login detected from a different device. If this wasn\'t you, please change your password.',
    type: 'error',
    isRead: false,
    createdAt: '2024-12-29T20:30:00Z',
    category: 'security',
    actionUrl: '/app/settings',
    userId: 'user123'
  },
  {
    id: 'notif-5',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur on January 1st from 2:00 AM to 4:00 AM EST.',
    type: 'info',
    isRead: true,
    createdAt: '2024-12-29T15:00:00Z',
    category: 'system',
    userId: 'user123'
  }
];

// Keep mock notifications in memory for CRUD operations
let mockNotificationsStore = [...MOCK_NOTIFICATIONS];

// Mock data helpers
const createMockPaginatedResponse = <T>(
  items: T[],
  page: number = 1,
  pageSize: number = 10
): PaginatedResponse<T> => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    total: items.length,
    totalPages: Math.ceil(items.length / pageSize),
    currentPage: page,
    pageSize: pageSize
  };
};

const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message
});

const createErrorResponse = <T>(error: string): ApiResponse<T> => ({
  success: false,
  data: {} as T,
  error
});

// Simulate async delay for mock data
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Simplified API Service Class
class ApiService {
  private apiBaseUrl = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

  // Helper to decide between mock and real API
  private async callApiOrMock<T>(
    mockDataFn: () => T | Promise<T>,
    realApiFn: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> {
    if (shouldUseMockData()) {
      try {
        await mockDelay(); // Simulate network delay
        const mockData = await mockDataFn();
        return createSuccessResponse(mockData);
      } catch (error) {
        return createErrorResponse(error instanceof Error ? error.message : 'Mock data error');
      }
    }
    
    try {
      return await realApiFn();
    } catch (error) {
      console.warn('Real API failed, falling back to mock data:', error);
      try {
        const mockData = await mockDataFn();
        return createSuccessResponse(mockData, 'Using mock data due to API unavailability');
      } catch {
        return createErrorResponse('Both API and mock data failed');
      }
    }
  }

  // Real API request helper
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }

    return createSuccessResponse(data.data || data, data.message);
  }

  // ===== SHIPMENT ENDPOINTS =====
  
  async getUserShipments(
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string
  ): Promise<ApiResponse<PaginatedResponse<ShipmentData>>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        let filteredShipments = [...MockData.MOCK_SHIPMENTS];
        
        // Apply status filter
        if (status && status !== 'all') {
          filteredShipments = filteredShipments.filter(s => s.status === status);
        }
        
        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          filteredShipments = filteredShipments.filter(s =>
            s.id.toLowerCase().includes(searchLower) ||
            s.recipient.toLowerCase().includes(searchLower) ||
            s.destination.toLowerCase().includes(searchLower)
          );
        }
        
        return createMockPaginatedResponse(filteredShipments, page, limit);
      },
      // Real API function
      () => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(status && { status }),
          ...(search && { search }),
        });
        return this.request<PaginatedResponse<ShipmentData>>(`/shipments?${params}`);
      }
    );
  }

  async getShipmentById(id: string): Promise<ApiResponse<ShipmentData>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        const shipment = MockData.MOCK_SHIPMENTS.find(s => s.id === id);
        if (!shipment) {
          throw new Error(`Shipment with ID ${id} not found`);
        }
        return shipment;
      },
      // Real API function
      () => this.request<ShipmentData>(`/shipments/${id}`)
    );
  }

  async trackShipment(trackingId: string): Promise<ApiResponse<ShipmentData>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        const shipment = MockData.MOCK_SHIPMENTS.find(s => s.id === trackingId);
        if (!shipment) {
          throw new Error(`No shipment found with tracking ID: ${trackingId}`);
        }
        return shipment;
      },
      // Real API function
      () => this.request<ShipmentData>(`/tracking/${trackingId}`)
    );
  }

  async createShipmentRequest(shipmentData: CreateShipmentRequest): Promise<ApiResponse<ShipmentData>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        // Create a mock shipment response
        const newShipment: ShipmentData = {
          id: `SHIP${Math.floor(Math.random() * 9999)}`,
          date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          destination: shipmentData.recipientAddress,
          recipient: shipmentData.recipientName,
          type: shipmentData.packageType === 'DOCUMENT' ? 'Document' : 'Package',
          status: 'pending',
          origin: `${shipmentData.originCountry}, ${shipmentData.originAddress}`,
          weight: shipmentData.estimatedWeight,
          service: shipmentData.deliveryType === 'EXPRESS' ? 'International Express' : 'Standard',
          recipientDetails: {
            name: shipmentData.recipientName,
            phone: shipmentData.recipientPhone,
            email: shipmentData.recipientEmail,
            address: shipmentData.recipientAddress
          },
          warehouseDetails: {
            name: "Ttarius Logistics Warehouse",
            phone: "+1 (555) 123-4567",
            email: "warehouse@ttariuslogistics.com",
            address: "123 Warehouse Street, City, Country"
          },
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          created: new Date().toISOString()
        };
        
        return newShipment;
      },
      // Real API function
      () => this.request<ShipmentData>('/shipments', {
        method: 'POST',
        body: JSON.stringify(shipmentData),
      })
    );
  }

  // ===== USER PROFILE ENDPOINTS =====
  
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        return MOCK_USER;
      },
      // Real API function
      () => this.request<UserProfile>('/user/profile')
    );
  }

  async updateUserProfile(profileData: UpdateUserProfileRequest): Promise<ApiResponse<UserProfile>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        const updatedUser: UserProfile = {
          ...MOCK_USER,
          ...profileData,
          updatedAt: new Date().toISOString()
        };
        return updatedUser;
      },
      // Real API function
      () => this.request<UserProfile>('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      })
    );
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        // Simulate password change validation
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (passwordData.newPassword.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
        // Mock success - no data returned for password change
        return undefined as void;
      },
      // Real API function
      () => this.request<void>('/user/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      })
    );
  }

  // ===== AUTHENTICATION ENDPOINTS =====
  
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        // Simple mock validation
        if (email === 'test@example.com' && password === 'password') {
          const authResponse: AuthResponse = {
            token: 'mock-jwt-token-' + Date.now(),
            user: MOCK_USER
          };
          // Store token in localStorage for mock mode
          localStorage.setItem('authToken', authResponse.token);
          localStorage.setItem('user', JSON.stringify(authResponse.user));
          return authResponse;
        } else {
          throw new Error('Invalid email or password');
        }
      },
      // Real API function
      () => this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
    );
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.callApiOrMock(
      // Mock data function
      async () => {
        const newUser: UserProfile = {
          id: 'user' + Date.now(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          country: userData.country,
          address: userData.address,
          emailVerified: false, // New users start unverified
          accountStatus: 'PENDING_VERIFICATION', // Account requires verification
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const authResponse: AuthResponse = {
          token: 'mock-jwt-token-' + Date.now(),
          user: newUser
        };
        
        // Store token and user in localStorage for mock mode
        localStorage.setItem('authToken', authResponse.token);
        localStorage.setItem('user', JSON.stringify(authResponse.user));
        
        // Store initial notification preferences based on marketing agreement
        const initialNotificationSettings: NotificationSettings = {
          id: 'notif-' + Date.now(),
          userId: newUser.id,
          shipmentUpdates: true, // Always enabled for logistics
          deliveryAlerts: true, // Always enabled for logistics
          delayNotifications: true, // Always enabled for logistics
          marketingNotifications: userData.agreeToMarketing ?? false, // Based on registration choice
          emailNotifications: true, // Default enabled
          smsNotifications: false, // Default disabled
          pushNotifications: true, // Default enabled
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Store notification settings for the new user
        localStorage.setItem(`notificationSettings_${newUser.id}`, JSON.stringify(initialNotificationSettings));
        
        // Automatically send verification email
        await this.sendVerificationEmail(userData.email);
        
        return authResponse;
      },
      // Real API function
      async () => {
        const result = await this.request<AuthResponse>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(userData),
        });
        
        // After successful registration, send verification email
        if (result.success && result.data?.user?.email) {
          await this.sendVerificationEmail(result.data.user.email);
        }
        
        return result;
      }
    );
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        // Clear localStorage for mock mode
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        return undefined as void;
      },
      // Real API function
      async () => {
        const result = await this.request<void>('/auth/logout', {
          method: 'POST',
        });
        // Clear localStorage regardless of API response
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        return result;
      }
    );
  }

  async forgotPassword(email: string): Promise<ApiResponse<ForgotPasswordResponse>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        // Mock validation - simulate sending reset code
        const mockResponse: ForgotPasswordResponse = {
          message: 'A verification code has been sent to your email address.',
          success: true
        };
        // Store the email temporarily for mock verification
        localStorage.setItem('resetEmail', email);
        return mockResponse;
      },
      // Real API function
      () => this.request<ForgotPasswordResponse>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
    );
  }

  async verifyResetCode(email: string, code: string): Promise<ApiResponse<ForgotPasswordResponse>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        const storedEmail = localStorage.getItem('resetEmail');
        // Mock validation - accept any 5-digit code except '99999' for testing
        if (email === storedEmail && code.length === 5 && code !== '99999') {
          const mockResponse: ForgotPasswordResponse = {
            message: 'Verification code is valid.',
            success: true
          };
          // Store verified status
          localStorage.setItem('resetCodeVerified', 'true');
          return mockResponse;
        } else {
          throw new Error('Invalid verification code. Please try again.');
        }
      },
      // Real API function
      () => this.request<ForgotPasswordResponse>('/auth/verify-reset-code', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      })
    );
  }

  async resetPassword(email: string, code: string, newPassword: string, confirmPassword: string): Promise<ApiResponse<ForgotPasswordResponse>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        const storedEmail = localStorage.getItem('resetEmail');
        const codeVerified = localStorage.getItem('resetCodeVerified');
        
        // Validate input
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        if (newPassword.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
        
        if (email === storedEmail && codeVerified === 'true') {
          const mockResponse: ForgotPasswordResponse = {
            message: 'Your password has been successfully reset.',
            success: true
          };
          // Clean up temporary data
          localStorage.removeItem('resetEmail');
          localStorage.removeItem('resetCodeVerified');
          return mockResponse;
        } else {
          throw new Error('Invalid reset request. Please start the process again.');
        }
      },
      // Real API function
      () => this.request<ForgotPasswordResponse>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, code, newPassword, confirmPassword }),
      })
    );
  }

  // ===== EMAIL VERIFICATION ENDPOINTS =====

  async sendVerificationEmail(email: string): Promise<ApiResponse<VerificationResponse>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        // Store the email temporarily for mock verification
        localStorage.setItem('verificationEmail', email);
        // Generate a mock verification token
        const mockToken = `mock-verification-token-${Date.now()}`;
        localStorage.setItem('verificationToken', mockToken);
        
        const mockResponse: VerificationResponse = {
          message: 'Verification email sent successfully. Please check your inbox.',
          success: true
        };
        return mockResponse;
      },
      // Real API function
      () => this.request<VerificationResponse>('/auth/send-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
    );
  }

  async verifyEmail(token: string): Promise<ApiResponse<VerificationResponse>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        const storedToken = localStorage.getItem('verificationToken');
        const verificationEmail = localStorage.getItem('verificationEmail');
        
        if (token === storedToken && verificationEmail) {
          // Mark user as verified in localStorage
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user.email === verificationEmail) {
            user.emailVerified = true;
            user.accountStatus = 'ACTIVE';
            localStorage.setItem('user', JSON.stringify(user));
          }
          
          // Clean up verification data
          localStorage.removeItem('verificationEmail');
          localStorage.removeItem('verificationToken');
          
          const mockResponse: VerificationResponse = {
            message: 'Email verified successfully! Your account is now active.',
            success: true
          };
          return mockResponse;
        } else {
          throw new Error('Invalid or expired verification token.');
        }
      },
      // Real API function
      () => this.request<VerificationResponse>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      })
    );
  }

  async resendVerificationEmail(email: string): Promise<ApiResponse<VerificationResponse>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        // Generate a new mock verification token
        const mockToken = `mock-verification-token-${Date.now()}`;
        localStorage.setItem('verificationToken', mockToken);
        localStorage.setItem('verificationEmail', email);
        
        const mockResponse: VerificationResponse = {
          message: 'Verification email resent successfully. Please check your inbox.',
          success: true
        };
        return mockResponse;
      },
      // Real API function
      () => this.request<VerificationResponse>('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
    );
  }

  // ===== NOTIFICATION SETTINGS ENDPOINTS =====
  
  async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        // Try to get user-specific settings first
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userSettingsKey = `notificationSettings_${user.id}`;
        const storedSettings = localStorage.getItem(userSettingsKey);
        
        if (storedSettings) {
          return JSON.parse(storedSettings);
        }
        
        // Fallback to default settings
        const mockSettings: NotificationSettings = {
          id: 'notif-001',
          userId: user.id || 'user-001',
          shipmentUpdates: true,
          deliveryAlerts: true,
          delayNotifications: true,
          marketingNotifications: false, // Default to false if no preference stored
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        };
        return mockSettings;
      },
      // Real API function
      async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${this.apiBaseUrl}/notifications/settings`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      }
    );
  }

  async updateNotificationSettings(settings: UpdateNotificationSettingsRequest): Promise<ApiResponse<NotificationSettings>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        // Get current user and their settings
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userSettingsKey = `notificationSettings_${user.id}`;
        const currentSettings = JSON.parse(localStorage.getItem(userSettingsKey) || '{}');
        
        const updatedSettings: NotificationSettings = {
          id: currentSettings.id || 'notif-001',
          userId: user.id || 'user-001',
          shipmentUpdates: settings.shipmentUpdates ?? currentSettings.shipmentUpdates ?? true,
          deliveryAlerts: settings.deliveryAlerts ?? currentSettings.deliveryAlerts ?? true,
          delayNotifications: settings.delayNotifications ?? currentSettings.delayNotifications ?? true,
          marketingNotifications: settings.marketingNotifications ?? currentSettings.marketingNotifications ?? false,
          emailNotifications: settings.emailNotifications ?? currentSettings.emailNotifications ?? true,
          smsNotifications: settings.smsNotifications ?? currentSettings.smsNotifications ?? false,
          pushNotifications: settings.pushNotifications ?? currentSettings.pushNotifications ?? true,
          createdAt: currentSettings.createdAt || '2024-01-01T00:00:00Z',
          updatedAt: new Date().toISOString()
        };
        
        // Persist the updated settings
        localStorage.setItem(userSettingsKey, JSON.stringify(updatedSettings));
        
        return updatedSettings;
      },
      // Real API function
      async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${this.apiBaseUrl}/notifications/settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(settings),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      }
    );
  }

  // ===== USER PREFERENCES ENDPOINTS =====
  
  async getUserPreferences(): Promise<ApiResponse<UserPreferences>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        const mockPreferences: UserPreferences = {
          id: 'pref-001',
          userId: 'user-001',
          language: 'en',
          units: 'imperial',
          autoRefresh: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        };
        return mockPreferences;
      },
      // Real API function
      async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${this.apiBaseUrl}/preferences`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      }
    );
  }

  async updateUserPreferences(preferences: UpdateUserPreferencesRequest): Promise<ApiResponse<UserPreferences>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        const updatedPreferences: UserPreferences = {
          id: 'pref-001',
          userId: 'user-001',
          language: preferences.language ?? 'en',
          units: preferences.units ?? 'imperial',
          autoRefresh: preferences.autoRefresh ?? true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: new Date().toISOString()
        };
        return updatedPreferences;
      },
      // Real API function
      async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${this.apiBaseUrl}/preferences`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(preferences),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      }
    );
  }

  // ===== NOTIFICATION METHODS =====
  
  async getNotifications(
    page: number = 1,
    pageSize: number = 10,
    filter?: 'all' | 'unread' | 'read',
    category?: 'all' | 'shipment' | 'payment' | 'system' | 'security'
  ): Promise<ApiResponse<PaginatedResponse<Notification>>> {
    return this.callApiOrMock(
      () => {
        let filteredNotifications = [...mockNotificationsStore];
        
        // Apply read/unread filter
        if (filter === 'read') {
          filteredNotifications = filteredNotifications.filter(n => n.isRead);
        } else if (filter === 'unread') {
          filteredNotifications = filteredNotifications.filter(n => !n.isRead);
        }
        
        // Apply category filter
        if (category && category !== 'all') {
          filteredNotifications = filteredNotifications.filter(n => n.category === category);
        }
        
        // Sort by creation date (newest first)
        filteredNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return createMockPaginatedResponse(filteredNotifications, page, pageSize);
      },
      async () => {
        const token = localStorage.getItem('authToken');
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          ...(filter && filter !== 'all' && { filter }),
          ...(category && category !== 'all' && { category })
        });
        
        const response = await fetch(`${this.apiBaseUrl}/notifications?${params}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      }
    );
  }

  async getUnreadNotifications(limit: number = 5): Promise<ApiResponse<Notification[]>> {
    return this.callApiOrMock(
      () => {
        const unreadNotifications = mockNotificationsStore
          .filter(n => !n.isRead)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
        return unreadNotifications;
      },
      async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${this.apiBaseUrl}/notifications/unread?limit=${limit}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      }
    );
  }

  async getNotificationStats(): Promise<ApiResponse<{ total: number; unread: number; }>> {
    return this.callApiOrMock(
      () => {
        const total = mockNotificationsStore.length;
        const unread = mockNotificationsStore.filter(n => !n.isRead).length;
        return { total, unread };
      },
      async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${this.apiBaseUrl}/notifications/stats`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      }
    );
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    return this.callApiOrMock(
      () => {
        const notificationIndex = mockNotificationsStore.findIndex(n => n.id === notificationId);
        if (notificationIndex === -1) {
          throw new Error('Notification not found');
        }
        
        mockNotificationsStore[notificationIndex] = {
          ...mockNotificationsStore[notificationIndex],
          isRead: true
        };
        
        return mockNotificationsStore[notificationIndex];
      },
      async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${this.apiBaseUrl}/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      }
    );
  }

  async markNotificationAsUnread(notificationId: string): Promise<ApiResponse<Notification>> {
    return this.callApiOrMock(
      () => {
        const notificationIndex = mockNotificationsStore.findIndex(n => n.id === notificationId);
        if (notificationIndex === -1) {
          throw new Error('Notification not found');
        }
        
        mockNotificationsStore[notificationIndex] = {
          ...mockNotificationsStore[notificationIndex],
          isRead: false
        };
        
        return mockNotificationsStore[notificationIndex];
      },
      async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${this.apiBaseUrl}/notifications/${notificationId}/unread`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      }
    );
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    return this.callApiOrMock(
      () => {
        const notificationIndex = mockNotificationsStore.findIndex(n => n.id === notificationId);
        if (notificationIndex === -1) {
          throw new Error('Notification not found');
        }
        
        mockNotificationsStore.splice(notificationIndex, 1);
        return undefined as void;
      },
      async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${this.apiBaseUrl}/notifications/${notificationId}`, {
          method: 'DELETE',
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      }
    );
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return this.callApiOrMock(
      () => {
        mockNotificationsStore = mockNotificationsStore.map(n => ({
          ...n,
          isRead: true
        }));
        return undefined as void;
      },
      async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${this.apiBaseUrl}/notifications/mark-all-read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      }
    );
  }

  // ===== UTILITY FUNCTIONS =====
  
  // Check if currently using mock data
  isUsingMockData(): boolean {
    return shouldUseMockData();
  }
  
  // Get configuration info
  getConfigInfo() {
    return {
      useMockData: shouldUseMockData(),
      apiBaseUrl: this.apiBaseUrl,
      environment: import.meta.env.REACT_APP_ENVIRONMENT || 'development'
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export utility functions
export const isUsingMockData = () => apiService.isUsingMockData();
export const getApiConfig = () => apiService.getConfigInfo();
