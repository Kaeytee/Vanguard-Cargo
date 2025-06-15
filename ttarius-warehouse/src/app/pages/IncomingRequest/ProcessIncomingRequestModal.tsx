import React, { useState } from 'react';
import { postAccountingRecord } from './accounting';
import type { AccountingRecord } from './accounting'; // type-only import for lint compliance

// Type definition for modal props
// Props for the modal component
interface ProcessIncomingRequestModalProps {
  open: boolean;
  onClose: () => void;
  onMarkReceived: (data: any) => void;
  request: any;
}
// Validation error type
interface ValidationErrors {
  weight?: string;
  packageType?: string;
  amountPaid?: string;
  dimensions?: string;
}
// Supported currencies
const currencyOptions = [
  { label: 'GHS', symbol: 'GHS', regex: /^GHS\d+(\.\d{1,2})?$/ },
  { label: 'USD', symbol: 'USD', regex: /^USD\d+(\.\d{1,2})?$/ },
];


/**
 * ProcessIncomingRequestModal
 * Modal for processing an incoming request (Step 1 overlay)
 * @param {object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {function} props.onClose - Close handler
 * @param {function} props.onMarkReceived - Submit handler
 * @param {object} props.request - The request being processed
 */
const ProcessIncomingRequestModal: React.FC<ProcessIncomingRequestModalProps> = ({ open, onClose, onMarkReceived, request }) => {
  // Local state for form fields
  // Form state
  // Editable weight field
  const [weight, setWeight] = useState<string>(request?.weight ? String(request.weight).replace(/[^\d.]/g, '') : '');
  // Package type selection
  const [packageType, setPackageType] = useState<string>('');
  // Currency dropdown selection
  const [currency, setCurrency] = useState<string>('GHS');
  // Amount paid input
  const [amountPaid, setAmountPaid] = useState<string>('');
  // Dimensions input
  const [dimensions, setDimensions] = useState<string>('');
  // Notes input
  const [notes, setNotes] = useState<string>('');
  // Validation state
  const [errors, setErrors] = useState<ValidationErrors>({});
  // Submission state
  const [touched, setTouched] = useState<{[k:string]:boolean}>({});
  // Error boundary state
  const [hasError, setHasError] = useState<boolean>(false);

  // Validate individual field
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'weight':
        if (!value || isNaN(Number(value)) || Number(value) <= 0) {
          return 'Enter a valid weight (kg)';
        }
        break;
      case 'packageType':
        if (!value) {
          return 'Select a package type';
        }
        break;
      case 'amountPaid':
        // Allow users to enter just numbers or with currency prefix
        if (!value) {
          return 'Enter an amount';
        }
        // Remove currency prefix if present and validate the number
        const numericValue = value.replace(/^(GHS|USD)/i, '');
        if (!/^\d+(\.\d{1,2})?$/.test(numericValue) || Number(numericValue) <= 0) {
          return 'Enter a valid amount (e.g. 100 or 100.50)';
        }
        break;
      case 'dimensions':
        if (!value || !/^\d+x\d+x\d+$/.test(value)) {
          return 'Format: Length x Breadth x Height (e.g. 30x22x2)';
        }
        break;
    }
    return undefined;
  };

  // Validate all fields (does not set state)
  // Validate all fields and return errors (called on submit)
  const validateAll = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    const weightError = validateField('weight', weight);
    if (weightError) newErrors.weight = weightError;
    
    const packageTypeError = validateField('packageType', packageType);
    if (packageTypeError) newErrors.packageType = packageTypeError;
    
    const amountPaidError = validateField('amountPaid', amountPaid);
    if (amountPaidError) newErrors.amountPaid = amountPaidError;
    
    const dimensionsError = validateField('dimensions', dimensions);
    if (dimensionsError) newErrors.dimensions = dimensionsError;
    
    return newErrors;
  };

  // Handle field change - only validate if field was already touched
  const handleChange = (field: string, value: string) => {
    switch (field) {
      case 'weight': setWeight(value); break;
      case 'packageType': setPackageType(value); break;
      case 'currency': 
        setCurrency(value);
        // Re-validate amount paid when currency changes if it was touched
        if (touched.amountPaid) {
          const amountError = validateField('amountPaid', amountPaid);
          setErrors(prev => ({
            ...prev,
            amountPaid: amountError
          }));
        }
        return; // Don't validate currency field itself
      case 'amountPaid': setAmountPaid(value); break;
      case 'dimensions': setDimensions(value); break;
      case 'notes': setNotes(value); break;
      default: break;
    }

    // Only validate if field was already touched (user has interacted with it before)
    if (touched[field]) {
      const fieldError = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: fieldError
      }));
    }
  };

  /**
   * Handles blur event for form fields.
   * Marks the field as touched and validates it.
   */
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Get the current value for the field
    let currentValue = '';
    switch (field) {
      case 'weight': currentValue = weight; break;
      case 'packageType': currentValue = packageType; break;
      case 'amountPaid': currentValue = amountPaid; break;
      case 'dimensions': currentValue = dimensions; break;
    }
    
    const fieldError = validateField(field, currentValue);
    setErrors(prev => ({
      ...prev,
      [field]: fieldError
    }));
  };

  // Generate random barcode string
  const generateBarcode = () => 'BAR' + Math.floor(100000000 + Math.random()*900000000);
  // Generate random package id
  const generatePackageId = () => 'PKG' + Date.now();

  // On submit, validate and call parent
  // Handle form submission
  const handleSubmit = () => {
    try {
      const validation = validateAll();
      setErrors(validation);
      setTouched({ weight: true, packageType: true, amountPaid: true, dimensions: true });
      
      if (Object.keys(validation).length > 0) return;
      
      const barcode = generateBarcode();
      const packageId = generatePackageId();
      // Parse numeric amount from string (strip currency prefix)
      const numericAmount = Number(amountPaid.replace(/[^\d.]/g, ''));
      
      // Create accounting record
      const accountingRecord: AccountingRecord = {
        id: `${packageId}-${Date.now()}`,
        amount: numericAmount,
        currency,
        requestId: request.id,
        packageId,
        client: request.client,
        date: new Date().toISOString(),
      };
      
      // Persist accounting record (localStorage for now)
      postAccountingRecord(accountingRecord);
      
      // Continue with parent handler
      onMarkReceived({
        weight,
        packageType,
        currency,
        amountPaid,
        dimensions,
        notes,
        barcode,
        packageId,
        ...request,
      });
    } catch (e) {
      setHasError(true);
    }
  };

  // Error boundary fallback
  if (hasError) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"><div className="bg-white p-8 rounded-xl shadow-xl text-red-600">Something went wrong. Please close and try again.</div></div>;
  if (!open || !request) return null;
  
  const validationErrors = validateAll();
  const isValid = Object.keys(validationErrors).length === 0;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-fadeIn">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Process Incoming Request</h2>
        <p className="text-gray-400 text-sm mb-6">Processing request {request.id} from {request.client}</p>
        
        {/* Package Weight (input, editable) */}
        <label className="block font-medium text-gray-700 mb-1">Package Weight(kg)</label>
        <input
          type="number"
          className={`w-full mb-2 px-3 py-2 border rounded-lg bg-gray-50 text-gray-900 ${errors.weight && touched.weight ? 'border-red-400' : ''}`}
          placeholder="Enter weight in kg"
          value={weight}
          onChange={e => handleChange('weight', e.target.value)}
          onBlur={() => handleBlur('weight')}
          min={0.01}
          step={0.01}
        />
        {errors.weight && touched.weight && <div className="text-red-500 text-xs mb-2">{errors.weight}</div>} 

        {/* Package Type (select) */}
        <label className="block font-medium text-gray-700 mb-1">Package Type</label>
        <select
          className={`w-full mb-2 px-3 py-2 border rounded-lg bg-white text-gray-900 ${errors.packageType && touched.packageType ? 'border-red-400' : ''}`}
          value={packageType}
          onChange={e => handleChange('packageType', e.target.value)}
          onBlur={() => handleBlur('packageType')}
        >
          <option value="">Choose the package type</option>
          <option value="parcel">Parcel</option>
          <option value="envelope">Envelope</option>
        </select>
        {errors.packageType && touched.packageType && <div className="text-red-500 text-xs mb-2">{errors.packageType}</div>} 
        
        {/* Amount Paid with Currency Dropdown */}
        <div className="flex items-center mb-2 gap-2">
          <label className="block font-medium text-gray-700 mb-1 flex-shrink-0">Amount Paid</label>
          <select
            className="border rounded-lg px-2 py-1 text-gray-900 bg-white"
            value={currency}
            onChange={e => handleChange('currency', e.target.value)}
          >
            {currencyOptions.map(opt => (
              <option key={opt.symbol} value={opt.symbol}>{opt.symbol}</option>
            ))}
          </select>
        </div>
        <input
          type="text"
          className={`w-full mb-2 px-3 py-2 border rounded-lg bg-gray-50 text-gray-900 ${errors.amountPaid && touched.amountPaid ? 'border-red-400' : ''}`}
          placeholder={`Enter amount (e.g. 100.50)`}
          value={amountPaid}
          onChange={e => handleChange('amountPaid', e.target.value)}
          onBlur={() => handleBlur('amountPaid')}
        />
        {errors.amountPaid && touched.amountPaid && <div className="text-red-500 text-xs mb-2">{errors.amountPaid}</div>} 
        
        {/* Dimensions */}
        <label className="block font-medium text-gray-700 mb-1">Dimension(cm)</label>
        <input
          type="text"
          className={`w-full mb-2 px-3 py-2 border rounded-lg bg-gray-50 text-gray-900 ${errors.dimensions && touched.dimensions ? 'border-red-400' : ''}`}
          placeholder="Length x Breadth x Height"
          value={dimensions}
          onChange={e => handleChange('dimensions', e.target.value)}
          onBlur={() => handleBlur('dimensions')}
        />
        {errors.dimensions && touched.dimensions && <div className="text-red-500 text-xs mb-2">{errors.dimensions}</div>} 
        
        {/* Notes */}
        <label className="block font-medium text-gray-700 mb-1">Notes(optional)</label>
        <textarea
          className="w-full mb-6 px-3 py-2 border rounded-lg bg-gray-50 text-gray-900"
          placeholder="Add any special handling instructions or notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="border border-gray-300 px-5 py-2 rounded-lg text-gray-700 font-medium bg-white hover:bg-gray-50">Cancel</button>
          <button
            onClick={handleSubmit}
            className={`bg-blue-900 hover:bg-blue-800 text-white px-7 py-2 rounded-lg font-semibold shadow ${!isValid ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={!isValid}
          >
            Mark as Received
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessIncomingRequestModal;