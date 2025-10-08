import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

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
  private reconnectDelay = 1000;

  async subscribe(
    subscriptionId: string,
    options: RealtimeSubscriptionOptions,
    callback: RealtimeCallback
  ): Promise<boolean> {
    try {
      await this.unsubscribe(subscriptionId);
      console.log(`🔄 Setting up real-time subscription: ${subscriptionId}`);

      let filter = options.filter || '';
      if (options.userId && !filter) {
        filter = `user_id=eq.${options.userId}`;
      }

      const channel = supabase.channel(`${subscriptionId}-${Date.now()}`);

      channel.on(
        'postgres_changes' as any,
        {
          event: options.event || '*',
          schema: options.schema || 'public',
          table: options.table,
          ...(filter && { filter })
        },
        async (payload: any) => {
          console.log(`📡 Real-time change [${subscriptionId}]:`, payload.eventType);
          try {
            await callback({
              eventType: payload.eventType,
              new: payload.new,
              old: payload.old,
              table: payload.table,
              schema: payload.schema
            });
          } catch (error) {
            console.error(`❌ Error in callback [${subscriptionId}]:`, error);
          }
        }
      );

      channel.subscribe((status) => {
        console.log(`📊 Real-time status [${subscriptionId}]:`, status);
        if (status === 'SUBSCRIBED') {
          this.reconnectAttempts.set(subscriptionId, 0);
        }
      });

      this.subscriptions.set(subscriptionId, channel);
      return true;
    } catch (error) {
      console.error(`❌ Failed subscription [${subscriptionId}]:`, error);
      return false;
    }
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      await subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
    }
  }

  async unsubscribeAll(): Promise<void> {
    const promises = Array.from(this.subscriptions.keys()).map(id => this.unsubscribe(id));
    await Promise.all(promises);
  }

  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  isSubscribed(subscriptionId: string): boolean {
    return this.subscriptions.has(subscriptionId);
  }

  /**
   * Get connection health status for monitoring and debugging
   * @returns Object containing total subscriptions, active subscription IDs, and reconnect attempts
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

export const realtimeService = new RealtimeService();
export default realtimeService;