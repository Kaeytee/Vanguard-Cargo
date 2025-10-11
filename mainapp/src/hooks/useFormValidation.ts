// ============================================================================
// Form Validation Hook
// ============================================================================
// Description: React hook for form validation with real-time feedback
// Author: Senior Software Engineer
// Purpose: Simplify form validation in React components
// Features: Real-time validation, error tracking, touched fields
// ============================================================================

import { useState, useCallback, useEffect } from 'react';
import { InputValidator, type ValidationResult } from '@/utils/inputValidator';

/**
 * Field Validation Rule
 * Defines validation rules for a single form field
 */
export interface FieldValidationRule {
  /** Field name */
  field: string;
  
  /** Validation function */
  validate: (value: any, formData?: any) => ValidationResult;
  
  /** Validate on change */
  validateOnChange?: boolean;
  
  /** Validate on blur */
  validateOnBlur?: boolean;
  
  /** Dependencies - other fields that trigger revalidation */
  dependencies?: string[];
}

/**
 * Form Validation Config
 */
export interface FormValidationConfig {
  /** Field validation rules */
  rules: FieldValidationRule[];
  
  /** Validate on mount */
  validateOnMount?: boolean;
  
  /** Validate all fields on submit */
  validateOnSubmit?: boolean;
}

/**
 * Validation State
 */
export interface ValidationState {
  /** Field errors (field name -> error message) */
  errors: Record<string, string>;
  
  /** Touched fields (field name -> boolean) */
  touched: Record<string, boolean>;
  
  /** Whether form is valid */
  isValid: boolean;
  
  /** Whether form is validating */
  isValidating: boolean;
  
  /** Whether form has been submitted */
  isSubmitted: boolean;
}

/**
 * useFormValidation Hook
 * 
 * Provides comprehensive form validation with:
 * - Real-time validation
 * - Error tracking
 * - Touched field tracking
 * - Submit validation
 * - Field dependencies
 * 
 * @param {FormValidationConfig} config - Validation configuration
 * @returns {Object} Validation state and methods
 */
export function useFormValidation(config: FormValidationConfig) {
  // Validation state
  const [state, setState] = useState<ValidationState>({
    errors: {},
    touched: {},
    isValid: false,
    isValidating: false,
    isSubmitted: false
  });
  
  /**
   * Validate a single field
   * 
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @param {any} formData - Complete form data
   * @returns {string | null} Error message or null
   */
  const validateField = useCallback((
    field: string,
    value: any,
    formData?: any
  ): string | null => {
    // Find validation rule for field
    const rule = config.rules.find(r => r.field === field);
    
    if (!rule) {
      return null;
    }
    
    // Run validation
    const result = rule.validate(value, formData);
    
    return result.isValid ? null : (result.error || 'Invalid value');
  }, [config.rules]);
  
  /**
   * Validate all fields
   * 
   * @param {any} formData - Complete form data
   * @returns {Object} Errors object and validity
   */
  const validateAll = useCallback((formData: any): {
    errors: Record<string, string>;
    isValid: boolean;
  } => {
    const errors: Record<string, string> = {};
    
    // Validate each field
    config.rules.forEach(rule => {
      const value = formData[rule.field];
      const error = validateField(rule.field, value, formData);
      
      if (error) {
        errors[rule.field] = error;
      }
    });
    
    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  }, [config.rules, validateField]);
  
  /**
   * Handle field change
   * Validates field if validateOnChange is enabled
   * 
   * @param {string} field - Field name
   * @param {any} value - New value
   * @param {any} formData - Complete form data
   */
  const handleFieldChange = useCallback((
    field: string,
    value: any,
    formData?: any
  ) => {
    const rule = config.rules.find(r => r.field === field);
    
    if (!rule || !rule.validateOnChange) {
      return;
    }
    
    const error = validateField(field, value, formData);
    
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error || ''
      }
    }));
    
    // Revalidate dependent fields
    if (rule.dependencies) {
      rule.dependencies.forEach(depField => {
        const depValue = formData?.[depField];
        const depError = validateField(depField, depValue, formData);
        
        setState(prev => ({
          ...prev,
          errors: {
            ...prev.errors,
            [depField]: depError || ''
          }
        }));
      });
    }
  }, [config.rules, validateField]);
  
  /**
   * Handle field blur
   * Marks field as touched and validates if validateOnBlur is enabled
   * 
   * @param {string} field - Field name
   * @param {any} value - Current value
   * @param {any} formData - Complete form data
   */
  const handleFieldBlur = useCallback((
    field: string,
    value: any,
    formData?: any
  ) => {
    // Mark as touched
    setState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [field]: true
      }
    }));
    
    const rule = config.rules.find(r => r.field === field);
    
    if (!rule || !rule.validateOnBlur) {
      return;
    }
    
    const error = validateField(field, value, formData);
    
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error || ''
      }
    }));
  }, [config.rules, validateField]);
  
  /**
   * Handle form submit
   * Validates all fields and marks them as touched
   * 
   * @param {any} formData - Complete form data
   * @returns {boolean} Whether form is valid
   */
  const handleSubmit = useCallback((formData: any): boolean => {
    setState(prev => ({ ...prev, isValidating: true, isSubmitted: true }));
    
    const { errors, isValid } = validateAll(formData);
    
    // Mark all fields as touched
    const touched: Record<string, boolean> = {};
    config.rules.forEach(rule => {
      touched[rule.field] = true;
    });
    
    setState(prev => ({
      ...prev,
      errors,
      touched,
      isValid,
      isValidating: false
    }));
    
    return isValid;
  }, [config.rules, validateAll]);
  
  /**
   * Reset validation state
   */
  const reset = useCallback(() => {
    setState({
      errors: {},
      touched: {},
      isValid: false,
      isValidating: false,
      isSubmitted: false
    });
  }, []);
  
  /**
   * Set field error manually
   * 
   * @param {string} field - Field name
   * @param {string} error - Error message
   */
  const setFieldError = useCallback((field: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error
      },
      isValid: false
    }));
  }, []);
  
  /**
   * Clear field error
   * 
   * @param {string} field - Field name
   */
  const clearFieldError = useCallback((field: string) => {
    setState(prev => {
      const { [field]: _, ...restErrors } = prev.errors;
      return {
        ...prev,
        errors: restErrors
      };
    });
  }, []);
  
  /**
   * Get field error (only if touched or submitted)
   * 
   * @param {string} field - Field name
   * @returns {string | undefined} Error message
   */
  const getFieldError = useCallback((field: string): string | undefined => {
    const isTouched = state.touched[field];
    const isSubmitted = state.isSubmitted;
    
    if (!isTouched && !isSubmitted) {
      return undefined;
    }
    
    return state.errors[field] || undefined;
  }, [state.errors, state.touched, state.isSubmitted]);
  
  /**
   * Check if field has error
   * 
   * @param {string} field - Field name
   * @returns {boolean} Whether field has error
   */
  const hasFieldError = useCallback((field: string): boolean => {
    return !!getFieldError(field);
  }, [getFieldError]);
  
  // Validate on mount if enabled
  useEffect(() => {
    if (config.validateOnMount) {
      // Will need formData to validate - skip for now
      // Could be implemented with initial values
    }
  }, [config.validateOnMount]);
  
  return {
    // State
    errors: state.errors,
    touched: state.touched,
    isValid: state.isValid,
    isValidating: state.isValidating,
    isSubmitted: state.isSubmitted,
    
    // Methods
    validateField,
    validateAll,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    reset,
    setFieldError,
    clearFieldError,
    getFieldError,
    hasFieldError
  };
}

/**
 * Common Form Validators
 * Pre-built validators for common form fields
 */
export const FormValidators = {
  /**
   * Required field validator
   */
  required: (fieldName: string = 'This field'): FieldValidationRule => ({
    field: fieldName,
    validate: (value) => InputValidator.validateString(value, { allowEmpty: false }),
    validateOnBlur: true
  }),
  
  /**
   * Email validator
   */
  email: (fieldName: string = 'email'): FieldValidationRule => ({
    field: fieldName,
    validate: (value) => InputValidator.validateEmail(value),
    validateOnBlur: true
  }),
  
  /**
   * Password validator
   */
  password: (
    fieldName: string = 'password',
    options?: { minLength?: number; requireStrong?: boolean }
  ): FieldValidationRule => ({
    field: fieldName,
    validate: (value) => InputValidator.validatePassword(value, {
      minLength: options?.minLength || 8,
      requireUppercase: options?.requireStrong !== false,
      requireLowercase: options?.requireStrong !== false,
      requireNumber: options?.requireStrong !== false,
      requireSpecial: options?.requireStrong !== false
    }),
    validateOnBlur: true
  }),
  
  /**
   * Password confirmation validator
   */
  passwordConfirm: (
    fieldName: string = 'confirmPassword',
    passwordField: string = 'password'
  ): FieldValidationRule => ({
    field: fieldName,
    validate: (value, formData) => {
      if (value !== formData?.[passwordField]) {
        return {
          isValid: false,
          error: 'Passwords do not match'
        };
      }
      return { isValid: true };
    },
    validateOnBlur: true,
    dependencies: [passwordField]
  }),
  
  /**
   * Name validator
   */
  name: (fieldName: string): FieldValidationRule => ({
    field: fieldName,
    validate: (value) => InputValidator.validateName(value),
    validateOnBlur: true
  }),
  
  /**
   * Phone validator
   */
  phone: (fieldName: string = 'phone'): FieldValidationRule => ({
    field: fieldName,
    validate: (value) => InputValidator.validatePhone(value),
    validateOnBlur: true
  }),
  
  /**
   * Number validator
   */
  number: (
    fieldName: string,
    options?: { min?: number; max?: number; integer?: boolean }
  ): FieldValidationRule => ({
    field: fieldName,
    validate: (value) => InputValidator.validateNumber(value, options),
    validateOnBlur: true
  })
};

/**
 * useFieldValidation Hook
 * 
 * Simplified hook for validating a single field.
 * 
 * @param {Function} validator - Validation function
 * @returns {Object} Field validation state and methods
 */
export function useFieldValidation(
  validator: (value: any) => ValidationResult
) {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  
  const validate = useCallback((value: any): boolean => {
    const result = validator(value);
    setError(result.isValid ? null : (result.error || 'Invalid value'));
    return result.isValid;
  }, [validator]);
  
  const handleBlur = useCallback((value: any) => {
    setTouched(true);
    validate(value);
  }, [validate]);
  
  const handleChange = useCallback((value: any) => {
    if (touched) {
      validate(value);
    }
  }, [touched, validate]);
  
  const reset = useCallback(() => {
    setError(null);
    setTouched(false);
  }, []);
  
  return {
    error: touched ? error : null,
    touched,
    hasError: touched && !!error,
    validate,
    handleBlur,
    handleChange,
    reset
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default useFormValidation;
