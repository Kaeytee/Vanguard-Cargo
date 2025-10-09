import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { realtimeService, type RealtimePayload } from '../services/realtimeService';

/**
 * useRealtime - React hook for managing real-time subscriptions
 * 
 * This hook provides a simple interface for components to subscribe to real-time
 * database changes without managing subscriptions manually.
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
  onChange?: (payload: RealtimePayload) => void | Promise<void>;
}

/**
 * Hook for subscribing to real-time database changes
 * @param options - Configuration for the real-time subscription
 * @returns Object with subscription status and control methods
 */
export function useRealtime(options: UseRealtimeOptions) {
  const { user } = useAuth();
  const { table, enabled = true, onInsert, onUpdate, onDelete, onChange } = options;

  // Handle real-time payload and route to appropriate callback
  const handleRealtimeChange = useCallback(async (payload: RealtimePayload) => {
    console.log(`📡 Real-time change [${table}]:`, {
      event: payload.eventType,
      id: payload.new?.id || payload.old?.id
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
      // Error handling real-time change
    }
  }, [table, onInsert, onUpdate, onDelete, onChange]);

  // Set up subscription
  useEffect(() => {
    if (!user?.id || !enabled) {
      return;
    }

    const channelName = `${table}-${user.id}`;
    
    // Subscribe using the centralized service
    realtimeService.subscribe(
      channelName,
      {
        table,
        userId: user.id,
        event: '*'
      },
      handleRealtimeChange
    );

    // Cleanup on unmount
    return () => {
      realtimeService.unsubscribe(channelName);
    };
  }, [user?.id, table, enabled, handleRealtimeChange]);

  return {
    isConnected: user?.id && enabled && realtimeService.isSubscribed(`${table}-${user.id}`),
    connectionHealth: realtimeService.getConnectionHealth()
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
