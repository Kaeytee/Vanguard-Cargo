import { supabase } from '../lib/supabase';

/**
 * DeliveryCodeService - Service for managing package delivery codes
 * 
 * Handles fetching and managing unique 6-digit delivery codes for packages
 * that have arrived at the warehouse and are ready for customer pickup.
 * 
 * @class DeliveryCodeService
 * @description Provides methods for:
 * - Fetching delivery codes for logged-in customers
 * - Retrieving code details for specific packages
 * - Managing delivery code lifecycle
 * 
 * @author Vanguard Cargo Development Team
 * @version 1.0.0
 */

/**
 * Interface representing a delivery code record from packages table
 * @interface DeliveryCode
 */
export interface DeliveryCode {
  /** Unique package identifier (e.g., 'PKG-001') */
  package_id: string;
  
  /** Package tracking number */
  tracking_number: string;
  
  /** 6-digit delivery code for pickup verification (from packages.delivery_auth_code) */
  delivery_code: string;
  
  /** Package status (should be 'arrived' for packages with codes) */
  status: string;
  
  /** Package description */
  description: string | null;
  
  /** Store name */
  store_name?: string | null;
  
  /** Package created timestamp */
  created_at?: string;
}

/**
 * Response structure for delivery code operations
 * @interface DeliveryCodeResponse
 */
export interface DeliveryCodeResponse {
  /** Success status of the operation */
  success: boolean;
  
  /** Array of delivery codes (if successful) */
  data?: DeliveryCode[];
  
  /** Error message (if operation failed) */
  error?: string;
  
  /** Additional error details for debugging */
  details?: unknown;
}

/**
 * DeliveryCodeService class - Manages delivery code operations
 * @class
 */
class DeliveryCodeService {
  /**
   * Fetch delivery codes for the logged-in customer
   * 
   * Queries the packages table directly for packages with delivery_auth_code.
   * Uses RLS to ensure users only see their own packages.
   * 
   * @param {string} userId - The authenticated user's ID
   * @returns {Promise<DeliveryCodeResponse>} Response containing delivery codes or error
   * 
   * @example
   * const response = await deliveryCodeService.getCustomerDeliveryCodes(user.id);
   * if (response.success) {
   *   console.log('Delivery codes:', response.data);
   * }
   */
  async getCustomerDeliveryCodes(userId: string): Promise<DeliveryCodeResponse> {
    try {
      // Validate user ID
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required',
        };
      }

      // Query packages table directly for packages with delivery codes
      // RLS policy ensures users only see their own packages
      const { data, error } = await supabase
        .from('packages')
        .select('package_id, tracking_number, delivery_auth_code, status, description, store_name, created_at')
        .eq('user_id', userId)
        .eq('status', 'arrived')
        .not('delivery_auth_code', 'is', null)
        .order('created_at', { ascending: false });

      // Handle Supabase errors
      if (error) {
        console.error('❌ Failed to fetch delivery codes:', error);
        return {
          success: false,
          error: 'Failed to fetch delivery codes. Please try again.',
          details: error,
        };
      }

      // Transform data to match DeliveryCode interface
      const deliveryCodes: DeliveryCode[] = (data || []).map((pkg: any) => ({
        package_id: pkg.package_id,
        tracking_number: pkg.tracking_number,
        delivery_code: pkg.delivery_auth_code,
        status: pkg.status,
        description: pkg.description,
        store_name: pkg.store_name,
        created_at: pkg.created_at,
      }));

      // Return successful response with delivery codes
      return {
        success: true,
        data: deliveryCodes,
      };
    } catch (err) {
      // Handle unexpected errors
      return {
        success: false,
        error: 'An unexpected error occurred while fetching delivery codes.',
        details: err,
      };
    }
  }

  /**
   * Get delivery code for a specific package
   * 
   * Retrieves the delivery code details for a single package by its ID.
   * 
   * @param {string} userId - The authenticated user's ID
   * @param {string} packageId - The package ID to lookup
   * @returns {Promise<DeliveryCodeResponse>} Response containing delivery code or error
   * 
   * @example
   * const response = await deliveryCodeService.getPackageDeliveryCode(user.id, 'PKG-123456');
   */
  async getPackageDeliveryCode(
    userId: string,
    packageId: string
  ): Promise<DeliveryCodeResponse> {
    try {
      // Fetch all delivery codes for the user
      const response = await this.getCustomerDeliveryCodes(userId);

      // Return error if fetch failed
      if (!response.success || !response.data) {
        return response;
      }

      // Filter for the specific package
      const packageCode = response.data.find(
        (code) => code.package_id === packageId
      );

      // Return error if package not found
      if (!packageCode) {
        return {
          success: false,
          error: 'Delivery code not found for this package',
        };
      }

      // Return successful response with single delivery code
      return {
        success: true,
        data: [packageCode],
      };
    } catch (err) {
      // Handle unexpected errors
      console.error('Unexpected error fetching package delivery code:', err);
      return {
        success: false,
        error: 'An unexpected error occurred while fetching package delivery code.',
        details: err,
      };
    }
  }

  /**
   * Check if a delivery code is valid
   * 
   * Currently delivery codes don't expire, so this always returns true
   * if the code exists. Future enhancement could add expiration logic.
   * 
   * @param {DeliveryCode} deliveryCode - The delivery code to validate
   * @returns {boolean} True if code is valid
   * 
   * @example
   * const isValid = deliveryCodeService.isCodeValid(code);
   */
  isCodeValid(deliveryCode: DeliveryCode): boolean {
    // Check if delivery code exists and is not empty
    return !!deliveryCode.delivery_code && deliveryCode.delivery_code.length === 6;
  }

  /**
   * Format delivery code for display
   * 
   * Formats a 6-digit code into a more readable format (e.g., 847-293)
   * 
   * @param {string} code - The raw 6-digit code
   * @returns {string} Formatted code
   * 
   * @example
   * const formatted = deliveryCodeService.formatCode('847293'); // Returns: '847-293'
   */
  formatCode(code: string): string {
    // Ensure code is 6 digits
    if (code.length !== 6) {
      return code;
    }

    // Format as XXX-XXX for better readability
    return `${code.substring(0, 3)}-${code.substring(3)}`;
  }

  /**
   * Get count of packages ready for pickup
   * 
   * @param {string} userId - The authenticated user's ID
   * @returns {Promise<number>} Count of packages with delivery codes
   * 
   * @example
   * const count = await deliveryCodeService.getReadyForPickupCount(user.id);
   */
  async getReadyForPickupCount(userId: string): Promise<number> {
    try {
      // Fetch delivery codes
      const response = await this.getCustomerDeliveryCodes(userId);

      // Return 0 if fetch failed or no data
      if (!response.success || !response.data) {
        return 0;
      }

      // Return count of delivery codes
      return response.data.length;
    } catch (err) {
      console.error('Error getting ready for pickup count:', err);
      return 0;
    }
  }
}

// Export singleton instance
export const deliveryCodeService = new DeliveryCodeService();

// Export service class for testing
export default DeliveryCodeService;
