import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Trash2, Eye } from 'lucide-react';
import { notificationService, type Notification } from '../../services/notificationService';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';

/**
 * NotificationsPage - Comprehensive notifications management page
 * 
 * This component displays all user notifications with filtering, marking as read/unread,
 * and deletion functionality.
 * 
 * Features:
 * - Filter notifications by category and read status
 * - Mark individual or bulk notifications as read/unread
 * - Delete notifications
 * - Responsive design
 * 
 * @returns {JSX.Element} The NotificationsPage component
 */
const NotificationsPage = () => {
  const { user } = useAuth();
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
  const [pageSize] = useState<number>(10);

  // Load notifications from API
  const loadNotifications = useCallback(async (page: number = 1) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const result = await notificationService.getNotifications(user.id);
      
      if (!result.error && result.data) {
        // Apply client-side filtering for now
        let filteredNotifications = result.data;
        
        if (filter === 'read') {
          filteredNotifications = filteredNotifications.filter(n => n.is_read);
        } else if (filter === 'unread') {
          filteredNotifications = filteredNotifications.filter(n => !n.is_read);
        }
        
        if (categoryFilter !== 'all') {
          filteredNotifications = filteredNotifications.filter(n => n.category === categoryFilter);
        }
        
        // Simulate pagination
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);
        
        setNotifications(paginatedNotifications);
        setTotalPages(Math.ceil(filteredNotifications.length / pageSize));
        setTotalNotifications(filteredNotifications.length);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filter, categoryFilter, pageSize]);

  // Load notifications on component mount and when filters change
  useEffect(() => {
    loadNotifications(1);
    setCurrentPage(1);
  }, [filter, categoryFilter, loadNotifications]);

  // Load notifications when page changes
  useEffect(() => {
    if (currentPage > 1) {
      loadNotifications(currentPage);
    }
  }, [currentPage, loadNotifications]);

  // Get notification icon based on type
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

  // Format notification date
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

  // Filter notifications based on current filters
  const filteredNotifications = notifications;

  // Toggle notification read status
  const toggleNotificationReadStatus = async (notificationId: string) => {
    try {
      // Find the notification to check its current status before updating
      const notification = notifications.find(n => n.id === notificationId);
      const currentlyRead = notification?.is_read || false;

      // Optimistic update
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: !n.is_read } : n
        )
      );

      // Call the appropriate service method based on current status
      if (currentlyRead) {
        await notificationService.markAsUnread(notificationId);
      } else {
        await notificationService.markAsRead(notificationId);
      }
    } catch (error) {
      console.error('Error toggling notification status:', error);
      // Revert optimistic update on error
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: !n.is_read } : n
        )
      );
    }
  };

    // Delete notification
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

  // Handle bulk actions
  const handleBulkAction = async (action: 'markRead' | 'markUnread' | 'delete') => {
    if (selectedNotifications.length === 0) return;

    try {
      setBulkActionLoading(true);
      
      // Update local state optimistically
      switch (action) {
        case 'markRead':
          setNotifications(prev => 
            prev.map(n => 
              selectedNotifications.includes(n.id) ? { ...n, is_read: true } : n
            )
          );
          // Call Supabase API for each notification
          await Promise.all(
            selectedNotifications.map(id => notificationService.markAsRead(id))
          );
          break;
        case 'markUnread':
          setNotifications(prev => 
            prev.map(n => 
              selectedNotifications.includes(n.id) ? { ...n, is_read: false } : n
            )
          );
          // Call Supabase API for each notification
          await Promise.all(
            selectedNotifications.map(id => notificationService.markAsUnread(id))
          );
          break;
        case 'delete':
          setNotifications(prev => 
            prev.filter(n => !selectedNotifications.includes(n.id))
          );
          // Call Supabase API for each notification
          await Promise.all(
            selectedNotifications.map(id => notificationService.deleteNotification(id))
          );
          break;
      }
      
      // Clear selection after successful bulk action
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      // Reload notifications on error to sync with server state
      loadNotifications(currentPage);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Toggle notification selection
  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Select all filtered notifications
  const selectAllNotifications = () => {
    const allIds = filteredNotifications.map(n => n.id);
    setSelectedNotifications(
      selectedNotifications.length === allIds.length ? [] : allIds
    );
  };

  if (loading) {
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
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
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
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'all' | 'shipment' | 'payment' | 'system' | 'security')}
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
          {filteredNotifications.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={selectAllNotifications}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Select all notifications
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
          {filteredNotifications.length === 0 ? (
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
            filteredNotifications.map((notification) => (
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
                          onClick={() => toggleNotificationReadStatus(notification.id)}
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
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalNotifications)} of {totalNotifications} notifications
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm border rounded-md ${
                        currentPage === pageNum
                          ? 'bg-red-600 text-white border-red-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
