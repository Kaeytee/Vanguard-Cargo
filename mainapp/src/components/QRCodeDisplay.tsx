import { useState, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { qrCodeService } from '../services/qrCodeService';

/**
 * QRCodeDisplay Component - Display QR codes for packages and shipments
 * 
 * This component displays QR codes with download functionality and
 * proper error handling. Supports both backend-generated QR codes
 * and on-the-fly generation.
 * 
 * Features:
 * - Display QR codes from backend data or generate on-the-fly
 * - Download QR code as PNG image
 * - Loading and error states
 * - Responsive sizing
 * - Accessibility support
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

interface QRCodeDisplayProps {
  /** QR code data (can be raw data or data URL) */
  data: string;
  /** Size of QR code in pixels */
  size?: number;
  /** Label text to display below QR code */
  label?: string;
  /** Show download button */
  showDownload?: boolean;
  /** Filename for download */
  downloadFilename?: string;
  /** Custom CSS class */
  className?: string;
}

const QRCodeDisplay = ({
  data,
  size = 300,
  label = 'Scan this code at warehouse',
  showDownload = true,
  downloadFilename = 'qr-code',
  className = ''
}: QRCodeDisplayProps) => {
  // Component state
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  /**
   * Generate or load QR code on component mount or data change
   */
  useEffect(() => {
    const loadQRCode = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('🔲 Loading QR code...', { data });

        // Get QR code URL (handles both backend data and generation)
        const url = await qrCodeService.getQRCodeFromData(data, {
          width: size,
          height: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        setQrCodeUrl(url);
        console.log('✅ QR code loaded successfully');
      } catch (err) {
        console.error('❌ Error loading QR code:', err);
        setError('Failed to load QR code');
      } finally {
        setLoading(false);
      }
    };

    if (data) {
      loadQRCode();
    }
  }, [data, size]);

  /**
   * Download QR code as PNG image
   */
  const handleDownload = async (): Promise<void> => {
    try {
      console.log('💾 Downloading QR code...');
      await qrCodeService.downloadQRCode(data, downloadFilename, {
        width: size * 2, // Higher resolution for download
        height: size * 2
      });
      console.log('✅ QR code downloaded');
    } catch (err) {
      console.error('❌ Error downloading QR code:', err);
      alert('Failed to download QR code. Please try again.');
    }
  };

  return (
    <div 
      className={`qr-code-display flex flex-col items-center ${className}`}
      role="region"
      aria-label="QR code display"
    >
      {/* QR Code Container */}
      <div 
        className="relative bg-white border-4 border-gray-200 rounded-2xl shadow-lg overflow-hidden"
        style={{ width: size + 40, height: size + 40 }}
      >
        {/* Loading State */}
        {loading && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-gray-100"
            role="status"
            aria-label="Loading QR code"
          >
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm text-gray-600">Generating QR code...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-red-50"
            role="alert"
            aria-label="QR code error"
          >
            <div className="text-center px-4">
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <button
                onClick={() => {
                  setError('');
                  setLoading(true);
                }}
                className="mt-2 text-xs text-red-700 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* QR Code Image */}
        {qrCodeUrl && !loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center p-5">
            <img
              src={qrCodeUrl}
              alt="QR Code for package tracking"
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }} // Sharp QR code rendering
            />
          </div>
        )}

        {/* Corner decorations for visual appeal */}
        {!loading && !error && (
          <>
            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-red-600"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-red-600"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-red-600"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-red-600"></div>
          </>
        )}
      </div>

      {/* Label */}
      {label && (
        <p className="mt-4 text-center text-sm font-medium text-gray-700 max-w-xs">
          {label}
        </p>
      )}

      {/* Download Button */}
      {showDownload && qrCodeUrl && !loading && !error && (
        <button
          onClick={handleDownload}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors duration-200 text-sm font-medium"
          aria-label="Download QR code"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Download QR Code</span>
        </button>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-xs">
        <p className="text-xs text-blue-800 text-center leading-relaxed">
          📱 Show this QR code to warehouse staff for quick package identification and verification.
        </p>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
