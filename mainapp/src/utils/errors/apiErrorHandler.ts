// ============================================================================
// API Error Handler
// ============================================================================
// Description: Centralized API error handling and transformation
// Author: Senior Software Engineer
// Purpose: Convert API errors to user-friendly AppErrors
// Features: Supabase error handling, HTTP error mapping, retry logic
// ============================================================================

import { PostgrestError } from '@supabase/supabase-js';
import {
  AppError,
  APIError,
  AuthError,
  DatabaseError,
  NetworkError,
  ValidationError,
  NotFoundError,
  RateLimitError
} from './CustomErrors';
import { errorLogger } from './ErrorLogger';

/**
 * Retry Configuration
 */
export interface RetryConfig {
  /** Maximum retry attempts */
  maxRetries?: number;
  
  /** Delay between retries (ms) */
  retryDelay?: number;
  
  /** Exponential backoff */
  exponentialBackoff?: boolean;
  
  /** HTTP status codes to retry */
  retryableStatusCodes?: number[];
}

/**
 * API Error Handler Class
 * 
 * Handles API errors from Supabase and other services.
 * Converts errors to user-friendly AppErrors with proper categorization.
 * 
 * Features:
 * - Supabase error handling
 * - HTTP status code mapping
 * - Retry logic with backoff
 * - Error logging
 * - User-friendly messages
 * 
 * @class APIErrorHandler
 */
export class APIErrorHandler {
  /**
   * Handle Supabase/Postgrest error
   * 
   * @param {PostgrestError} error - Postgrest error
   * @param {string} operation - Operation that failed
   * @param {string} table - Table involved
   * @returns {AppError} Converted error
   */
  static handleSupabaseError(
    error: PostgrestError,
    operation: string = 'database operation',
    table?: string
  ): AppError {
    const { code, message, details, hint } = error;
    
    // Log the error
    errorLogger.logError(
      new DatabaseError(
        `Supabase error: ${message}`,
        this.getSupabaseUserMessage(code, operation),
        operation,
        table,
        { code, details, hint }
      )
    );
    
    // Map Supabase error codes to AppErrors
    switch (code) {
      // Authentication errors
      case 'PGRST301': // JWT expired
      case 'PGRST302': // JWT invalid
        return new AuthError(
          message,
          'Your session has expired. Please log in again.',
          { code, operation, table }
        );
      
      // Authorization errors
      case 'PGRST116': // Row Level Security violation
      case '42501': // Insufficient privilege
        return new AuthError(
          message,
          'You don\'t have permission to perform this action.',
          { code, operation, table }
        );
      
      // Not found errors
      case 'PGRST116': // No rows
      case '42P01': // Undefined table
        return new NotFoundError(
          message,
          'The requested item was not found.',
          table,
          undefined,
          { code, operation }
        );
      
      // Validation errors
      case '23505': // Unique violation
        return new ValidationError(
          message,
          'This value already exists. Please use a different one.',
          undefined,
          'unique',
          { code, operation, table }
        );
      
      case '23503': // Foreign key violation
        return new ValidationError(
          message,
          'This operation would create invalid references.',
          undefined,
          'foreign_key',
          { code, operation, table }
        );
      
      case '23502': // Not null violation
        return new ValidationError(
          message,
          'Required field is missing.',
          undefined,
          'required',
          { code, operation, table }
        );
      
      case '23514': // Check constraint violation
        return new ValidationError(
          message,
          'The provided value is invalid.',
          undefined,
          'constraint',
          { code, operation, table }
        );
      
      // Database errors
      default:
        return new DatabaseError(
          message,
          this.getSupabaseUserMessage(code, operation),
          operation,
          table,
          { code, details, hint }
        );
    }
  }
  
  /**
   * Get user-friendly message for Supabase error code
   */
  private static getSupabaseUserMessage(code: string, operation: string): string {
    const messages: Record<string, string> = {
      'PGRST301': 'Your session has expired. Please log in again.',
      'PGRST302': 'Authentication failed. Please log in again.',
      'PGRST116': 'You don\'t have permission to perform this action.',
      '42501': 'You don\'t have permission to perform this action.',
      '23505': 'This value already exists.',
      '23503': 'This operation would create invalid references.',
      '23502': 'Required field is missing.',
      '23514': 'The provided value is invalid.',
      '42P01': 'Resource not found.'
    };
    
    return messages[code] || `Failed to ${operation}. Please try again.`;
  }
  
  /**
   * Handle HTTP error
   * 
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {string} endpoint - API endpoint
   * @returns {AppError} Converted error
   */
  static handleHTTPError(
    statusCode: number,
    message: string,
    endpoint?: string
  ): AppError {
    // Authentication errors
    if (statusCode === 401) {
      return new AuthError(
        message,
        'Please log in to continue.',
        { statusCode, endpoint }
      );
    }
    
    if (statusCode === 403) {
      return new AuthError(
        message,
        'You don\'t have permission to perform this action.',
        { statusCode, endpoint }
      );
    }
    
    // Not found
    if (statusCode === 404) {
      return new NotFoundError(
        message,
        'The requested resource was not found.',
        undefined,
        undefined,
        { statusCode, endpoint }
      );
    }
    
    // Validation error
    if (statusCode === 422) {
      return new ValidationError(
        message,
        'The provided data is invalid.',
        undefined,
        undefined,
        { statusCode, endpoint }
      );
    }
    
    // Rate limit
    if (statusCode === 429) {
      return new RateLimitError(
        message,
        'Too many requests. Please try again later.',
        undefined,
        undefined,
        { statusCode, endpoint }
      );
    }
    
    // Server errors
    if (statusCode >= 500) {
      return new APIError(
        message,
        statusCode,
        'Server error. Please try again later.',
        endpoint
      );
    }
    
    // Client errors
    return new APIError(
      message,
      statusCode,
      undefined,
      endpoint
    );
  }
  
  /**
   * Handle network error
   * 
   * @param {Error} error - Network error
   * @param {string} endpoint - API endpoint
   * @returns {NetworkError} Network error
   */
  static handleNetworkError(error: Error, endpoint?: string): NetworkError {
    return new NetworkError(
      error.message,
      'Network error. Please check your connection and try again.',
      { endpoint, originalError: error.name }
    );
  }
  
  /**
   * Retry API call with exponential backoff
   * 
   * @param {Function} apiCall - API call function
   * @param {RetryConfig} config - Retry configuration
   * @returns {Promise<T>} API response
   */
  static async withRetry<T>(
    apiCall: () => Promise<T>,
    config: RetryConfig = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      exponentialBackoff = true,
      retryableStatusCodes = [408, 429, 500, 502, 503, 504]
    } = config;
    
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break;
        }
        
        // Check if error is retryable
        const isRetryable = this.isRetryableError(error, retryableStatusCodes);
        
        if (!isRetryable) {
          break;
        }
        
        // Calculate delay
        const delay = exponentialBackoff
          ? retryDelay * Math.pow(2, attempt)
          : retryDelay;
        
        // Log retry attempt
        errorLogger.logWarning(
          `Retrying API call (attempt ${attempt + 1}/${maxRetries})`,
          { error: error.message, delay }
        );
        
        // Wait before retry
        await this.sleep(delay);
      }
    }
    
    // All retries failed
    throw lastError;
  }
  
  /**
   * Check if error is retryable
   */
  private static isRetryableError(error: any, retryableStatusCodes: number[]): boolean {
    // Network errors are retryable
    if (error instanceof NetworkError) {
      return true;
    }
    
    // API errors with specific status codes
    if (error instanceof APIError) {
      return retryableStatusCodes.includes(error.statusCode);
    }
    
    // Fetch errors are retryable
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Sleep utility
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Wrap async function with error handling
   * 
   * @param {Function} fn - Async function to wrap
   * @param {string} operation - Operation name for logging
   * @returns {Function} Wrapped function
   */
  static wrapAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    operation: string
  ): T {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error: any) {
        // Convert to AppError if needed
        const appError = this.toAppError(error, operation);
        
        // Log error
        errorLogger.logError(appError, {
          operation,
          args: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg).substring(0, 100) : String(arg)
          )
        });
        
        // Re-throw as AppError
        throw appError;
      }
    }) as T;
  }
  
  /**
   * Convert any error to AppError
   */
  private static toAppError(error: any, operation: string): AppError {
    // Already an AppError
    if (error instanceof AppError) {
      return error;
    }
    
    // Supabase error
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      return this.handleSupabaseError(error as PostgrestError, operation);
    }
    
    // Network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return this.handleNetworkError(error, operation);
    }
    
    // Standard error
    if (error instanceof Error) {
      return new AppError(
        error.message,
        `Failed to ${operation}. Please try again.`,
        undefined,
        undefined,
        true,
        { operation }
      );
    }
    
    // Unknown error
    return new AppError(
      String(error),
      `Failed to ${operation}. Please try again.`,
      undefined,
      undefined,
      true,
      { operation, error: String(error) }
    );
  }
}

/**
 * Wrap Supabase query with error handling
 * 
 * @param {Promise} query - Supabase query promise
 * @param {string} operation - Operation name
 * @param {string} table - Table name
 * @returns {Promise} Query result
 */
export async function handleSupabaseQuery<T>(
  query: Promise<{ data: T | null; error: PostgrestError | null }>,
  operation: string,
  table?: string
): Promise<T> {
  const { data, error } = await query;
  
  if (error) {
    throw APIErrorHandler.handleSupabaseError(error, operation, table);
  }
  
  if (!data) {
    throw new NotFoundError(
      'No data returned',
      'No data found.',
      table,
      undefined,
      { operation }
    );
  }
  
  return data;
}

/**
 * Create error handler for specific table
 * 
 * @param {string} table - Table name
 * @returns {Function} Error handler function
 */
export function createTableErrorHandler(table: string) {
  return async <T>(
    query: Promise<{ data: T | null; error: PostgrestError | null }>,
    operation: string
  ): Promise<T> => {
    return handleSupabaseQuery(query, operation, table);
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default APIErrorHandler;
