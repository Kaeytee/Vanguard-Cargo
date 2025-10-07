import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Package, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePackageNotifications } from '../hooks/usePackageNotifications';
import type { PackageNotification } from '../services/packageNotificationService';

/**
 * Package Notification Badge Component
 * 
 * Displays a notification bell with badge count and dropdown with recent notifications.
 * Specifically designed for package arrival notifications.
 */
export default function PackageNotificationBadge() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = usePackageNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Get recent notifications (last 10)
  const recentNotifications = notifications.slice(0, 10);

  // Handle notification click
  const handleNotificationClick = (notification: PackageNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    console.log('🔔 Notification clicked:', notification);
    console.log('📦 Navigating to shipment history page');
    
    // Navigate to shipment history page instead of tracking page
    window.location.href = '/app/shipment-history';
    
    setIsOpen(false);
  };

  // Format time ago
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-full transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            data-notification-badge
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1"
          >
            {unreadCount > 10 ? '10+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Package Notifications</h3>
              <div className="flex items-center space-x-2">
                {/* Test notification button removed for production */}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {recentNotifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Store logo or package icon */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          {notification.packageDetails.storeLogoUrl ? (
                            <img
                              src={notification.packageDetails.storeLogoUrl}
                              alt={notification.packageDetails.storeName}
                              className="w-6 h-6 rounded object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.setAttribute('style', 'display: block');
                              }}
                            />
                          ) : null}
                          <Package className="w-4 h-4 text-gray-400" style={{ display: notification.packageDetails.storeLogoUrl ? 'none' : 'block' }} />
                        </div>

                        {/* Notification content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-800'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <span>{notification.packageDetails.storeName}</span>
                                <span className="mx-1">•</span>
                                <span>{notification.packageDetails.trackingNumber.substring(0, 10)}...</span>
                                <span className="mx-1">•</span>
                                <span>{formatTimeAgo(notification.timestamp)}</span>
                              </div>
                            </div>
                            
                            {/* Unread indicator */}
                            {!notification.read && (
                              <div className="flex-shrink-0 ml-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* Empty state */
                <div className="px-4 py-8 text-center">
                  <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No package notifications yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    You'll be notified when packages arrive at our warehouse
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {recentNotifications.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-3">
                <Link
                  to="/app/package-intake"
                  className="flex items-center justify-center w-full text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View All Packages
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
