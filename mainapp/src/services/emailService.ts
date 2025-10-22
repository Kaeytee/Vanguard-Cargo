/**
 * Email Service
 * Handles sending automated emails through Supabase Edge Functions
 * @author Senior Software Engineer
 */

import { supabase } from '@/lib/supabase';

interface SendWelcomeEmailParams {
  email: string;
  firstName: string;
}

interface SendLoginWelcomeEmailParams {
  email: string;
  userId: string;
}

interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class EmailService {
  /**
   * Send welcome email after successful email verification
   * This is triggered when user verifies their email
   * @param params - Email and first name of the user
   * @returns Promise with success status
   */
  async sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<EmailResponse> {
    try {
      console.log('📧 Sending welcome email to:', params.email);

      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: params.email,
          firstName: params.firstName
        }
      });

      if (error) {
        console.error('❌ Welcome email error:', error);
        return {
          success: false,
          error: error.message || 'Failed to send welcome email'
        };
      }

      console.log('✅ Welcome email sent successfully');
      return {
        success: true,
        message: data?.message || 'Welcome email sent successfully'
      };
    } catch (err: any) {
      console.error('❌ Unexpected error sending welcome email:', err);
      return {
        success: false,
        error: err?.message || 'Unexpected error sending welcome email'
      };
    }
  }

  /**
   * Send login welcome email with user details and service instructions
   * This is triggered on first login or when user needs service details
   * @param params - Email and user ID
   * @returns Promise with success status
   */
  async sendLoginWelcomeEmail(params: SendLoginWelcomeEmailParams): Promise<EmailResponse> {
    try {
      console.log('📧 Sending login welcome email to:', params.email);

      const { data, error } = await supabase.functions.invoke('send-login-welcome-email', {
        body: {
          email: params.email,
          userId: params.userId
        }
      });

      if (error) {
        console.error('❌ Login welcome email error:', error);
        return {
          success: false,
          error: error.message || 'Failed to send login welcome email'
        };
      }

      console.log('✅ Login welcome email sent successfully');
      return {
        success: true,
        message: data?.message || 'Login welcome email sent successfully'
      };
    } catch (err: any) {
      console.error('❌ Unexpected error sending login welcome email:', err);
      return {
        success: false,
        error: err?.message || 'Unexpected error sending login welcome email'
      };
    }
  }

  /**
   * Send welcome email asynchronously (non-blocking)
   * This method doesn't wait for the email to be sent
   * @param params - Email and first name of the user
   */
  sendWelcomeEmailAsync(params: SendWelcomeEmailParams): void {
    this.sendWelcomeEmail(params).catch(err => {
      console.error('Background welcome email failed:', err);
    });
  }

  /**
   * Send login welcome email asynchronously (non-blocking)
   * This method doesn't wait for the email to be sent
   * @param params - Email and user ID
   */
  sendLoginWelcomeEmailAsync(params: SendLoginWelcomeEmailParams): void {
    this.sendLoginWelcomeEmail(params).catch(err => {
      console.error('Background login welcome email failed:', err);
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
