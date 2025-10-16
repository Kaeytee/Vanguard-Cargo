/**
 * Delivery Notification Service
 * 
 * Handles sending delivery confirmation emails to customers
 * and automatically triggers Trustpilot review invitations.
 * 
 * @author Vanguard Cargo Development Team
 * @version 1.0.0
 */

import { supabase } from '../lib/supabase';

/**
 * Interface for delivery notification data
 */
export interface DeliveryNotificationData {
  /** Customer's email address */
  customerEmail: string;
  /** Customer's full name */
  customerName: string;
  /** Package tracking number */
  trackingNumber: string;
  /** Description of the package contents */
  packageDescription: string;
  /** Date the package was delivered (YYYY-MM-DD format) */
  deliveryDate: string;
  /** Address where package was delivered */
  deliveryAddress: string;
}

/**
 * Response from delivery notification service
 */
export interface DeliveryNotificationResponse {
  /** Whether the notification was sent successfully */
  success: boolean;
  /** Success or error message */
  message: string;
  /** Email ID from the email service */
  emailId?: string;
  /** Whether Trustpilot review invitation was triggered */
  trustpilotTriggered?: boolean;
  /** Error details if applicable */
  error?: string;
}

/**
 * Delivery Notification Service Class
 * 
 * Provides methods for sending delivery confirmation emails
 * with automatic Trustpilot review invitation triggers.
 */
export class DeliveryNotificationService {
  /**
   * Send delivery confirmation email to customer
   * 
   * This method sends a professional delivery confirmation email
   * and automatically triggers a Trustpilot review invitation via BCC.
   * 
   * @param data - Delivery notification data
   * @returns Promise<DeliveryNotificationResponse>
   * 
   * @example
   * ```typescript
   * const result = await DeliveryNotificationService.sendDeliveryNotification({
   *   customerEmail: 'customer@example.com',
   *   customerName: 'John Doe',
   *   trackingNumber: 'VC-12345',
   *   packageDescription: 'Electronics - iPhone 15',
   *   deliveryDate: '2025-10-16',
   *   deliveryAddress: 'Accra, Ghana'
   * });
   * 
   * if (result.success) {
   *   console.log('Delivery notification sent!');
   *   console.log('Trustpilot review invitation triggered:', result.trustpilotTriggered);
   * }
   * ```
   */
  static async sendDeliveryNotification(
    data: DeliveryNotificationData
  ): Promise<DeliveryNotificationResponse> {
    try {
      // Validate required fields
      if (!data.customerEmail || !data.customerName || !data.trackingNumber) {
        return {
          success: false,
          message: 'Missing required fields: customerEmail, customerName, or trackingNumber',
          error: 'Validation error',
        };
      }

      // Call Supabase Edge Function
      const { data: responseData, error } = await supabase.functions.invoke(
        'send-delivery-notification',
        {
          body: data,
        }
      );

      // Handle errors from Edge Function
      if (error) {
        console.error('Error sending delivery notification:', error);
        return {
          success: false,
          message: 'Failed to send delivery notification',
          error: error.message,
        };
      }

      // Return success response
      return {
        success: true,
        message: responseData.message || 'Delivery notification sent successfully',
        emailId: responseData.emailId,
        trustpilotTriggered: responseData.trustpilotTriggered,
      };
    } catch (error) {
      console.error('Unexpected error in sendDeliveryNotification:', error);
      return {
        success: false,
        message: 'Unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send delivery notification from package data
   * 
   * Convenience method that extracts delivery information from a package
   * object and sends the notification.
   * 
   * @param packageData - Package object with delivery details
   * @returns Promise<DeliveryNotificationResponse>
   * 
   * @example
   * ```typescript
   * // When package status is updated to 'delivered'
   * const package = await packageService.getPackageById(packageId);
   * 
   * if (package.status === 'delivered') {
   *   await DeliveryNotificationService.sendDeliveryNotificationFromPackage(package);
   * }
   * ```
   */
  static async sendDeliveryNotificationFromPackage(
    packageData: any
  ): Promise<DeliveryNotificationResponse> {
    try {
      // Extract user information
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, full_name, first_name, last_name')
        .eq('id', packageData.user_id)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        return {
          success: false,
          message: 'Failed to fetch user information',
          error: userError?.message || 'User not found',
        };
      }

      // Determine customer name (prefer full_name, fallback to first_name + last_name)
      const customerName =
        userData.full_name ||
        `${userData.first_name || ''} ${userData.last_name || ''}`.trim() ||
        'Valued Customer';

      // Format delivery date
      const deliveryDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Build notification data
      const notificationData: DeliveryNotificationData = {
        customerEmail: userData.email,
        customerName: customerName,
        trackingNumber: packageData.tracking_number || packageData.package_id,
        packageDescription:
          packageData.description || packageData.store_name || 'Your package',
        deliveryDate: deliveryDate,
        deliveryAddress: 'Ghana', // You can make this dynamic from user address
      };

      // Send notification
      return await this.sendDeliveryNotification(notificationData);
    } catch (error) {
      console.error(
        'Unexpected error in sendDeliveryNotificationFromPackage:',
        error
      );
      return {
        success: false,
        message: 'Unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Trigger Trustpilot review invitation manually
   * 
   * Use this method if you need to manually trigger a review invitation
   * for a past delivery that didn't get the automatic invitation.
   * 
   * @param customerEmail - Customer's email address
   * @param trackingNumber - Package tracking number for reference
   * @returns Promise<DeliveryNotificationResponse>
   * 
   * @example
   * ```typescript
   * // Manually trigger review invitation for past customer
   * await DeliveryNotificationService.triggerTrustpilotReview(
   *   'customer@example.com',
   *   'VC-12345'
   * );
   * ```
   */
  static async triggerTrustpilotReview(
    customerEmail: string,
    trackingNumber: string
  ): Promise<DeliveryNotificationResponse> {
    // Create minimal notification data for Trustpilot trigger
    const notificationData: DeliveryNotificationData = {
      customerEmail: customerEmail,
      customerName: 'Valued Customer',
      trackingNumber: trackingNumber,
      packageDescription: 'Package delivery',
      deliveryDate: new Date().toISOString().split('T')[0],
      deliveryAddress: 'Ghana',
    };

    return await this.sendDeliveryNotification(notificationData);
  }
}

/**
 * Export singleton instance for convenience
 */
export const deliveryNotificationService = DeliveryNotificationService;

export default DeliveryNotificationService;
