import { useState } from "react";
import StepIndicator from "../../components/StepIndicator";
import { useShipmentForm } from "../../hooks/useShipmentForm";
import { initialFormData } from "../../lib/constants";

export default function SubmitShipmentPage() {
  useShipmentForm(initialFormData);

  // Core state variables for the simplified flow
  const [step] = useState<number>(1); // Start with step 1 (origin country)
  const [showLoader, setShowLoader] = useState(false);
  const [loaderStatus, setLoaderStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [loaderMessage] = useState('');
  const [validationErrors] = useState<string[]>([]);

  // Close loader modal function
  const closeLoader = () => {
    if (loaderStatus !== 'loading') {
      setShowLoader(false);
      if (loaderStatus === 'error') {
        setLoaderStatus('error');
      }
    }
  };

  // Define renderStepContent function
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <div>Step 1 Content</div>;
      case 2:
        return <div>Step 2 Content</div>;
      case 3:
        return <div>Step 3 Content</div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-10 py-6 bg-gray-100 transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-2">Submit a New Shipment</h1>
      <p className="mb-6 text-gray-400">
        Fill out the form below to create a new shipment request.
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
                  {loaderStatus === 'success' ? 'View Shipments' : 'Try Again'}
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
            {validationErrors.map((error: string, idx: number) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      <div className="w-full md:w-[90%] lg:w-[85%] mx-auto px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8 lg:py-10 bg-white border border-gray-300 shadow-md rounded-lg transition-all duration-300">
        {renderStepContent()}
      </div>
    </div>
  );
}