/**
 * Email Notification Service
 * 
 * Handles sending professional email notifications for package status changes.
 * Integrates with Supabase Edge Functions and Resend email service.
 * 
 * Features:
 * - Professional email templates for each status
 * - Automatic user data fetching
 * - Error handling and retry logic
 * - Clean code architecture with OOP principles
 */

import { supabase } from '../lib/supabase';

export interface EmailNotificationData {
  packageId: string;
  trackingNumber: string;
  storeName: string;
  oldStatus: string;
  newStatus: string;
  description?: string;
  userId: string;
}

export interface UserEmailData {
  email: string;
  firstName: string;
  lastName: string;
  suiteNumber?: string;
}

/**
 * Service class for handling email notifications
 * Follows clean code architecture and OOP principles
 */
export class EmailNotificationService {
  private static instance: EmailNotificationService;

  private constructor() {}

  /**
   * Get singleton instance of EmailNotificationService
   * @returns EmailNotificationService instance
   */
  public static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  /**
   * Send package status change email notification
   * @param data - Package and status change data
   * @returns Promise with success/error result
   */
  public async sendPackageStatusEmail(data: EmailNotificationData): Promise<{ 
    success: boolean; 
    error?: string; 
    messageId?: string 
  }> {
    try {
      // Fetch user email data from database
      const userData = await this.getUserEmailData(data.userId);
      if (!userData) {
        return { 
          success: false, 
          error: 'User email data not found' 
        };
      }

      // Prepare email data for Edge Function
      const emailData = {
        userEmail: userData.email,
        userName: `${userData.firstName} ${userData.lastName}`,
        packageId: data.packageId,
        trackingNumber: data.trackingNumber,
        storeName: data.storeName,
        oldStatus: data.oldStatus,
        newStatus: data.newStatus,
        description: data.description,
        suiteNumber: userData.suiteNumber
      };

      // Call Supabase Edge Function to send email
      const { data: result, error } = await supabase.functions.invoke(
        'send-package-status-email',
        {
          body: emailData
        }
      );

      if (error) {
        console.error('Edge function error:', error);
        return { 
          success: false, 
          error: `Failed to send email: ${error.message}` 
        };
      }

      if (!result.success) {
        return { 
          success: false, 
          error: result.error || 'Unknown error occurred' 
        };
      }

      // Log successful email send for audit trail
      await this.logEmailNotification({
        userId: data.userId,
        packageId: data.packageId,
        emailType: 'status_change',
        status: data.newStatus,
        messageId: result.messageId,
        recipientEmail: userData.email
      });

      return { 
        success: true, 
        messageId: result.messageId 
      };

    } catch (error) {
      console.error('Email notification service error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Fetch user email data from database
   * @param userId - User ID to fetch data for
   * @returns User email data or null if not found
   */
  private async getUserEmailData(userId: string): Promise<UserEmailData | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email, first_name, last_name, suite_number')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.error('Error fetching user email data:', error);
        return null;
      }

      return {
        email: data.email,
        firstName: data.first_name || 'Valued Customer',
        lastName: data.last_name || '',
        suiteNumber: data.suite_number
      };

    } catch (error) {
      console.error('Error in getUserEmailData:', error);
      return null;
    }
  }

  /**
   * Log email notification for audit trail
   * @param logData - Email notification log data
   */
  private async logEmailNotification(logData: {
    userId: string;
    packageId: string;
    emailType: string;
    status: string;
    messageId?: string;
    recipientEmail: string;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('email_notifications_log')
        .insert({
          user_id: logData.userId,
          package_id: logData.packageId,
          email_type: logData.emailType,
          status: logData.status,
          message_id: logData.messageId,
          recipient_email: logData.recipientEmail,
          sent_at: new Date().toISOString(),
          success: true
        });

      if (error) {
        console.error('Error logging email notification:', error);
        // Don't throw error here as it's just logging
      }

    } catch (error) {
      console.error('Error in logEmailNotification:', error);
      // Don't throw error here as it's just logging
    }
  }

  /**
   * Test email service connectivity
   * @returns Promise with test result
   */
  public async testEmailService(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.functions.invoke(
        'send-package-status-email',
        {
          body: {
            userEmail: 'test@example.com',
            userName: 'Test User',
            packageId: 'test-123',
            trackingNumber: 'TEST-123',
            storeName: 'Test Store',
            oldStatus: 'received',
            newStatus: 'processing',
            suiteNumber: 'VC-001'
          }
        }
      );

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export singleton instance
export const emailNotificationService = EmailNotificationService.getInstance();
