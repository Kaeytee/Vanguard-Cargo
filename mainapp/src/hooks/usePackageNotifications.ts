import { useState, useEffect } from 'react';
import { packageNotificationService } from '../services/packageNotificationService';
import type { PackageNotification } from '../services/packageNotificationService';

/**
 * React hook for package notifications
 * 
 * Provides an easy way for React components to subscribe to package notifications
 * and manage notification state.
 */
export function usePackageNotifications() {
  const [notifications, setNotifications] = useState<PackageNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = packageNotificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const markAsRead = (notificationId: string) => {
    packageNotificationService.markAsRead(notificationId);
  };

  const markAllAsRead = () => {
    packageNotificationService.markAllAsRead();
  };

  const clearAll = () => {
    packageNotificationService.clearAll();
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearAll
  };
}
