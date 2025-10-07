import { MapPin, Phone, Clock, FileText, Navigation } from 'lucide-react';
import type { Package } from '../services/packageService';
import AuthCodeDisplay from './AuthCodeDisplay';
import QRCodeDisplay from './QRCodeDisplay';
import { useState } from 'react';
import ReceiptViewer from './ReceiptViewer';
import { receiptService, type Receipt } from '../services/receiptService';

/**
 * PackageCollectionView Component - Comprehensive package pickup interface
 * 
 * This component provides customers with all information needed to collect
 * their package from the warehouse, including pickup code, QR code, location,
 * and contact information.
 * 
 * Features:
 * - Display 6-digit authentication code prominently
 * - Show QR code for quick scanning
 * - Warehouse location with map integration
 * - Operating hours and contact information
 * - Package details summary
 * - Receipt viewing
 * - Call and directions actions
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

interface PackageCollectionViewProps {
  /** Package object with arrival status */
  package: Package;
  /** Custom CSS class */
  className?: string;
}

const PackageCollectionView = ({ package: pkg, className = '' }: PackageCollectionViewProps) => {
  // Component state
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState<boolean>(false);

  // Warehouse information (from your existing setup)
  const warehouseInfo = {
    name: 'ALX-E2 Warehouse',
    address: '4700 Eisenhower Avenue',
    city: 'Alexandria, VA 22304',
    country: 'USA',
    phone: '+1 (703) 555-0100',
    hours: 'Mon-Fri: 9:00 AM - 6:00 PM, Sat: 10:00 AM - 4:00 PM',
    email: 'warehouse@vanguardcargo.com'
  };

  /**
   * Get directions to warehouse using Google Maps
   */
  const handleGetDirections = (): void => {
    const address = encodeURIComponent(`${warehouseInfo.address}, ${warehouseInfo.city}`);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    window.open(mapsUrl, '_blank');
    console.log('📍 Opening directions to warehouse');
  };

  /**
   * Call warehouse phone number
   */
  const handleCallWarehouse = (): void => {
    window.location.href = `tel:${warehouseInfo.phone}`;
    console.log('📞 Initiating call to warehouse');
  };

  /**
   * Load and view package receipt
   */
  const handleViewReceipt = async (): Promise<void> => {
    try {
      setLoadingReceipt(true);
      console.log('📄 Loading package receipt...');

      const { data, error } = await receiptService.getPackageReceipt(pkg.id);

      if (error || !data) {
        console.error('❌ Error loading receipt:', error);
        alert('Failed to load receipt. Please try again.');
        return;
      }

      setReceipt(data);
      setShowReceipt(true);
      console.log('✅ Receipt loaded successfully');
    } catch (err) {
      console.error('❌ Exception loading receipt:', err);
      alert('Failed to load receipt. Please try again.');
    } finally {
      setLoadingReceipt(false);
    }
  };

  /**
   * Calculate days waiting
   */
  const calculateDaysWaiting = (): number => {
    if (!pkg.intake_date) return 0;
    const intakeDate = new Date(pkg.intake_date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - intakeDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={`package-collection-view ${className}`}>
      {/* Hero Section - Ready for Pickup */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-8 shadow-xl mb-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <MapPin className="w-8 h-8" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            📦 Ready for Pickup!
          </h1>
          <p className="text-green-100 text-lg">
            Your package is waiting for you at our warehouse
          </p>
          {pkg.intake_date && (
            <p className="text-green-200 text-sm mt-2">
              Waiting for {calculateDaysWaiting()} day{calculateDaysWaiting() !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Authentication Code Section */}
      {pkg.delivery_auth_code && (
        <div className="mb-6">
          <AuthCodeDisplay
            authCode={pkg.delivery_auth_code}
            trackingNumber={pkg.tracking_number}
            size="large"
            showWarnings={true}
          />
        </div>
      )}

      {/* QR Code Section */}
      {pkg.qr_code_data && (
        <div className="mb-6 flex justify-center">
          <QRCodeDisplay
            data={pkg.qr_code_data}
            size={300}
            label="Show this QR code at the warehouse counter"
            showDownload={true}
            downloadFilename={`package-${pkg.tracking_number}`}
          />
        </div>
      )}

      {/* Warehouse Information */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-red-600" aria-hidden="true" />
          Pickup Location
        </h2>

        <div className="space-y-4">
          {/* Address */}
          <div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              {warehouseInfo.name}
            </h3>
            <p className="text-gray-700">
              {warehouseInfo.address}<br />
              {warehouseInfo.city}<br />
              {warehouseInfo.country}
            </p>
          </div>

          {/* Operating Hours */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h4 className="font-medium text-blue-900 text-sm">Operating Hours</h4>
              <p className="text-blue-800 text-sm mt-1">
                {warehouseInfo.hours}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h4 className="font-medium text-gray-900 text-sm">Contact</h4>
              <p className="text-gray-700 text-sm mt-1">
                Phone: {warehouseInfo.phone}<br />
                Email: {warehouseInfo.email}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <button
            onClick={handleGetDirections}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            aria-label="Get directions to warehouse"
          >
            <Navigation className="w-5 h-5" aria-hidden="true" />
            <span>Get Directions</span>
          </button>
          <button
            onClick={handleCallWarehouse}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors shadow-sm"
            aria-label="Call warehouse"
          >
            <Phone className="w-5 h-5" aria-hidden="true" />
            <span>Call Warehouse</span>
          </button>
        </div>
      </div>

      {/* Package Details Summary */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-red-600" aria-hidden="true" />
          Package Details
        </h2>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Tracking Number</dt>
            <dd className="mt-1 text-base font-mono font-semibold text-gray-900">
              {pkg.tracking_number}
            </dd>
          </div>
          {pkg.description && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-base text-gray-900">
                {pkg.description}
              </dd>
            </div>
          )}
          {pkg.store_name && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Store/Vendor</dt>
              <dd className="mt-1 text-base text-gray-900">
                {pkg.store_name}
              </dd>
            </div>
          )}
          {pkg.weight_lbs && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Weight</dt>
              <dd className="mt-1 text-base text-gray-900">
                {pkg.weight_lbs.toFixed(2)} lbs
              </dd>
            </div>
          )}
          {pkg.declared_value && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Declared Value</dt>
              <dd className="mt-1 text-base font-semibold text-gray-900">
                ${pkg.declared_value.toFixed(2)} USD
              </dd>
            </div>
          )}
          {pkg.intake_date && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Received Date</dt>
              <dd className="mt-1 text-base text-gray-900">
                {new Date(pkg.intake_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </dd>
            </div>
          )}
        </dl>

        {/* View Receipt Button */}
        <button
          onClick={handleViewReceipt}
          disabled={loadingReceipt}
          className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors shadow-sm"
          aria-label="View full receipt"
        >
          <FileText className="w-5 h-5" aria-hidden="true" />
          <span>{loadingReceipt ? 'Loading...' : 'View Full Receipt'}</span>
        </button>
      </div>

      {/* Pickup Checklist */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 p-6">
        <h3 className="font-bold text-purple-900 text-lg mb-4">
          📋 Pickup Checklist
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <span className="text-purple-900 text-sm">
              <strong>Valid Photo ID</strong> - Bring government-issued ID matching your account
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <span className="text-purple-900 text-sm">
              <strong>6-Digit Code</strong> - Provide your authentication code to warehouse staff
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <span className="text-purple-900 text-sm">
              <strong>QR Code</strong> - Show the QR code above for quick verification (optional but recommended)
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
            <span className="text-purple-900 text-sm">
              <strong>Visit During Hours</strong> - Come during our operating hours listed above
            </span>
          </li>
        </ul>
      </div>

      {/* Receipt Viewer Modal */}
      <ReceiptViewer
        receipt={receipt}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
      />
    </div>
  );
};

export default PackageCollectionView;
