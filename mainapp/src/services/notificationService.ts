import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Define a local interface to match the new 'notifications' table schema
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  // The 'type' in the new schema ('email', 'sms') is different from the old UI type ('success', 'warning').
  // We will need to adapt the UI to handle this. For now, we map it as a string.
  type: string;
  read_status: boolean; // Changed from is_read
  created_at: string;

  // The following fields are aliased for backward compatibility within this service
  is_read?: boolean;
  category?: string; // No longer in the new schema, will be undefined
  priority?: string; // No longer in the new schema, will be undefined
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
        .select('*, is_read:read_status', { count: 'exact' }) // Remap read_status to is_read
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
        .update({ read_status: true })
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
        .update({ read_status: false })
        .eq('id', notificationId);

      return { error };
    } catch (err) {
      console.error('Mark notification as unread error:', err);
      return { error: err as Error };
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_status: true })
        .eq('user_id', userId)
        .eq('read_status', false);

      return { error };
    } catch (err) {
      console.error('Mark all notifications as read error:', err);
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
        .eq('read_status', false);

      if (error) {
        return { data: 0, error };
      }

      return { data: count || 0, error: null };
    } catch (err) {
      console.error('Get unread count error:', err);
      return { data: 0, error: err as Error };
    }
  }

  // Get notification types
  getNotificationTypes(): Array<{ value: string; label: string; icon: string }> {
    return [
      { value: 'email', label: 'Email', icon: 'Mail' },
      { value: 'sms', label: 'SMS', icon: 'MessageCircle' },
      { value: 'in_app', label: 'In-App', icon: 'Bell' },
      { value: 'push', label: 'Push', icon: 'Smartphone' },
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
}

export const notificationService = new NotificationService();
export default notificationService;
