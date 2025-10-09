/**
 * WhatsApp Verification Service
 * Handles WhatsApp number verification with SMS/OTP and database checks
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

import { supabase } from '../lib/supabase';

// Verification step types
export type VerificationStep = 'phone_input' | 'otp_verification' | 'completed';

// Verification response interface
export interface VerificationResponse {
  success: boolean;
  error?: string;
  step?: VerificationStep;
  message?: string;
}

// OTP verification interface
export interface OTPVerificationResponse {
  success: boolean;
  error?: string;
  verified?: boolean;
}

/**
 * WhatsApp Verification Service Class
 * Manages the complete verification workflow
 */
export class WhatsAppVerificationService {
  
  /**
   * Step 1: Validate phone number format and check for duplicates
   * @param phoneNumber - Full phone number with country code
   * @param userId - Current user ID
   */
  static async validatePhoneNumber(phoneNumber: string, userId: string): Promise<VerificationResponse> {
    try {
      // Basic phone number validation
      const phoneRegex = /^[\+]?[1-9][\d]{8,14}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
        return {
          success: false,
          error: 'Please enter a valid phone number format'
        };
      }

      // Check if number already exists in database
      const { data: existingNumbers, error: checkError } = await supabase
        .from('users')
        .select('id, whatsapp_number')
        .eq('whatsapp_number', phoneNumber)
        .neq('id', userId);

      if (checkError) {
        console.error('Database check error:', checkError);
        return {
          success: false,
          error: 'Unable to verify number uniqueness. Please try again.'
        };
      }

      if (existingNumbers && existingNumbers.length > 0) {
        return {
          success: false,
          error: 'This WhatsApp number is already registered to another account'
        };
      }

      return {
        success: true,
        step: 'phone_input',
        message: 'Phone number is valid and available'
      };

    } catch (error) {
      console.error('Phone validation error:', error);
      return {
        success: false,
        error: 'Network error occurred during validation'
      };
    }
  }

  /**
   * Step 2: Send OTP verification code via SMS
   * @param phoneNumber - Phone number to send OTP to
   */
  static async sendOTPCode(phoneNumber: string): Promise<VerificationResponse> {
    try {
      // Generate 6-digit OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in database with expiration (5 minutes)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      
      const { error: storeError } = await supabase
        .from('whatsapp_verification_codes')
        .upsert({
          phone_number: phoneNumber,
          otp_code: otpCode,
          expires_at: expiresAt,
          verified: false,
          created_at: new Date().toISOString()
        });

      if (storeError) {
        console.error('OTP storage error:', storeError);
        return {
          success: false,
          error: 'Failed to generate verification code'
        };
      }

      // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
      // For now, we'll simulate SMS sending
      console.log(`📱 SMS OTP Code for ${phoneNumber}: ${otpCode}`);
      
      // In production, you would call an SMS service here:
      // await this.sendSMS(phoneNumber, `Your Vanguard Cargo verification code is: ${otpCode}`);

      return {
        success: true,
        step: 'otp_verification',
        message: `Verification code sent to ${phoneNumber}`
      };

    } catch (error) {
      console.error('OTP sending error:', error);
      return {
        success: false,
        error: 'Failed to send verification code'
      };
    }
  }

  /**
   * Step 3: Verify OTP code entered by user
   * @param phoneNumber - Phone number being verified
   * @param otpCode - OTP code entered by user
   */
  static async verifyOTPCode(phoneNumber: string, otpCode: string): Promise<OTPVerificationResponse> {
    try {
      // Get the latest OTP for this phone number
      const { data: otpRecord, error: fetchError } = await supabase
        .from('whatsapp_verification_codes')
        .select('*')
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !otpRecord) {
        return {
          success: false,
          error: 'No verification code found. Please request a new code.'
        };
      }

      // Check if OTP has expired
      if (new Date() > new Date(otpRecord.expires_at)) {
        return {
          success: false,
          error: 'Verification code has expired. Please request a new code.'
        };
      }

      // Check if OTP code matches
      if (otpRecord.otp_code !== otpCode) {
        return {
          success: false,
          error: 'Invalid verification code. Please try again.'
        };
      }

      // Mark OTP as verified
      const { error: updateError } = await supabase
        .from('whatsapp_verification_codes')
        .update({ verified: true })
        .eq('id', otpRecord.id);

      if (updateError) {
        console.error('OTP verification update error:', updateError);
        return {
          success: false,
          error: 'Failed to verify code'
        };
      }

      return {
        success: true,
        verified: true
      };

    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        error: 'Network error during verification'
      };
    }
  }

  /**
   * Step 4: Complete verification and update user record
   * @param phoneNumber - Verified phone number
   * @param userId - User ID to update
   */
  static async completeVerification(phoneNumber: string, userId: string): Promise<VerificationResponse> {
    try {
      // Update user's WhatsApp number and verification status
      const { error: updateError } = await supabase
        .from('users')
        .update({
          whatsapp_number: phoneNumber,
          whatsapp_verified: true,
          whatsapp_verified_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('User update error:', updateError);
        return {
          success: false,
          error: 'Failed to save verification status'
        };
      }

      // Clean up verification codes for this phone number
      await supabase
        .from('whatsapp_verification_codes')
        .delete()
        .eq('phone_number', phoneNumber);

      return {
        success: true,
        step: 'completed',
        message: 'WhatsApp number verified successfully!'
      };

    } catch (error) {
      console.error('Verification completion error:', error);
      return {
        success: false,
        error: 'Failed to complete verification'
      };
    }
  }

  /**
   * Full verification workflow
   * @param phoneNumber - Phone number to verify
   * @param userId - User ID
   */
  static async initiateVerification(phoneNumber: string, userId: string): Promise<VerificationResponse> {
    // Step 1: Validate phone number
    const validation = await this.validatePhoneNumber(phoneNumber, userId);
    if (!validation.success) {
      return validation;
    }

    // Step 2: Send OTP code
    const otpResult = await this.sendOTPCode(phoneNumber);
    return otpResult;
  }
}

/**
 * SMS Service Integration (placeholder)
 * In production, integrate with Twilio, AWS SNS, or similar service
 */
export class SMSService {
  
  /**
   * Send SMS message
   * @param phoneNumber - Recipient phone number
   * @param message - SMS message content
   */
  static async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // TODO: Implement actual SMS service integration
      // Example with Twilio:
      /*
      const client = twilio(accountSid, authToken);
      await client.messages.create({
        body: message,
        from: '+1234567890', // Your Twilio number
        to: phoneNumber
      });
      */
      
      console.log(`📱 SMS to ${phoneNumber}: ${message}`);
      return true;
    } catch (error) {
      console.error('SMS sending error:', error);
      return false;
    }
  }
}

export default WhatsAppVerificationService;
