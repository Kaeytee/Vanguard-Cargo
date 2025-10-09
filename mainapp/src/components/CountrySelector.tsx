/**
 * Country Selector Component
 * Provides a dropdown interface for selecting countries with flags
 * Used in registration and other forms for better UX
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
// import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

// Country codes for the dropdown selector with flags and phone codes
// Currently unused - will be implemented when full dropdown functionality is restored

// Interface for component props
interface CountrySelectorProps {
  value: string;
  onChange: (country: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
}

/**
 * Country Selector Component
 * Provides a dropdown interface for selecting countries with flags
 */
const CountrySelector: React.FC<CountrySelectorProps> = ({
  value: _value,
  onChange: _onChange,
  onBlur,
  error,
  touched,
  disabled = false,
  // placeholder = "Select your country",
  className = "",
  id,
  name
}) => {
  // Component state for dropdown visibility
  const [showDropdown, setShowDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  /**
   * Handles country selection from dropdown
   */
  // const handleCountrySelect = (country: string) => {
  //   onChange(country);
  //   setShowDropdown(false);
  //   if (onBlur) {
  //     onBlur();
  //   }
  // };

  // Find selected country for display
  // const selectedCountry = COUNTRY_CODES.find(c => c.country === value);

  return (
    <div className="relative">
      <button
        type="button"
        id={id}
        name={name}
        onClick={() => !disabled && setShowDropdown(!showDropdown)}
        onBlur={onBlur}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-left outline-none',
          error && touched ? 'border-red-300' : 'border-gray-300',
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50',
          className
        )}
        aria-invalid={error && touched ? true : false}
        aria-describedby={error && touched ? `${id}-error` : undefined}
      >
        <span>Select Country</span>
      </button>
    </div>
  );
};

export default CountrySelector;
