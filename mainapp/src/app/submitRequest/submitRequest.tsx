// EMAIL_REGEX: File-level constant for robust email validation (clean code best practice)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";

const useRouter = () => {
  return {
    push: (path: string) => {
      window.location.href = path;
    },
  };
};

import StepIndicator from "../../components/StepIndicator";
import PackageOriginForm from "../../components/PackageOriginForm";
import PackageForm from "../../components/PackageForm";
import ConfirmForm from "../../components/ConfirmForm";
import { useShipmentForm } from "../../hooks/useShipmentForm";
import { initialFormData } from "../../lib/constants";

// Interface for address suggestions from OpenStreetMap API
interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    pedestrian?: string;
    footway?: string;
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

export default function SubmitRequestPage() {
  // Get user data from auth context
  const { user } = useAuth();
  
  // Initialize form with simplified data structure
  const { formData, setFormData, handleInputChange: baseHandleInputChange } = useShipmentForm(initialFormData);
  
  // Auto-populate client information from user profile when component mounts
  useEffect(() => {
    if (user) {
      // Update form data with user information
      setFormData(prevData => ({
        ...prevData,
        clientName: user.name || prevData.clientName,
        clientEmail: user.email || prevData.clientEmail,
        clientPhone: user.phone || prevData.clientPhone,
        clientAddress: user.address || prevData.clientAddress,
        clientCity: user.city || prevData.clientCity,
        clientState: user.state || prevData.clientState,
        clientZip: user.zip || prevData.clientZip,
        clientCountry: user.country || prevData.clientCountry
      }));
    }
  }, [user, setFormData]);

  // Enhanced handleInputChange: clears stepValidationError if set, for instant UX feedback
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (stepValidationError) setStepValidationError(null); // Clear error on any input change
    baseHandleInputChange(e);
  }

  // Core state variables for the simplified flow
  const [step, setStep] = useState<number>(1); // Start with step 1 (origin country)
  const [originAddressSuggestions, setOriginAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [originAddressLoading, setOriginAddressLoading] = useState(false);
  const [originAddressError, setOriginAddressError] = useState<string | null>(null);
  const [originSuggestionIndex, setOriginSuggestionIndex] = useState(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [stepValidationError, setStepValidationError] = useState<string | null>(null);

  // Address auto-complete for package origin (with keyboard nav)
  const handleOriginCountryInput = async (value: string) => {
    // Handle address/country input for package origin
    setFormData((prev) => ({ ...prev, originCountry: value }));
    setOriginAddressError(null);
    setOriginAddressLoading(true);
    setOriginAddressSuggestions([]);
    setOriginSuggestionIndex(-1);

    // Only search if user has typed at least 2 characters
    if (value.length > 2) {
      try {
        // Use OpenStreetMap API to get country suggestions
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(value)}&countrycodes=1`;
        const res = await fetch(url);
        const data = await res.json();
        setOriginAddressSuggestions(data);
      } catch {
        setOriginAddressError("Failed to fetch country suggestions.");
      }
    }
    setOriginAddressLoading(false);
  };

  // Keyboard navigation for country suggestions
  const handleOriginCountryKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (!originAddressSuggestions.length) return;

    // Navigate through suggestions with arrow keys
    if (e.key === "ArrowDown") {
      setOriginSuggestionIndex((idx) =>
        Math.min(idx + 1, originAddressSuggestions.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      setOriginSuggestionIndex((idx) => Math.max(idx - 1, 0));
    } else if (e.key === "Enter" && originSuggestionIndex >= 0) {
      // Select the highlighted suggestion on Enter key
      handleOriginSuggestionSelect(
        originAddressSuggestions[originSuggestionIndex]
      );
    }
  };

  // When user selects a country suggestion
  const handleOriginSuggestionSelect = (
    suggestion: AddressSuggestion
  ) => {
    // Update form with selected country
    setFormData((prev) => ({
      ...prev,
      originCountry: suggestion.address?.country || suggestion.display_name || "",
      originCity: suggestion.address?.city || "",
    }));

    // Clear suggestions after selection
    setOriginAddressSuggestions([]);
    setOriginSuggestionIndex(-1);
  };

  // Simple function to go back to previous step
  const goToPreviousStep = () => {
    setStepValidationError(null);
    setStep(step - 1);
  };

  // Step validation helper functions
  const validateOriginStep = () => {
    // Check required fields for the origin step
    const requiredFields = [
      "originCountry",
      "clientEmail",
      "clientName",
      "clientPhone"
    ];

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      setStepValidationError("Please fill in all required fields marked with *");
      return false;
    }

    // Email validation
    if (!EMAIL_REGEX.test(formData.clientEmail)) {
      setStepValidationError("Please enter a valid email address");
      return false;
    }

    // International cargo validation - client cannot select their own country as origin
    if (formData.originCountry && formData.clientCountry) {
      const originCountry = formData.originCountry.toLowerCase();
      const clientCountry = formData.clientCountry.toLowerCase();
      
      if (originCountry === clientCountry || 
          (clientCountry === 'united states' && originCountry === 'united states') ||
          (clientCountry === 'ghana' && originCountry === 'ghana')) {
        setStepValidationError("International cargo only: You cannot select your own country as the package origin");
        return false;
      }
    }

    setStepValidationError(null);
    return true;
  };

  const validatePackageStep = () => {
    // Check required fields for package details
    const requiredFields = [
      "packageType",
      "packageCategory",
      "packageDescription",
      "freightType"
    ];

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      setStepValidationError("Please fill in all required package fields marked with *");
      return false;
    }

    setStepValidationError(null);
    return true;
  };

  // Handle moving to the next step in the form flow
  const handleNextStep = () => {
    setStepValidationError(null);

    // Step validation based on current step
    let isValid = false;

    switch (step) {
      case 1: // Package Origin & Client Info
        isValid = validateOriginStep();
        break;
      case 2: // Package Details
        isValid = validatePackageStep();
        break;
      default:
        isValid = true;
    }

    // Only proceed if current step is valid
    if (isValid) {
      setStep(step + 1);
      window.scrollTo(0, 0); // Scroll to top when changing steps
    }
  };

  // Step Rendering
  const renderStepContent = () => {
    // Fix stringifiedFormData to include all required properties
    // Ensure all client information from the user profile is included
    const stringifiedFormData = {
      // Client information - already auto-populated from user profile
      clientName: formData.clientName || "",
      clientEmail: formData.clientEmail || "",
      clientPhone: formData.clientPhone || "",
      clientAddress: formData.clientAddress || "",
      clientCity: formData.clientCity || "",
      clientState: formData.clientState || "",
      clientZip: formData.clientZip || "",
      clientCountry: formData.clientCountry || "",
      
      // Package information
      originCountry: formData.originCountry || "",
      originCity: formData.originCity || "",
      originAddress: formData.originAddress || "",
      originState: formData.originState || "",
      packageType: formData.packageType || "",
      packageCategory: formData.packageCategory || "",
      packageDescription: formData.packageDescription || "",
      freightType: formData.freightType || "",
      packageWeight: formData.packageWeight || "",
      
      // Include remaining form data while preserving data types
      ...Object.fromEntries(
        Object.entries(formData).map(([key, value]) => {
          // Keep boolean values as booleans for proper API handling
          if (typeof value === 'boolean') {
            return [key, value];
          }
          // Return other values unmodified
          return [key, value];
        })
      )
    };

    switch (step) {
      case 1:
        return (
          <PackageOriginForm
            formData={stringifiedFormData}
            onInputChange={handleInputChange}
            onOriginCountryInput={handleOriginCountryInput}
            onOriginCountryKeyDown={handleOriginCountryKeyDown}
            countrySuggestions={originAddressSuggestions}
            countryLoading={originAddressLoading}
            countryError={originAddressError}
            suggestionIndex={originSuggestionIndex}
            onSuggestionSelect={handleOriginSuggestionSelect}
          />
        );
      case 2:
        return (
          <PackageForm
            formData={stringifiedFormData}
            onInputChange={handleInputChange}
          />
        );
      case 3:
        return (
          <ConfirmForm 
            formData={stringifiedFormData}
            onBack={goToPreviousStep} 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null; // Handle unexpected step values
    }
  };

  // Initialize router for navigation
  const router = useRouter();

  // States for loader popup
  const [showLoader, setShowLoader] = useState(false);
  const [loaderStatus, setLoaderStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [loaderMessage, setLoaderMessage] = useState('');

  /**
   * Handle form submission
   * This function processes the form submission with proper loading states,
   * success/error handling, and redirection to awaiting-shipments on success
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Always prevent default browser form submission behavior
    e.preventDefault();
    // Early return if already submitting to prevent duplicate submissions
    if (isSubmitting) return;

    // Reset states for a clean submission process
    setIsSubmitting(true);
    setValidationErrors([]);
    setLoaderStatus('loading');
    setShowLoader(true);      setLoaderMessage('Processing your package request...');

    try {
      // In a real application, this would submit to an API
      // Simulate API call delay with network request time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // FIXED: Removed the intentional error - form will now succeed
      console.log('Form submitted successfully with data:', formData);

      // Update UI for successful submission
      setLoaderStatus('success');
      setLoaderMessage('Success! Your package request has been submitted.');

      // Wait a moment before redirecting to shipment-history
      setTimeout(() => {
        // Navigate to shipment history page to see the new request
        router.push('/app/shipment-history');
      }, 1500);

    } catch (error) {
      // Handle submission errors gracefully
      console.error("Error submitting package request:", error);
      setLoaderStatus('error');
      setLoaderMessage('There was an error submitting your request. Please try again.');

      // Hide loader after a delay and show error message for better UX
      setTimeout(() => {
        setShowLoader(false);
        setValidationErrors(["There was an error submitting your package request. Please try again."]);
      }, 1500);

      setIsSubmitting(false);
    }
  };

  // Close loader modal function
  const closeLoader = () => {
    if (loaderStatus !== 'loading') {
      setShowLoader(false);
      if (loaderStatus === 'error') {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-10 py-6 bg-gray-100 transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-2">Submit a New Request</h1>
      <p className="mb-6 text-gray-400">
        Fill out the form below to create a new package request.
      </p>

      {/* Popup Loader */}
      {showLoader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-opacity duration-300">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transform transition-transform duration-300">
            <div className="text-center">
              {loaderStatus === 'loading' && (
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1A2B6D] mx-auto mb-4"></div>
              )}

              {loaderStatus === 'success' && (
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {loaderStatus === 'error' && (
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {loaderStatus === 'loading' ? 'Processing...' : loaderStatus === 'success' ? 'Success!' : 'Error'}
              </h3>

              <p className="text-gray-600 mb-4">{loaderMessage}</p>

              {loaderStatus !== 'loading' && (
                <button
                  onClick={closeLoader}
                  className="px-4 py-2 bg-[#1A2B6D] text-white rounded-md hover:bg-[#0F1A45] transition-colors duration-200"
                >
                  {loaderStatus === 'success' ? 'View Requests' : 'Try Again'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <StepIndicator
        steps={["Origin & Client", "Package", "Confirm"]}
        currentStep={step}
      />

      {/* Error messages */}
      {validationErrors.length > 0 && (
        <div className="w-full md:w-[90%] lg:w-[85%] mx-auto mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <h3 className="font-semibold mb-2">Please correct the following issues:</h3>
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step validation error */}
      {stepValidationError && (
        <div className="w-full md:w-[90%] lg:w-[85%] mx-auto mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {stepValidationError}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="w-full md:w-[90%] lg:w-[85%] mx-auto px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8 lg:py-10 bg-white border border-gray-300 shadow-md rounded-lg transition-all duration-300">
        {/* Conditional rendering: Only use form wrapper for steps 1 and 2, not for step 3 */}
        {step < 3 ? (
          <form onSubmit={handleSubmit} noValidate>
            {renderStepContent()}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 sm:py-3 px-4 sm:px-8 text-sm sm:text-base rounded-md transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-red-600 hover:bg-red-600/90 text-white py-2 sm:py-3 px-4 sm:px-8 text-sm sm:text-base rounded-md transition-colors flex items-center gap-2"
              >
                Next
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </form>
        ) : (
          /* For step 3, render content directly without form wrapper to avoid nesting forms */
          <>
            {renderStepContent()}
          </>
        )}
      </div>
    </div>
  );
}