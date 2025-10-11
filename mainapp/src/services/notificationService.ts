import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Define interface to match actual database schema
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  // Database type values: 'package_update', 'shipment_update', 'system', 'promotion'
  type: string;
  is_read: boolean; // Matches database column name
  action_url?: string | null;
  created_at: string;

  // Optional fields for UI compatibility
  category?: string; // Derived from type for UI
  priority?: string; // Not in database, default to 'normal'
}


export interface NotificationFilters {
  isRead?: boolean;
  type?: string;
  category?: string;
  priority?: string;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  shipmentUpdates: boolean;
  deliveryAlerts: boolean;
  delayNotifications: boolean;
  marketingNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateNotificationSettingsData {
  shipmentUpdates?: boolean;
  deliveryAlerts?: boolean;
  delayNotifications?: boolean;
  marketingNotifications?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
}

class NotificationService {
  // Helper method to map database type to UI category
  private mapTypeToCategory(type: string): string {
    const typeMap: Record<string, string> = {
      'package_update': 'shipment',
      'shipment_update': 'shipment',
      'system': 'system',
      'promotion': 'system'
    };
    return typeMap[type] || 'system';
  }

  // Get notifications for a user
  async getNotifications(
    userId: string,
    filters?: NotificationFilters,
    limit = 50,
    offset = 0
  ): Promise<{ data: Notification[]; error: Error | null; count?: number }> {
    try {
      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.isRead !== undefined) {
        query = query.eq('is_read', filters.isRead);
      }

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      // Filtering by category and priority is removed as these fields are not in the new schema.
      // if (filters?.category) {
      //   query = query.eq('category', filters.category);
      // }
      //
      // if (filters?.priority) {
      //   query = query.eq('priority', filters.priority);
      // }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return { data: [], error };
      }

      return { data: data || [], error: null, count: count || 0 };
    } catch (err) {
      console.error('Get notifications error:', err);
      return { data: [], error: err as Error };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      return { error };
    } catch (err) {
      console.error('Mark notification as read error:', err);
      return { error: err as Error };
    }
  }

  // Mark notification as unread
  async markAsUnread(notificationId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: false })
        .eq('id', notificationId);

      return { error };
    } catch (err) {
      console.error('Mark notification as unread error:', err);
      return { error: err as Error };
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<{ error: Error | null; count?: number }> {
    try {
      // Use database function for reliable marking
      const { data, error } = await supabase
        .rpc('mark_all_notifications_read', { p_user_id: userId });

      if (error) {
        console.error('Mark all notifications as read error:', error);
        return { error };
      }

      // Return the count of updated notifications
      const count = data?.[0]?.updated_count || 0;
      console.log(`✅ Marked ${count} notifications as read for user ${userId}`);
      
      return { error: null, count };
    } catch (err) {
      console.error('Mark all notifications as read exception:', err);
      return { error: err as Error };
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      return { error };
    } catch (err) {
      console.error('Delete notification error:', err);
      return { error: err as Error };
    }
  }

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<{ data: number; error: Error | null }> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        return { data: 0, error };
      }

      return { data: count || 0, error: null };
    } catch (err) {
      console.error('Get unread count error:', err);
      return { data: 0, error: err as Error };
    }
  }

  // Get notification types based on actual database schema
  getNotificationTypes(): Array<{ value: string; label: string; icon: string }> {
    return [
      { value: 'package_update', label: 'Package Update', icon: 'Package' },
      { value: 'shipment_update', label: 'Shipment Update', icon: 'Truck' },
      { value: 'system', label: 'System', icon: 'Bell' },
      { value: 'promotion', label: 'Promotion', icon: 'Tag' },
    ];
  }

  // getNotificationCategories and getPriorityLevels are removed because 'category' and 'priority' fields
  // are no longer part of the 'notifications' table in the new schema.

  // Subscribe to real-time notifications
  subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ) {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return channel;
  }

  // Unsubscribe from real-time notifications
  unsubscribeFromNotifications(channel: RealtimeChannel) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  }

  // === NOTIFICATION SETTINGS METHODS ===

    // Get user notification settings
  async getSettings(userId: string): Promise<{ data: NotificationSettings | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.error('Get notification settings error:', error);
        return { data: null, error: error.message };
      }

      // If no settings found, create default settings
      if (!data || data.length === 0) {
        return await this.createDefaultSettings(userId);
      }

      const userPrefs = data[0];
      return {
        data: {
          id: userPrefs.id,
          userId: userPrefs.user_id,
          shipmentUpdates: userPrefs.in_app, // Map in_app to shipmentUpdates
          deliveryAlerts: userPrefs.in_app, // Map in_app to deliveryAlerts
          delayNotifications: userPrefs.in_app, // Map in_app to delayNotifications
          marketingNotifications: false, // Not in schema, default to false
          emailNotifications: userPrefs.email,
          smsNotifications: userPrefs.sms,
          pushNotifications: userPrefs.whatsapp, // Map whatsapp to push for now
          createdAt: userPrefs.created_at,
          updatedAt: userPrefs.updated_at,
        },
        error: null,
      };
    } catch (err) {
      console.error('Get notification settings error:', err);
      return { data: null, error: 'Failed to load notification settings' };
    }
  }

  // Create default notification settings for new user
  async createDefaultSettings(userId: string): Promise<{ data: NotificationSettings | null; error: string | null }> {
    try {
      const defaultSettings = {
        user_id: userId,
        email: true,
        sms: false,
        whatsapp: true,
        in_app: true,
        frequency: 'immediate',
      };

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert(defaultSettings, { onConflict: 'user_id' })
        .select()
        .limit(1);

      if (error) {
        console.error('Create default notification settings error:', error);
        return { data: null, error: error.message };
      }

      const userPrefs = data[0];
      return {
        data: {
          id: userPrefs.id,
          userId: userPrefs.user_id,
          shipmentUpdates: userPrefs.in_app,
          deliveryAlerts: userPrefs.in_app,
          delayNotifications: userPrefs.in_app,
          marketingNotifications: false,
          emailNotifications: userPrefs.email,
          smsNotifications: userPrefs.sms,
          pushNotifications: userPrefs.whatsapp,
          createdAt: userPrefs.created_at,
          updatedAt: userPrefs.updated_at,
        },
        error: null,
      };
    } catch (err) {
      console.error('Create default notification settings error:', err);
      return { data: null, error: 'Failed to create default notification settings' };
    }
  }

  // Update user notification settings
  async updateSettings(
    userId: string,
    updates: UpdateNotificationSettingsData
  ): Promise<{ data: NotificationSettings | null; error: string | null; success: boolean }> {
    try {
      const updateData: Record<string, boolean | string> = {
        updated_at: new Date().toISOString(),
      };

      // Map frontend fields to database columns
      if (updates.shipmentUpdates !== undefined) updateData.in_app = updates.shipmentUpdates;
      if (updates.deliveryAlerts !== undefined) updateData.in_app = updates.deliveryAlerts;
      if (updates.delayNotifications !== undefined) updateData.in_app = updates.delayNotifications;
      // marketingNotifications not supported in current schema
      if (updates.emailNotifications !== undefined) updateData.email = updates.emailNotifications;
      if (updates.smsNotifications !== undefined) updateData.sms = updates.smsNotifications;
      if (updates.pushNotifications !== undefined) updateData.whatsapp = updates.pushNotifications;

      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .limit(1);

      if (error) {
        console.error('Update notification settings error:', error);
        return { data: null, error: error.message, success: false };
      }

      if (!data || data.length === 0) {
        return { data: null, error: 'Failed to update notification settings', success: false };
      }

      const userPrefs = data[0];
      return {
        data: {
          id: userPrefs.id,
          userId: userPrefs.user_id,
          shipmentUpdates: userPrefs.in_app,
          deliveryAlerts: userPrefs.in_app,
          delayNotifications: userPrefs.in_app,
          marketingNotifications: false,
          emailNotifications: userPrefs.email,
          smsNotifications: userPrefs.sms,
          pushNotifications: userPrefs.whatsapp,
          createdAt: userPrefs.created_at,
          updatedAt: userPrefs.updated_at,
        },
        error: null,
        success: true,
      };
    } catch (err) {
      console.error('Update notification settings error:', err);
      return { data: null, error: 'Failed to update notification settings', success: false };
    }
  }

  // Toggle a specific notification setting
  async toggleSetting(
    userId: string,
    settingName: keyof UpdateNotificationSettingsData,
    value: boolean
  ): Promise<{ data: NotificationSettings | null; error: string | null; success: boolean }> {
    return await this.updateSettings(userId, { [settingName]: value });
  }

  // === NOTIFICATION CREATION METHODS ===

  /**
   * Create a new notification for a user
   * @param userId - The user ID to send the notification to
   * @param title - The notification title
   * @param message - The notification message
   * @param type - The notification type ('email', 'sms', 'in_app', 'push')
   * @returns Promise with the created notification or error
   */
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string = 'system'
  ): Promise<{ data: Notification | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Create notification error:', error);
        return { data: null, error };
      }

      // Transform the data to match our interface
      const notification: Notification = {
        ...data,
        // Map type to category for UI
        category: this.mapTypeToCategory(data.type),
        priority: 'normal' // Default priority
      };

      console.log('✅ Notification created:', notification.title);
      return { data: notification, error: null };
    } catch (err) {
      console.error('Create notification error:', err);
      return { data: null, error: err as Error };
    }
  }

  /**
   * Create a package status update notification
   * @param userId - The user ID to send the notification to
   * @param packageId - The package ID that was updated
   * @param packageDetails - Package details for the notification
   * @param oldStatus - The previous status
   * @param newStatus - The new status
   * @returns Promise with the created notification or error
   */
  async createPackageStatusNotification(
    userId: string,
    packageId: string,
    packageDetails: {
      storeName?: string;
      trackingNumber?: string;
      description?: string;
    },
    _oldStatus: string,
    newStatus: string
  ): Promise<{ data: Notification | null; error: Error | null }> {
    try {
      // Generate user-friendly status messages
      const statusMessages = {
        pending: 'is awaiting processing',
        received: 'has been received at our warehouse',
        processing: 'is being processed for shipment',
        shipped: 'has been shipped and is on its way',
        delivered: 'has been delivered successfully',
        on_hold: 'has been placed on hold'
      };

      const title = `Package Status Update`;
      const storeName = packageDetails.storeName || 'Unknown Store';
      const trackingNumber = packageDetails.trackingNumber || packageId;
      const statusMessage = statusMessages[newStatus as keyof typeof statusMessages] || `status changed to ${newStatus}`;
      
      const message = `Your package from ${storeName} (${trackingNumber}) ${statusMessage}.`;

      return await this.createNotification(userId, title, message, 'package_update');
    } catch (err) {
      console.error('Create package status notification error:', err);
      return { data: null, error: err as Error };
    }
  }

  /**
   * Create a shipment notification
   * @param userId - The user ID to send the notification to
   * @param shipmentId - The shipment ID
   * @param shipmentDetails - Shipment details for the notification
   * @param eventType - The type of shipment event
   * @returns Promise with the created notification or error
   */
  async createShipmentNotification(
    userId: string,
    shipmentId: string,
    shipmentDetails: {
      recipientName?: string;
      destinationAddress?: string;
      trackingNumber?: string;
    },
    eventType: 'created' | 'shipped' | 'in_transit' | 'delivered' | 'delayed'
  ): Promise<{ data: Notification | null; error: Error | null }> {
    try {
      const eventMessages = {
        created: 'has been created and is being prepared',
        shipped: 'has been shipped and is on its way',
        in_transit: 'is currently in transit',
        delivered: 'has been delivered successfully',
        delayed: 'has been delayed - we apologize for the inconvenience'
      };

      const title = `Shipment ${eventType === 'created' ? 'Created' : eventType === 'shipped' ? 'Shipped' : eventType === 'delivered' ? 'Delivered' : 'Update'}`;
      const recipientName = shipmentDetails.recipientName || 'recipient';
      const trackingNumber = shipmentDetails.trackingNumber || shipmentId;
      const eventMessage = eventMessages[eventType];
      
      const message = `Your shipment to ${recipientName} (${trackingNumber}) ${eventMessage}.`;

      return await this.createNotification(userId, title, message, 'shipment_update');
    } catch (err) {
      console.error('Create shipment notification error:', err);
      return { data: null, error: err as Error };
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
