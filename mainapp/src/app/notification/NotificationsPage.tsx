import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Trash2, Eye } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { notificationService, type Notification } from '../../services/notificationService';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useNotificationRealtime } from '../../hooks/useRealtime';
import { useNotificationToast } from '../../hooks/useNotificationToast';

/**
 * NotificationsPage - Comprehensive notifications management page
 * 
 * This component displays all user notifications with filtering, marking as read/unread,
 * and deletion functionality. It integrates with the API service and translation system.
 * 
 * Features:
 * - Filter notifications by category and read status
 * - Mark individual or bulk notifications as read/unread
 * - Delete notifications
 * - Real-time updates
 * - Responsive design
 * 
 * @returns {JSX.Element} The NotificationsPage component
 */
const NotificationsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showNotification, showSuccess, showError } = useNotificationToast();
  
  // State management
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'shipment' | 'payment' | 'system' | 'security'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalNotifications, setTotalNotifications] = useState<number>(0);

  // Load notifications on component mount and when filters change
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const result = await notificationService.getNotifications(user.id);
      
      if (!result.error && result.data) {
        // Apply client-side filtering
        let filteredNotifications = result.data;
        
        if (filter === 'read') {
          filteredNotifications = filteredNotifications.filter(n => n.is_read);
        } else if (filter === 'unread') {
          filteredNotifications = filteredNotifications.filter(n => !n.is_read);
        }
        
        if (categoryFilter !== 'all') {
          filteredNotifications = filteredNotifications.filter(n => n.category === categoryFilter);
        }
        
        // Simulate pagination for consistency
        const pageSize = 10;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);
        
        setNotifications(paginatedNotifications);
        setTotalPages(Math.ceil(filteredNotifications.length / pageSize));
        setTotalNotifications(filteredNotifications.length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentPage, filter, categoryFilter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Real-time subscription for notification updates
  const { isConnected } = useNotificationRealtime({
    onInsert: useCallback((newNotificationData: any) => {
      // Map database type to UI category
      const mapTypeToCategory = (type: string) => {
        const typeMap: Record<string, string> = {
          'package_update': 'shipment',
          'shipment_update': 'shipment',
          'system': 'system',
          'promotion': 'system'
        };
        return typeMap[type] || 'system';
      };
      
      // Transform the data to match our interface
      const newNotification: Notification = {
        ...newNotificationData,
        // Database already has is_read field
        category: mapTypeToCategory(newNotificationData.type),
        priority: 'normal' // Default priority
      };
      
      // Add new notification to the beginning of the list
      setNotifications(prev => [newNotification, ...prev]);
      setTotalNotifications(prev => prev + 1);
      
      // Show toast notification
      showNotification({
        id: newNotification.id,
        title: newNotification.title,
        message: newNotification.message || 'You have a new notification',
        category: newNotification.category as any,
        priority: newNotification.priority as any,
        created_at: newNotification.created_at
      });
      
      console.log('✨ New notification received via real-time:', newNotification.title);
    }, [showNotification]),
    
    onUpdate: useCallback((updatedNotificationData: any) => {
      // Transform the data to match our interface
      const updatedNotification: Notification = {
        ...updatedNotificationData,
        is_read: updatedNotificationData.read_status,
        category: 'system', // Default category since it's not in new schema
        priority: 'normal' // Default priority since it's not in new schema
      };
      
      // Update existing notification
      setNotifications(prev => 
        prev.map(n => 
          n.id === updatedNotification.id ? updatedNotification : n
        )
      );
      console.log('Notification updated via real-time:', updatedNotification.title);
    }, []),
    
    onDelete: useCallback((deletedNotificationData: any) => {
      // Remove notification from list
      setNotifications(prev => 
        prev.filter(n => n.id !== deletedNotificationData.id)
      );
      setTotalNotifications(prev => Math.max(0, prev - 1));
      console.log('Notification deleted via real-time:', deletedNotificationData.id);
    }, [])
  });

  /**
   * Get notification icon based on type
   */
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-red-500" />;
    }
  };

  /**
   * Format notification date
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  /**
   * Toggle notification read status
   */
  const toggleReadStatus = async (notificationId: string) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      // Optimistic update first
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: !n.is_read } : n
        )
      );

      if (notification.is_read) {
        await notificationService.markAsUnread(notificationId);
      } else {
        await notificationService.markAsRead(notificationId);
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      // Revert on error
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: !n.is_read } : n
        )
      );
    }
  };

  /**
   * Delete notification
   */
  const deleteNotification = async (notificationId: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  /**
   * Handle bulk actions
   */
  const handleBulkAction = async (action: 'markRead' | 'markUnread' | 'delete') => {
    if (selectedNotifications.length === 0) return;

    try {
      setBulkActionLoading(true);
      
      // Use Promise.all for better performance
      switch (action) {
        case 'markRead':
          await Promise.all(
            selectedNotifications.map(id => notificationService.markAsRead(id))
          );
          // Optimistic update
          setNotifications(prev => 
            prev.map(n => 
              selectedNotifications.includes(n.id) ? { ...n, is_read: true } : n
            )
          );
          break;
        case 'markUnread':
          await Promise.all(
            selectedNotifications.map(id => notificationService.markAsUnread(id))
          );
          // Optimistic update
          setNotifications(prev => 
            prev.map(n => 
              selectedNotifications.includes(n.id) ? { ...n, is_read: false } : n
            )
          );
          break;
        case 'delete':
          await Promise.all(
            selectedNotifications.map(id => notificationService.deleteNotification(id))
          );
          // Optimistic update
          setNotifications(prev => 
            prev.filter(n => !selectedNotifications.includes(n.id))
          );
          break;
      }
      
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      // Reload notifications on error to sync with server state
      await loadNotifications();
    } finally {
      setBulkActionLoading(false);
    }
  };

  /**
   * Mark all notifications as read for the current user
   */
  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    try {
      setBulkActionLoading(true);
      
      // Call the service to mark all notifications as read
      const result = await notificationService.markAllAsRead(user.id);
      
      if (result.error) {
        console.error('Error marking all notifications as read:', result.error);
        showError('Failed to mark all notifications as read');
        return;
      }

      // Optimistic update - mark all current notifications as read
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );

      // Clear selected notifications
      setSelectedNotifications([]);

      // Show success message with count
      const count = result.count || 0;
      if (count > 0) {
        showSuccess(`Marked ${count} notification${count === 1 ? '' : 's'} as read`);
      } else {
        showSuccess('All notifications are already read');
      }
      console.log(`✅ Marked ${count} notifications as read`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showError('An error occurred while marking notifications as read');
      // Reload notifications on error to sync with server state
      await loadNotifications();
    } finally {
      setBulkActionLoading(false);
    }
  };

  /**
   * Toggle notification selection
   */
  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  /**
   * Select all notifications on current page
   */
  const selectAllNotifications = () => {
    const allIds = notifications.map(n => n.id);
    setSelectedNotifications(
      selectedNotifications.length === allIds.length ? [] : allIds
    );
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              {t('notifications')} ({totalNotifications > 10 ? '10+' : totalNotifications})
            </h1>
            
            {/* Real-time Connection Status */}
            <div className="flex items-center space-x-2 ml-4">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-gray-500">
                {isConnected ? 'Live Updates' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-gray-600">
            Stay updated with your shipments and account activities
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as 'all' | 'unread' | 'read');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value as typeof categoryFilter);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Categories</option>
                <option value="shipment">Shipments</option>
                <option value="payment">Payments</option>
                <option value="system">System</option>
                <option value="security">Security</option>
              </select>
            </div>

            {/* Bulk Actions and Mark All as Read */}
            <div className="flex gap-2">
              {/* Mark All as Read Button */}
              {notifications.some(n => !n.is_read) && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={bulkActionLoading}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Mark All as Read
                </button>
              )}
              
              {/* Bulk Actions for Selected */}
              {selectedNotifications.length > 0 && (
                <>
                  <button
                    onClick={() => handleBulkAction('markRead')}
                    disabled={bulkActionLoading}
                    className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    Mark Read
                  </button>
                  <button
                    onClick={() => handleBulkAction('markUnread')}
                    disabled={bulkActionLoading}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Mark Unread
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    disabled={bulkActionLoading}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Select All */}
          {notifications.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                  onChange={selectAllNotifications}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Select all notifications on this page
                {selectedNotifications.length > 0 && (
                  <span className="text-red-600 font-medium">
                    ({selectedNotifications.length} selected)
                  </span>
                )}
              </label>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications found
              </h3>
              <p className="text-gray-600">
                You don't have any notifications matching the current filters.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border p-4 transition-all hover:shadow-md ${
                  !notification.is_read ? 'border-l-4 border-l-red-500 bg-red-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => toggleNotificationSelection(notification.id)}
                    className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />

                  {/* Notification Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-gray-700 text-sm mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{formatDate(notification.created_at)}</span>
                          <span className="capitalize">{notification.category}</span>
                          {!notification.is_read && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                              New
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleReadStatus(notification.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title={notification.is_read ? 'Mark as unread' : 'Mark as read'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Action Button - Future enhancement for specific notification actions */}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 bg-red-600 text-white rounded-md">
                {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
