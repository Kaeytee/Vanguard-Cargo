// ============================================================================
// API Security Middleware
// ============================================================================
// Description: Centralized security layer for all API requests
// Author: Senior Software Engineer
// Purpose: Enforce security policies on API communication
// Features: Request/response validation, signing, sanitization, auth
// ============================================================================

import { APIAuth } from './apiAuth';
import { APIValidator, type APIRequestSchema, type APIValidationResult } from './apiValidator';
import { RequestSigner, type SignatureConfig } from './requestSigner';
import { ResponseSanitizer, type SanitizationOptions, STANDARD_SANITIZATION } from './responseSanitizer';
import { RateLimiter } from '@/utils/rateLimiter';
import { errorLogger } from '@/utils/errors/ErrorLogger';
import { APIError, ValidationError, RateLimitError, NetworkError } from '@/utils/errors/CustomErrors';

/**
 * Security Middleware Configuration
 */
export interface SecurityConfig {
  /** Enable request validation */
  validateRequests?: boolean;
  
  /** Enable response validation */
  validateResponses?: boolean;
  
  /** Enable request signing */
  signRequests?: boolean;
  
  /** Enable response sanitization */
  sanitizeResponses?: boolean;
  
  /** Enable authentication */
  requireAuth?: boolean;
  
  /** Enable rate limiting */
  enableRateLimit?: boolean;
  
  /** Rate limit configuration */
  rateLimitConfig?: {
    maxRequests: number;
    windowMs: number;
  };
  
  /** Sanitization options */
  sanitizationOptions?: SanitizationOptions;
  
  /** Signature configuration */
  signatureConfig?: Partial<SignatureConfig>;
  
  /** Request timeout (milliseconds) */
  timeout?: number;
  
  /** Retry configuration */
  retry?: {
    maxRetries: number;
    retryDelay: number;
    retryableStatuses: number[];
  };
}

/**
 * API Request Context
 */
export interface APIRequestContext {
  /** Request URL */
  url: string;
  
  /** HTTP method */
  method: string;
  
  /** Request headers */
  headers?: Record<string, string>;
  
  /** Request body */
  body?: any;
  
  /** Query parameters */
  params?: Record<string, any>;
  
  /** Request schema (for validation) */
  schema?: APIRequestSchema;
  
  /** Security configuration override */
  securityConfig?: Partial<SecurityConfig>;
  
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * API Response Context
 */
export interface APIResponseContext<T = any> {
  /** Response data */
  data: T;
  
  /** Response status */
  status: number;
  
  /** Response headers */
  headers: Record<string, string>;
  
  /** Response timestamp */
  timestamp: number;
  
  /** Request context */
  request: APIRequestContext;
}

/**
 * Middleware Interceptor
 */
export interface APIInterceptor {
  /** Name/ID of interceptor */
  name: string;
  
  /** Before request hook */
  beforeRequest?: (context: APIRequestContext) => Promise<APIRequestContext> | APIRequestContext;
  
  /** After response hook */
  afterResponse?: <T>(response: APIResponseContext<T>) => Promise<APIResponseContext<T>> | APIResponseContext<T>;
  
  /** Error handler */
  onError?: (error: Error, context: APIRequestContext) => Promise<void> | void;
}

/**
 * APISecurityMiddleware Class
 * 
 * Centralized security layer for all API requests.
 * Enforces security policies and provides interceptor support.
 * 
 * Features:
 * - Request/response validation
 * - Request signing
 * - Response sanitization
 * - Authentication management
 * - Rate limiting
 * - Request/response interceptors
 * - Retry logic with exponential backoff
 * - Timeout handling
 * 
 * @class APISecurityMiddleware
 */
export class APISecurityMiddleware {
  /** Default security configuration */
  private static defaultConfig: SecurityConfig = {
    validateRequests: true,
    validateResponses: true,
    signRequests: false, // Disabled by default (requires setup)
    sanitizeResponses: true,
    requireAuth: true,
    enableRateLimit: true,
    rateLimitConfig: {
      maxRequests: 100,
      windowMs: 60 * 1000 // 1 minute
    },
    sanitizationOptions: STANDARD_SANITIZATION,
    timeout: 30000, // 30 seconds
    retry: {
      maxRetries: 3,
      retryDelay: 1000,
      retryableStatuses: [408, 429, 500, 502, 503, 504]
    }
  };
  
  /** Registered interceptors */
  private static interceptors: APIInterceptor[] = [];
  
  /** Rate limiter instance */
  private static rateLimiter: RateLimiter | null = null;
  
  /**
   * Configure security middleware
   * 
   * @param {Partial<SecurityConfig>} config - Configuration
   */
  static configure(config: Partial<SecurityConfig>): void {
    this.defaultConfig = {
      ...this.defaultConfig,
      ...config
    };
    
    // Initialize rate limiter if enabled
    if (this.defaultConfig.enableRateLimit && this.defaultConfig.rateLimitConfig) {
      this.rateLimiter = new RateLimiter({
        storageKey: 'api-requests',
        maxAttempts: this.defaultConfig.rateLimitConfig.maxRequests,
        windowMs: this.defaultConfig.rateLimitConfig.windowMs
      });
    }
  }
  
  /**
   * Register interceptor
   * 
   * @param {APIInterceptor} interceptor - Interceptor to register
   */
  static registerInterceptor(interceptor: APIInterceptor): void {
    this.interceptors.push(interceptor);
  }
  
  /**
   * Unregister interceptor
   * 
   * @param {string} name - Interceptor name
   */
  static unregisterInterceptor(name: string): void {
    this.interceptors = this.interceptors.filter(i => i.name !== name);
  }
  
  /**
   * Execute API request with security middleware
   * 
   * @param {APIRequestContext} context - Request context
   * @returns {Promise<APIResponseContext>} Response context
   */
  static async executeRequest<T = any>(
    context: APIRequestContext
  ): Promise<APIResponseContext<T>> {
    const config = { ...this.defaultConfig, ...context.securityConfig };
    
    let requestContext = { ...context };
    
    try {
      // Run before-request interceptors
      requestContext = await this.runBeforeInterceptors(requestContext);
      
      // Check rate limit
      if (config.enableRateLimit) {
        await this.checkRateLimit(requestContext);
      }
      
      // Validate request
      if (config.validateRequests && requestContext.schema) {
        await this.validateRequest(requestContext);
      }
      
      // Add authentication
      if (config.requireAuth) {
        requestContext = await this.addAuthentication(requestContext);
      }
      
      // Sign request
      if (config.signRequests) {
        requestContext = await this.signRequest(requestContext, config.signatureConfig);
      }
      
      // Execute request with retry logic
      let response = await this.executeWithRetry<T>(requestContext, config);
      
      // Validate response
      if (config.validateResponses) {
        await this.validateResponse(response);
      }
      
      // Sanitize response
      if (config.sanitizeResponses) {
        response = await this.sanitizeResponse(response, config.sanitizationOptions);
      }
      
      // Run after-response interceptors
      response = await this.runAfterInterceptors(response);
      
      return response;
    } catch (error: any) {
      // Run error interceptors
      await this.runErrorInterceptors(error, requestContext);
      
      // Re-throw error
      throw error;
    }
  }
  
  /**
   * Check rate limit
   * 
   * @param {APIRequestContext} context - Request context
   * @throws {RateLimitError} If rate limit exceeded
   */
  private static async checkRateLimit(_context: APIRequestContext): Promise<void> {
    if (!this.rateLimiter) {
      return;
    }
    
    const status = this.rateLimiter.checkLimit();
    
    if (!status.allowed) {
      throw new RateLimitError(
        'Rate limit exceeded',
        status.message || 'Too many requests. Please try again later.'
      );
    }
  }
  
  /**
   * Validate request
   * 
   * @param {APIRequestContext} context - Request context
   * @throws {ValidationError} If validation fails
   */
  private static async validateRequest(context: APIRequestContext): Promise<void> {
    if (!context.schema) {
      return;
    }
    
    const result: APIValidationResult = APIValidator.validateRequest(
      {
        method: context.method,
        headers: context.headers,
        params: context.params,
        body: context.body
      },
      context.schema
    );
    
    if (!result.valid) {
      throw new ValidationError(
        result.errors.join(', '),
        'Request validation failed'
      );
    }
    
    // Use sanitized data
    if (result.sanitizedData) {
      context.body = result.sanitizedData;
    }
  }
  
  /**
   * Add authentication to request
   * 
   * @param {APIRequestContext} context - Request context
   * @returns {Promise<APIRequestContext>} Context with auth headers
   */
  private static async addAuthentication(
    context: APIRequestContext
  ): Promise<APIRequestContext> {
    const authHeaders = await APIAuth.getAuthHeaders();
    
    return {
      ...context,
      headers: {
        ...context.headers,
        ...authHeaders
      }
    };
  }
  
  /**
   * Sign request
   * 
   * @param {APIRequestContext} context - Request context
   * @param {Partial<SignatureConfig>} signConfig - Signature config
   * @returns {Promise<APIRequestContext>} Context with signature headers
   */
  private static async signRequest(
    context: APIRequestContext,
    signConfig?: Partial<SignatureConfig>
  ): Promise<APIRequestContext> {
    const signatureHeaders = RequestSigner.generateSignatureHeaders(
      context.method,
      context.url,
      context.headers || {},
      context.body,
      signConfig
    );
    
    return {
      ...context,
      headers: {
        ...context.headers,
        ...signatureHeaders
      }
    };
  }
  
  /**
   * Execute request with retry logic
   * 
   * @param {APIRequestContext} context - Request context
   * @param {SecurityConfig} config - Security config
   * @returns {Promise<APIResponseContext<T>>} Response context
   */
  private static async executeWithRetry<T>(
    context: APIRequestContext,
    config: SecurityConfig
  ): Promise<APIResponseContext<T>> {
    let lastError: Error | null = null;
    const maxRetries = config.retry?.maxRetries || 0;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Execute request
        const response = await this.executeRawRequest<T>(context, config);
        
        // Check if response is retryable
        if (
          attempt < maxRetries &&
          config.retry?.retryableStatuses?.includes(response.status)
        ) {
          // Wait before retry with exponential backoff
          const delay = (config.retry?.retryDelay || 1000) * Math.pow(2, attempt);
          await this.sleep(delay);
          continue;
        }
        
        return response;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on non-network errors
        if (!(error instanceof NetworkError)) {
          throw error;
        }
        
        // Don't retry if max attempts reached
        if (attempt >= maxRetries) {
          throw error;
        }
        
        // Wait before retry
        const delay = (config.retry?.retryDelay || 1000) * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }
    
    throw lastError || new NetworkError('Request failed', 'Failed after all retry attempts');
  }
  
  /**
   * Execute raw HTTP request
   * 
   * @param {APIRequestContext} context - Request context
   * @param {SecurityConfig} config - Security config
   * @returns {Promise<APIResponseContext<T>>} Response context
   */
  private static async executeRawRequest<T>(
    context: APIRequestContext,
    config: SecurityConfig
  ): Promise<APIResponseContext<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || 30000);
    
    try {
      const response = await fetch(context.url, {
        method: context.method,
        headers: {
          'Content-Type': 'application/json',
          ...context.headers
        },
        body: context.body ? JSON.stringify(context.body) : undefined,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Parse response
      const responseData = await this.parseResponse<T>(response);
      
      // Check for errors
      if (!response.ok) {
        throw new APIError(
          `API request failed with status ${response.status}`,
          responseData as any,
          String(response.status)
        );
      }
      
      // Build response context
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      return {
        data: responseData,
        status: response.status,
        headers: responseHeaders,
        timestamp: Date.now(),
        request: context
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new NetworkError(
          'Request timeout',
          `Request to ${context.url} timed out after ${config.timeout}ms`
        );
      }
      
      if (error instanceof APIError) {
        throw error;
      }
      
      throw new NetworkError(
        error.message,
        `Failed to execute request to ${context.url}`
      );
    }
  }
  
  /**
   * Parse response data
   * 
   * @param {Response} response - Fetch response
   * @returns {Promise<T>} Parsed data
   */
  private static async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return await response.json();
    }
    
    if (contentType?.includes('text/')) {
      return await response.text() as any;
    }
    
    return await response.blob() as any;
  }
  
  /**
   * Validate response
   * 
   * @param {APIResponseContext} response - Response context
   * @throws {ValidationError} If validation fails
   */
  private static async validateResponse<T>(
    _response: APIResponseContext<T>
  ): Promise<void> {
    // Placeholder for response validation
    // Can be extended with schema validation
  }
  
  /**
   * Sanitize response
   * 
   * @param {APIResponseContext<T>} response - Response context
   * @param {SanitizationOptions} options - Sanitization options
   * @returns {Promise<APIResponseContext<T>>} Sanitized response
   */
  private static async sanitizeResponse<T>(
    response: APIResponseContext<T>,
    options?: SanitizationOptions
  ): Promise<APIResponseContext<T>> {
    const sanitizedData = ResponseSanitizer.sanitize(response.data, options);
    
    return {
      ...response,
      data: sanitizedData
    };
  }
  
  /**
   * Run before-request interceptors
   * 
   * @param {APIRequestContext} context - Request context
   * @returns {Promise<APIRequestContext>} Modified context
   */
  private static async runBeforeInterceptors(
    context: APIRequestContext
  ): Promise<APIRequestContext> {
    let modifiedContext = context;
    
    for (const interceptor of this.interceptors) {
      if (interceptor.beforeRequest) {
        modifiedContext = await interceptor.beforeRequest(modifiedContext);
      }
    }
    
    return modifiedContext;
  }
  
  /**
   * Run after-response interceptors
   * 
   * @param {APIResponseContext<T>} response - Response context
   * @returns {Promise<APIResponseContext<T>>} Modified response
   */
  private static async runAfterInterceptors<T>(
    response: APIResponseContext<T>
  ): Promise<APIResponseContext<T>> {
    let modifiedResponse = response;
    
    for (const interceptor of this.interceptors) {
      if (interceptor.afterResponse) {
        modifiedResponse = await interceptor.afterResponse(modifiedResponse);
      }
    }
    
    return modifiedResponse;
  }
  
  /**
   * Run error interceptors
   * 
   * @param {Error} error - Error
   * @param {APIRequestContext} context - Request context
   */
  private static async runErrorInterceptors(
    error: Error,
    context: APIRequestContext
  ): Promise<void> {
    for (const interceptor of this.interceptors) {
      if (interceptor.onError) {
        try {
          await interceptor.onError(error, context);
        } catch (interceptorError: any) {
          errorLogger.logError(interceptorError);
        }
      }
    }
  }
  
  /**
   * Sleep utility
   * 
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get current configuration
   * 
   * @returns {SecurityConfig} Current configuration
   */
  static getConfig(): SecurityConfig {
    return { ...this.defaultConfig };
  }
  
  /**
   * Reset middleware (clear interceptors and config)
   */
  static reset(): void {
    this.interceptors = [];
    this.rateLimiter = null;
    this.defaultConfig = {
      validateRequests: true,
      validateResponses: true,
      signRequests: false,
      sanitizeResponses: true,
      requireAuth: true,
      enableRateLimit: true,
      rateLimitConfig: {
        maxRequests: 100,
        windowMs: 60 * 1000
      },
      sanitizationOptions: STANDARD_SANITIZATION,
      timeout: 30000,
      retry: {
        maxRetries: 3,
        retryDelay: 1000,
        retryableStatuses: [408, 429, 500, 502, 503, 504]
      }
    };
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Execute GET request with security
 * 
 * @param {string} url - Request URL
 * @param {Partial<SecurityConfig>} config - Security config
 * @returns {Promise<T>} Response data
 */
export async function secureGet<T = any>(
  url: string,
  config?: Partial<SecurityConfig>
): Promise<T> {
  const response = await APISecurityMiddleware.executeRequest<T>({
    url,
    method: 'GET',
    securityConfig: config
  });
  return response.data;
}

/**
 * Execute POST request with security
 * 
 * @param {string} url - Request URL
 * @param {any} body - Request body
 * @param {Partial<SecurityConfig>} config - Security config
 * @returns {Promise<T>} Response data
 */
export async function securePost<T = any>(
  url: string,
  body: any,
  config?: Partial<SecurityConfig>
): Promise<T> {
  const response = await APISecurityMiddleware.executeRequest<T>({
    url,
    method: 'POST',
    body,
    securityConfig: config
  });
  return response.data;
}

/**
 * Execute PUT request with security
 * 
 * @param {string} url - Request URL
 * @param {any} body - Request body
 * @param {Partial<SecurityConfig>} config - Security config
 * @returns {Promise<T>} Response data
 */
export async function securePut<T = any>(
  url: string,
  body: any,
  config?: Partial<SecurityConfig>
): Promise<T> {
  const response = await APISecurityMiddleware.executeRequest<T>({
    url,
    method: 'PUT',
    body,
    securityConfig: config
  });
  return response.data;
}

/**
 * Execute DELETE request with security
 * 
 * @param {string} url - Request URL
 * @param {Partial<SecurityConfig>} config - Security config
 * @returns {Promise<T>} Response data
 */
export async function secureDelete<T = any>(
  url: string,
  config?: Partial<SecurityConfig>
): Promise<T> {
  const response = await APISecurityMiddleware.executeRequest<T>({
    url,
    method: 'DELETE',
    securityConfig: config
  });
  return response.data;
}

// ============================================================================
// EXPORT
// ============================================================================

export default APISecurityMiddleware;
