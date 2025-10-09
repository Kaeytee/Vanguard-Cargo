/**
 * Package Notification Service
 * 
 * Handles real-time notifications for package arrivals and status updates.
 * Integrates with various notification channels (in-app, email, SMS, WhatsApp).
 */

import { notificationService } from './notificationService';
import { supabase } from '../lib/supabase';
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
          actionUrl: `/app/shipment-history`, // Navigate to shipment history page
          priority: (notification.priority as PackageNotification['priority']) || 'medium',
          channels: ['in_app'] as ('in_app' | 'email' | 'sms' | 'whatsapp')[],
          read: notification.is_read || false
        };
        
        this.handleIncomingNotification(packageNotification);
      }
    );
  }



  /**
   * Handle incoming notification from WebSocket or other sources
   */
  private async handleIncomingNotification(notification: PackageNotification) {
    // Try to enhance notification with actual package data if possible
    await this.enhanceNotificationWithPackageData(notification);
    
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
   * Enhance notification with actual package data from database
   */
  private async enhanceNotificationWithPackageData(notification: PackageNotification) {
    try {
      
      // Try to find the package by notification ID or message content
      const { data: packages, error: _error } = await supabase
        .from('packages')
        .select('id, package_id, tracking_number, store_name, description')
        .or(`id.eq.${notification.packageId},package_id.eq.${notification.packageId}`)
        .limit(1);

      if (packages && packages.length > 0) {
        const pkg = packages[0];
        
        // Update notification with real package data using SAME LOGIC as shipment history
        // Priority: package_id first, then tracking_number, then id as fallback
        const trackingId = pkg.package_id || pkg.tracking_number || pkg.id;
        notification.packageDetails.trackingNumber = trackingId;
        notification.packageDetails.storeName = pkg.store_name || 'Store';
        notification.packageDetails.description = pkg.description || notification.message;
        notification.actionUrl = `/app/shipment-history`;
      }
    } catch (error) {
      // Keep default values if enhancement fails
    }
  }

  /**
   * Show professional in-app toast notification
   */
  private showInAppNotification(notification: PackageNotification) {
    // Show professional toast notification
    this.showToastNotification(notification);

    // Show browser notification if permission is granted
    this.showBrowserNotification(notification);

    // Play notification sound
    this.playNotificationSound();

    // Show badge animation
    this.triggerBadgeAnimation();
  }

  /**
   * Show professional toast notification
   */
  private showToastNotification(notification: PackageNotification) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('notification-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'notification-toast-container';
      toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        pointer-events: none;
      `;
      document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      margin-bottom: 12px;
      min-width: 320px;
      max-width: 400px;
      pointer-events: auto;
      cursor: pointer;
      transform: translateX(100%);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-left: 4px solid #10b981;
      backdrop-filter: blur(10px);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Toast content
    toast.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="
          background: rgba(255,255,255,0.2);
          border-radius: 8px;
          padding: 8px;
          flex-shrink: 0;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 4px;
            line-height: 1.3;
          ">${notification.title}</div>
          <div style="
            font-size: 13px;
            opacity: 0.9;
            line-height: 1.4;
            margin-bottom: 8px;
          ">${notification.message}</div>
          <div style="
            font-size: 11px;
            opacity: 0.7;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <span>${notification.packageDetails.storeName}</span>
            <span>•</span>
            <span>${this.formatTimeAgo(notification.timestamp)}</span>
          </div>
        </div>
        <button style="
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 6px;
          color: white;
          padding: 4px;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
        " onclick="this.parentElement.parentElement.remove()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    // Add click handler
    toast.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).tagName !== 'BUTTON') {
        window.location.href = notification.actionUrl || '/app/shipment-history';
      }
    });

    // Add hover effects
    toast.addEventListener('mouseenter', () => {
      toast.style.transform = 'translateX(0) scale(1.02)';
      toast.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
    });

    toast.addEventListener('mouseleave', () => {
      toast.style.transform = 'translateX(0) scale(1)';
      toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    });

    // Add to container
    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove after 6 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove();
          }
        }, 300);
      }
    }, 6000);
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(notification: PackageNotification) {
    // Try to show browser notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: notification.packageDetails.storeLogoUrl || '/favicon.ico',
        tag: notification.id,
        badge: '/favicon.ico',
        data: {
          url: notification.actionUrl
        }
      });

      // Handle notification click
      browserNotification.onclick = () => {
        window.focus();
        window.location.href = notification.actionUrl || '/app/shipment-history';
        browserNotification.close();
      };

      // Auto close after 8 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 8000);

    } else if ('Notification' in window && Notification.permission !== 'denied') {
      // Request permission for future notifications
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.showBrowserNotification(notification);
        }
      });
    }
  }

  /**
   * Trigger badge animation
   */
  private triggerBadgeAnimation() {
    // Find notification badge and animate it
    const badge = document.querySelector('[data-notification-badge]');
    if (badge) {
      badge.classList.add('animate-pulse');
      setTimeout(() => {
        badge.classList.remove('animate-pulse');
      }, 2000);
    }
  }

  /**
   * Format time ago for notifications
   */
  private formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
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
      // Create professional notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a pleasant notification sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Pleasant notification tone (C-E-G chord)
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
    } catch (error) {
      // Fallback to simple beep
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
              const mappedNotifications = backendResponse.data.map(notification => ({
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
                actionUrl: `/app/shipment-history`, // Navigate to shipment history page
                priority: (notification.priority as PackageNotification['priority']) || 'medium',
                channels: ['in_app'] as ('in_app' | 'email' | 'sms' | 'whatsapp')[],
                read: notification.is_read || false
              }));
              
              // Enhance each notification with actual package data
              for (const notif of mappedNotifications) {
                await this.enhanceNotificationWithPackageData(notif);
              }
              
              this.notifications = mappedNotifications;
              return; // Successfully loaded from backend
            }
          }
        } catch (sessionError) {
          // Error parsing session
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
      // Error storing notifications
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
      // Error clearing notifications
    }
    this.notifyListeners();
  }

  /**
   * Create a test notification for debugging (temporary)
   */
  public async createTestNotification(userId: string) {
    try {
      // Get a real package from the database to test with
      const { data: packages } = await supabase
        .from('packages')
        .select('id, package_id, tracking_number, store_name, description')
        .eq('user_id', userId)
        .limit(1);

      if (packages && packages.length > 0) {
        const pkg = packages[0];
        // Use SAME LOGIC as shipment history: package_id first, then tracking_number, then id
        const trackingId = pkg.package_id || pkg.tracking_number || pkg.id;
        
        const testNotification: PackageNotification = {
          id: `test-${Date.now()}`,
          type: 'package_arrived',
          title: 'Test Package Notification',
          message: `Your package from ${pkg.store_name || 'Store'} has arrived`,
          packageId: pkg.id,
          packageDetails: {
            storeName: pkg.store_name || 'Test Store',
            trackingNumber: trackingId,
            description: pkg.description || 'Test package',
            storeLogoUrl: undefined
          },
          timestamp: new Date().toISOString(),
          actionUrl: `/app/shipment-history`,
          priority: 'medium',
          channels: ['in_app'] as ('in_app' | 'email' | 'sms' | 'whatsapp')[],
          read: false
        };

        this.handleIncomingNotification(testNotification);
      }
    } catch (error) {
      console.error('Error creating test notification:', error);
    }
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
          actionUrl: `/app/shipment-history`, // Navigate to shipment history page
          priority: (notification.priority as PackageNotification['priority']) || 'medium',
          channels: ['in_app'] as ('in_app' | 'email' | 'sms' | 'whatsapp')[],
          read: notification.is_read || false
        }));
        
        this.storeNotifications();
        this.notifyListeners();
      } else if (backendResponse.error) {
        // For new users or if there's an error, ensure we start with empty notifications
        this.notifications = [];
        this.storeNotifications();
        this.notifyListeners();
      }
    } catch (error) {
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
        // Error notifying listener
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

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).packageNotificationService = packageNotificationService;
  (window as any).testNotification = async () => {
    const userId = localStorage.getItem('supabase.auth.token');
    if (userId) {
      try {
        const session = JSON.parse(userId);
        const id = session?.user?.id;
        if (id) {
          console.log('🧪 Creating test notification for user:', id);
          await packageNotificationService.createTestNotification(id);
        }
      } catch (error) {
        console.error('Error getting user ID:', error);
      }
    }
  };
  
  (window as any).clearNotifications = () => {
    console.log('🗑️ Clearing all notifications');
    packageNotificationService.clearAllNotifications();
  };
  
  (window as any).debugNotifications = () => {
    const notifications = packageNotificationService.getNotifications();
    console.log('🔍 Current notifications:', notifications);
    notifications.forEach((notif, index) => {
      console.log(`📋 Notification ${index + 1}:`, {
        id: notif.id,
        title: notif.title,
        trackingNumber: notif.packageDetails.trackingNumber,
        actionUrl: notif.actionUrl,
        packageId: notif.packageId
      });
    });
  };
  
  (window as any).fixExistingNotifications = async () => {
    console.log('🔧 Fixing existing notifications...');
    const notifications = packageNotificationService.getNotifications();
    for (const notif of notifications) {
      if (notif.packageDetails.trackingNumber === 'N/A' || (notif.actionUrl && notif.actionUrl.includes('tracking'))) {
        console.log('🔧 Fixing notification:', notif.id);
        // Access the private method through the instance
        await (packageNotificationService as any).enhanceNotificationWithPackageData(notif);
      }
    }
    console.log('✅ All notifications fixed!');
  };
}
