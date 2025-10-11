// ============================================================================
// API Security Configuration
// ============================================================================
// Description: Centralized configuration for API security layer
// Author: Senior Software Engineer
// Purpose: Initialize and configure all API security components
// Usage: Call initializeAPISecurity() on app startup
// ============================================================================

import { 
  APISecurityMiddleware,
  RequestSigner,
  type SecurityConfig
} from '@/utils/api';
// APIRateLimiter disabled for client app - not needed
import { errorLogger } from '@/utils/errors/ErrorLogger';

/**
 * API Security Configuration Options
 */
export interface APISecurityOptions {
  /** Enable request validation */
  enableValidation?: boolean;
  
  /** Enable request signing */
  enableSigning?: boolean;
  
  /** Signing secret key */
  signingKey?: string;
  
  /** Enable rate limiting */
  enableRateLimit?: boolean;
  
  /** Enable response sanitization */
  enableSanitization?: boolean;
  
  /** Custom security config */
  customConfig?: Partial<SecurityConfig>;
}

/**
 * Default security configuration
 */
const DEFAULT_OPTIONS: APISecurityOptions = {
  enableValidation: true,
  enableSigning: false, // Disabled by default (requires setup)
  enableRateLimit: false, // Disabled - client app doesn't need per-endpoint rate limiting
  enableSanitization: true
};

/**
 * Initialize API Security Layer
{{ ... }}
 * 
 * Sets up all security components for the application.
 * Call this function once during app initialization.
 * 
 * @param {APISecurityOptions} options - Configuration options
 * 
 * @example
 * ```typescript
 * // Basic initialization
 * initializeAPISecurity();
 * 
 * // With custom options
 * initializeAPISecurity({
 *   enableSigning: true,
 *   signingKey: process.env.REACT_APP_SIGNING_KEY
 * });
 * ```
 */
export function initializeAPISecurity(options: APISecurityOptions = {}): void {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    console.log('🔒 Initializing API Security Layer...');
    
    // ========================================================================
    // 1. CONFIGURE SECURITY MIDDLEWARE
    // ========================================================================
    
    const middlewareConfig: Partial<SecurityConfig> = {
      validateRequests: config.enableValidation,
      validateResponses: config.enableValidation,
      signRequests: config.enableSigning,
      sanitizeResponses: config.enableSanitization,
      requireAuth: true,
      enableRateLimit: config.enableRateLimit,
      timeout: 30000, // 30 seconds
      retry: {
        maxRetries: 3,
        retryDelay: 1000,
        retryableStatuses: [408, 429, 500, 502, 503, 504]
      },
      ...config.customConfig
    };
    
    APISecurityMiddleware.configure(middlewareConfig);
    console.log('  ✅ Security middleware configured');
    
    // ========================================================================
    // 2. INITIALIZE RATE LIMITER
    // ========================================================================
    
    if (config.enableRateLimit) {
      // Note: API rate limiting disabled for client app
      console.log('  ⚠️  Rate limiter disabled (not needed for client app)');
    }
    
    // ========================================================================
    // 3. INITIALIZE REQUEST SIGNER
    // ========================================================================
    
    if (config.enableSigning) {
      if (!config.signingKey || config.signingKey.length < 32) {
        console.warn('  ⚠️  Request signing enabled but secret key is missing or too short');
        console.warn('     Request signing will be disabled');
        
        // Disable signing in middleware
        APISecurityMiddleware.configure({
          signRequests: false
        });
      } else {
        RequestSigner.initialize({
          secretKey: config.signingKey,
          timestampTolerance: 5 * 60 * 1000, // 5 minutes
          includeBody: true
        });
        
        console.log('  ✅ Request signing initialized');
      }
    }
    
    // ========================================================================
    // 4. REGISTER INTERCEPTORS
    // ========================================================================
    
    // Logging interceptor (development only)
    if (import.meta.env.DEV) {
      APISecurityMiddleware.registerInterceptor({
        name: 'dev-logger',
        beforeRequest: async (context) => {
          console.log(`→ ${context.method} ${context.url}`);
          return context;
        },
        afterResponse: async (response) => {
          console.log(`← ${response.status} ${response.request.url}`);
          return response;
        },
        onError: async (error, context) => {
          console.error(`✗ ${context.method} ${context.url}:`, error.message);
        }
      });
    }
    
    // Error logging interceptor
    APISecurityMiddleware.registerInterceptor({
      name: 'error-logger',
      onError: async (error, context) => {
        errorLogger.logError(error, {
          context: 'API Request',
          endpoint: context.url,
          method: context.method
        });
      }
    });
    
    console.log('  ✅ Interceptors registered');
    
    // ========================================================================
    // 5. FINAL STATUS
    // ========================================================================
    
    console.log('✅ API Security Layer initialized successfully');
    console.log(`   - Validation: ${config.enableValidation ? 'ON' : 'OFF'}`);
    console.log(`   - Signing: ${config.enableSigning ? 'ON' : 'OFF'}`);
    console.log(`   - Rate Limiting: ${config.enableRateLimit ? 'ON' : 'OFF'}`);
    console.log(`   - Sanitization: ${config.enableSanitization ? 'ON' : 'OFF'}`);
    
  } catch (error: any) {
    console.error('❌ Failed to initialize API Security Layer:', error);
    errorLogger.logError(error, {
      context: 'API Security Initialization'
    });
  }
}

/**
 * Get current security configuration
 * 
 * @returns {SecurityConfig} Current configuration
 */
export function getSecurityConfig(): SecurityConfig {
  return APISecurityMiddleware.getConfig();
}

/**
 * Reset security layer
 * 
 * Clears all interceptors, rate limiters, and resets configuration.
 * Useful for testing or re-initialization.
 */
export function resetAPISecurity(): void {
  APISecurityMiddleware.reset();
  RequestSigner.stopNonceCleanup();
  console.log('🔄 API Security Layer reset');
}

/**
 * Configure custom endpoint rate limits
 * 
 * @param {string} endpoint - Endpoint path
 * @param {number} maxRequests - Max requests per window
 * @param {number} windowMs - Time window in milliseconds
 * 
 * @example
 * ```typescript
 * // Strict limit for payment endpoint
 * configureEndpointLimit('/api/payment', 5, 60000);
 * ```
 */
export function configureEndpointLimit(
  _endpoint: string,
  _maxRequests: number,
  _windowMs: number
): void {
  // Note: API rate limiting disabled for client app
  console.warn('API rate limiting not available in client app');
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  initializeAPISecurity,
  getSecurityConfig,
  resetAPISecurity,
  configureEndpointLimit
};
