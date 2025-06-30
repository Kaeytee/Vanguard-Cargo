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
      () => {
        const newUser: UserProfile = {
          id: 'user' + Date.now(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          country: userData.country,
          address: userData.address,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const authResponse: AuthResponse = {
          token: 'mock-jwt-token-' + Date.now(),
          user: newUser
        };
        
        // Store token in localStorage for mock mode
        localStorage.setItem('authToken', authResponse.token);
        localStorage.setItem('user', JSON.stringify(authResponse.user));
        return authResponse;
      },
      // Real API function
      () => this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      })
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

  // ===== NOTIFICATION SETTINGS ENDPOINTS =====
  
  async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    return this.callApiOrMock(
      // Mock data function
      () => {
        const mockSettings: NotificationSettings = {
          id: 'notif-001',
          userId: 'user-001',
          shipmentUpdates: true,
          deliveryAlerts: true,
          delayNotifications: true,
          marketingNotifications: false,
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
        const updatedSettings: NotificationSettings = {
          id: 'notif-001',
          userId: 'user-001',
          shipmentUpdates: settings.shipmentUpdates ?? true,
          deliveryAlerts: settings.deliveryAlerts ?? true,
          delayNotifications: settings.delayNotifications ?? true,
          marketingNotifications: settings.marketingNotifications ?? false,
          emailNotifications: settings.emailNotifications ?? true,
          smsNotifications: settings.smsNotifications ?? false,
          pushNotifications: settings.pushNotifications ?? true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: new Date().toISOString()
        };
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
