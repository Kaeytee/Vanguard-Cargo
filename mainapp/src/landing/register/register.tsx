import React, { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { parsePhoneNumber } from 'libphonenumber-js';
import { cn } from '../../lib/utils';
import registerbg from '../../images/register-bg.jpg';
import { useNavigate } from 'react-router-dom';
import DeliveryImage from '../../images/delivery-man.png';
import { useAuth } from '../../hooks/useAuth';
import { RegisterSuccessStep } from './RegisterSuccessStep';

/**
 * Register component - Displays the Register/Signup page with animations
 * @returns {JSX.Element} The Register page component
 */
export default function Register() {
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    agreeToMarketing: false,
  });

  // UI state and validation
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [errors, setErrors] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    agreeToTerms: string;
    general: string;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    agreeToTerms: '',
    general: '',
  });
  const [success, setSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<{
    email: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [touched, setTouched] = useState<{
    firstName: boolean;
    lastName: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
    phoneNumber: boolean;
    address: boolean;
    city: boolean;
    state: boolean;
    zip: boolean;
    country: boolean;
    agreeToTerms: boolean;
  }>({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
    phoneNumber: false,
    address: false,
    city: false,
    state: false,
    zip: false,
    country: false,
    agreeToTerms: false,
  });
  
  const navigate = useNavigate();
  const { signUp } = useAuth();


  // Handle form input changes with real-time validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Mark field as touched
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    // Real-time validation for the specific field
    const updatedFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };
    
    // Validate specific field
    const fieldErrors = validateField(name, updatedFormData);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldErrors,
    }));
  };

  // Handle phone number change with real-time validation
  const handlePhoneChange = (value?: string) => {
    // First update the phone number in the form data
    setFormData((prev) => ({ ...prev, phoneNumber: value || '' }));
    
    // Mark phone field as touched
    setTouched((prev) => ({ ...prev, phoneNumber: true }));
    
    // Real-time validation for phone number
    if (value && !isValidPhoneNumber(value)) {
      setPhoneError('Please enter a valid phone number');
      setErrors((prev) => ({ ...prev, phoneNumber: 'Please enter a valid phone number' }));
    } else if (!value) {
      setPhoneError('Phone number is required');
      setErrors((prev) => ({ ...prev, phoneNumber: 'Phone number is required' }));
    } else {
      // Clear any phone error
      setPhoneError('');
      setErrors((prev) => ({ ...prev, phoneNumber: '' }));
    }
    
    // Auto-set country based on phone number using libphonenumber-js
    if (value && isValidPhoneNumber(value)) {
      try {
        // Parse the phone number to get country information
        const phoneNumberData = parsePhoneNumber(value);
        
        if (phoneNumberData && phoneNumberData.country) {
          // Get the country name from the country code
          const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(phoneNumberData.country);
          
          if (countryName) {
            // Update the country field with the detected country name
            // Use a separate state update to ensure it renders properly
            setTimeout(() => {
              setFormData((prev) => {
                const updated = { ...prev, country: countryName };
                return updated;
              });
              
              // Mark the country field as touched to trigger validation
              setTouched((prev) => ({ ...prev, country: true }));
              
              // Clear any country field error since we've set it automatically
              setErrors((prev) => ({ ...prev, country: '' }));
            }, 0);
          }
        }
      } catch (error) {
        // If there's an error parsing the phone number, don't update the country
        console.log('Error detecting country from phone number:', error);
      }
    }
  };

  // Email validation helper
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validate single field for real-time validation
  const validateField = (fieldName: string, data: typeof formData): string => {
    switch (fieldName) {
      case 'firstName':
        return !data.firstName ? 'First name is required' : '';
      case 'lastName':
        return !data.lastName ? 'Last name is required' : '';
      case 'email':
        if (!data.email) return 'Email is required';
        return !isValidEmail(data.email) ? 'Please enter a valid email address' : '';
      case 'password':
        if (!data.password) return 'Password is required';
        return data.password.length < 8 ? 'Password must be at least 8 characters' : '';
      case 'confirmPassword':
        if (!data.confirmPassword) return 'Please confirm your password';
        return data.password !== data.confirmPassword ? 'Passwords do not match' : '';
      case 'phoneNumber':
        if (!data.phoneNumber) return 'Phone number is required';
        return !isValidPhoneNumber(data.phoneNumber) ? 'Valid phone number is required' : '';
      case 'country':
        return !data.country ? 'Country is required' : '';
      case 'agreeToTerms':
        return !data.agreeToTerms ? 'You must agree to the terms of service' : '';
      default:
        return '';
    }
  };

  // Validate all fields
  const validate = () => {
    const newErrors: typeof errors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      agreeToTerms: '',
      general: '',
    };
    
    // Use validateField for each field
    newErrors.firstName = validateField('firstName', formData);
    newErrors.lastName = validateField('lastName', formData);
    newErrors.email = validateField('email', formData);
    newErrors.password = validateField('password', formData);
    newErrors.confirmPassword = validateField('confirmPassword', formData);
    newErrors.phoneNumber = validateField('phoneNumber', formData);
    newErrors.country = validateField('country', formData);
    newErrors.agreeToTerms = validateField('agreeToTerms', formData);
    
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default form submission behavior
    e.preventDefault();
    
    // Validate form
    const newErrors = validate();
    setErrors(newErrors);
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error)) {
      // If there are errors, focus on the first error field
      const firstErrorField = Object.keys(newErrors).find(key => newErrors[key as keyof typeof newErrors]);
      if (firstErrorField) {
        const errorElement = document.getElementById(firstErrorField);
        if (errorElement) {
          errorElement.focus();
        }
      }
      return;
    }

    // Removed loading state to eliminate blue loading screen
    setErrors(prev => ({ ...prev, general: '' }));

    try {
      // Use Supabase signUp function
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phoneNumber,
      });

      if (!result.error) {
        // Store user data before clearing form
        setRegisteredUser({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName
        });
        
        setSuccess(true);
        
        // Clear form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          password: '',
          confirmPassword: '',
          agreeToTerms: false,
          agreeToMarketing: false,
        });
        setTouched({
          firstName: false,
          lastName: false,
          email: false,
          password: false,
          confirmPassword: false,
          phoneNumber: false,
          address: false,
          city: false,
          state: false,
          zip: false,
          country: false,
          agreeToTerms: false,
        });
        
        // Show success step instead of immediate redirect
        // The success step will handle navigation to login
      } else {
        // Convert technical errors to user-friendly messages
        let userFriendlyMessage = 'Registration failed. Please try again.';
        
        if (result.error) {
          const errorMsg = result.error.toLowerCase();
          
          if (errorMsg.includes('email') && errorMsg.includes('already')) {
            userFriendlyMessage = 'An account with this email already exists. Please try logging in instead.';
          } else if (errorMsg.includes('permission denied') || errorMsg.includes('policy')) {
            userFriendlyMessage = 'Registration is temporarily unavailable. Please try again in a few minutes.';
          } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
            userFriendlyMessage = 'Network error. Please check your connection and try again.';
          } else if (errorMsg.includes('password')) {
            userFriendlyMessage = 'Password must be at least 6 characters long.';
          } else if (errorMsg.includes('invalid') && errorMsg.includes('email')) {
            userFriendlyMessage = 'Please enter a valid email address.';
          } else if (errorMsg.includes('rate') || errorMsg.includes('429') || errorMsg.includes('too many')) {
            userFriendlyMessage = 'Too many registration attempts. Please wait 5 minutes before trying again.';
          }
        }
        
        setErrors((prev) => ({ ...prev, general: userFriendlyMessage }));
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrors(prev => ({ 
        ...prev, 
        general: 'Registration is temporarily unavailable. Please try again in a few minutes.' 
      }));
    } finally {
      // Removed setLoading(false) to eliminate loading state
    }
  };

  // Form validation
  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    isValidEmail(formData.email) &&
    formData.phoneNumber &&
    isValidPhoneNumber(formData.phoneNumber) &&
    !phoneError &&
    formData.password &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword &&
    formData.agreeToTerms;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    // Validate only the specific field that lost focus
    const fieldError = validateField(name, formData);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4" style={{ backgroundImage: `url(${registerbg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <style>
        {`
          .error-shake {
            animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
          }
          @keyframes shake {
            10%, 90% { transform: translateX(-1px); }
            20%, 80% { transform: translateX(2px); }
            30%, 50%, 70% { transform: translateX(-4px); }
            40%, 60% { transform: translateX(4px); }
          }
        `}
      </style>
      <div className="w-full max-w-6xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[700px]">
          {/* Left panel: Delivery image */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center p-8" style={{ backgroundImage: `url(${DeliveryImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="w-32 h-32 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24">
                <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-transparent">Join Vanguard</h3>
            <p className="text-transparent">Your cargo journey starts here</p>
          </div>

          {/* Right panel: Registration form */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <div className="max-w-lg mx-auto w-full">
                {success ? (
                  <RegisterSuccessStep
                    email={registeredUser?.email || formData.email}
                    userName={`${registeredUser?.firstName || formData.firstName} ${registeredUser?.lastName || formData.lastName}`}
                    onGoToLogin={() => {
                      navigate(`/login?email=${encodeURIComponent(registeredUser?.email || formData.email)}&fromRegistration=true`);
                    }}
                  />
                ) : (
                  <React.Fragment>
                    <div className="mb-8 text-center lg:text-left">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                      <p className="text-gray-600">Begin your cargo journey here</p>
                    </div>
                    {/* Error Message */}
                    {errors.general && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 error-shake">
                        {errors.general}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="John"
                        className={cn(
                          'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none',
                          errors.firstName && touched.firstName ? 'border-red-300' : 'border-gray-300'
                        )}
                        aria-invalid={!!errors.firstName}
                        aria-describedby="firstName-error"
                      />
                      {errors.firstName && touched.firstName && (
                        <p id="firstName-error" className="mt-1 text-sm text-red-600">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Doe"
                        className={cn(
                          'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none',
                          errors.lastName && touched.lastName ? 'border-red-300' : 'border-gray-300'
                        )}
                        aria-invalid={!!errors.lastName}
                        aria-describedby="lastName-error"
                      />
                      {errors.lastName && touched.lastName && (
                        <p id="lastName-error" className="mt-1 text-sm text-red-600">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="you@example.com"
                      className={cn(
                        'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none',
                        errors.email && touched.email ? 'border-red-300' : 'border-gray-300'
                      )}
                      aria-invalid={!!errors.email}
                      aria-describedby="email-error"
                    />
                    {errors.email && touched.email && (
                      <p id="email-error" className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <PhoneInput
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="Enter phone number"
                      className={cn(
                        'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none',
                        phoneError ? 'border-red-300' : 'border-gray-300'
                      )}
                      data-testid="phone-input"
                      aria-invalid={!!phoneError}
                      aria-describedby="phoneNumber-error"
                    />
                    {phoneError && (
                      <p id="phoneNumber-error" className="mt-1 text-sm text-red-600">
                        {phoneError}
                      </p>
                    )}
                  </div>
                  
                  {/* Address Information Section */}
                  <div className="mt-4 mb-2">
                    <h3 className="text-md font-semibold text-gray-700">Address Information</h3>
                    <p className="text-sm text-gray-500 mb-3">This information will be used for shipping documents</p>
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="123 Main St"
                      className={cn(
                        'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none',
                        errors.address && touched.address ? 'border-red-300' : 'border-gray-300'
                      )}
                      aria-invalid={!!errors.address}
                      aria-describedby="address-error"
                    />
                    {errors.address && touched.address && (
                      <p id="address-error" className="mt-1 text-sm text-red-600">
                        {errors.address}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="New York"
                        className={cn(
                          'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none',
                          errors.city && touched.city ? 'border-red-300' : 'border-gray-300'
                        )}
                        aria-invalid={!!errors.city}
                        aria-describedby="city-error"
                      />
                      {errors.city && touched.city && (
                        <p id="city-error" className="mt-1 text-sm text-red-600">
                          {errors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="NY"
                        className={cn(
                          'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none',
                          errors.state && touched.state ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                        )}
                        aria-invalid={!!errors.state}
                        aria-describedby="state-error"
                      />
                      {errors.state && touched.state && (
                        <p id="state-error" className="mt-1 text-sm text-red-600">
                          {errors.state}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                        Postal/ZIP Code
                      </label>
                      <input
                        type="text"
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="10001"
                        className={cn(
                          'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none',
                          errors.zip && touched.zip ? 'border-red-300' : 'border-gray-300'
                        )}
                        aria-invalid={!!errors.zip}
                        aria-describedby="zip-error"
                      />
                      {errors.zip && touched.zip && (
                        <p id="zip-error" className="mt-1 text-sm text-red-600">
                          {errors.zip}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="United States"
                        className={cn(
                          'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none',
                          errors.country && touched.country ? 'border-red-300' : 'border-gray-300'
                        )}
                        aria-invalid={!!errors.country}
                        aria-describedby="country-error"
                      />
                      {errors.country && touched.country && (
                        <p id="country-error" className="mt-1 text-sm text-red-600">
                          {errors.country}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={cn(
                          'w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none',
                          errors.password && touched.password ? 'border-red-300' : 'border-gray-300'
                        )}
                        aria-invalid={!!errors.password}
                        aria-describedby="password-error"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && touched.password && (
                      <p id="password-error" className="mt-1 text-sm text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={cn(
                          'w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none',
                          errors.confirmPassword && touched.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        )}
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby="confirmPassword-error"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3 pt-4">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className="sr-only"
                          aria-label="I agree to the terms of service"
                        />
                        <div
                          className={cn(
                            'w-5 h-5 border-2 rounded flex items-center justify-center transition-colors duration-200',
                            formData.agreeToTerms ? 'bg-red-500 border-red-500' : 'border-gray-300'
                          )}
                        >
                          {formData.agreeToTerms && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">
                        I agree to the{' '}
                        <a 
                          href="#" 
                          className="text-red-500 hover:text-red-600 font-medium"
                          onClick={(e) => {
                            e.preventDefault();
                            // TODO: Open terms of service modal or navigate to terms page
                          }}
                        >
                          terms of service
                        </a>
                      </span>
                    </label>
                    {errors.agreeToTerms && touched.agreeToTerms && (
                      <p className="ml-8 text-sm text-red-600">You must agree to the terms and conditions</p>
                    )}
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="agreeToMarketing"
                          checked={formData.agreeToMarketing}
                          onChange={handleInputChange}
                          className="sr-only"
                          aria-label="I agree to receive marketing communications"
                        />
                        <div
                          className={cn(
                            'w-5 h-5 border-2 rounded flex items-center justify-center transition-colors duration-200 p-2',
                            formData.agreeToMarketing ? 'bg-red-500 border-red-500' : 'border-gray-300'
                          )}
                        >
                          {formData.agreeToMarketing && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700 pb-4">I agree to receive marketing communications</span>
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className={cn(
                      'w-full font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center mt-6',
                      isFormValid
                        ? 'bg-red-500 hover:bg-red-600 text-white transform hover:scale-105 hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    )}
                  >
                    Create Account
                  </button>
                  
                  {/* Login Link */}
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <a
                        href="#"
                        className="text-red-500 hover:text-red-600 font-medium transition-colors"
                        aria-label="Log in"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/login');
                        }}
                      >
                        Sign In
                      </a>
                    </p>
                  </div>
                    </form>
                </React.Fragment>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}