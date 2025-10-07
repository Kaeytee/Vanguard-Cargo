import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * RealtimeService - Centralized real-time synchronization service
 * 
 * This service provides a unified interface for managing real-time subscriptions
 * across the application, ensuring data stays synchronized without manual refreshes.
 * 
 * Features:
 * - Automatic reconnection on connection loss
 * - User-specific data filtering
 * - Comprehensive error handling and logging
 * - Memory leak prevention with proper cleanup
 * - TypeScript support for type safety
 */

export interface RealtimeSubscriptionOptions {
  table: string;
  userId?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  filter?: string;
}

export interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: any;
  old?: any;
  table: string;
  schema: string;
}

export type RealtimeCallback = (payload: RealtimePayload) => void | Promise<void>;

class RealtimeService {
  private subscriptions: Map<string, RealtimeChannel> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  /**
   * Subscribe to real-time changes on a specific table
   * @param subscriptionId - Unique identifier for this subscription
   * @param options - Subscription configuration
   * @param callback - Function to call when changes occur
   * @returns Promise<boolean> - Success status
   */
  async subscribe(
    subscriptionId: string,
    options: RealtimeSubscriptionOptions,
    callback: RealtimeCallback
  ): Promise<boolean> {
    try {
      // Clean up existing subscription if it exists
      await this.unsubscribe(subscriptionId);

      console.log(`🔄 Setting up real-time subscription: ${subscriptionId}`, options);

      // Build filter string
      let filter = options.filter || '';
      if (options.userId && !filter) {
        filter = `user_id=eq.${options.userId}`;
      }

      // Create subscription channel
      const channel = supabase.channel(`${subscriptionId}-${Date.now()}`);

      // Configure postgres changes listener
      channel.on(
        'postgres_changes' as any,
        {
          event: options.event || '*',
          schema: options.schema || 'public',
          table: options.table,
          ...(filter && { filter })
        },
        async (payload: any) => {
          console.log(`📡 Real-time change detected [${subscriptionId}]:`, {
            event: payload.eventType,
            table: payload.table,
            id: payload.new?.id || payload.old?.id
          });

          try {
            await callback({
              eventType: payload.eventType,
              new: payload.new,
              old: payload.old,
              table: payload.table,
              schema: payload.schema
            });
          } catch (error) {
            console.error(`❌ Error in real-time callback [${subscriptionId}]:`, error);
          }
        }
      );

      // Subscribe and handle connection status
      channel.subscribe((status, error) => {
        console.log(`📊 Real-time status [${subscriptionId}]:`, status);

        switch (status) {
          case 'SUBSCRIBED':
            console.log(`✅ Successfully subscribed to real-time updates: ${subscriptionId}`);
            this.reconnectAttempts.set(subscriptionId, 0); // Reset reconnect attempts
            break;

          case 'CHANNEL_ERROR':
            console.error(`❌ Real-time subscription error [${subscriptionId}]:`, error);
            this.handleReconnection(subscriptionId, options, callback);
            break;

          case 'TIMED_OUT':
            console.warn(`⏰ Real-time subscription timed out [${subscriptionId}]`);
            this.handleReconnection(subscriptionId, options, callback);
            break;

          case 'CLOSED':
            console.log(`🔒 Real-time subscription closed [${subscriptionId}]`);
            break;

          default:
            console.log(`📡 Real-time status update [${subscriptionId}]:`, status);
        }
      });

      // Store subscription for cleanup
      this.subscriptions.set(subscriptionId, channel);

      return true;
    } catch (error) {
      console.error(`❌ Failed to create real-time subscription [${subscriptionId}]:`, error);
      return false;
    }
  }

  /**
   * Unsubscribe from real-time changes
   * @param subscriptionId - Unique identifier for the subscription to remove
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      console.log(`🔌 Unsubscribing from real-time updates: ${subscriptionId}`);
      await subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
      this.reconnectAttempts.delete(subscriptionId);
    }
  }

  /**
   * Unsubscribe from all active subscriptions
   */
  async unsubscribeAll(): Promise<void> {
    console.log(`🔌 Unsubscribing from all real-time updates (${this.subscriptions.size} active)`);
    
    const unsubscribePromises = Array.from(this.subscriptions.keys()).map(id => 
      this.unsubscribe(id)
    );
    
    await Promise.all(unsubscribePromises);
  }

  /**
   * Get list of active subscription IDs
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Check if a subscription is active
   */
  isSubscribed(subscriptionId: string): boolean {
    return this.subscriptions.has(subscriptionId);
  }

  /**
   * Handle automatic reconnection with exponential backoff
   */
  private async handleReconnection(
    subscriptionId: string,
    options: RealtimeSubscriptionOptions,
    callback: RealtimeCallback
  ): Promise<void> {
    const attempts = this.reconnectAttempts.get(subscriptionId) || 0;
    
    if (attempts >= this.maxReconnectAttempts) {
      console.error(`❌ Max reconnection attempts reached for ${subscriptionId}`);
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, attempts); // Exponential backoff
    this.reconnectAttempts.set(subscriptionId, attempts + 1);

    console.log(`🔄 Attempting to reconnect ${subscriptionId} in ${delay}ms (attempt ${attempts + 1}/${this.maxReconnectAttempts})`);

    setTimeout(async () => {
      try {
        await this.subscribe(subscriptionId, options, callback);
      } catch (error) {
        console.error(`❌ Reconnection failed for ${subscriptionId}:`, error);
      }
    }, delay);
  }

  /**
   * Subscribe to package changes for a specific user
   * Convenience method for package-related subscriptions
   */
  async subscribeToPackages(
    userId: string,
    callback: (payload: RealtimePayload) => void | Promise<void>
  ): Promise<boolean> {
    return this.subscribe(
      `packages-${userId}`,
      {
        table: 'packages',
        userId,
        event: '*'
      },
      callback
    );
  }

  /**
   * Subscribe to shipment changes for a specific user
   * Convenience method for shipment-related subscriptions
   */
  async subscribeToShipments(
    userId: string,
    callback: (payload: RealtimePayload) => void | Promise<void>
  ): Promise<boolean> {
    return this.subscribe(
      `shipments-${userId}`,
      {
        table: 'shipments',
        userId,
        event: '*'
      },
      callback
    );
  }

  /**
   * Subscribe to notification changes for a specific user
   * Convenience method for notification-related subscriptions
   */
  async subscribeToNotifications(
    userId: string,
    callback: (payload: RealtimePayload) => void | Promise<void>
  ): Promise<boolean> {
    return this.subscribe(
      `notifications-${userId}`,
      {
        table: 'notifications',
        userId,
        event: '*'
      },
      callback
    );
  }

  /**
   * Get connection health status
   */
  getConnectionHealth(): {
    totalSubscriptions: number;
    activeSubscriptions: string[];
    reconnectAttempts: Record<string, number>;
  } {
    return {
      totalSubscriptions: this.subscriptions.size,
      activeSubscriptions: this.getActiveSubscriptions(),
      reconnectAttempts: Object.fromEntries(this.reconnectAttempts)
    };
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
export default realtimeService;
