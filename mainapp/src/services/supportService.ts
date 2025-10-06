// =====================================================
// SUPPORT SERVICE
// =====================================================
// This service handles support form submissions and
// communication with the Supabase Edge Function for
// sending emails to admin mailbox
// =====================================================

import { supabase } from '../lib/supabase';
import { SUPABASE_CONFIG } from '../config/supabase';

/**
 * Interface for support message submission data
 */
export interface SupportMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'general' | 'support' | 'feedback' | 'complaint';
}

/**
 * Interface for support message response
 */
export interface SupportMessageResponse {
  success: boolean;
  message: string;
  messageId?: string;
  emailSent?: boolean;
  error?: string;
}

/**
 * Interface for support message from database
 */
export interface SupportMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'general' | 'support' | 'feedback' | 'complaint';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  user_id?: string;
  responded_at?: string;
  responded_by?: string;
  response_message?: string;
  email_sent: boolean;
  email_sent_at?: string;
  email_error?: string;
  ip_address?: string;
  user_agent?: string;
  source: 'web' | 'mobile' | 'api';
  created_at: string;
  updated_at: string;
}

/**
 * SupportService class for handling support-related operations
 */
export class SupportService {
  /**
   * Submit a support message via Supabase Edge Function
   * This will save the message to database and send emails
   * 
   * @param messageData - The support message data
   * @returns Promise<SupportMessageResponse>
   */
  static async submitSupportMessage(messageData: SupportMessageData): Promise<SupportMessageResponse> {
    try {
      // Validate input data
      if (!messageData.name?.trim()) {
        throw new Error('Name is required');
      }
      
      if (!messageData.email?.trim()) {
        throw new Error('Email is required');
      }
      
      if (!messageData.subject?.trim()) {
        throw new Error('Subject is required');
      }
      
      if (!messageData.message?.trim()) {
        throw new Error('Message is required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(messageData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();

      // Prepare payload for Edge Function
      const payload = {
        name: messageData.name.trim(),
        email: messageData.email.trim().toLowerCase(),
        subject: messageData.subject.trim(),
        message: messageData.message.trim(),
        category: messageData.category,
        user_id: user?.id || null,
      };

      // Call Edge Function directly with fetch to avoid CORS issues
      const response = await fetch(`${SUPABASE_CONFIG.url}/functions/v1/resend-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Edge function error:', errorData);
        throw new Error(`Failed to send support message: ${response.status}`);
      }

      const data = await response.json();

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send support message');
      }

      return {
        success: true,
        message: 'Your message has been sent successfully! We will get back to you soon.',
        messageId: data.messageId,
        emailSent: data.emailSent,
      };

    } catch (error) {
      console.error('Support message submission error:', error);
      
      return {
        success: false,
        message: 'Failed to send message. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get support messages for the current user
   * Only returns messages associated with the authenticated user
   * 
   * @returns Promise<SupportMessage[]>
   */
  static async getUserSupportMessages(): Promise<SupportMessage[]> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Query support messages for the user
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user support messages:', error);
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Get user support messages error:', error);
      throw error;
    }
  }

  /**
   * Get all support messages (admin only)
   * Requires admin or superadmin role
   * 
   * @param filters - Optional filters for querying messages
   * @returns Promise<SupportMessage[]>
   */
  static async getAllSupportMessages(filters?: {
    status?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<SupportMessage[]> {
    try {
      let query = supabase
        .from('support_messages')
        .select('*');

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
      }

      // Order by creation date (newest first)
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching all support messages:', error);
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Get all support messages error:', error);
      throw error;
    }
  }

  /**
   * Update support message status (admin only)
   * 
   * @param messageId - The message ID to update
   * @param status - New status
   * @param responseMessage - Optional response message
   * @returns Promise<boolean>
   */
  static async updateSupportMessageStatus(
    messageId: string,
    status: 'new' | 'in_progress' | 'resolved' | 'closed',
    responseMessage?: string
  ): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare update data
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Add response data if provided
      if (responseMessage) {
        updateData.response_message = responseMessage;
        updateData.responded_at = new Date().toISOString();
        updateData.responded_by = user.id;
      }

      // Update the message
      const { error } = await supabase
        .from('support_messages')
        .update(updateData)
        .eq('id', messageId);

      if (error) {
        console.error('Error updating support message status:', error);
        throw error;
      }

      return true;

    } catch (error) {
      console.error('Update support message status error:', error);
      throw error;
    }
  }

  /**
   * Get support message statistics (admin only)
   * 
   * @returns Promise<object> Statistics object
   */
  static async getSupportMessageStats(): Promise<{
    total: number;
    new: number;
    inProgress: number;
    resolved: number;
    closed: number;
    byCategory: Record<string, number>;
  }> {
    try {
      // Get all messages
      const { data, error } = await supabase
        .from('support_messages')
        .select('status, category');

      if (error) {
        console.error('Error fetching support message stats:', error);
        throw error;
      }

      const messages = data || [];

      // Calculate statistics
      const stats = {
        total: messages.length,
        new: messages.filter(m => m.status === 'new').length,
        inProgress: messages.filter(m => m.status === 'in_progress').length,
        resolved: messages.filter(m => m.status === 'resolved').length,
        closed: messages.filter(m => m.status === 'closed').length,
        byCategory: {} as Record<string, number>,
      };

      // Calculate category statistics
      messages.forEach(message => {
        stats.byCategory[message.category] = (stats.byCategory[message.category] || 0) + 1;
      });

      return stats;

    } catch (error) {
      console.error('Get support message stats error:', error);
      throw error;
    }
  }
}

export default SupportService;
