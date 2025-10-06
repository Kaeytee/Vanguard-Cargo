import React, { useState, useEffect } from 'react';
import { X, ChevronDown, MessageCircle, Check, AlertCircle, Shield } from 'lucide-react';
import { WhatsAppVerificationService } from '../services/whatsappVerificationService';
import type { VerificationStep } from '../services/whatsappVerificationService';
import { useAuth } from '../hooks/useAuth';

/**
 * WhatsApp Verification Modal Component
 * Handles WhatsApp number verification process for users
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

// Popular country codes for WhatsApp
const COUNTRY_CODES = [
  { code: '+1', country: 'US/Canada', flag: '🇺🇸' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+51', country: 'Peru', flag: '🇵🇪' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' }
];

interface WhatsAppVerificationModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Function to handle WhatsApp verification */
  onVerify: (whatsappNumber: string) => Promise<{ success: boolean; error?: string }>;
  /** Current verification status */
  isVerified: boolean;
  /** Current WhatsApp number if any */
  currentNumber?: string;
}

/**
 * WhatsApp Verification Modal Component
 * Provides interface for users to verify their WhatsApp number
 */
const WhatsAppVerificationModal: React.FC<WhatsAppVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  isVerified,
  currentNumber
}) => {
  // Get user from auth context
  const { user } = useAuth();
  
  // Component state management
  const [selectedCountryCode, setSelectedCountryCode] = useState('+233'); // Default to Ghana
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [currentStep, setCurrentStep] = useState<VerificationStep>('phone_input');
  const [verificationMessage, setVerificationMessage] = useState<string>('');

  // Parse existing number if available
  useEffect(() => {
    if (currentNumber) {
      // Try to parse existing number to extract country code and phone number
      const countryCode = COUNTRY_CODES.find(cc => currentNumber.startsWith(cc.code));
      if (countryCode) {
        setSelectedCountryCode(countryCode.code);
        setPhoneNumber(currentNumber.replace(countryCode.code, ''));
      } else {
        setPhoneNumber(currentNumber);
      }
    }
  }, [currentNumber]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showCountryDropdown) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);

  /**
   * Handles sending OTP code
   */
  const handleSendOTP = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setError(null);
    setIsLoading(true);
    
    if (!phoneNumber.trim()) {
      setError('Please enter your WhatsApp number');
      setIsLoading(false);
      return;
    }
    
    const fullWhatsAppNumber = selectedCountryCode + phoneNumber.trim();
    
    try {
      // Step 1: Validate phone number and check for duplicates
      const validation = await WhatsAppVerificationService.validatePhoneNumber(fullWhatsAppNumber, user.id);
      
      if (!validation.success) {
        setError(validation.error || 'Phone number validation failed');
        setIsLoading(false);
        return;
      }

      // Step 2: Send OTP code
      const otpResult = await WhatsAppVerificationService.sendOTPCode(fullWhatsAppNumber);
      
      if (otpResult.success) {
        setCurrentStep('otp_verification');
        setVerificationMessage(otpResult.message || 'Verification code sent!');
      } else {
        setError(otpResult.error || 'Failed to send verification code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles OTP verification
   */
  const handleVerifyOTP = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setError(null);
    setIsLoading(true);
    
    if (!otpCode.trim() || otpCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      setIsLoading(false);
      return;
    }
    
    const fullWhatsAppNumber = selectedCountryCode + phoneNumber.trim();
    
    try {
      // Verify OTP code
      const otpResult = await WhatsAppVerificationService.verifyOTPCode(fullWhatsAppNumber, otpCode);
      
      if (!otpResult.success) {
        setError(otpResult.error || 'Invalid verification code');
        setIsLoading(false);
        return;
      }

      // Complete verification
      const completionResult = await WhatsAppVerificationService.completeVerification(fullWhatsAppNumber, user.id);
      
      if (completionResult.success) {
        setCurrentStep('completed');
        setSuccess(true);
        setVerificationMessage('WhatsApp number verified successfully!');
        
        // Call the original onVerify callback for UI updates
        await onVerify(fullWhatsAppNumber);
        
        // Auto-close modal after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(completionResult.error || 'Failed to complete verification');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles resending OTP code
   */
  const handleResendOTP = async () => {
    const fullWhatsAppNumber = selectedCountryCode + phoneNumber.trim();
    
    setError(null);
    setIsLoading(true);
    
    try {
      const otpResult = await WhatsAppVerificationService.sendOTPCode(fullWhatsAppNumber);
      
      if (otpResult.success) {
        setVerificationMessage('New verification code sent!');
      } else {
        setError(otpResult.error || 'Failed to resend verification code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles phone number input change
   */
  const handlePhoneInputChange = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, '');
    setPhoneNumber(cleaned);
    setError(null);
  };

  /**
   * Handles country code selection
   */
  const handleCountryCodeSelect = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    setShowCountryDropdown(false);
    setError(null);
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <img 
                src="https://i.pinimg.com/originals/93/b2/65/93b265c795140247db600ac92e58746a.jpg" 
                alt="WhatsApp Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                WhatsApp Verification
              </h3>
              <p className="text-sm text-gray-500">
                Verify your WhatsApp number for notifications
              </p>
            </div>
          </div>
        </div>

        {/* Success State */}
        {success && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Verification Successful!
            </h3>
            <p className="text-gray-600">
              Your WhatsApp number has been verified successfully.
            </p>
          </div>
        )}

        {/* Verification Form */}
        {!success && (
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Why verify your WhatsApp?
                  </p>
                  <p className="text-sm text-blue-700">
                    Get instant notifications about your packages and shipments directly on WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 1: Phone Number Input */}
            {currentStep === 'phone_input' && (
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <div className="flex gap-2">
                  {/* Country Code Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex items-center gap-2 px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors min-w-[120px]"
                      disabled={isLoading}
                    >
                      <span className="text-lg">
                        {COUNTRY_CODES.find(cc => cc.code === selectedCountryCode)?.flag || '🌍'}
                      </span>
                      <span className="font-mono text-sm">{selectedCountryCode}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {/* Country Dropdown */}
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        {COUNTRY_CODES.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleCountryCodeSelect(country.code)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 transition-colors"
                          >
                            <span className="text-lg">{country.flag}</span>
                            <span className="font-mono text-sm w-12">{country.code}</span>
                            <span className="text-sm text-gray-700 truncate">{country.country}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Phone Number Input */}
                  <input
                    id="whatsapp"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneInputChange(e.target.value)}
                    placeholder="123456789"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select your country code and enter your WhatsApp number
                </p>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {currentStep === 'otp_verification' && (
              <div>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Verification Code Sent
                  </h4>
                  <p className="text-sm text-gray-600">
                    We've sent a 6-digit code to <br />
                    <span className="font-mono font-medium">{selectedCountryCode} {phoneNumber}</span>
                  </p>
                </div>

                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-center text-lg font-mono tracking-wider"
                    disabled={isLoading}
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the 6-digit code sent to your WhatsApp
                  </p>
                </div>

                {/* Resend Code */}
                <div className="text-center">
                  <button
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Didn't receive the code? Resend
                  </button>
                </div>
              </div>
            )}

            {/* Success Message */}
            {verificationMessage && !error && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">{verificationMessage}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              
              {currentStep === 'phone_input' && (
                <button
                  onClick={handleSendOTP}
                  disabled={isLoading || !phoneNumber.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      Send Code
                    </>
                  )}
                </button>
              )}

              {currentStep === 'otp_verification' && (
                <button
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otpCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Verify Code
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppVerificationModal;
