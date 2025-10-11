// ============================================================================
// Input Validator - Comprehensive Validation & Sanitization Utility
// ============================================================================
// Description: Enterprise-grade input validation and sanitization
// Author: Senior Software Engineer
// Purpose: Prevent XSS, injection attacks, and data integrity issues
// Security: Multi-layer validation with sanitization
// ============================================================================

/**
 * Validation Result Interface
 * Represents the outcome of a validation check
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  
  /** Error message if validation failed */
  error?: string;
  
  /** Sanitized/cleaned value */
  sanitizedValue?: any;
  
  /** Validation rule that failed */
  failedRule?: string;
}

/**
 * Validation Rule Interface
 * Defines a single validation rule
 */
export interface ValidationRule {
  /** Rule name/identifier */
  name: string;
  
  /** Validation function */
  validate: (value: any) => boolean;
  
  /** Error message template */
  message: string | ((value: any) => string);
  
  /** Whether to stop validation chain on failure */
  stopOnFail?: boolean;
}

/**
 * Validation Options Interface
 * Configuration options for validation
 */
export interface ValidationOptions {
  /** Allow empty values */
  allowEmpty?: boolean;
  
  /** Trim whitespace before validation */
  trim?: boolean;
  
  /** Sanitize value before validation */
  sanitize?: boolean;
  
  /** Custom error message */
  customMessage?: string;
}

/**
 * Email Validation Options
 */
export interface EmailValidationOptions extends ValidationOptions {
  /** Allow disposable email domains */
  allowDisposable?: boolean;
  
  /** Require specific domain */
  requiredDomain?: string;
  
  /** Blocked domains */
  blockedDomains?: string[];
}

/**
 * Password Validation Options
 */
export interface PasswordValidationOptions extends ValidationOptions {
  /** Minimum length */
  minLength?: number;
  
  /** Maximum length */
  maxLength?: number;
  
  /** Require uppercase letter */
  requireUppercase?: boolean;
  
  /** Require lowercase letter */
  requireLowercase?: boolean;
  
  /** Require number */
  requireNumber?: boolean;
  
  /** Require special character */
  requireSpecial?: boolean;
  
  /** Disallow common passwords */
  disallowCommon?: boolean;
}

/**
 * String Validation Options
 */
export interface StringValidationOptions extends ValidationOptions {
  /** Minimum length */
  minLength?: number;
  
  /** Maximum length */
  maxLength?: number;
  
  /** Allowed pattern (regex) */
  pattern?: RegExp;
  
  /** Allowed characters only */
  allowedChars?: RegExp;
  
  /** Disallowed characters */
  disallowedChars?: RegExp;
}

/**
 * Number Validation Options
 */
export interface NumberValidationOptions extends ValidationOptions {
  /** Minimum value */
  min?: number;
  
  /** Maximum value */
  max?: number;
  
  /** Must be integer */
  integer?: boolean;
  
  /** Must be positive */
  positive?: boolean;
  
  /** Number of decimal places */
  decimals?: number;
}

/**
 * InputValidator Class
 * 
 * Comprehensive validation and sanitization utility.
 * Provides methods for validating common input types and preventing
 * security vulnerabilities like XSS and injection attacks.
 * 
 * Features:
 * - Email validation
 * - Password strength checking
 * - Phone number validation
 * - URL validation
 * - Name validation
 * - XSS sanitization
 * - SQL injection prevention
 * - Custom validation rules
 * 
 * @class InputValidator
 */
export class InputValidator {
  // ============================================================================
  // COMMON PATTERNS
  // ============================================================================
  
  /** Email pattern (RFC 5322 simplified) */
  private static readonly EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  /** URL pattern */
  private static readonly URL_PATTERN = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  
  /** Phone pattern (international format) */
  private static readonly PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/;
  
  /** Name pattern (letters, spaces, hyphens, apostrophes) */
  private static readonly NAME_PATTERN = /^[a-zA-Z\s'-]+$/;
  
  /** Alphanumeric pattern */
  // Reserved for future use
  // private static readonly ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9]+$/;
  // private static readonly SUITE_NUMBER_PATTERN = /^VC-\d{3,}$/;
  // private static readonly TRACKING_NUMBER_PATTERN = /^[A-Z0-9-]+$/;
  
  /** XSS dangerous patterns */
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<embed/gi,
    /<object/gi,
    /eval\(/gi,
    /expression\(/gi
  ];
  
  /** SQL injection patterns */
  private static readonly SQL_PATTERNS = [
    /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
    /(--|\;|\/\*|\*\/)/,
    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/i,
    /'\s*(OR|AND)\s*'.*?'\s*=\s*'/i
  ];
  
  /** Common weak passwords */
  private static readonly COMMON_PASSWORDS = [
    'password', 'password123', '123456', '12345678', 'qwerty',
    'abc123', 'monkey', '1234567', 'letmein', 'trustno1',
    'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
    'ashley', 'bailey', 'passw0rd', 'shadow', '123123'
  ];
  
  /** Disposable email domains */
  private static readonly DISPOSABLE_DOMAINS = [
    'tempmail.com', 'guerrillamail.com', '10minutemail.com',
    'throwaway.email', 'mailinator.com', 'maildrop.cc'
  ];
  
  // ============================================================================
  // EMAIL VALIDATION
  // ============================================================================
  
  /**
   * Validate Email Address
   * 
   * Validates email format and optionally checks for:
   * - Disposable email domains
   * - Required domains
   * - Blocked domains
   * 
   * @param {string} email - Email address to validate
   * @param {EmailValidationOptions} options - Validation options
   * @returns {ValidationResult} Validation result
   */
  static validateEmail(
    email: string,
    options: EmailValidationOptions = {}
  ): ValidationResult {
    // Apply defaults
    const opts = {
      allowEmpty: false,
      trim: true,
      sanitize: true,
      allowDisposable: true,
      ...options
    };
    
    // Handle empty values
    if (!email || email.trim() === '') {
      if (opts.allowEmpty) {
        return { isValid: true, sanitizedValue: '' };
      }
      return { isValid: false, error: 'Email is required' };
    }
    
    // Trim and sanitize
    let sanitizedEmail = opts.trim ? email.trim() : email;
    if (opts.sanitize) {
      sanitizedEmail = this.sanitizeString(sanitizedEmail);
    }
    
    // Convert to lowercase for validation
    sanitizedEmail = sanitizedEmail.toLowerCase();
    
    // Check format
    if (!this.EMAIL_PATTERN.test(sanitizedEmail)) {
      return {
        isValid: false,
        error: opts.customMessage || 'Invalid email format',
        failedRule: 'format'
      };
    }
    
    // Check length (RFC 5321: max 254 characters)
    if (sanitizedEmail.length > 254) {
      return {
        isValid: false,
        error: 'Email address is too long',
        failedRule: 'length'
      };
    }
    
    // Extract domain
    const domain = sanitizedEmail.split('@')[1];
    
    // Check for disposable domains
    if (!opts.allowDisposable && this.DISPOSABLE_DOMAINS.includes(domain)) {
      return {
        isValid: false,
        error: 'Disposable email addresses are not allowed',
        failedRule: 'disposable'
      };
    }
    
    // Check required domain
    if (opts.requiredDomain && domain !== opts.requiredDomain.toLowerCase()) {
      return {
        isValid: false,
        error: `Email must be from ${opts.requiredDomain} domain`,
        failedRule: 'requiredDomain'
      };
    }
    
    // Check blocked domains
    if (opts.blockedDomains && opts.blockedDomains.includes(domain)) {
      return {
        isValid: false,
        error: 'This email domain is not allowed',
        failedRule: 'blockedDomain'
      };
    }
    
    return {
      isValid: true,
      sanitizedValue: sanitizedEmail
    };
  }
  
  // ============================================================================
  // PASSWORD VALIDATION
  // ============================================================================
  
  /**
   * Validate Password Strength
   * 
   * Validates password against configurable strength requirements:
   * - Length requirements
   * - Character type requirements (uppercase, lowercase, numbers, special)
   * - Common password detection
   * 
   * @param {string} password - Password to validate
   * @param {PasswordValidationOptions} options - Validation options
   * @returns {ValidationResult} Validation result with strength score
   */
  static validatePassword(
    password: string,
    options: PasswordValidationOptions = {}
  ): ValidationResult {
    // Apply defaults
    const opts = {
      allowEmpty: false,
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecial: true,
      disallowCommon: true,
      ...options
    };
    
    // Handle empty values
    if (!password || password.trim() === '') {
      if (opts.allowEmpty) {
        return { isValid: true, sanitizedValue: '' };
      }
      return { isValid: false, error: 'Password is required' };
    }
    
    // Check minimum length
    if (password.length < opts.minLength!) {
      return {
        isValid: false,
        error: `Password must be at least ${opts.minLength} characters`,
        failedRule: 'minLength'
      };
    }
    
    // Check maximum length
    if (password.length > opts.maxLength!) {
      return {
        isValid: false,
        error: `Password must not exceed ${opts.maxLength} characters`,
        failedRule: 'maxLength'
      };
    }
    
    // Check for uppercase
    if (opts.requireUppercase && !/[A-Z]/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one uppercase letter',
        failedRule: 'uppercase'
      };
    }
    
    // Check for lowercase
    if (opts.requireLowercase && !/[a-z]/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one lowercase letter',
        failedRule: 'lowercase'
      };
    }
    
    // Check for number
    if (opts.requireNumber && !/\d/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one number',
        failedRule: 'number'
      };
    }
    
    // Check for special character
    if (opts.requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one special character',
        failedRule: 'special'
      };
    }
    
    // Check for common passwords
    if (opts.disallowCommon) {
      const lowerPassword = password.toLowerCase();
      if (this.COMMON_PASSWORDS.includes(lowerPassword)) {
        return {
          isValid: false,
          error: 'This password is too common. Please choose a stronger password.',
          failedRule: 'common'
        };
      }
    }
    
    return {
      isValid: true,
      sanitizedValue: password // Don't sanitize passwords
    };
  }
  
  /**
   * Calculate Password Strength Score
   * 
   * Returns a strength score (0-100) based on password characteristics.
   * 
   * @param {string} password - Password to evaluate
   * @returns {number} Strength score (0-100)
   */
  static calculatePasswordStrength(password: string): number {
    if (!password) return 0;
    
    let score = 0;
    
    // Length score (up to 25 points)
    score += Math.min(25, password.length * 2);
    
    // Uppercase letters (10 points)
    if (/[A-Z]/.test(password)) score += 10;
    
    // Lowercase letters (10 points)
    if (/[a-z]/.test(password)) score += 10;
    
    // Numbers (10 points)
    if (/\d/.test(password)) score += 10;
    
    // Special characters (15 points)
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;
    
    // Mix of character types (20 points)
    const types = [
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ].filter(Boolean).length;
    
    if (types >= 3) score += 10;
    if (types === 4) score += 10;
    
    // Penalize common patterns
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeating characters
    if (/^[a-z]+$/.test(password)) score -= 10; // All lowercase
    if (/^[A-Z]+$/.test(password)) score -= 10; // All uppercase
    if (/^\d+$/.test(password)) score -= 10; // All numbers
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }
  
  // ============================================================================
  // STRING VALIDATION
  // ============================================================================
  
  /**
   * Validate String
   * 
   * General-purpose string validation with configurable rules.
   * 
   * @param {string} value - String to validate
   * @param {StringValidationOptions} options - Validation options
   * @returns {ValidationResult} Validation result
   */
  static validateString(
    value: string,
    options: StringValidationOptions = {}
  ): ValidationResult {
    // Apply defaults
    const opts = {
      allowEmpty: false,
      trim: true,
      sanitize: true,
      ...options
    };
    
    // Handle empty values
    if (!value || value.trim() === '') {
      if (opts.allowEmpty) {
        return { isValid: true, sanitizedValue: '' };
      }
      return { isValid: false, error: 'This field is required' };
    }
    
    // Trim and sanitize
    let sanitizedValue = opts.trim ? value.trim() : value;
    if (opts.sanitize) {
      sanitizedValue = this.sanitizeString(sanitizedValue);
    }
    
    // Check minimum length
    if (opts.minLength && sanitizedValue.length < opts.minLength) {
      return {
        isValid: false,
        error: `Must be at least ${opts.minLength} characters`,
        failedRule: 'minLength'
      };
    }
    
    // Check maximum length
    if (opts.maxLength && sanitizedValue.length > opts.maxLength) {
      return {
        isValid: false,
        error: `Must not exceed ${opts.maxLength} characters`,
        failedRule: 'maxLength'
      };
    }
    
    // Check pattern
    if (opts.pattern && !opts.pattern.test(sanitizedValue)) {
      return {
        isValid: false,
        error: opts.customMessage || 'Invalid format',
        failedRule: 'pattern'
      };
    }
    
    // Check allowed characters
    if (opts.allowedChars && !opts.allowedChars.test(sanitizedValue)) {
      return {
        isValid: false,
        error: 'Contains invalid characters',
        failedRule: 'allowedChars'
      };
    }
    
    // Check disallowed characters
    if (opts.disallowedChars && opts.disallowedChars.test(sanitizedValue)) {
      return {
        isValid: false,
        error: 'Contains disallowed characters',
        failedRule: 'disallowedChars'
      };
    }
    
    return {
      isValid: true,
      sanitizedValue
    };
  }
  
  /**
   * Validate Name
   * 
   * Validates person names (first name, last name, etc.).
   * Allows letters, spaces, hyphens, and apostrophes.
   * 
   * @param {string} name - Name to validate
   * @param {StringValidationOptions} options - Validation options
   * @returns {ValidationResult} Validation result
   */
  static validateName(
    name: string,
    options: StringValidationOptions = {}
  ): ValidationResult {
    return this.validateString(name, {
      minLength: 2,
      maxLength: 50,
      pattern: this.NAME_PATTERN,
      customMessage: 'Name can only contain letters, spaces, hyphens, and apostrophes',
      ...options
    });
  }
  
  /**
   * Validate Phone Number
   * 
   * Validates phone numbers in international format.
   * 
   * @param {string} phone - Phone number to validate
   * @param {ValidationOptions} options - Validation options
   * @returns {ValidationResult} Validation result
   */
  static validatePhone(
    phone: string,
    options: ValidationOptions = {}
  ): ValidationResult {
    const opts = { trim: true, sanitize: true, ...options };
    
    if (!phone || phone.trim() === '') {
      if (opts.allowEmpty) {
        return { isValid: true, sanitizedValue: '' };
      }
      return { isValid: false, error: 'Phone number is required' };
    }
    
    // Remove spaces, hyphens, parentheses for validation
    const sanitized = phone.replace(/[\s\-\(\)]/g, '');
    
    if (!this.PHONE_PATTERN.test(sanitized)) {
      return {
        isValid: false,
        error: 'Invalid phone number format. Use international format (e.g., +12125551234)',
        failedRule: 'format'
      };
    }
    
    return {
      isValid: true,
      sanitizedValue: sanitized
    };
  }
  
  /**
   * Validate URL
   * 
   * Validates URL format.
   * 
   * @param {string} url - URL to validate
   * @param {ValidationOptions} options - Validation options
   * @returns {ValidationResult} Validation result
   */
  static validateURL(
    url: string,
    options: ValidationOptions = {}
  ): ValidationResult {
    const opts = { trim: true, sanitize: true, ...options };
    
    if (!url || url.trim() === '') {
      if (opts.allowEmpty) {
        return { isValid: true, sanitizedValue: '' };
      }
      return { isValid: false, error: 'URL is required' };
    }
    
    let sanitizedURL = opts.trim ? url.trim() : url;
    
    if (!this.URL_PATTERN.test(sanitizedURL)) {
      return {
        isValid: false,
        error: 'Invalid URL format',
        failedRule: 'format'
      };
    }
    
    return {
      isValid: true,
      sanitizedValue: sanitizedURL
    };
  }
  
  // ============================================================================
  // NUMBER VALIDATION
  // ============================================================================
  
  /**
   * Validate Number
   * 
   * Validates numeric values with configurable constraints.
   * 
   * @param {any} value - Value to validate
   * @param {NumberValidationOptions} options - Validation options
   * @returns {ValidationResult} Validation result
   */
  static validateNumber(
    value: any,
    options: NumberValidationOptions = {}
  ): ValidationResult {
    const opts = {
      allowEmpty: false,
      ...options
    };
    
    // Handle empty values
    if (value === null || value === undefined || value === '') {
      if (opts.allowEmpty) {
        return { isValid: true, sanitizedValue: null };
      }
      return { isValid: false, error: 'This field is required' };
    }
    
    // Convert to number
    const num = typeof value === 'number' ? value : parseFloat(value);
    
    // Check if valid number
    if (isNaN(num)) {
      return {
        isValid: false,
        error: 'Must be a valid number',
        failedRule: 'type'
      };
    }
    
    // Check minimum
    if (opts.min !== undefined && num < opts.min) {
      return {
        isValid: false,
        error: `Must be at least ${opts.min}`,
        failedRule: 'min'
      };
    }
    
    // Check maximum
    if (opts.max !== undefined && num > opts.max) {
      return {
        isValid: false,
        error: `Must not exceed ${opts.max}`,
        failedRule: 'max'
      };
    }
    
    // Check integer requirement
    if (opts.integer && !Number.isInteger(num)) {
      return {
        isValid: false,
        error: 'Must be a whole number',
        failedRule: 'integer'
      };
    }
    
    // Check positive requirement
    if (opts.positive && num <= 0) {
      return {
        isValid: false,
        error: 'Must be a positive number',
        failedRule: 'positive'
      };
    }
    
    // Check decimal places
    if (opts.decimals !== undefined) {
      const decimalPlaces = (num.toString().split('.')[1] || '').length;
      if (decimalPlaces > opts.decimals) {
        return {
          isValid: false,
          error: `Maximum ${opts.decimals} decimal places allowed`,
          failedRule: 'decimals'
        };
      }
    }
    
    return {
      isValid: true,
      sanitizedValue: num
    };
  }
  
  // ============================================================================
  // SANITIZATION
  // ============================================================================
  
  /**
   * Sanitize String
   * 
   * Removes potentially dangerous characters and patterns.
   * Prevents XSS and injection attacks.
   * 
   * @param {string} value - String to sanitize
   * @returns {string} Sanitized string
   */
  static sanitizeString(value: string): string {
    if (!value) return '';
    
    let sanitized = value;
    
    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Remove script tags and content
    this.XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    // Encode HTML entities
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
    
    return sanitized.trim();
  }
  
  /**
   * Sanitize HTML
   * 
   * Strips all HTML tags except allowed safe ones.
   * 
   * @param {string} html - HTML string to sanitize
   * @param {string[]} allowedTags - Tags to allow (default: none)
   * @returns {string} Sanitized HTML
   */
  static sanitizeHTML(html: string, allowedTags: string[] = []): string {
    if (!html) return '';
    
    let sanitized = html;
    
    // Remove all tags except allowed ones
    if (allowedTags.length === 0) {
      // Remove all tags
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    } else {
      // Remove disallowed tags
      const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
      sanitized = sanitized.replace(tagPattern, (match, tag) => {
        return allowedTags.includes(tag.toLowerCase()) ? match : '';
      });
    }
    
    // Remove dangerous patterns
    this.XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    return sanitized.trim();
  }
  
  /**
   * Check for XSS Patterns
   * 
   * Detects potential XSS attack patterns in input.
   * 
   * @param {string} value - Value to check
   * @returns {boolean} True if XSS patterns detected
   */
  static containsXSS(value: string): boolean {
    if (!value) return false;
    
    return this.XSS_PATTERNS.some(pattern => pattern.test(value));
  }
  
  /**
   * Check for SQL Injection Patterns
   * 
   * Detects potential SQL injection patterns in input.
   * 
   * @param {string} value - Value to check
   * @returns {boolean} True if SQL injection patterns detected
   */
  static containsSQLInjection(value: string): boolean {
    if (!value) return false;
    
    return this.SQL_PATTERNS.some(pattern => pattern.test(value));
  }
  
  /**
   * Validate Against XSS
   * 
   * Validates that input doesn't contain XSS patterns.
   * 
   * @param {string} value - Value to validate
   * @returns {ValidationResult} Validation result
   */
  static validateNoXSS(value: string): ValidationResult {
    if (this.containsXSS(value)) {
      return {
        isValid: false,
        error: 'Input contains potentially dangerous content',
        failedRule: 'xss'
      };
    }
    
    return {
      isValid: true,
      sanitizedValue: value
    };
  }
  
  /**
   * Validate Against SQL Injection
   * 
   * Validates that input doesn't contain SQL injection patterns.
   * 
   * @param {string} value - Value to validate
   * @returns {ValidationResult} Validation result
   */
  static validateNoSQL(value: string): ValidationResult {
    if (this.containsSQLInjection(value)) {
      return {
        isValid: false,
        error: 'Input contains potentially dangerous content',
        failedRule: 'sql'
      };
    }
    
    return {
      isValid: true,
      sanitizedValue: value
    };
  }
  
  // ============================================================================
  // CUSTOM VALIDATORS
  // ============================================================================
  
  /**
   * Validate with Custom Rules
   * 
   * Runs value through a chain of custom validation rules.
   * 
   * @param {any} value - Value to validate
   * @param {ValidationRule[]} rules - Array of validation rules
   * @returns {ValidationResult} Validation result
   */
  static validateCustom(value: any, rules: ValidationRule[]): ValidationResult {
    for (const rule of rules) {
      if (!rule.validate(value)) {
        const message = typeof rule.message === 'function'
          ? rule.message(value)
          : rule.message;
        
        return {
          isValid: false,
          error: message,
          failedRule: rule.name
        };
      }
      
      // Stop validation chain if specified
      if (rule.stopOnFail) {
        break;
      }
    }
    
    return {
      isValid: true,
      sanitizedValue: value
    };
  }
  
  /**
   * Combine Multiple Validation Results
   * 
   * Combines results from multiple validations.
   * Returns first failure or success if all pass.
   * 
   * @param {ValidationResult[]} results - Array of validation results
   * @returns {ValidationResult} Combined result
   */
  static combineResults(results: ValidationResult[]): ValidationResult {
    const failed = results.find(r => !r.isValid);
    
    if (failed) {
      return failed;
    }
    
    return {
      isValid: true,
      sanitizedValue: results[results.length - 1]?.sanitizedValue
    };
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default InputValidator;
