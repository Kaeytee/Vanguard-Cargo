// ============================================================================
// Validated Input Component
// ============================================================================
// Description: Reusable input component with built-in validation
// Author: Senior Software Engineer
// Purpose: Simplify form validation and error display
// Features: Real-time validation, error messages, sanitization
// ============================================================================

import React, { useState, useCallback, type InputHTMLAttributes } from 'react';
import { InputValidator, type ValidationResult } from '@/utils/inputValidator';
import { AlertCircle } from 'lucide-react';

/**
 * Validated Input Props
 */
export interface ValidatedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur'> {
  /** Input label */
  label?: string;
  
  /** Input name */
  name: string;
  /** Validation function */
  validator?: (value: string) => ValidationResult;
  
  /** On change callback with validated value */
  onChange?: (value: string, isValid: boolean) => void;
  onBlur?: (value: string) => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>; /* focus callback */
  
  /** Validate on change */
  validateOnChange?: boolean;
  /** Validate on blur */
  validateOnBlur?: boolean;
  
  /** Show error only when touched */
  showErrorOnlyWhenTouched?: boolean;
  
  /** Custom error message */
  customError?: string;
  
  /** Helper text */
  helperText?: string;
  
  /** Required field */
  required?: boolean;
  
  /** Sanitize input */
  sanitize?: boolean;
  
  /** Container class name */
  containerClassName?: string;
  
  /** Label class name */
  labelClassName?: string;
  
  /** Input class name */
  inputClassName?: string;
  
  /** Error class name */
  errorClassName?: string;
}

/**
 * ValidatedInput Component
 * 
 * Input component with built-in validation and error display.
 * Provides real-time validation feedback and sanitization.
 * 
 * @component
 */
export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  name,
  validator,
  onChange,
  onBlur,
  validateOnChange = false,
  validateOnBlur = true,
  showErrorOnlyWhenTouched = true,
  customError,
  helperText,
  required = false,
  sanitize = true,
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  value: controlledValue,
  ...inputProps
}) => {
  // Component state
  const [internalValue, setInternalValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);
  
  // Use controlled value if provided, otherwise use internal state
  const value = controlledValue !== undefined ? String(controlledValue) : internalValue;
  
  /**
   * Validate input value
   */
  const validate = useCallback((val: string): ValidationResult => {
    // Use custom validator if provided
    if (validator) {
      return validator(val);
    }
    
    // Default validation: required check
    if (required && !val.trim()) {
      return {
        isValid: false,
        error: `${label || name} is required`
      };
    }
    
    return { isValid: true, sanitizedValue: val };
  }, [validator, required, label, name]);
  
  /**
   * Handle input change
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Sanitize if enabled
    if (sanitize) {
      newValue = InputValidator.sanitizeString(newValue);
    }
    
    // Update value
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    
    // Validate on change if enabled
    if (validateOnChange || touched) {
      const result = validate(newValue);
      setError(result.error || null);
      setIsValid(result.isValid);
      
      // Call onChange with validation result
      onChange?.(newValue, result.isValid);
    } else {
      // Call onChange without validation
      onChange?.(newValue, true);
    }
  }, [controlledValue, sanitize, validateOnChange, touched, validate, onChange]);
  
  /**
   * Handle input blur
   */
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Mark as touched
    setTouched(true);
    
    // Validate on blur if enabled
    if (validateOnBlur) {
      const result = validate(val);
      setError(result.error || null);
      setIsValid(result.isValid);
    }
    
    // Call onBlur callback
    onBlur?.(val);
  }, [validateOnBlur, validate, onBlur]);
  
  // Determine if error should be shown
  const shouldShowError = showErrorOnlyWhenTouched ? touched : true;
  const displayError = customError || (shouldShowError ? error : null);
  
  // Determine input border color
  const borderColor = displayError 
    ? 'border-red-500 focus:ring-red-500' 
    : isValid && touched 
      ? 'border-green-500 focus:ring-green-500'
      : 'border-gray-300 focus:ring-red-600';
  
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input */}
      <div className="relative">
        <input
          {...inputProps}
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          required={required}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2
            ${borderColor}
            ${displayError ? 'pr-10' : ''}
            ${inputClassName}
          `}
          aria-invalid={!!displayError}
          aria-describedby={displayError ? `${name}-error` : undefined}
        />
        
        {/* Error icon */}
        {displayError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
      
      {/* Error message */}
      {displayError && (
        <p
          id={`${name}-error`}
          className={`mt-1 text-sm text-red-600 ${errorClassName}`}
          role="alert"
        >
          {displayError}
        </p>
      )}
      
      {/* Helper text */}
      {!displayError && helperText && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

/**
 * Email Input Component
 * Pre-configured input for email addresses
 */
export const EmailInput: React.FC<Omit<ValidatedInputProps, 'validator' | 'type'>> = (props) => {
  return (
    <ValidatedInput
      {...props}
      type="email"
      validator={(value) => InputValidator.validateEmail(value)}
      validateOnBlur={true}
    />
  );
};

/**
 * Password Input Component
 * Pre-configured input for passwords with strength indicator
 */
export const PasswordInput: React.FC<Omit<ValidatedInputProps, 'validator' | 'type'> & {
  showStrengthIndicator?: boolean;
}> = ({ showStrengthIndicator = false, ...props }) => {
  const [strength, setStrength] = useState(0);
  
  const handleChange = useCallback((value: string, isValid: boolean) => {
    if (showStrengthIndicator) {
      const strengthScore = InputValidator.calculatePasswordStrength(value);
      setStrength(strengthScore);
    }
    props.onChange?.(value, isValid);
  }, [showStrengthIndicator, props]);
  
  const getStrengthColor = () => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getStrengthText = () => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };
  
  return (
    <div>
      <ValidatedInput
        {...props}
        type="password"
        onChange={handleChange}
        validator={(value) => InputValidator.validatePassword(value)}
        validateOnBlur={true}
      />
      
      {showStrengthIndicator && strength > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Password strength:</span>
            <span className="text-xs font-medium">{getStrengthText()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${getStrengthColor()}`}
              style={{ width: `${strength}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Phone Input Component
 * Pre-configured input for phone numbers
 */
export const PhoneInput: React.FC<Omit<ValidatedInputProps, 'validator' | 'type'>> = (props) => {
  return (
    <ValidatedInput
      {...props}
      type="tel"
      validator={(value) => InputValidator.validatePhone(value)}
      validateOnBlur={true}
      placeholder="+1234567890"
    />
  );
};

/**
 * Number Input Component
 * Pre-configured input for numbers
 */
export const NumberInput: React.FC<Omit<ValidatedInputProps, 'validator' | 'type'> & {
  min?: number;
  max?: number;
  integer?: boolean;
}> = ({ min, max, integer, ...props }) => {
  return (
    <ValidatedInput
      {...props}
      type="number"
      validator={(value) => InputValidator.validateNumber(value, { min, max, integer })}
      validateOnBlur={true}
    />
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default ValidatedInput;
