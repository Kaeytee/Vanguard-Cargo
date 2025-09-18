/**
 * Package Notification Service
 * 
 * Handles real-time notifications for package arrivals and status updates.
 * Integrates with various notification channels (in-app, email, SMS, WhatsApp).
 */

import { notificationService } from './notificationService';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface PackageNotification {
  id: string;
  type: 'package_arrived' | 'package_ready' | 'package_approved' | 'package_shipped' | 'package_delivered';
  title: string;
  message: string;
  packageId: string;
  packageDetails: {
    storeName: string;
    trackingNumber: string;
    description: string;
    storeLogoUrl?: string;
  };
  timestamp: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('in_app' | 'email' | 'sms' | 'whatsapp')[];
  read: boolean;
}

export class PackageNotificationService {
  private static instance: PackageNotificationService;
  private notifications: PackageNotification[] = [];
  private listeners: ((notifications: PackageNotification[]) => void)[] = [];
  private realtimeChannel: RealtimeChannel | null = null;

  private constructor() {
    this.initializeRealtimeNotifications();
    this.loadNotifications();
    this.clearMockDataIfExists();
  }

  public static getInstance(): PackageNotificationService {
    if (!PackageNotificationService.instance) {
      PackageNotificationService.instance = new PackageNotificationService();
    }
    return PackageNotificationService.instance;
  }

  /**
   * Initialize real-time notifications using Supabase
   */
  private initializeRealtimeNotifications() {
    // Note: Real-time subscription will be set up when user logs in
    // This is handled in the setupRealtimeForUser method
    console.log('Package notification service initialized - real-time will be enabled on user login');
  }

  /**
   * Setup real-time notifications for a specific user
   */
  public setupRealtimeForUser(userId: string) {
    // Cleanup existing subscription
    this.disconnect();

    // Setup new subscription
    this.realtimeChannel = notificationService.subscribeToNotifications(
      userId,
      (notification) => {
        // Convert Supabase notification to our PackageNotification format
        const packageNotification: PackageNotification = {
          id: notification.id,
          type: notification.type as PackageNotification['type'],
          title: notification.title,
          message: notification.message,
          packageId: notification.id, // Use notification ID as package ID for now
          packageDetails: {
            storeName: 'Store Name', // Default value since backend doesn't have package details
            trackingNumber: 'N/A',
            description: notification.message,
            storeLogoUrl: undefined
          },
          timestamp: notification.created_at,
          actionUrl: '/app/packages', // Default action URL
          priority: (notification.priority as PackageNotification['priority']) || 'medium',
          channels: ['in_app'],
          read: notification.is_read
        };
        
        this.handleIncomingNotification(packageNotification);
      }
    );

    console.log(`Real-time notifications set up for user: ${userId}`);
  }



  /**
   * Handle incoming notification from WebSocket or other sources
   */
  private handleIncomingNotification(notification: PackageNotification) {
    // Add to notifications array
    this.notifications.unshift(notification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    // Store in localStorage
    this.storeNotifications();

    // Notify all listeners
    this.notifyListeners();

    // Show in-app notification if applicable
    if (notification.channels.includes('in_app')) {
      this.showInAppNotification(notification);
    }

    // Send to other channels (email, SMS, WhatsApp) - would be handled by backend
    this.sendToExternalChannels(notification);
  }

  /**
   * Show in-app toast notification
   */
  private showInAppNotification(notification: PackageNotification) {
    // Create a simple text-based notification for now
    // In a real implementation, you might use a more sophisticated toast library
    const message = `${notification.title}\n${notification.message}\n${notification.packageDetails.storeName} • ${notification.packageDetails.trackingNumber}`;

    // For development, we'll use console.log and browser notification API
    console.log('📦 Package Notification:', message);

    // Try to show browser notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.packageDetails.storeLogoUrl || '/favicon.ico',
        tag: notification.id,
        data: {
          url: notification.actionUrl
        }
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      // Request permission for future notifications
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: notification.packageDetails.storeLogoUrl || '/favicon.ico',
            tag: notification.id
          });
        }
      });
    }

    // Play notification sound for high priority notifications
    if (notification.priority === 'urgent' || notification.priority === 'high') {
      this.playNotificationSound();
    }
  }

  /**
   * Send notification to external channels (handled by backend)
   */
  private sendToExternalChannels(notification: PackageNotification) {
    // This would typically be handled by the backend, but we can log for development
    console.log('Sending notification to external channels:', {
      channels: notification.channels.filter(c => c !== 'in_app'),
      notification: {
        title: notification.title,
        message: notification.message,
        packageDetails: notification.packageDetails
      }
    });

    // In a real implementation, you might send API requests to:
    // - Email service (SendGrid, AWS SES, etc.)
    // - SMS service (Twilio, AWS SNS, etc.)
    // - WhatsApp Business API
  }

  /**
   * Play notification sound
   */
  private playNotificationSound() {
    try {
      // Create audio element for notification sound
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(error => {
        // Ignore audio play errors (user might not have interacted with page yet)
        console.log('Could not play notification sound:', error);
      });
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  }

  /**
   * Load notifications from backend and localStorage fallback
   */
  private async loadNotifications() {
    try {
      // Get current user from localStorage or session
      const userSession = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      
      if (userSession) {
        try {
          const session = JSON.parse(userSession);
          const userId = session?.user?.id;
          
          if (userId) {
            // Try to load from backend
            const backendResponse = await notificationService.getNotifications(userId);
            
            if (!backendResponse.error && backendResponse.data && backendResponse.data.length > 0) {
              // Map backend notifications to our PackageNotification format
              this.notifications = backendResponse.data.map(notification => ({
                id: notification.id,
                type: notification.type as PackageNotification['type'],
                title: notification.title,
                message: notification.message,
                packageId: notification.id, // Use notification ID as package ID for now
                packageDetails: {
                  storeName: 'Store Name', // Default value since backend doesn't have package details
                  trackingNumber: 'N/A',
                  description: notification.message,
                  storeLogoUrl: undefined
                },
                timestamp: notification.created_at,
                actionUrl: '/app/packages', // Default action URL
                priority: (notification.priority as PackageNotification['priority']) || 'medium',
                channels: ['in_app'],
                read: notification.is_read
              }));
              return; // Successfully loaded from backend
            }
          }
        } catch (sessionError) {
          console.error('Error parsing user session:', sessionError);
        }
      }
      
      // Fallback to localStorage for existing users or if backend fails
      const stored = localStorage.getItem('package_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      } else {
        // New user - start with empty notifications
        this.notifications = [];
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Final fallback to localStorage
      try {
        const stored = localStorage.getItem('package_notifications');
        if (stored) {
          this.notifications = JSON.parse(stored);
        } else {
          this.notifications = [];
        }
      } catch (storageError) {
        console.error('Error loading stored notifications:', storageError);
        this.notifications = [];
      }
    }
  }

  /**
   * Store notifications in localStorage
   */
  private storeNotifications() {
    try {
      localStorage.setItem('package_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error storing notifications:', error);
    }
  }

  /**
   * Clear all notifications (useful for clearing mock data)
   */
  public clearAllNotifications() {
    this.notifications = [];
    try {
      localStorage.removeItem('package_notifications');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
    this.notifyListeners();
  }

  /**
   * Refresh notifications from backend for a specific user
   */
  public async refreshNotificationsForUser(userId: string) {
    try {
      const backendResponse = await notificationService.getNotifications(userId);
      
      if (!backendResponse.error && backendResponse.data) {
        // Map backend notifications to our PackageNotification format
        this.notifications = backendResponse.data.map(notification => ({
          id: notification.id,
          type: notification.type as PackageNotification['type'],
          title: notification.title,
          message: notification.message,
          packageId: notification.id, // Use notification ID as package ID for now
          packageDetails: {
            storeName: 'Store Name', // Default value since backend doesn't have package details
            trackingNumber: 'N/A',
            description: notification.message,
            storeLogoUrl: undefined
          },
          timestamp: notification.created_at,
          actionUrl: '/app/packages', // Default action URL
          priority: (notification.priority as PackageNotification['priority']) || 'medium',
          channels: ['in_app'],
          read: notification.is_read
        }));
        
        this.storeNotifications();
        this.notifyListeners();
      } else if (backendResponse.error) {
        console.error('Error fetching notifications from backend:', backendResponse.error);
        // For new users or if there's an error, ensure we start with empty notifications
        this.notifications = [];
        this.storeNotifications();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      // For new users, start with empty notifications
      this.notifications = [];
      this.storeNotifications();
      this.notifyListeners();
    }
  }

  /**
   * Check if notifications contain mock/demo data and clear them
   */
  private clearMockDataIfExists() {
    const hasMockData = this.notifications.some(notification => 
      notification.packageId === 'PKG004' || 
      notification.message.includes('Amazon has arrived') ||
      notification.packageDetails?.trackingNumber === '1Z999AA1234567893'
    );
    
    if (hasMockData) {
      console.log('Clearing mock notifications for production use');
      this.clearAllNotifications();
    }
  }

  /**
   * Notify all listeners about notification updates
   */
  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener([...this.notifications]);
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });
  }

  /**
   * Subscribe to notification updates
   */
  public subscribe(listener: (notifications: PackageNotification[]) => void): () => void {
    this.listeners.push(listener);
    
    // Immediately call listener with current notifications
    listener([...this.notifications]);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get all notifications
   */
  public getNotifications(): PackageNotification[] {
    return [...this.notifications];
  }

  /**
   * Get unread notifications count
   */
  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Mark notification as read
   */
  public markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.storeNotifications();
      this.notifyListeners();
    }
  }

  /**
   * Mark all notifications as read
   */
  public markAllAsRead() {
    let hasChanges = false;
    this.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.storeNotifications();
      this.notifyListeners();
    }
  }

  /**
   * Clear all notifications
   */
  public clearAll() {
    this.notifications = [];
    this.storeNotifications();
    this.notifyListeners();
  }



  /**
   * Cleanup real-time connection
   */
  public disconnect() {
    if (this.realtimeChannel) {
      notificationService.unsubscribeFromNotifications(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }
}

// Export singleton instance
export const packageNotificationService = PackageNotificationService.getInstance();
