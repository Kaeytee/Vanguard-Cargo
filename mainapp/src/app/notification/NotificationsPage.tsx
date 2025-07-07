import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Trash2, Eye } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { apiService, type Notification } from '../../services/api';

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
const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  
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
  const loadNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotifications(
        currentPage,
        10,
        filter,
        categoryFilter
      );
      
      if (response.success) {
        setNotifications(response.data.items);
        setTotalPages(response.data.totalPages);
        setTotalNotifications(response.data.total);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filter, categoryFilter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

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

      if (notification.isRead) {
        await apiService.markNotificationAsUnread(notificationId);
      } else {
        await apiService.markNotificationAsRead(notificationId);
      }

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: !n.isRead } : n
        )
      );
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  /**
   * Delete notification
   */
  const deleteNotification = async (notificationId: string) => {
    try {
      await apiService.deleteNotification(notificationId);
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
      
      for (const notificationId of selectedNotifications) {
        switch (action) {
          case 'markRead':
            await apiService.markNotificationAsRead(notificationId);
            break;
          case 'markUnread':
            await apiService.markNotificationAsUnread(notificationId);
            break;
          case 'delete':
            await apiService.deleteNotification(notificationId);
            break;
        }
      }
      
      // Reload notifications after bulk action
      await loadNotifications();
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
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
              {t('notifications')} ({totalNotifications})
            </h1>
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

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex gap-2">
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
              </div>
            )}
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
                  !notification.isRead ? 'border-l-4 border-l-red-500 bg-red-50/30' : ''
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
                          <span>{formatDate(notification.createdAt)}</span>
                          <span className="capitalize">{notification.category}</span>
                          {!notification.isRead && (
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
                          title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
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

                    {/* Action Button */}
                    {notification.actionUrl && (
                      <div className="mt-3">
                        <a
                          href={notification.actionUrl}
                          className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                        >
                          View Details
                        </a>
                      </div>
                    )}
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
