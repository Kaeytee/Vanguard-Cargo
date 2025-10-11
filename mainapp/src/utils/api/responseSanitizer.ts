// ============================================================================
// Response Sanitization Utility
// ============================================================================
// Description: Sanitizes API responses to prevent XSS and data leaks
// Author: Senior Software Engineer
// Purpose: Clean response data before rendering
// Features: XSS prevention, PII masking, sensitive data removal
// ============================================================================

import { InputValidator } from '@/utils/inputValidator';
import { errorLogger } from '@/utils/errors/ErrorLogger';

/**
 * Sanitization Options
 */
export interface SanitizationOptions {
  /** Remove sensitive fields */
  removeSensitiveFields?: boolean;
  
  /** Mask PII (Personally Identifiable Information) */
  maskPII?: boolean;
  
  /** Sanitize HTML strings */
  sanitizeHTML?: boolean;
  
  /** Remove null values */
  removeNulls?: boolean;
  
  /** Remove undefined values */
  removeUndefined?: boolean;
  
  /** Remove empty strings */
  removeEmptyStrings?: boolean;
  
  /** Whitelist fields (only keep these) */
  whitelist?: string[];
  
  /** Blacklist fields (remove these) */
  blacklist?: string[];
  
  /** Custom sanitizers by field name */
  customSanitizers?: Record<string, (value: any) => any>;
}

/**
 * Sensitive field patterns
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /access[_-]?token/i,
  /refresh[_-]?token/i,
  /auth[_-]?token/i,
  /credit[_-]?card/i,
  /cvv/i,
  /ssn/i,
  /social[_-]?security/i
];

/**
 * PII field patterns
 */
const PII_PATTERNS = [
  /email/i,
  /phone/i,
  /address/i,
  /zip[_-]?code/i,
  /postal[_-]?code/i,
  /birth[_-]?date/i,
  /dob/i,
  /license/i
];

/**
 * ResponseSanitizer Class
 * 
 * Sanitizes API responses to prevent XSS attacks and data leaks.
 * Removes sensitive information and masks PII.
 * 
 * Features:
 * - XSS prevention
 * - Sensitive data removal
 * - PII masking
 * - HTML sanitization
 * - Custom field sanitizers
 * - Whitelist/blacklist filtering
 * 
 * @class ResponseSanitizer
 */
export class ResponseSanitizer {
  /**
   * Sanitize response data
   * 
   * @param {any} data - Response data to sanitize
   * @param {SanitizationOptions} options - Sanitization options
   * @returns {any} Sanitized data
   */
  static sanitize(data: any, options: SanitizationOptions = {}): any {
    const defaultOptions: SanitizationOptions = {
      removeSensitiveFields: true,
      maskPII: false,
      sanitizeHTML: true,
      removeNulls: false,
      removeUndefined: true,
      removeEmptyStrings: false,
      ...options
    };
    
    return this.sanitizeValue(data, defaultOptions, '');
  }
  
  /**
   * Sanitize a value based on its type
   * 
   * @param {any} value - Value to sanitize
   * @param {SanitizationOptions} options - Sanitization options
   * @param {string} fieldPath - Current field path (for nested objects)
   * @returns {any} Sanitized value
   */
  private static sanitizeValue(
    value: any,
    options: SanitizationOptions,
    fieldPath: string
  ): any {
    // Handle null
    if (value === null) {
      return options.removeNulls ? undefined : null;
    }
    
    // Handle undefined
    if (value === undefined) {
      return undefined;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      return this.sanitizeArray(value, options, fieldPath);
    }
    
    // Handle objects
    if (typeof value === 'object') {
      return this.sanitizeObject(value, options, fieldPath);
    }
    
    // Handle strings
    if (typeof value === 'string') {
      return this.sanitizeString(value, options, fieldPath);
    }
    
    // Handle other primitives (numbers, booleans)
    return value;
  }
  
  /**
   * Sanitize an object
   * 
   * @param {Record<string, any>} obj - Object to sanitize
   * @param {SanitizationOptions} options - Sanitization options
   * @param {string} parentPath - Parent field path
   * @returns {Record<string, any>} Sanitized object
   */
  private static sanitizeObject(
    obj: Record<string, any>,
    options: SanitizationOptions,
    parentPath: string
  ): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    Object.entries(obj).forEach(([key, value]) => {
      const fieldPath = parentPath ? `${parentPath}.${key}` : key;
      
      // Check whitelist
      if (options.whitelist && options.whitelist.length > 0) {
        if (!this.isInWhitelist(fieldPath, options.whitelist)) {
          return; // Skip field
        }
      }
      
      // Check blacklist
      if (options.blacklist && this.isInBlacklist(fieldPath, options.blacklist)) {
        return; // Skip field
      }
      
      // Remove sensitive fields
      if (options.removeSensitiveFields && this.isSensitiveField(key)) {
        return; // Skip field
      }
      
      // Apply custom sanitizer
      if (options.customSanitizers && options.customSanitizers[fieldPath]) {
        sanitized[key] = options.customSanitizers[fieldPath](value);
        return;
      }
      
      // Mask PII
      if (options.maskPII && this.isPIIField(key)) {
        sanitized[key] = this.maskValue(value, key);
        return;
      }
      
      // Recursively sanitize value
      const sanitizedValue = this.sanitizeValue(value, options, fieldPath);
      
      // Skip undefined values
      if (sanitizedValue === undefined && options.removeUndefined) {
        return;
      }
      
      // Skip empty strings
      if (sanitizedValue === '' && options.removeEmptyStrings) {
        return;
      }
      
      sanitized[key] = sanitizedValue;
    });
    
    return sanitized;
  }
  
  /**
   * Sanitize an array
   * 
   * @param {any[]} arr - Array to sanitize
   * @param {SanitizationOptions} options - Sanitization options
   * @param {string} fieldPath - Current field path
   * @returns {any[]} Sanitized array
   */
  private static sanitizeArray(
    arr: any[],
    options: SanitizationOptions,
    fieldPath: string
  ): any[] {
    return arr
      .map((item, index) => this.sanitizeValue(item, options, `${fieldPath}[${index}]`))
      .filter(item => !(item === undefined && options.removeUndefined));
  }
  
  /**
   * Sanitize a string
   * 
   * @param {string} str - String to sanitize
   * @param {SanitizationOptions} options - Sanitization options
   * @param {string} fieldPath - Current field path
   * @returns {string} Sanitized string
   */
  private static sanitizeString(
    str: string,
    options: SanitizationOptions,
    _fieldPath: string
  ): string {
    let sanitized = str;
    
    // Sanitize HTML
    if (options.sanitizeHTML) {
      sanitized = InputValidator.sanitizeString(sanitized);
    }
    
    return sanitized;
  }
  
  /**
   * Check if field is sensitive
   * 
   * @param {string} fieldName - Field name
   * @returns {boolean} Whether field is sensitive
   */
  private static isSensitiveField(fieldName: string): boolean {
    return SENSITIVE_PATTERNS.some(pattern => pattern.test(fieldName));
  }
  
  /**
   * Check if field contains PII
   * 
   * @param {string} fieldName - Field name
   * @returns {boolean} Whether field contains PII
   */
  private static isPIIField(fieldName: string): boolean {
    return PII_PATTERNS.some(pattern => pattern.test(fieldName));
  }
  
  /**
   * Mask sensitive value
   * 
   * @param {any} value - Value to mask
   * @param {string} fieldName - Field name
   * @returns {any} Masked value
   */
  private static maskValue(value: any, fieldName: string): any {
    if (typeof value !== 'string') {
      return value;
    }
    
    // Email masking
    if (/email/i.test(fieldName)) {
      return this.maskEmail(value);
    }
    
    // Phone masking
    if (/phone/i.test(fieldName)) {
      return this.maskPhone(value);
    }
    
    // Default masking
    return this.maskDefault(value);
  }
  
  /**
   * Mask email address
   * 
   * Example: john.doe@example.com -> j***e@example.com
   * 
   * @param {string} email - Email to mask
   * @returns {string} Masked email
   */
  private static maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    
    if (!localPart || !domain) {
      return email;
    }
    
    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }
    
    return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
  }
  
  /**
   * Mask phone number
   * 
   * Example: +1234567890 -> +******7890
   * 
   * @param {string} phone - Phone to mask
   * @returns {string} Masked phone
   */
  private static maskPhone(phone: string): string {
    if (phone.length <= 4) {
      return '****';
    }
    
    const visiblePart = phone.slice(-4);
    const prefix = phone.startsWith('+') ? '+' : '';
    return `${prefix}******${visiblePart}`;
  }
  
  /**
   * Default masking (show first and last character)
   * 
   * Example: sensitive -> s*******e
   * 
   * @param {string} value - Value to mask
   * @returns {string} Masked value
   */
  private static maskDefault(value: string): string {
    if (value.length <= 2) {
      return '***';
    }
    
    const asterisks = '*'.repeat(Math.max(value.length - 2, 3));
    return `${value[0]}${asterisks}${value[value.length - 1]}`;
  }
  
  /**
   * Check if field is in whitelist
   * 
   * @param {string} fieldPath - Field path
   * @param {string[]} whitelist - Whitelist
   * @returns {boolean} Whether field is whitelisted
   */
  private static isInWhitelist(fieldPath: string, whitelist: string[]): boolean {
    return whitelist.some(pattern => {
      // Exact match
      if (pattern === fieldPath) {
        return true;
      }
      
      // Wildcard match (e.g., "user.*")
      if (pattern.endsWith('.*')) {
        const prefix = pattern.slice(0, -2);
        return fieldPath.startsWith(prefix + '.');
      }
      
      return false;
    });
  }
  
  /**
   * Check if field is in blacklist
   * 
   * @param {string} fieldPath - Field path
   * @param {string[]} blacklist - Blacklist
   * @returns {boolean} Whether field is blacklisted
   */
  private static isInBlacklist(fieldPath: string, blacklist: string[]): boolean {
    return blacklist.some(pattern => {
      // Exact match
      if (pattern === fieldPath) {
        return true;
      }
      
      // Wildcard match
      if (pattern.endsWith('.*')) {
        const prefix = pattern.slice(0, -2);
        return fieldPath.startsWith(prefix + '.');
      }
      
      return false;
    });
  }
  
  /**
   * Remove sensitive fields from object
   * 
   * Convenience method to quickly remove sensitive fields.
   * 
   * @param {any} data - Data to clean
   * @returns {any} Cleaned data
   */
  static removeSensitive(data: any): any {
    return this.sanitize(data, {
      removeSensitiveFields: true,
      sanitizeHTML: true
    });
  }
  
  /**
   * Mask PII in object
   * 
   * Convenience method to mask PII.
   * 
   * @param {any} data - Data to mask
   * @returns {any} Masked data
   */
  static maskPII(data: any): any {
    return this.sanitize(data, {
      maskPII: true,
      removeSensitiveFields: true,
      sanitizeHTML: true
    });
  }
  
  /**
   * Deep clone and sanitize
   * 
   * Creates a deep copy before sanitizing to avoid mutating original.
   * 
   * @param {any} data - Data to clone and sanitize
   * @param {SanitizationOptions} options - Sanitization options
   * @returns {any} Cloned and sanitized data
   */
  static cloneAndSanitize(data: any, options: SanitizationOptions = {}): any {
    try {
      const cloned = JSON.parse(JSON.stringify(data));
      return this.sanitize(cloned, options);
    } catch (error: any) {
      errorLogger.logError(error);
      return this.sanitize(data, options);
    }
  }
}

// ============================================================================
// SANITIZATION PRESETS
// ============================================================================

/**
 * Strict sanitization (maximum security)
 */
export const STRICT_SANITIZATION: SanitizationOptions = {
  removeSensitiveFields: true,
  maskPII: true,
  sanitizeHTML: true,
  removeNulls: true,
  removeUndefined: true,
  removeEmptyStrings: true
};

/**
 * Standard sanitization (balanced)
 */
export const STANDARD_SANITIZATION: SanitizationOptions = {
  removeSensitiveFields: true,
  maskPII: false,
  sanitizeHTML: true,
  removeNulls: false,
  removeUndefined: true,
  removeEmptyStrings: false
};

/**
 * Light sanitization (minimal)
 */
export const LIGHT_SANITIZATION: SanitizationOptions = {
  removeSensitiveFields: true,
  maskPII: false,
  sanitizeHTML: true,
  removeNulls: false,
  removeUndefined: false,
  removeEmptyStrings: false
};

/**
 * Public API sanitization (for public-facing APIs)
 */
export const PUBLIC_API_SANITIZATION: SanitizationOptions = {
  removeSensitiveFields: true,
  maskPII: true,
  sanitizeHTML: true,
  removeNulls: true,
  removeUndefined: true,
  removeEmptyStrings: true,
  blacklist: [
    'internal_*',
    '*.password',
    '*.token',
    '*.secret'
  ]
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Quick sanitize - convenience function
 * 
 * @param {any} data - Data to sanitize
 * @returns {any} Sanitized data
 */
export function sanitizeResponse(data: any): any {
  return ResponseSanitizer.sanitize(data, STANDARD_SANITIZATION);
}

/**
 * Sanitize for logging (mask PII)
 * 
 * @param {any} data - Data to sanitize for logging
 * @returns {any} Sanitized data safe for logs
 */
export function sanitizeForLogging(data: any): any {
  return ResponseSanitizer.sanitize(data, {
    removeSensitiveFields: true,
    maskPII: true,
    sanitizeHTML: false,
    removeNulls: false,
    removeUndefined: false
  });
}

// ============================================================================
// EXPORT
// ============================================================================

export default ResponseSanitizer;
