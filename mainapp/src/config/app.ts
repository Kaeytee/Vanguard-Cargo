// App configuration - Now fully integrated with Supabase
export const APP_CONFIG = {
  // Legacy mock data flag (application now uses Supabase by default)
  // Only enable for development testing of fallback behavior
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  
  // Legacy API configuration (deprecated - now using Supabase)
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  
  // App environment
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  
  // Debug mode
  debug: import.meta.env.VITE_DEBUG === 'true',
  
  // App metadata
  appName: import.meta.env.VITE_APP_NAME || 'Vanguard Cargo',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Feature flags
  features: {
    enableNotifications: true,
    enableTracking: true,
    enableSupportTickets: true,
    enableAddressAutocomplete: true,
  },
  
  // UI configuration
  ui: {
    itemsPerPage: 10,
    maxSearchHistory: 5,
    defaultTimeout: 10000,
    retryAttempts: 3,
  }
};

// Helper functions
export const isDevelopment = () => APP_CONFIG.environment === 'development';
export const isProduction = () => APP_CONFIG.environment === 'production';
export const shouldUseMockData = () => APP_CONFIG.useMockData;
export const isDebugMode = () => APP_CONFIG.debug;
