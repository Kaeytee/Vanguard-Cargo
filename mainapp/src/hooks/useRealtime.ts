import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useReduxAuth as useAuth } from './useReduxAuth';

/**
 * useRealtime - React hook for managing real-time subscriptions
 * 
 * This hook provides a simple interface for components to subscribe to real-time
{{ ... }}
 * 
 * Features:
 * - Automatic cleanup on component unmount
 * - User-specific filtering
 * - TypeScript support
 * - Error handling and reconnection
 */

export interface UseRealtimeOptions {
  table: string;
  enabled?: boolean;
  onInsert?: (data: any) => void | Promise<void>;
  onUpdate?: (data: any) => void | Promise<void>;
  onDelete?: (data: any) => void | Promise<void>;
  onChange?: (payload: RealtimePostgresChangesPayload<any>) => void | Promise<void>;
}

/**
 * Hook for subscribing to real-time database changes
 * @param options - Configuration for the real-time subscription
 * @returns Object with subscription status and control methods
 */
export function useRealtime(options: UseRealtimeOptions) {
  const { user } = useAuth();
  const { table, enabled = true, onInsert, onUpdate, onDelete, onChange } = options;
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Handle real-time payload and route to appropriate callback
  const handleRealtimeChange = useCallback(async (payload: RealtimePostgresChangesPayload<any>) => {
    console.log(`📡 Real-time change [${table}]:`, {
      event: payload.eventType,
      id: (payload.new as any)?.id || (payload.old as any)?.id
    });

    try {
      // Call the general onChange callback if provided
      if (onChange) {
        await onChange(payload);
      }

      // Call specific event callbacks
      switch (payload.eventType) {
        case 'INSERT':
          if (onInsert && payload.new) {
            await onInsert(payload.new);
          }
          break;
        case 'UPDATE':
          if (onUpdate && payload.new) {
            await onUpdate(payload.new);
          }
          break;
        case 'DELETE':
          if (onDelete && payload.old) {
            await onDelete(payload.old);
          }
          break;
      }
    } catch (error) {
      console.error('Error handling real-time change:', error);
    }
  }, [table, onInsert, onUpdate, onDelete, onChange]);

  // Set up subscription
  useEffect(() => {
    if (!user?.id || !enabled) {
      setIsConnected(false);
      return;
    }

    const channelName = `${table}-${user.id}`;
    
    // Create Supabase real-time channel
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: `user_id=eq.${user.id}`
        },
        handleRealtimeChange
      )
      .subscribe((status) => {
        console.log(`📡 Real-time subscription status [${table}]:`, status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
      }
    };
  }, [user?.id, table, enabled, handleRealtimeChange]);

  return {
    isConnected,
    connectionHealth: isConnected ? 'connected' : 'disconnected'
  };
}

/**
 * Convenience hook for package real-time updates
 */
export function usePackageRealtime(callbacks: {
  onInsert?: (pkg: any) => void;
  onUpdate?: (pkg: any) => void;
  onDelete?: (pkg: any) => void;
}) {
  return useRealtime({
    table: 'packages',
    ...callbacks
  });
}

/**
 * Convenience hook for shipment real-time updates
 */
export function useShipmentRealtime(callbacks: {
  onInsert?: (shipment: any) => void;
  onUpdate?: (shipment: any) => void;
  onDelete?: (shipment: any) => void;
}) {
  return useRealtime({
    table: 'shipments',
    ...callbacks
  });
}

/**
 * Convenience hook for notification real-time updates
 */
export function useNotificationRealtime(callbacks: {
  onInsert?: (notification: any) => void;
  onUpdate?: (notification: any) => void;
  onDelete?: (notification: any) => void;
}) {
  return useRealtime({
    table: 'notifications',
    ...callbacks
  });
}
