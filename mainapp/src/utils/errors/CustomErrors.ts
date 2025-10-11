// ============================================================================
// Custom Error Classes
// ============================================================================
// Description: Specialized error classes for different error scenarios
// Author: Senior Software Engineer
// Purpose: Provide context-rich errors with metadata for better handling
// Features: Error categorization, metadata, user messages, recovery hints
// ============================================================================

/**
 * Error Severity Levels
 */
export const ErrorSeverity = {
  /** Low severity - minor issues, recoverable */
  LOW: 'low',
  
  /** Medium severity - user action failed but app continues */
  MEDIUM: 'medium',
  
  /** High severity - critical feature unavailable */
  HIGH: 'high',
  
  /** Critical severity - app cannot function */
  CRITICAL: 'critical'
} as const;

export type ErrorSeverity = typeof ErrorSeverity[keyof typeof ErrorSeverity];

/**
 * Error Categories
 */
export const ErrorCategory = {
  /** Authentication/authorization errors */
  AUTH: 'auth',
  
  /** Network/API errors */
  NETWORK: 'network',
  
  /** Validation errors */
  VALIDATION: 'validation',
  
  /** Database/storage errors */
  DATABASE: 'database',
  
  /** Business logic errors */
  BUSINESS: 'business',
  
  /** UI/rendering errors */
  UI: 'ui',
  
  /** Unknown/unexpected errors */
  UNKNOWN: 'unknown'
} as const;

export type ErrorCategory = typeof ErrorCategory[keyof typeof ErrorCategory];

/**
 * Error Metadata - Allows any additional properties
 */
export type ErrorMetadata = Record<string, any>;

/**
 * Base Application Error
 * 
 * Base class for all custom application errors.
 * Extends native Error with additional metadata and categorization.
 * 
 * @class AppError
 * @extends Error
 */
export class AppError extends Error {
  /** Error category */
  public readonly category: ErrorCategory;
  
  /** Error severity */
  public readonly severity: ErrorSeverity;
  
  /** User-friendly message */
  public readonly userMessage: string;
  
  /** Error metadata */
  public readonly metadata: ErrorMetadata;
  
  /** Whether error is recoverable */
  public readonly recoverable: boolean;
  
  /** Recovery action hint */
  public readonly recoveryHint?: string;
  
  /**
   * Creates an application error
   * 
   * @param {string} message - Technical error message
   * @param {string} userMessage - User-friendly message
   * @param {ErrorCategory} category - Error category
   * @param {ErrorSeverity} severity - Error severity
   * @param {boolean} recoverable - Whether error is recoverable
   * @param {ErrorMetadata} metadata - Additional metadata
   * @param {string} recoveryHint - How to recover from error
   */
  constructor(
    message: string,
    userMessage: string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    recoverable: boolean = true,
    metadata: ErrorMetadata = {},
    recoveryHint?: string
  ) {
    super(message);
    
    // Set error name to class name
    this.name = this.constructor.name;
    
    // Set properties
    this.userMessage = userMessage;
    this.category = category;
    this.severity = severity;
    this.recoverable = recoverable;
    this.recoveryHint = recoveryHint;
    
    // Add timestamp to metadata
    this.metadata = {
      timestamp: new Date(),
      stack: this.stack,
      ...metadata
    };
    
    // Maintain proper stack trace (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Convert error to JSON
   * 
   * @returns {Object} JSON representation
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      userMessage: this.userMessage,
      category: this.category,
      severity: this.severity,
      recoverable: this.recoverable,
      recoveryHint: this.recoveryHint,
      metadata: this.metadata
    };
  }
  
  /**
   * Get log-friendly representation
   * 
   * @returns {Object} Log data
   */
  toLogData(): Record<string, any> {
    return {
      error: this.name,
      message: this.message,
      category: this.category,
      severity: this.severity,
      metadata: this.metadata
    };
  }
}

/**
 * Authentication Error
 * 
 * Thrown when authentication or authorization fails.
 * 
 * @class AuthError
 * @extends AppError
 */
export class AuthError extends AppError {
  constructor(
    message: string,
    userMessage: string = 'Authentication failed. Please log in again.',
    metadata: ErrorMetadata = {}
  ) {
    super(
      message,
      userMessage,
      ErrorCategory.AUTH,
      ErrorSeverity.HIGH,
      true,
      metadata,
      'Please log in again to continue.'
    );
  }
}

/**
 * Network Error
 * 
 * Thrown when network requests fail.
 * 
 * @class NetworkError
 * @extends AppError
 */
export class NetworkError extends AppError {
  constructor(
    message: string,
    userMessage: string = 'Network error. Please check your connection and try again.',
    metadata: ErrorMetadata = {}
  ) {
    super(
      message,
      userMessage,
      ErrorCategory.NETWORK,
      ErrorSeverity.MEDIUM,
      true,
      metadata,
      'Check your internet connection and try again.'
    );
  }
}

/**
 * API Error
 * 
 * Thrown when API requests fail with specific status codes.
 * 
 * @class APIError
 * @extends AppError
 */
export class APIError extends AppError {
  /** HTTP status code */
  public readonly statusCode: number;
  
  /** API endpoint */
  public readonly endpoint?: string;
  
  constructor(
    message: string,
    statusCode: number,
    userMessage?: string,
    endpoint?: string,
    metadata: ErrorMetadata = {}
  ) {
    // Default user message based on status code
    const defaultUserMessage = APIError.getDefaultMessage(statusCode);
    
    super(
      message,
      userMessage || defaultUserMessage,
      ErrorCategory.NETWORK,
      APIError.getSeverity(statusCode),
      statusCode < 500, // 5xx errors are not recoverable by user
      { ...metadata, statusCode, endpoint },
      APIError.getRecoveryHint(statusCode)
    );
    
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
  
  /**
   * Get default user message for status code
   */
  private static getDefaultMessage(statusCode: number): string {
    if (statusCode === 400) return 'Invalid request. Please check your input.';
    if (statusCode === 401) return 'Please log in to continue.';
    if (statusCode === 403) return 'You don\'t have permission to perform this action.';
    if (statusCode === 404) return 'The requested resource was not found.';
    if (statusCode === 409) return 'This action conflicts with existing data.';
    if (statusCode === 422) return 'The provided data is invalid.';
    if (statusCode === 429) return 'Too many requests. Please try again later.';
    if (statusCode >= 500) return 'Server error. Please try again later.';
    return 'An error occurred. Please try again.';
  }
  
  /**
   * Get severity based on status code
   */
  private static getSeverity(statusCode: number): ErrorSeverity {
    if (statusCode === 401 || statusCode === 403) return ErrorSeverity.HIGH;
    if (statusCode >= 500) return ErrorSeverity.CRITICAL;
    return ErrorSeverity.MEDIUM;
  }
  
  /**
   * Get recovery hint based on status code
   */
  private static getRecoveryHint(statusCode: number): string | undefined {
    if (statusCode === 401) return 'Please log in again.';
    if (statusCode === 403) return 'Contact support if you believe you should have access.';
    if (statusCode === 404) return 'Check the URL or contact support.';
    if (statusCode === 429) return 'Wait a few moments before trying again.';
    if (statusCode >= 500) return 'Try again in a few moments. Contact support if the problem persists.';
    return undefined;
  }
}

/**
 * Validation Error
 * 
 * Thrown when data validation fails.
 * 
 * @class ValidationError
 * @extends AppError
 */
export class ValidationError extends AppError {
  /** Field that failed validation */
  public readonly field?: string;
  
  /** Validation rule that failed */
  public readonly rule?: string;
  
  constructor(
    message: string,
    userMessage: string = 'Please check your input and try again.',
    field?: string,
    rule?: string,
    metadata: ErrorMetadata = {}
  ) {
    super(
      message,
      userMessage,
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      true,
      { ...metadata, field, rule },
      'Correct the highlighted fields and try again.'
    );
    
    this.field = field;
    this.rule = rule;
  }
}

/**
 * Database Error
 * 
 * Thrown when database operations fail.
 * 
 * @class DatabaseError
 * @extends AppError
 */
export class DatabaseError extends AppError {
  /** Database operation that failed */
  public readonly operation?: string;
  
  /** Table/collection involved */
  public readonly table?: string;
  
  constructor(
    message: string,
    userMessage: string = 'A database error occurred. Please try again.',
    operation?: string,
    table?: string,
    metadata: ErrorMetadata = {}
  ) {
    super(
      message,
      userMessage,
      ErrorCategory.DATABASE,
      ErrorSeverity.HIGH,
      true,
      { ...metadata, operation, table },
      'Try again in a moment. Contact support if the problem persists.'
    );
    
    this.operation = operation;
    this.table = table;
  }
}

/**
 * Business Logic Error
 * 
 * Thrown when business rules are violated.
 * 
 * @class BusinessError
 * @extends AppError
 */
export class BusinessError extends AppError {
  /** Business rule that was violated */
  public readonly rule?: string;
  
  constructor(
    message: string,
    userMessage: string,
    rule?: string,
    metadata: ErrorMetadata = {}
  ) {
    super(
      message,
      userMessage,
      ErrorCategory.BUSINESS,
      ErrorSeverity.MEDIUM,
      true,
      { ...metadata, rule },
      undefined
    );
    
    this.rule = rule;
  }
}

/**
 * UI Error
 * 
 * Thrown when UI rendering or interaction fails.
 * 
 * @class UIError
 * @extends AppError
 */
export class UIError extends AppError {
  /** Component that failed */
  public readonly component?: string;
  
  constructor(
    message: string,
    userMessage: string = 'A display error occurred. Please refresh the page.',
    component?: string,
    metadata: ErrorMetadata = {}
  ) {
    super(
      message,
      userMessage,
      ErrorCategory.UI,
      ErrorSeverity.MEDIUM,
      true,
      { ...metadata, component },
      'Try refreshing the page. Contact support if the problem persists.'
    );
    
    this.component = component;
  }
}

/**
 * Rate Limit Error
 * 
 * Thrown when rate limits are exceeded.
 * 
 * @class RateLimitError
 * @extends AppError
 */
export class RateLimitError extends AppError {
  /** When user can retry */
  public readonly retryAfter?: Date;
  
  /** Number of requests attempted */
  public readonly requestsAttempted?: number;
  
  constructor(
    message: string,
    userMessage: string = 'Too many attempts. Please try again later.',
    retryAfter?: Date,
    requestsAttempted?: number,
    metadata: ErrorMetadata = {}
  ) {
    super(
      message,
      userMessage,
      ErrorCategory.BUSINESS,
      ErrorSeverity.MEDIUM,
      true,
      { ...metadata, retryAfter, requestsAttempted },
      retryAfter 
        ? `Try again after ${retryAfter.toLocaleTimeString()}.`
        : 'Wait a few moments before trying again.'
    );
    
    this.retryAfter = retryAfter;
    this.requestsAttempted = requestsAttempted;
  }
}

/**
 * Not Found Error
 * 
 * Thrown when a resource is not found.
 * 
 * @class NotFoundError
 * @extends AppError
 */
export class NotFoundError extends AppError {
  /** Resource type that was not found */
  public readonly resourceType?: string;
  
  /** Resource ID that was not found */
  public readonly resourceId?: string;
  
  constructor(
    message: string,
    userMessage: string = 'The requested item was not found.',
    resourceType?: string,
    resourceId?: string,
    metadata: ErrorMetadata = {}
  ) {
    super(
      message,
      userMessage,
      ErrorCategory.BUSINESS,
      ErrorSeverity.MEDIUM,
      false,
      { ...metadata, resourceType, resourceId },
      'Check that you have the correct link or ID.'
    );
    
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Check if error is an AppError instance
 * 
 * @param {any} error - Error to check
 * @returns {boolean} True if error is AppError
 */
export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

/**
 * Extract user message from any error
 * 
 * @param {any} error - Error object
 * @returns {string} User-friendly message
 */
export function getUserMessage(error: any): string {
  if (isAppError(error)) {
    return error.userMessage;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Convert unknown error to AppError
 * 
 * @param {any} error - Error to convert
 * @param {ErrorMetadata} metadata - Additional metadata
 * @returns {AppError} Converted error
 */
export function toAppError(error: any, metadata: ErrorMetadata = {}): AppError {
  // Already an AppError
  if (isAppError(error)) {
    return error;
  }
  
  // Standard Error
  if (error instanceof Error) {
    return new AppError(
      error.message,
      'An error occurred. Please try again.',
      ErrorCategory.UNKNOWN,
      ErrorSeverity.MEDIUM,
      true,
      { ...metadata, originalError: error.name }
    );
  }
  
  // String error
  if (typeof error === 'string') {
    return new AppError(
      error,
      error,
      ErrorCategory.UNKNOWN,
      ErrorSeverity.MEDIUM,
      true,
      metadata
    );
  }
  
  // Unknown error type
  return new AppError(
    'Unknown error',
    'An unexpected error occurred.',
    ErrorCategory.UNKNOWN,
    ErrorSeverity.MEDIUM,
    true,
    { ...metadata, error: String(error) }
  );
}

// ============================================================================
// EXPORT
// ============================================================================

export default AppError;
