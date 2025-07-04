// Configuration for API vs Mock data
export const APP_CONFIG = {
  // Use mock data by default unless explicitly set to false
  useMockData: import.meta.env.REACT_APP_USE_MOCK_DATA !== 'false',
  
  // API configuration
  apiBaseUrl: import.meta.env.API_BASE_URL || 'http://localhost:8080/api',
  
  // App environment
  environment: import.meta.env.REACT_APP_ENVIRONMENT || 'development',
  
  // Debug mode
  debug: import.meta.env.REACT_APP_DEBUG === 'true',
  
  // App metadata
  appName: import.meta.env.REACT_APP_APP_NAME || 'Ttarius Logistics',
  version: import.meta.env.REACT_APP_VERSION || '1.0.0',
  
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
