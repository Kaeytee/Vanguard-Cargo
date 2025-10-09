/**
 * QR Code Service - Handles QR code generation and management
 * 
 * This service provides methods to generate and manage QR codes
 * for packages and shipments using the qrcode library.
 * 
 * Features:
 * - Generate QR codes from text/data
 * - Convert QR codes to data URLs for display
 * - Download QR codes as images
 * - Customizable QR code styling
 * 
 * Note: Install qrcode library: npm install qrcode @types/qrcode
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

import QRCode from 'qrcode';

// QR Code options type
interface QRCodeOptions {
  width?: number;
  height?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

// Default QR code styling
const DEFAULT_OPTIONS: QRCodeOptions = {
  width: 300,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  errorCorrectionLevel: 'H' // High error correction for better scanning
};

class QRCodeService {
  /**
   * Generate QR code as data URL (base64 image)
   * Can be directly used in <img> src attribute
   * 
   * @param data - Data to encode in QR code (package ID, tracking number, etc.)
   * @param options - Optional QR code customization
   * @returns Promise<string> - Data URL of the QR code image
   */
  async generateQRCode(
    data: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    try {
      console.log('🔲 Generating QR code for:', data);

      // Merge options with defaults
      const qrOptions = { ...DEFAULT_OPTIONS, ...options };

      // Generate QR code as data URL
      const dataUrl = await QRCode.toDataURL(data, qrOptions);

      console.log('✅ QR code generated successfully');
      return dataUrl;
    } catch (err) {
      console.error('❌ Error generating QR code:', err);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code for package tracking
   * Encodes package tracking number and auth code
   * 
   * @param trackingNumber - Package tracking number
   * @param authCode - Optional 6-digit authentication code
   * @returns Promise<string> - Data URL of the QR code
   */
  async generatePackageQRCode(
    trackingNumber: string,
    authCode?: string
  ): Promise<string> {
    try {
      // Format data for QR code
      const qrData = authCode 
        ? `VANGUARD:PKG:${trackingNumber}:AUTH:${authCode}`
        : `VANGUARD:PKG:${trackingNumber}`;

      console.log('📦 Generating package QR code:', qrData);

      return await this.generateQRCode(qrData, {
        width: 300,
        color: {
          dark: '#DC2626', // Vanguard red theme
          light: '#FFFFFF'
        }
      });
    } catch (err) {
      console.error('❌ Error generating package QR code:', err);
      throw err;
    }
  }

  /**
   * Generate QR code for shipment tracking
   * Encodes shipment tracking number
   * 
   * @param trackingNumber - Shipment tracking number
   * @returns Promise<string> - Data URL of the QR code
   */
  async generateShipmentQRCode(trackingNumber: string): Promise<string> {
    try {
      const qrData = `VANGUARD:SHIP:${trackingNumber}`;
      console.log('🚚 Generating shipment QR code:', qrData);

      return await this.generateQRCode(qrData, {
        width: 300,
        color: {
          dark: '#1F2937', // Dark gray for shipments
          light: '#FFFFFF'
        }
      });
    } catch (err) {
      console.error('❌ Error generating shipment QR code:', err);
      throw err;
    }
  }

  /**
   * Generate QR code as canvas element
   * Useful for advanced rendering needs
   * 
   * @param data - Data to encode
   * @param canvas - HTML canvas element
   * @param options - Optional QR code customization
   */
  async generateQRCodeToCanvas(
    data: string,
    canvas: HTMLCanvasElement,
    options: QRCodeOptions = {}
  ): Promise<void> {
    try {
      const qrOptions = { ...DEFAULT_OPTIONS, ...options };
      await QRCode.toCanvas(canvas, data, qrOptions);
      console.log('✅ QR code rendered to canvas');
    } catch (err) {
      console.error('❌ Error rendering QR code to canvas:', err);
      throw err;
    }
  }

  /**
   * Download QR code as PNG image
   * Triggers browser download
   * 
   * @param data - Data to encode
   * @param filename - Filename for download
   * @param options - Optional QR code customization
   */
  async downloadQRCode(
    data: string,
    filename: string,
    options: QRCodeOptions = {}
  ): Promise<void> {
    try {
      console.log('💾 Downloading QR code as:', filename);

      // Generate QR code
      const dataUrl = await this.generateQRCode(data, options);

      // Create download link
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ QR code downloaded successfully');
    } catch (err) {
      console.error('❌ Error downloading QR code:', err);
      throw err;
    }
  }

  /**
   * Get QR code from backend data
   * If backend already generated QR code data, convert it to displayable format
   * 
   * @param qrCodeData - QR code data from backend (could be raw data or data URL)
   * @param options - Optional QR code customization
   * @returns Promise<string> - Data URL of the QR code
   */
  async getQRCodeFromData(
    qrCodeData: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    try {
      // Check if data is already a data URL
      if (qrCodeData.startsWith('data:image')) {
        console.log('✅ QR code data is already a data URL');
        return qrCodeData;
      }

      // Otherwise, generate QR code from the data
      console.log('🔄 Converting QR code data to image');
      return await this.generateQRCode(qrCodeData, options);
    } catch (err) {
      console.error('❌ Error processing QR code data:', err);
      throw err;
    }
  }

  /**
   * Validate QR code data format
   * Checks if the QR code data follows Vanguard format
   * 
   * @param qrCodeData - QR code data string
   * @returns boolean - True if valid Vanguard QR code format
   */
  isValidVanguardQRCode(qrCodeData: string): boolean {
    const patterns = [
      /^VANGUARD:PKG:[A-Z0-9-]+$/,           // Package without auth code
      /^VANGUARD:PKG:[A-Z0-9-]+:AUTH:\d{6}$/, // Package with auth code
      /^VANGUARD:SHIP:[A-Z0-9-]+$/           // Shipment
    ];

    return patterns.some(pattern => pattern.test(qrCodeData));
  }

  /**
   * Parse Vanguard QR code data
   * Extracts tracking number and auth code from QR code
   * 
   * @param qrCodeData - QR code data string
   * @returns Object with parsed data or null if invalid
   */
  parseVanguardQRCode(qrCodeData: string): {
    type: 'package' | 'shipment';
    trackingNumber: string;
    authCode?: string;
  } | null {
    try {
      const parts = qrCodeData.split(':');
      
      if (parts[0] !== 'VANGUARD') {
        return null;
      }

      if (parts[1] === 'PKG') {
        return {
          type: 'package',
          trackingNumber: parts[2],
          authCode: parts[4] // May be undefined if no auth code
        };
      }

      if (parts[1] === 'SHIP') {
        return {
          type: 'shipment',
          trackingNumber: parts[2]
        };
      }

      return null;
    } catch (err) {
      console.error('❌ Error parsing QR code:', err);
      return null;
    }
  }
}

// Export singleton instance
export const qrCodeService = new QRCodeService();
export default qrCodeService;
