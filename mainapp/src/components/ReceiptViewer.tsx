import { X, Download, Printer, Package } from 'lucide-react';
import { receiptService, type Receipt } from '../services/receiptService';
import AuthCodeDisplay from './AuthCodeDisplay';
import QRCodeDisplay from './QRCodeDisplay';

/**
 * ReceiptViewer Component - Display and manage package receipts
 * 
 * This component provides a comprehensive view of package receipts with
 * authentication codes, QR codes, and download/print functionality.
 * 
 * Features:
 * - Display full receipt details
 * - Show 6-digit authentication code prominently
 * - Display QR code and barcode
 * - Download receipt as text file
 * - Print receipt
 * - Responsive modal design
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

interface ReceiptViewerProps {
  /** Receipt object to display */
  receipt: Receipt | null;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Show modal */
  isOpen: boolean;
}

const ReceiptViewer = ({ receipt, onClose, isOpen }: ReceiptViewerProps) => {
  // Don't render if not open or no receipt
  if (!isOpen || !receipt) {
    return null;
  }

  const receiptData = receipt.receipt_data;

  /**
   * Handle download receipt
   */
  const handleDownload = (): void => {
    receiptService.downloadReceipt(receipt);
  };

  /**
   * Handle print receipt
   */
  const handlePrint = (): void => {
    receiptService.printReceipt(receipt);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-title"
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6" aria-hidden="true" />
                <div>
                  <h2 id="receipt-title" className="text-xl font-bold">
                    Package Receipt
                  </h2>
                  <p className="text-red-100 text-sm">
                    {receiptData.receipt_number}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Download receipt"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={handlePrint}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Print receipt"
                  title="Print"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Close receipt"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-6 space-y-6">
                {/* Receipt Info */}
                <div className="text-center pb-4 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    VanguardCargo
                  </h3>
                  <p className="text-sm text-gray-600">
                    {receiptData.warehouse_address || 'ALX-E2: 4700 Eisenhower Avenue, Alexandria, VA 22304, USA'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Receipt Date: {formatDate(receipt.created_at)}
                  </p>
                </div>

                {/* Authentication Code - Prominent Display */}
                {receiptData.auth_code && (
                  <div className="my-6">
                    <AuthCodeDisplay
                      authCode={receiptData.auth_code}
                      trackingNumber={receiptData.tracking_number}
                      size="medium"
                      showWarnings={true}
                    />
                  </div>
                )}

                {/* Package Details */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-red-600" aria-hidden="true" />
                    Package Details
                  </h4>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Tracking Number</dt>
                      <dd className="mt-1 text-base font-semibold text-gray-900 font-mono">
                        {receiptData.tracking_number}
                      </dd>
                    </div>
                    {receiptData.package_id && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Package ID</dt>
                        <dd className="mt-1 text-base font-semibold text-gray-900 font-mono">
                          {receiptData.package_id}
                        </dd>
                      </div>
                    )}
                    {receiptData.description && (
                      <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                        <dd className="mt-1 text-base text-gray-900">
                          {receiptData.description}
                        </dd>
                      </div>
                    )}
                    {receiptData.store_name && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Store/Vendor</dt>
                        <dd className="mt-1 text-base text-gray-900">
                          {receiptData.store_name}
                        </dd>
                      </div>
                    )}
                    {receiptData.weight && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Weight</dt>
                        <dd className="mt-1 text-base text-gray-900">
                          {receiptData.weight.toFixed(2)} lbs
                        </dd>
                      </div>
                    )}
                    {receiptData.declared_value && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Declared Value</dt>
                        <dd className="mt-1 text-base font-semibold text-gray-900">
                          ${receiptData.declared_value.toFixed(2)} USD
                        </dd>
                      </div>
                    )}
                    {receiptData.intake_date && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Intake Date</dt>
                        <dd className="mt-1 text-base text-gray-900">
                          {formatDate(receiptData.intake_date)}
                        </dd>
                      </div>
                    )}
                    {receiptData.customer_suite_number && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Suite Number</dt>
                        <dd className="mt-1 text-base font-semibold text-gray-900">
                          {receiptData.customer_suite_number}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* QR Code and Barcode Section */}
                {(receiptData.qr_code || receiptData.barcode) && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                      Tracking Codes
                    </h4>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                      {/* QR Code */}
                      {receiptData.qr_code && (
                        <QRCodeDisplay
                          data={receiptData.qr_code}
                          size={200}
                          label="Scan for Quick Verification"
                          showDownload={true}
                          downloadFilename={`qr-${receiptData.tracking_number}`}
                        />
                      )}

                      {/* Barcode */}
                      {receiptData.barcode && (
                        <div className="text-center">
                          <div className="bg-white p-4 rounded-lg border-2 border-gray-300 shadow-sm">
                            <div className="font-mono text-lg font-bold tracking-wider">
                              {receiptData.barcode}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Barcode
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Important Notice */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <h5 className="font-semibold text-yellow-900 text-sm mb-2">
                    📋 Important Information
                  </h5>
                  <ul className="text-xs text-yellow-800 space-y-1">
                    <li>• This receipt is proof of package intake at our warehouse</li>
                    <li>• Keep your authentication code secure and confidential</li>
                    <li>• Bring valid photo ID and this code when collecting your package</li>
                    <li>• For questions, contact support@vanguardcargo.com</li>
                  </ul>
                </div>

                {/* Footer */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Thank you for using VanguardCargo!
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This is an official receipt. Please retain for your records.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReceiptViewer;
