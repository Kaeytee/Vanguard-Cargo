// ============================================================================
// API Request/Response Validator
// ============================================================================
// Description: Validates API requests and responses for security
// Author: Senior Software Engineer
// Purpose: Prevent malicious requests and ensure data integrity
// Features: Schema validation, sanitization, type checking
// ============================================================================

import { InputValidator } from '@/utils/inputValidator';

/**
 * API Request Schema
 */
export interface APIRequestSchema {
  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  
  /** Required headers */
  requiredHeaders?: string[];
  
  /** Required query parameters */
  requiredParams?: string[];
  
  /** Body schema (for POST/PUT/PATCH) */
  bodySchema?: Record<string, ValidationRule>;
  
  /** Maximum request size (bytes) */
  maxSize?: number;
  
  /** Allowed content types */
  allowedContentTypes?: string[];
}

/**
 * Validation Rule
 */
export interface ValidationRule {
  /** Field type */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'uuid';
  
  /** Whether field is required */
  required?: boolean;
  
  /** Minimum value/length */
  min?: number;
  
  /** Maximum value/length */
  max?: number;
  
  /** Regex pattern */
  pattern?: RegExp;
  
  /** Allowed values (enum) */
  enum?: any[];
  
  /** Custom validator function */
  validator?: (value: any) => boolean;
  
  /** Nested schema (for objects/arrays) */
  schema?: Record<string, ValidationRule>;
  
  /** Sanitize value */
  sanitize?: boolean;
}

/**
 * Validation Result
 */
export interface APIValidationResult {
  /** Whether validation passed */
  valid: boolean;
  
  /** Validation errors */
  errors: string[];
  
  /** Sanitized data */
  sanitizedData?: any;
  
  /** Warnings (non-blocking) */
  warnings?: string[];
}

/**
 * APIValidator Class
 * 
 * Validates API requests and responses against defined schemas.
 * Ensures data integrity and prevents malicious inputs.
 * 
 * Features:
 * - Schema-based validation
 * - Type checking
 * - Data sanitization
 * - Size limits
 * - Content type validation
 * - Custom validators
 * 
 * @class APIValidator
 */
export class APIValidator {
  /**
   * Validate API request
   * 
   * @param {any} request - Request object
   * @param {APIRequestSchema} schema - Validation schema
   * @returns {APIValidationResult} Validation result
   */
  static validateRequest(
    request: {
      method?: string;
      headers?: Record<string, string>;
      params?: Record<string, any>;
      body?: any;
      size?: number;
    },
    schema: APIRequestSchema
  ): APIValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let sanitizedData: any = {};
    
    // Validate HTTP method
    if (schema.method && request.method !== schema.method) {
      errors.push(`Invalid HTTP method. Expected ${schema.method}, got ${request.method}`);
    }
    
    // Validate required headers
    if (schema.requiredHeaders) {
      schema.requiredHeaders.forEach(header => {
        if (!request.headers?.[header.toLowerCase()]) {
          errors.push(`Missing required header: ${header}`);
        }
      });
    }
    
    // Validate required params
    if (schema.requiredParams) {
      schema.requiredParams.forEach(param => {
        if (!request.params?.[param]) {
          errors.push(`Missing required parameter: ${param}`);
        }
      });
    }
    
    // Validate request size
    if (schema.maxSize && request.size && request.size > schema.maxSize) {
      errors.push(`Request too large. Max size: ${schema.maxSize} bytes`);
    }
    
    // Validate content type
    if (schema.allowedContentTypes && request.headers?.['content-type']) {
      const contentType = request.headers['content-type'];
      const isAllowed = schema.allowedContentTypes.some(type => 
        contentType.includes(type)
      );
      
      if (!isAllowed) {
        errors.push(`Invalid content type. Allowed: ${schema.allowedContentTypes.join(', ')}`);
      }
    }
    
    // Validate body schema
    if (schema.bodySchema && request.body) {
      const bodyValidation = this.validateObject(request.body, schema.bodySchema);
      errors.push(...bodyValidation.errors);
      warnings.push(...(bodyValidation.warnings || []));
      sanitizedData = bodyValidation.sanitizedData;
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      sanitizedData: Object.keys(sanitizedData).length > 0 ? sanitizedData : request.body
    };
  }
  
  /**
   * Validate object against schema
   * 
   * @param {any} data - Data to validate
   * @param {Record<string, ValidationRule>} schema - Validation schema
   * @returns {APIValidationResult} Validation result
   */
  static validateObject(
    data: any,
    schema: Record<string, ValidationRule>
  ): APIValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const sanitizedData: any = {};
    
    // Check for missing required fields
    Object.entries(schema).forEach(([key, rule]) => {
      if (rule.required && !(key in data)) {
        errors.push(`Missing required field: ${key}`);
      }
    });
    
    // Validate each field
    Object.entries(data).forEach(([key, value]) => {
      const rule = schema[key];
      
      // Unknown field
      if (!rule) {
        warnings.push(`Unknown field: ${key}`);
        return;
      }
      
      // Validate field
      const fieldValidation = this.validateField(key, value, rule);
      errors.push(...fieldValidation.errors);
      
      // Store sanitized value
      if (fieldValidation.sanitizedData !== undefined) {
        sanitizedData[key] = fieldValidation.sanitizedData;
      } else {
        sanitizedData[key] = value;
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      sanitizedData
    };
  }
  
  /**
   * Validate individual field
   * 
   * @param {string} key - Field name
   * @param {any} value - Field value
   * @param {ValidationRule} rule - Validation rule
   * @returns {APIValidationResult} Validation result
   */
  static validateField(
    key: string,
    value: any,
    rule: ValidationRule
  ): APIValidationResult {
    const errors: string[] = [];
    let sanitizedValue = value;
    
    // Type validation
    const typeValid = this.validateType(value, rule.type);
    if (!typeValid) {
      errors.push(`Invalid type for ${key}. Expected ${rule.type}`);
      return { valid: false, errors };
    }
    
    // Sanitize if needed
    if (rule.sanitize && typeof value === 'string') {
      sanitizedValue = InputValidator.sanitizeString(value);
    }
    
    // Type-specific validation
    switch (rule.type) {
      case 'string':
        this.validateString(key, sanitizedValue, rule, errors);
        break;
      
      case 'number':
        this.validateNumber(key, value, rule, errors);
        break;
      
      case 'array':
        this.validateArray(key, value, rule, errors);
        break;
      
      case 'object':
        if (rule.schema) {
          const objValidation = this.validateObject(value, rule.schema);
          errors.push(...objValidation.errors);
          sanitizedValue = objValidation.sanitizedData;
        }
        break;
      
      case 'email':
        const emailResult = InputValidator.validateEmail(sanitizedValue);
        if (!emailResult.isValid) {
          errors.push(`Invalid email for ${key}: ${emailResult.error}`);
        } else {
          sanitizedValue = emailResult.sanitizedValue;
        }
        break;
      
      case 'url':
        const urlResult = InputValidator.validateURL(sanitizedValue);
        if (!urlResult.isValid) {
          errors.push(`Invalid URL for ${key}: ${urlResult.error}`);
        }
        break;
      
      case 'uuid':
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
          errors.push(`Invalid UUID for ${key}`);
        }
        break;
    }
    
    // Enum validation
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`Invalid value for ${key}. Allowed: ${rule.enum.join(', ')}`);
    }
    
    // Custom validator
    if (rule.validator && !rule.validator(value)) {
      errors.push(`Custom validation failed for ${key}`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      sanitizedData: sanitizedValue
    };
  }
  
  /**
   * Validate type
   */
  private static validateType(value: any, type: ValidationRule['type']): boolean {
    switch (type) {
      case 'string':
      case 'email':
      case 'url':
      case 'uuid':
        return typeof value === 'string';
      
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      
      case 'boolean':
        return typeof value === 'boolean';
      
      case 'array':
        return Array.isArray(value);
      
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      
      default:
        return false;
    }
  }
  
  /**
   * Validate string
   */
  private static validateString(
    key: string,
    value: string,
    rule: ValidationRule,
    errors: string[]
  ): void {
    if (rule.min !== undefined && value.length < rule.min) {
      errors.push(`${key} must be at least ${rule.min} characters`);
    }
    
    if (rule.max !== undefined && value.length > rule.max) {
      errors.push(`${key} must not exceed ${rule.max} characters`);
    }
    
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(`${key} does not match required pattern`);
    }
  }
  
  /**
   * Validate number
   */
  private static validateNumber(
    key: string,
    value: number,
    rule: ValidationRule,
    errors: string[]
  ): void {
    if (rule.min !== undefined && value < rule.min) {
      errors.push(`${key} must be at least ${rule.min}`);
    }
    
    if (rule.max !== undefined && value > rule.max) {
      errors.push(`${key} must not exceed ${rule.max}`);
    }
  }
  
  /**
   * Validate array
   */
  private static validateArray(
    key: string,
    value: any[],
    rule: ValidationRule,
    errors: string[]
  ): void {
    if (rule.min !== undefined && value.length < rule.min) {
      errors.push(`${key} must have at least ${rule.min} items`);
    }
    
    if (rule.max !== undefined && value.length > rule.max) {
      errors.push(`${key} must not have more than ${rule.max} items`);
    }
    
    // Validate array items if schema provided
    if (rule.schema) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && !Array.isArray(item)) {
          const itemValidation = this.validateObject(item, rule.schema!);
          if (!itemValidation.valid) {
            errors.push(`${key}[${index}]: ${itemValidation.errors.join(', ')}`);
          }
        }
      });
    }
  }
  
  /**
   * Validate response data
   * 
   * @param {any} response - Response data
   * @param {Record<string, ValidationRule>} schema - Expected schema
   * @returns {APIValidationResult} Validation result
   */
  static validateResponse(
    response: any,
    schema: Record<string, ValidationRule>
  ): APIValidationResult {
    return this.validateObject(response, schema);
  }
  
  /**
   * Create schema from example
   * 
   * @param {any} example - Example object
   * @returns {Record<string, ValidationRule>} Generated schema
   */
  static createSchemaFromExample(example: any): Record<string, ValidationRule> {
    const schema: Record<string, ValidationRule> = {};
    
    Object.entries(example).forEach(([key, value]) => {
      const type = Array.isArray(value) ? 'array' :
                   typeof value === 'object' ? 'object' :
                   typeof value as ValidationRule['type'];
      
      schema[key] = {
        type,
        required: true
      };
      
      if (type === 'object' && value !== null) {
        schema[key].schema = this.createSchemaFromExample(value);
      }
    });
    
    return schema;
  }
}

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

/**
 * User registration schema
 */
export const userRegistrationSchema: Record<string, ValidationRule> = {
  email: {
    type: 'email',
    required: true,
    sanitize: true
  },
  password: {
    type: 'string',
    required: true,
    min: 8,
    max: 128
  },
  firstName: {
    type: 'string',
    required: true,
    min: 2,
    max: 50,
    sanitize: true
  },
  lastName: {
    type: 'string',
    required: true,
    min: 2,
    max: 50,
    sanitize: true
  },
  phone: {
    type: 'string',
    required: false,
    pattern: /^\+?[1-9]\d{1,14}$/
  }
};

/**
 * Package creation schema
 */
export const packageCreationSchema: Record<string, ValidationRule> = {
  tracking_number: {
    type: 'string',
    required: true,
    min: 5,
    max: 50,
    sanitize: true
  },
  description: {
    type: 'string',
    required: false,
    max: 500,
    sanitize: true
  },
  weight: {
    type: 'number',
    required: false,
    min: 0,
    max: 10000
  },
  declared_value: {
    type: 'number',
    required: false,
    min: 0,
    max: 1000000
  },
  store_name: {
    type: 'string',
    required: false,
    max: 100,
    sanitize: true
  }
};

// ============================================================================
// EXPORT
// ============================================================================

export default APIValidator;
