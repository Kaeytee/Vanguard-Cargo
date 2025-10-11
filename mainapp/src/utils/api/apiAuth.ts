// ============================================================================
// API Authentication Helpers
// ============================================================================
// Description: Utilities for API authentication and authorization
// Author: Senior Software Engineer
// Purpose: Secure API requests with authentication tokens
// Features: Token management, refresh, validation, headers
// ============================================================================

import { supabase } from '../../lib/supabase';
import { AuthError } from '@/utils/errors/CustomErrors';
import { errorLogger } from '@/utils/errors/ErrorLogger';

/**
 * API Authentication Token
 */
export interface APIAuthToken {
  /** Access token */
  accessToken: string;
  
  /** Refresh token */
  refreshToken?: string;
  
  /** Token type (Bearer, etc.) */
  tokenType: string;
  
  /** Expiration time (Unix timestamp) */
  expiresAt?: number;
  
  /** User ID */
  userId?: string;
  
  /** User role */
  userRole?: string;
}

/**
 * Authentication Headers
 */
export interface AuthHeaders {
  /** Authorization header */
  Authorization: string;
  
  /** API key (if needed) */
  'X-API-Key'?: string;
  
  /** Request ID for tracking */
  'X-Request-ID'?: string;
  
  /** Client ID */
  'X-Client-ID'?: string;
}

/**
 * APIAuth Class
 * 
 * Manages API authentication and authorization.
 * Handles token lifecycle, refresh, and header generation.
 * 
 * Features:
 * - Token management
 * - Automatic token refresh
 * - Auth header generation
 * - Token validation
 * - Role-based access
 * 
 * @class APIAuth
 */
export class APIAuth {
  private static tokenCache: APIAuthToken | null = null;
  private static refreshPromise: Promise<APIAuthToken> | null = null;
  
  /**
   * Get current authentication token
   * 
   * @param {boolean} forceRefresh - Force token refresh
   * @returns {Promise<APIAuthToken | null>} Authentication token
   */
  static async getToken(forceRefresh: boolean = false): Promise<APIAuthToken | null> {
    try {
      // Check cache
      if (!forceRefresh && this.tokenCache && this.isTokenValid(this.tokenCache)) {
        return this.tokenCache;
      }
      
      // Get session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        errorLogger.logError(new AuthError(
          error.message,
          'Failed to get authentication session'
        ));
        return null;
      }
      
      if (!session) {
        this.tokenCache = null;
        return null;
      }
      
      // Create token object
      const token: APIAuthToken = {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        tokenType: 'Bearer',
        expiresAt: session.expires_at ? session.expires_at * 1000 : undefined,
        userId: session.user.id,
        userRole: session.user.user_metadata?.role || session.user.role
      };
      
      // Cache token
      this.tokenCache = token;
      
      return token;
    } catch (error: any) {
      errorLogger.logError(new AuthError(
        error.message,
        'Failed to retrieve authentication token'
      ));
      return null;
    }
  }
  
  /**
   * Check if token is valid (not expired)
   * 
   * @param {APIAuthToken} token - Token to check
   * @returns {boolean} Whether token is valid
   */
  static isTokenValid(token: APIAuthToken): boolean {
    if (!token.expiresAt) {
      return true; // No expiration set
    }
    
    // Check if token expires within next 5 minutes
    const buffer = 5 * 60 * 1000; // 5 minutes
    return Date.now() < (token.expiresAt - buffer);
  }
  
  /**
   * Refresh authentication token
   * 
   * @returns {Promise<APIAuthToken>} New token
   */
  static async refreshToken(): Promise<APIAuthToken> {
    // Prevent multiple simultaneous refresh calls
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    
    this.refreshPromise = (async () => {
      try {
        const { data: { session }, error } = await supabase.auth.refreshSession();
        
        if (error || !session) {
          throw new AuthError(
            error?.message || 'No session',
            'Failed to refresh authentication. Please log in again.'
          );
        }
        
        const token: APIAuthToken = {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          tokenType: 'Bearer',
          expiresAt: session.expires_at ? session.expires_at * 1000 : undefined,
          userId: session.user.id,
          userRole: session.user.user_metadata?.role || session.user.role
        };
        
        this.tokenCache = token;
        
        return token;
      } catch (error: any) {
        errorLogger.logError(error);
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();
    
    return this.refreshPromise;
  }
  
  /**
   * Get authentication headers
   * 
   * @param {Partial<AuthHeaders>} additionalHeaders - Additional headers
   * @returns {Promise<AuthHeaders>} Authentication headers
   */
  static async getAuthHeaders(
    additionalHeaders: Partial<AuthHeaders> = {}
  ): Promise<AuthHeaders> {
    const token = await this.getToken();
    
    if (!token) {
      throw new AuthError(
        'No authentication token',
        'Please log in to continue.'
      );
    }
    
    const headers: AuthHeaders = {
      Authorization: `${token.tokenType} ${token.accessToken}`,
      'X-Request-ID': this.generateRequestId(),
      'X-Client-ID': 'vanguard-cargo-client',
      ...additionalHeaders
    };
    
    return headers;
  }
  
  /**
   * Generate unique request ID
   * 
   * @returns {string} Request ID
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
  
  /**
   * Clear cached token
   */
  static clearToken(): void {
    this.tokenCache = null;
  }
  
  /**
   * Check if user is authenticated
   * 
   * @returns {Promise<boolean>} Whether user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null && this.isTokenValid(token);
  }
  
  /**
   * Check if user has required role
   * 
   * @param {string | string[]} roles - Required roles
   * @returns {Promise<boolean>} Whether user has role
   */
  static async hasRole(roles: string | string[]): Promise<boolean> {
    const token = await this.getToken();
    
    if (!token || !token.userRole) {
      return false;
    }
    
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return requiredRoles.includes(token.userRole);
  }
  
  /**
   * Get current user ID
   * 
   * @returns {Promise<string | null>} User ID
   */
  static async getUserId(): Promise<string | null> {
    const token = await this.getToken();
    return token?.userId || null;
  }
  
  /**
   * Get current user role
   * 
   * @returns {Promise<string | null>} User role
   */
  static async getUserRole(): Promise<string | null> {
    const token = await this.getToken();
    return token?.userRole || null;
  }
  
  /**
   * Wrap fetch with authentication
   * 
   * @param {string} url - URL to fetch
   * @param {RequestInit} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  static async authenticatedFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const authHeaders = await this.getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...authHeaders
      }
    });
    
    // Handle 401 Unauthorized - attempt token refresh
    if (response.status === 401) {
      try {
        await this.refreshToken();
        const newAuthHeaders = await this.getAuthHeaders();
        
        // Retry request with new token
        return await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            ...newAuthHeaders
          }
        });
      } catch (error) {
        // Refresh failed - clear token and throw
        this.clearToken();
        throw new AuthError(
          'Authentication failed',
          'Your session has expired. Please log in again.'
        );
      }
    }
    
    return response;
  }
  
  /**
   * Create authenticated request config
   * 
   * @param {RequestInit} options - Base options
   * @returns {Promise<RequestInit>} Authenticated request config
   */
  static async createAuthenticatedRequest(
    options: RequestInit = {}
  ): Promise<RequestInit> {
    const authHeaders = await this.getAuthHeaders();
    
    return {
      ...options,
      headers: {
        ...options.headers,
        ...authHeaders,
        'Content-Type': 'application/json'
      }
    };
  }
}

// ============================================================================
// AUTHENTICATION GUARDS
// ============================================================================

/**
 * Require authentication
 * 
 * Throws error if user is not authenticated.
 * 
 * @throws {AuthError} If not authenticated
 */
export async function requireAuth(): Promise<void> {
  const isAuth = await APIAuth.isAuthenticated();
  
  if (!isAuth) {
    throw new AuthError(
      'Not authenticated',
      'Please log in to continue.'
    );
  }
}

/**
 * Require specific role
 * 
 * Throws error if user doesn't have required role.
 * 
 * @param {string | string[]} roles - Required roles
 * @throws {AuthError} If role not found
 */
export async function requireRole(roles: string | string[]): Promise<void> {
  await requireAuth();
  
  const hasRequiredRole = await APIAuth.hasRole(roles);
  
  if (!hasRequiredRole) {
    throw new AuthError(
      'Insufficient permissions',
      'You don\'t have permission to perform this action.'
    );
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default APIAuth;
