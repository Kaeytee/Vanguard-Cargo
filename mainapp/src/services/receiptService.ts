import { supabase } from '../lib/supabase';

/**
 * Receipt Service - Handles all receipt-related operations
 * 
 * This service provides methods to interact with the receipts table
 * and generate package intake receipts with authentication codes.
 * 
 * Features:
 * - Generate package intake receipts with 6-digit auth codes
 * - Retrieve receipt history for customers
 * - Get receipt details with QR codes and barcodes
 * - Download/export receipts
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

// Receipt type definitions
export interface Receipt {
  id: string;
  package_id?: string;
  shipment_id?: string;
  receipt_number: string;
  receipt_type: 'intake' | 'shipment';
  receipt_data: ReceiptData;
  created_at: string;
}

// Receipt data structure from backend
export interface ReceiptData {
  receipt_number: string;
  package_id?: string;
  tracking_number: string;
  auth_code?: string;
  description?: string;
  weight?: number;
  declared_value?: number;
  store_name?: string;
  intake_date?: string;
  qr_code?: string;
  barcode?: string;
  customer_suite_number?: string;
  warehouse_address?: string;
}

// API response type
interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

class ReceiptService {
  /**
   * Generate package intake receipt with authentication code
   * Calls the Supabase RPC function generate_package_intake_receipt
   * 
   * @param packageId - UUID of the package
   * @param staffId - UUID of the staff member processing the package
   * @returns Receipt data with auth code, QR code, and barcode
   */
  async generatePackageIntakeReceipt(
    packageId: string,
    staffId: string
  ): Promise<ApiResponse<ReceiptData>> {
    try {
      console.log('📝 Generating package intake receipt...', { packageId, staffId });

      // Call Supabase RPC function
      const { data, error } = await supabase.rpc('generate_package_intake_receipt', {
        p_package_id: packageId,
        p_staff_id: staffId
      });

      if (error) {
        console.error('❌ Error generating receipt:', error);
        return { data: null, error };
      }

      console.log('✅ Receipt generated successfully:', data);
      return { data, error: null };
    } catch (err) {
      console.error('❌ Exception in generatePackageIntakeReceipt:', err);
      return { data: null, error: err as Error };
    }
  }

  /**
   * Get all receipts for a specific user
   * Retrieves receipts for all packages belonging to the user
   * 
   * @param userId - UUID of the user
   * @returns Array of receipts with full details
   */
  async getUserReceipts(userId: string): Promise<ApiResponse<Receipt[]>> {
    try {
      console.log('📋 Fetching user receipts...', { userId });

      // Query receipts table with joins to packages
      const { data, error } = await supabase
        .from('receipts')
        .select(`
          *,
          packages!inner(user_id)
        `)
        .eq('packages.user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching receipts:', error);
        return { data: null, error };
      }

      console.log(`✅ Found ${data?.length || 0} receipts`);
      return { data: data || [], error: null };
    } catch (err) {
      console.error('❌ Exception in getUserReceipts:', err);
      return { data: null, error: err as Error };
    }
  }

  /**
   * Get a specific receipt by ID
   * 
   * @param receiptId - UUID of the receipt
   * @returns Receipt with full details
   */
  async getReceipt(receiptId: string): Promise<ApiResponse<Receipt>> {
    try {
      console.log('📄 Fetching receipt...', { receiptId });

      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('id', receiptId)
        .single();

      if (error) {
        console.error('❌ Error fetching receipt:', error);
        return { data: null, error };
      }

      console.log('✅ Receipt fetched successfully');
      return { data, error: null };
    } catch (err) {
      console.error('❌ Exception in getReceipt:', err);
      return { data: null, error: err as Error };
    }
  }

  /**
   * Get receipt for a specific package
   * 
   * @param packageId - UUID of the package
   * @returns Receipt for the package (intake receipt)
   */
  async getPackageReceipt(packageId: string): Promise<ApiResponse<Receipt>> {
    try {
      console.log('📦 Fetching package receipt...', { packageId });

      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('package_id', packageId)
        .eq('receipt_type', 'intake')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('❌ Error fetching package receipt:', error);
        return { data: null, error };
      }

      console.log('✅ Package receipt fetched successfully');
      return { data, error: null };
    } catch (err) {
      console.error('❌ Exception in getPackageReceipt:', err);
      return { data: null, error: err as Error };
    }
  }

  /**
   * Download receipt as formatted text/JSON
   * Prepares receipt data for download or printing
   * 
   * @param receipt - Receipt object
   * @returns Formatted receipt string
   */
  formatReceiptForDownload(receipt: Receipt): string {
    const data = receipt.receipt_data;
    
    return `
╔════════════════════════════════════════════════════════╗
║          VANGUARD CARGO - PACKAGE RECEIPT             ║
╚════════════════════════════════════════════════════════╝

Receipt Number: ${data.receipt_number}
Date: ${new Date(receipt.created_at).toLocaleString()}

${data.auth_code ? `
╔════════════════════════════════════════════════════════╗
║              PICKUP AUTHENTICATION CODE               ║
║                                                        ║
║                    ${data.auth_code}                        ║
║                                                        ║
║  ⚠️  KEEP THIS CODE CONFIDENTIAL                       ║
║  Required for package collection                      ║
╚════════════════════════════════════════════════════════╝
` : ''}

PACKAGE DETAILS:
─────────────────────────────────────────────────────────
Tracking Number: ${data.tracking_number}
Description: ${data.description || 'N/A'}
Store/Vendor: ${data.store_name || 'N/A'}
Weight: ${data.weight ? `${data.weight} lbs` : 'N/A'}
Declared Value: ${data.declared_value ? `$${data.declared_value.toFixed(2)}` : 'N/A'}
Intake Date: ${data.intake_date ? new Date(data.intake_date).toLocaleString() : 'N/A'}

CUSTOMER INFORMATION:
─────────────────────────────────────────────────────────
Suite Number: ${data.customer_suite_number || 'N/A'}

WAREHOUSE LOCATION:
─────────────────────────────────────────────────────────
${data.warehouse_address || 'ALX-E2: 4700 Eisenhower Avenue, Alexandria, VA 22304, USA'}

TRACKING CODES:
─────────────────────────────────────────────────────────
QR Code: ${data.qr_code || 'N/A'}
Barcode: ${data.barcode || 'N/A'}

═══════════════════════════════════════════════════════════
Thank you for using VanguardCargo!
For support: support@vanguardcargo.com
═══════════════════════════════════════════════════════════
    `.trim();
  }

  /**
   * Trigger browser download of receipt
   * 
   * @param receipt - Receipt object
   * @param filename - Optional custom filename
   */
  downloadReceipt(receipt: Receipt, filename?: string): void {
    try {
      const formattedReceipt = this.formatReceiptForDownload(receipt);
      const blob = new Blob([formattedReceipt], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = filename || `receipt-${receipt.receipt_number}.txt`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Receipt downloaded successfully');
    } catch (err) {
      console.error('❌ Error downloading receipt:', err);
    }
  }

  /**
   * Print receipt
   * Opens browser print dialog with formatted receipt
   * 
   * @param receipt - Receipt object
   */
  printReceipt(receipt: Receipt): void {
    try {
      const formattedReceipt = this.formatReceiptForDownload(receipt);
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        console.error('❌ Could not open print window');
        return;
      }
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${receipt.receipt_number}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                white-space: pre-wrap;
                padding: 20px;
              }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>${formattedReceipt}</body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      
      console.log('✅ Print dialog opened');
    } catch (err) {
      console.error('❌ Error printing receipt:', err);
    }
  }
}

// Export singleton instance
export const receiptService = new ReceiptService();
export default receiptService;
