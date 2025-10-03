/**
 * Supabase Error Handler Utility
 * 
 * This utility provides centralized error handling for Supabase operations
 * to prevent HTTP 406 and other common API errors.
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

import { PostgrestError } from '@supabase/supabase-js';

/**
 * Interface for standardized error response
 */
export interface SupabaseErrorResponse {
  success: boolean;
  error: Error | null;
  message: string;
}

/**
 * Class for handling Supabase-specific errors
 */
export class SupabaseErrorHandler {
  /**
   * Handle PostgrestError and convert to standardized format
   * @param error - The PostgrestError from Supabase
   * @param operation - Description of the operation that failed
   * @returns Standardized error response
   */
  static handlePostgrestError(
    error: PostgrestError | null,
    operation: string = 'Database operation'
  ): SupabaseErrorResponse {
    if (!error) {
      return {
        success: true,
        error: null,
        message: 'Operation completed successfully'
      };
    }

    // Log the error for debugging
    console.error(`${operation} failed:`, {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });

    // Handle specific error codes
    switch (error.code) {
      case 'PGRST116': // No rows returned
        return {
          success: true, // Not an error, just no data
          error: null,
          message: 'No data found'
        };

      case 'PGRST301': // Moved permanently
      case 'PGRST302': // Found
        return {
          success: false,
          error: new Error('Resource has been moved'),
          message: 'The requested resource has been moved. Please check your query.'
        };

      case '406': // Not Acceptable (HTTP 406)
        return {
          success: false,
          error: new Error('Content type not acceptable'),
          message: 'The server cannot produce a response matching the acceptable content types. Please check your request headers.'
        };

      case 'PGRST204': // No content
        return {
          success: true,
          error: null,
          message: 'Operation completed successfully with no content'
        };

      case 'PGRST400': // Bad request
        return {
          success: false,
          error: new Error('Bad request'),
          message: `Bad request: ${error.message || 'Invalid query parameters'}`
        };

      case 'PGRST401': // Unauthorized
        return {
          success: false,
          error: new Error('Unauthorized'),
          message: 'Authentication required or invalid credentials'
        };

      case 'PGRST403': // Forbidden
        return {
          success: false,
          error: new Error('Forbidden'),
          message: 'Access denied. Insufficient permissions for this operation'
        };

      case 'PGRST404': // Not found
        return {
          success: false,
          error: new Error('Not found'),
          message: 'The requested resource was not found'
        };

      case 'PGRST409': // Conflict
        return {
          success: false,
          error: new Error('Conflict'),
          message: 'Data conflict occurred. The resource may have been modified by another process'
        };

      case 'PGRST500': // Internal server error
        return {
          success: false,
          error: new Error('Internal server error'),
          message: 'An internal server error occurred. Please try again later'
        };

      default:
        return {
          success: false,
          error: new Error(error.message || 'Unknown database error'),
          message: error.message || 'An unknown database error occurred'
        };
    }
  }

  /**
   * Handle generic JavaScript errors
   * @param error - The caught error
   * @param operation - Description of the operation that failed
   * @returns Standardized error response
   */
  static handleGenericError(
    error: unknown,
    operation: string = 'Operation'
  ): SupabaseErrorResponse {
    console.error(`${operation} failed:`, error);

    if (error instanceof Error) {
      return {
        success: false,
        error,
        message: error.message || 'An unexpected error occurred'
      };
    }

    return {
      success: false,
      error: new Error('Unknown error'),
      message: 'An unknown error occurred'
    };
  }

  /**
   * Wrapper for safe Supabase query execution
   * @param queryFn - Function that returns a Supabase query promise
   * @param operation - Description of the operation
   * @returns Promise with standardized response
   */
  static async safeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
    operation: string = 'Database query'
  ): Promise<{ data: T | null; success: boolean; error: Error | null; message: string }> {
    try {
      const { data, error } = await queryFn();
      const errorResponse = this.handlePostgrestError(error, operation);

      return {
        data: errorResponse.success ? data : null,
        success: errorResponse.success,
        error: errorResponse.error,
        message: errorResponse.message
      };
    } catch (err) {
      const errorResponse = this.handleGenericError(err, operation);
      return {
        data: null,
        success: errorResponse.success,
        error: errorResponse.error,
        message: errorResponse.message
      };
    }
  }

  /**
   * Check if an error is recoverable (can be retried)
   * @param error - The error to check
   * @returns True if the error is recoverable
   */
  static isRecoverableError(error: PostgrestError | Error | null): boolean {
    if (!error) return false;

    // PostgrestError codes that are recoverable
    const recoverableCodes = [
      'PGRST500', // Internal server error
      'PGRST503', // Service unavailable
      'PGRST504', // Gateway timeout
    ];

    if ('code' in error && typeof error.code === 'string') {
      return recoverableCodes.includes(error.code);
    }

    // Generic network errors that might be recoverable
    if (error.message) {
      const recoverableMessages = [
        'network error',
        'timeout',
        'connection',
        'fetch'
      ];
      
      return recoverableMessages.some(msg => 
        error.message.toLowerCase().includes(msg)
      );
    }

    return false;
  }
}

/**
 * Retry configuration for failed operations
 */
export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2
};

/**
 * Retry wrapper for Supabase operations
 * @param operation - The operation to retry
 * @param config - Retry configuration
 * @returns Promise with the operation result
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;
  let delay = config.delayMs;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry if it's the last attempt or if error is not recoverable
      if (attempt === config.maxAttempts || !SupabaseErrorHandler.isRecoverableError(lastError)) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= config.backoffMultiplier;
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

export default SupabaseErrorHandler;
