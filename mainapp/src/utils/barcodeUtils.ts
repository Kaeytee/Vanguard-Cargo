/**
 * Barcode Generation Utilities for Vanguard Cargo Logistics Application
 * 
 * This file contains utilities for generating tracking barcodes for packages and shipments
 * using Canvas API to create Code 128 barcodes as PNG data URLs.
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2024-10-02
 */

// ============================================================================
// BARCODE CONFIGURATION
// ============================================================================

/**
 * Configuration for barcode generation
 */
interface BarcodeConfig {
  width: number;
  height: number;
  fontSize: number;
  margin: number;
  backgroundColor: string;
  foregroundColor: string;
  showText: boolean;
}

/**
 * Default barcode configuration
 */
const DEFAULT_BARCODE_CONFIG: BarcodeConfig = {
  width: 300,
  height: 100,
  fontSize: 12,
  margin: 10,
  backgroundColor: '#FFFFFF',
  foregroundColor: '#000000',
  showText: true
};

// ============================================================================
// CODE 128 BARCODE IMPLEMENTATION
// ============================================================================

/**
 * Code 128 character set mapping
 * Simplified implementation for basic alphanumeric encoding
 */
const CODE128_PATTERNS: Record<string, string> = {
  // Start codes
  'START_A': '11010000100',
  'START_B': '11010010000',
  'START_C': '11010011100',
  
  // Stop code
  'STOP': '1100011101011',
  
  // Numbers 0-9
  '0': '11011001100',
  '1': '11001101100',
  '2': '11001100110',
  '3': '10010011000',
  '4': '10010001100',
  '5': '10001001100',
  '6': '10011001000',
  '7': '10011000100',
  '8': '10001100100',
  '9': '11001001000',
  
  // Letters A-Z
  'A': '11001000100',
  'B': '11000100100',
  'C': '10110011100',
  'D': '10011011100',
  'E': '10011001110',
  'F': '10111001000',
  'G': '10011101000',
  'H': '10011100100',
  'I': '11001110010',
  'J': '11001011100',
  'K': '11001001110',
  'L': '11011100100',
  'M': '11001110100',
  'N': '11101101110',
  'O': '11101001100',
  'P': '11100101100',
  'Q': '11100100110',
  'R': '11101100100',
  'S': '11100110100',
  'T': '11100110010',
  'U': '11011011000',
  'V': '11011000110',
  'W': '11000110110',
  'X': '10100011000',
  'Y': '10001011000',
  'Z': '10001000110',
  
  // Special characters
  '-': '10110001000',
  '.': '10001101000',
  ' ': '10001100010',
  '$': '10110111000',
  '/': '10110001110',
  '+': '10001001110',
  '%': '11010001110'
};

// ============================================================================
// BARCODE GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate a Code 128 barcode pattern for the given text
 * @param text - The text to encode
 * @returns Binary pattern string
 */
function generateCode128Pattern(text: string): string {
  const cleanText = text.toUpperCase().replace(/[^A-Z0-9\-\.\s\$\/\+%]/g, '');
  
  let pattern = CODE128_PATTERNS['START_B']; // Use START_B for alphanumeric
  
  // Add character patterns
  for (const char of cleanText) {
    const charPattern = CODE128_PATTERNS[char];
    if (charPattern) {
      pattern += charPattern;
    }
  }
  
  // Add stop pattern
  pattern += CODE128_PATTERNS['STOP'];
  
  return pattern;
}

/**
 * Draw barcode on canvas
 * @param canvas - HTML Canvas element
 * @param pattern - Binary pattern string
 * @param text - Original text to display
 * @param config - Barcode configuration
 */
function drawBarcodeOnCanvas(
  canvas: HTMLCanvasElement,
  pattern: string,
  text: string,
  config: BarcodeConfig
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to get canvas context');
  }

  // Set canvas dimensions
  canvas.width = config.width;
  canvas.height = config.height;

  // Clear canvas with background color
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calculate barcode dimensions
  const barcodeWidth = config.width - (config.margin * 2);
  const barcodeHeight = config.showText ? config.height - config.margin - config.fontSize - 5 : config.height - (config.margin * 2);
  const barWidth = barcodeWidth / pattern.length;

  // Draw barcode bars
  ctx.fillStyle = config.foregroundColor;
  let x = config.margin;

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '1') {
      ctx.fillRect(x, config.margin, barWidth, barcodeHeight);
    }
    x += barWidth;
  }

  // Draw text if enabled
  if (config.showText) {
    ctx.fillStyle = config.foregroundColor;
    ctx.font = `${config.fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(
      text,
      canvas.width / 2,
      config.height - config.margin
    );
  }
}

/**
 * Generate a tracking barcode as PNG data URL
 * @param trackingId - The tracking ID to encode
 * @param customConfig - Optional custom configuration
 * @returns PNG data URL string
 */
export function generateTrackingBarcode(
  trackingId: string,
  customConfig?: Partial<BarcodeConfig>
): string {
  try {
    // Merge custom config with defaults
    const config: BarcodeConfig = { ...DEFAULT_BARCODE_CONFIG, ...customConfig };
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    
    // Generate barcode pattern
    const pattern = generateCode128Pattern(trackingId);
    
    // Draw barcode on canvas
    drawBarcodeOnCanvas(canvas, pattern, trackingId, config);
    
    // Return as PNG data URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating barcode:', error);
    
    // Return a fallback image or throw error
    return generateFallbackBarcode(trackingId);
  }
}

/**
 * Generate a fallback barcode when main generation fails
 * @param trackingId - The tracking ID
 * @returns Simple text-based barcode as PNG data URL
 */
function generateFallbackBarcode(trackingId: string): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    // Set canvas dimensions
    canvas.width = 300;
    canvas.height = 100;

    // Draw background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    // Draw text
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VANGUARD CARGO', canvas.width / 2, 30);
    ctx.fillText(trackingId, canvas.width / 2, 55);
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText('Tracking ID', canvas.width / 2, 80);

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating fallback barcode:', error);
    
    // Return a minimal data URL if everything fails
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
}

/**
 * Generate a package barcode with specific formatting
 * @param packageId - The package ID
 * @param customConfig - Optional custom configuration
 * @returns PNG data URL string
 */
export function generatePackageBarcode(
  packageId: string,
  customConfig?: Partial<BarcodeConfig>
): string {
  const config = {
    ...DEFAULT_BARCODE_CONFIG,
    ...customConfig,
    width: 250,
    height: 80
  };
  
  return generateTrackingBarcode(`PKG-${packageId}`, config);
}

/**
 * Generate a shipment barcode with specific formatting
 * @param shipmentId - The shipment ID
 * @param customConfig - Optional custom configuration
 * @returns PNG data URL string
 */
export function generateShipmentBarcode(
  shipmentId: string,
  customConfig?: Partial<BarcodeConfig>
): string {
  const config = {
    ...DEFAULT_BARCODE_CONFIG,
    ...customConfig,
    width: 300,
    height: 100
  };
  
  return generateTrackingBarcode(`SHP-${shipmentId}`, config);
}

/**
 * Generate a warehouse label barcode
 * @param labelId - The label ID
 * @param customConfig - Optional custom configuration
 * @returns PNG data URL string
 */
export function generateWarehouseLabelBarcode(
  labelId: string,
  customConfig?: Partial<BarcodeConfig>
): string {
  const config = {
    ...DEFAULT_BARCODE_CONFIG,
    ...customConfig,
    width: 200,
    height: 60,
    fontSize: 10
  };
  
  return generateTrackingBarcode(`WH-${labelId}`, config);
}

/**
 * Validate if a string can be encoded as a barcode
 * @param text - The text to validate
 * @returns Boolean indicating if text is valid for barcode generation
 */
export function validateBarcodeText(text: string): boolean {
  if (!text || text.length === 0) {
    return false;
  }
  
  if (text.length > 50) {
    return false; // Too long for practical barcode
  }
  
  // Check if text contains only supported characters
  const supportedChars = /^[A-Z0-9\-\.\s\$\/\+%]*$/i;
  return supportedChars.test(text);
}

/**
 * Get barcode dimensions for a given configuration
 * @param config - Barcode configuration
 * @returns Object with width and height
 */
export function getBarcodeDimensions(config?: Partial<BarcodeConfig>): { width: number; height: number } {
  const finalConfig = { ...DEFAULT_BARCODE_CONFIG, ...config };
  return {
    width: finalConfig.width,
    height: finalConfig.height
  };
}

/**
 * Download barcode as PNG file
 * @param dataUrl - The barcode data URL
 * @param filename - The filename for download
 */
export function downloadBarcode(dataUrl: string, filename: string): void {
  try {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading barcode:', error);
  }
}

/**
 * Print barcode with custom layout
 * @param dataUrl - The barcode data URL
 * @param title - Title for the print layout
 * @param additionalInfo - Additional information to include
 */
export function printBarcode(
  dataUrl: string,
  title: string,
  additionalInfo?: Record<string, string>
): void {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window');
    }

    let additionalInfoHtml = '';
    if (additionalInfo) {
      additionalInfoHtml = Object.entries(additionalInfo)
        .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
        .join('');
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px; 
              margin: 0;
            }
            .barcode-container {
              margin: 20px auto;
              padding: 20px;
              border: 2px solid #000;
              display: inline-block;
              background: white;
            }
            .header {
              margin-bottom: 15px;
              font-size: 18px;
              font-weight: bold;
            }
            .barcode-image {
              margin: 15px 0;
            }
            .info {
              margin-top: 15px;
              font-size: 12px;
              text-align: left;
            }
            .footer {
              margin-top: 15px;
              font-size: 10px;
              color: #666;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="barcode-container">
            <div class="header">Vanguard Cargo Logistics</div>
            <div class="header">${title}</div>
            <div class="barcode-image">
              <img src="${dataUrl}" alt="Barcode" />
            </div>
            ${additionalInfoHtml ? `<div class="info">${additionalInfoHtml}</div>` : ''}
            <div class="footer">
              Generated: ${new Date().toLocaleString()}<br>
              ALX-E2: 4700 Eisenhower Avenue, Alexandria, VA 22304, USA
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  } catch (error) {
    console.error('Error printing barcode:', error);
  }
}

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export {
  DEFAULT_BARCODE_CONFIG,
  type BarcodeConfig
};
