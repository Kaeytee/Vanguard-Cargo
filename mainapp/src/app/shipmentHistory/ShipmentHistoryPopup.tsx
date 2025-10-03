/**
 * ShipmentHistoryPopup Component
 * 
 * Displays detailed shipment information in a modal popup with barcode generation
 * and tracking capabilities. Integrates with the centralized status workflow system.
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2024-10-02
 */

import React from 'react';
import { X, Download, Printer, Package, MapPin, Calendar, User, Phone } from 'lucide-react';
import { ShipmentStatus, type ShipmentStatusValue } from '../../types';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

/**
 * Interface for shipment data displayed in the popup
 */
export interface ShipmentType {
  id: string;
  date: string;
  destination: string;
  recipient: string;
  type: string;
  status: ShipmentStatusValue;
  origin?: string;
  weight?: string;
  service?: string;
  trackingNumber?: string;
  recipientPhone?: string;
  estimatedDelivery?: string;
  description?: string;
  totalValue?: number;
  notes?: string;
}

/**
 * Props interface for the ShipmentHistoryPopup component
 */
interface ShipmentHistoryPopupProps {
  /** Whether the popup is visible */
  isOpen: boolean;
  /** Function to close the popup */
  onClose: () => void;
  /** Shipment data to display */
  shipment: ShipmentType | null;
  /** Optional callback for barcode generation */
  onGenerateBarcode?: (shipmentId: string) => string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get status badge styling based on shipment status
 * @param status - The shipment status
 * @returns CSS classes for status badge
 */
const getStatusBadgeClasses = (status: ShipmentStatusValue): string => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  switch (status) {
    case ShipmentStatus.AWAITING_QUOTE:
      return `${baseClasses} bg-gray-100 text-gray-800`;
    case ShipmentStatus.QUOTE_READY:
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case ShipmentStatus.PAYMENT_PENDING:
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case ShipmentStatus.PROCESSING:
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case ShipmentStatus.SHIPPED:
      return `${baseClasses} bg-indigo-100 text-indigo-800`;
    case ShipmentStatus.ARRIVED:
      return `${baseClasses} bg-green-100 text-green-800`;
    case ShipmentStatus.IN_TRANSIT:
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case ShipmentStatus.CUSTOMS_CLEARANCE:
      return `${baseClasses} bg-orange-100 text-orange-800`;
    case ShipmentStatus.OUT_FOR_DELIVERY:
      return `${baseClasses} bg-green-100 text-green-800`;
    case ShipmentStatus.DELIVERED:
      return `${baseClasses} bg-green-100 text-green-800`;
    case ShipmentStatus.CANCELLED:
      return `${baseClasses} bg-red-100 text-red-800`;
    // Legacy statuses
    case ShipmentStatus.PENDING:
      return `${baseClasses} bg-gray-100 text-gray-800`;
    case ShipmentStatus.RECEIVED:
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case ShipmentStatus.TRANSIT:
      return `${baseClasses} bg-blue-100 text-blue-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

/**
 * Get human-readable status label
 * @param status - The shipment status
 * @returns Human-readable status label
 */
const getStatusLabel = (status: ShipmentStatusValue): string => {
  switch (status) {
    case ShipmentStatus.AWAITING_QUOTE:
      return 'Awaiting Quote';
    case ShipmentStatus.QUOTE_READY:
      return 'Quote Ready';
    case ShipmentStatus.PAYMENT_PENDING:
      return 'Payment Pending';
    case ShipmentStatus.PROCESSING:
      return 'Processing';
    case ShipmentStatus.SHIPPED:
      return 'Shipped';
    case ShipmentStatus.ARRIVED:
      return 'Arrived';
    case ShipmentStatus.IN_TRANSIT:
      return 'In Transit';
    case ShipmentStatus.CUSTOMS_CLEARANCE:
      return 'Customs Clearance';
    case ShipmentStatus.OUT_FOR_DELIVERY:
      return 'Out for Delivery';
    case ShipmentStatus.DELIVERED:
      return 'Delivered';
    case ShipmentStatus.CANCELLED:
      return 'Cancelled';
    // Legacy statuses
    case ShipmentStatus.PENDING:
      return 'Pending';
    case ShipmentStatus.RECEIVED:
      return 'Received';
    case ShipmentStatus.TRANSIT:
      return 'Transit';
    default:
      return status;
  }
};

/**
 * Check if shipment status allows barcode generation
 * @param status - The shipment status
 * @returns Boolean indicating if barcode can be generated
 */
const canGenerateBarcode = (status: ShipmentStatusValue): boolean => {
  const barcodeEnabledStatuses: ShipmentStatusValue[] = [
    ShipmentStatus.PROCESSING,
    ShipmentStatus.SHIPPED,
    ShipmentStatus.ARRIVED,
    ShipmentStatus.IN_TRANSIT,
    ShipmentStatus.CUSTOMS_CLEARANCE,
    ShipmentStatus.OUT_FOR_DELIVERY,
    ShipmentStatus.DELIVERED
  ];
  
  return barcodeEnabledStatuses.includes(status);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ShipmentHistoryPopup Component
 * 
 * A comprehensive modal popup that displays detailed shipment information
 * with dynamic content based on shipment status and barcode generation capabilities.
 */
export const ShipmentHistoryPopup: React.FC<ShipmentHistoryPopupProps> = ({
  isOpen,
  onClose,
  shipment,
  onGenerateBarcode
}) => {
  // Early return if popup is not open
  if (!isOpen || !shipment) {
    return null;
  }

  /**
   * Handle barcode download functionality
   * Generates and downloads barcode as PNG file
   */
  const handleDownloadBarcode = (): void => {
    if (!onGenerateBarcode || !canGenerateBarcode(shipment.status)) {
      console.warn('Barcode generation not available for current status');
      return;
    }

    try {
      const barcodeDataUrl = onGenerateBarcode(shipment.id);
      
      // Create download link
      const link = document.createElement('a');
      link.href = barcodeDataUrl;
      link.download = `shipment-${shipment.id}-barcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading barcode:', error);
    }
  };

  /**
   * Handle barcode print functionality
   * Opens print dialog with barcode content
   */
  const handlePrintBarcode = (): void => {
    if (!onGenerateBarcode || !canGenerateBarcode(shipment.status)) {
      console.warn('Barcode generation not available for current status');
      return;
    }

    try {
      const barcodeDataUrl = onGenerateBarcode(shipment.id);
      
      // Create print window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Shipment Barcode - ${shipment.id}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  padding: 20px; 
                }
                .barcode-container {
                  margin: 20px auto;
                  padding: 20px;
                  border: 2px solid #000;
                  display: inline-block;
                }
                .shipment-info {
                  margin-bottom: 15px;
                  font-size: 14px;
                }
                .barcode-image {
                  margin: 10px 0;
                }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="barcode-container">
                <div class="shipment-info">
                  <strong>Vanguard Cargo Logistics</strong><br>
                  Shipment ID: ${shipment.id}<br>
                  Destination: ${shipment.destination}<br>
                  Recipient: ${shipment.recipient}<br>
                  Status: ${getStatusLabel(shipment.status)}
                </div>
                <div class="barcode-image">
                  <img src="${barcodeDataUrl}" alt="Shipment Barcode" />
                </div>
                <div class="shipment-info">
                  Generated: ${new Date().toLocaleString()}
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Error printing barcode:', error);
    }
  };

  /**
   * Handle backdrop click to close popup
   */
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Shipment Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              ID: {shipment.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close popup"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={getStatusBadgeClasses(shipment.status)}>
              {getStatusLabel(shipment.status)}
            </span>
            {shipment.trackingNumber && (
              <span className="text-sm text-gray-500">
                Tracking: {shipment.trackingNumber}
              </span>
            )}
          </div>

          {/* Shipment Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recipient Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-400" />
                Recipient Information
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Name:</span>
                  <p className="text-sm text-gray-900">{shipment.recipient}</p>
                </div>
                {shipment.recipientPhone && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Phone:</span>
                    <p className="text-sm text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {shipment.recipientPhone}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-500">Destination:</span>
                  <p className="text-sm text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {shipment.destination}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipment Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2 text-gray-400" />
                Shipment Details
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Date:</span>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {shipment.date}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Type:</span>
                  <p className="text-sm text-gray-900">{shipment.type}</p>
                </div>
                {shipment.weight && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Weight:</span>
                    <p className="text-sm text-gray-900">{shipment.weight}</p>
                  </div>
                )}
                {shipment.service && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Service:</span>
                    <p className="text-sm text-gray-900">{shipment.service}</p>
                  </div>
                )}
                {shipment.totalValue && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Total Value:</span>
                    <p className="text-sm text-gray-900">${shipment.totalValue.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(shipment.origin || shipment.estimatedDelivery || shipment.description || shipment.notes) && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
              <div className="space-y-2">
                {shipment.origin && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Origin:</span>
                    <p className="text-sm text-gray-900">{shipment.origin}</p>
                  </div>
                )}
                {shipment.estimatedDelivery && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Estimated Delivery:</span>
                    <p className="text-sm text-gray-900">{shipment.estimatedDelivery}</p>
                  </div>
                )}
                {shipment.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Description:</span>
                    <p className="text-sm text-gray-900">{shipment.description}</p>
                  </div>
                )}
                {shipment.notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Notes:</span>
                    <p className="text-sm text-gray-900">{shipment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Barcode Section */}
          {canGenerateBarcode(shipment.status) ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Tracking Barcode</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {onGenerateBarcode && (
                  <div className="text-center space-y-4">
                    <img 
                      src={onGenerateBarcode(shipment.id)} 
                      alt="Shipment Barcode"
                      className="mx-auto"
                    />
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={handleDownloadBarcode}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </button>
                      <button
                        onClick={handlePrintBarcode}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Tracking Barcode</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Barcode will be available once the shipment is processed and ready for tracking.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentHistoryPopup;
