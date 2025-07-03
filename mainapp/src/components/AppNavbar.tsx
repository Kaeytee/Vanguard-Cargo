import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell, Settings, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { useLogout } from "../hooks/useLogout";
import { apiService, type Notification } from "../services/api";

interface AppNavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

/**
 * AppNavbar - Top navigation bar for the application dashboard
 *
 * This component renders the top navigation bar with notifications
 * and user profile dropdown. It follows OOP principles by
 * encapsulating all navbar-related functionality within this component.
 *
 * @returns {JSX.Element} The AppNavbar component
 */
const AppNavbar: React.FC<AppNavbarProps> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  // Get user data and logout function from auth context
  const { user } = useAuth();
  const { confirmLogout } = useLogout();

  // State for notification dropdown visibility
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // State for user dropdown visibility
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);

  // State for notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState<boolean>(false);

  // Refs for click outside detection
  const notificationRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Fallback user data if auth context user is null
  const userData = user || {
    id: "",
    name: "Guest User",
    email: "guest@example.com",
    image: "",
  };

  // Load notifications when component mounts
  useEffect(() => {
    loadNotifications();
  }, []);

  /**
   * Load unread notifications from API
   */
  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await apiService.getUnreadNotifications(5); // Get up to 5 unread notifications
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Get unread notification count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /**
   * Handle click outside to close dropdowns
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Toggle notification dropdown visibility
   * Closes user dropdown if open and loads fresh notifications
   */
  const toggleNotifications = (): void => {
    setShowNotifications(!showNotifications);
    if (showUserDropdown) setShowUserDropdown(false);
    
    // Reload notifications when opening dropdown
    if (!showNotifications) {
      loadNotifications();
    }
  };

  /**
   * Toggle user dropdown visibility
   * Closes notifications dropdown if open
   */
  const toggleUserDropdown = (): void => {
    setShowUserDropdown(!showUserDropdown);
    if (showNotifications) setShowNotifications(false);
  };

  /**
   * Format notification date to relative time
   */
  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  /**
   * Handle notification click - mark as read and navigate if has action URL
   */
  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await apiService.markNotificationAsRead(notification.id);
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      }
      
      // Navigate to action URL if exists
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center px-4 py-3 bg-white shadow-md h-16 relative z-40">
        {/* Left section - Mobile menu button and Welcome message */}
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Welcome message */}
          <div className="welcome-section block sm:block">
            <h2 className="text-lg sm:text-xl lg:text-2xl text-gray-800 font-semibold">
              Welcome
            </h2>
          </div>
        </div>

        {/* Right section - notifications, user profile */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={toggleNotifications}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border min-w-[280px] sm:min-w-[320px] z-50 max-h-96 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">No new notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.isRead ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-700 mb-1">
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatNotificationTime(notification.createdAt)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <Link
                  to="/app/notifications"
                  className="block text-center p-3 text-red-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                  onClick={() => setShowNotifications(false)}
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>

          {/* User profile */}
          <div className="relative" ref={userDropdownRef}>
            <button
              className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 transition-colors"
              onClick={toggleUserDropdown}
              aria-label="User menu"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-gray-200">
                <img
                  src={userData.image || ""}
                  alt="User"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      userData.name
                    )}&background=ef4444&color=ffffff&size=64`;
                  }}
                />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-800 max-w-24 truncate">
                {userData.name}
              </span>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border min-w-[250px] z-50">
                <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-200">
                    <img
                      src={userData.image || ""}
                      alt="User"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          userData.name
                        )}&background=ef4444&color=ffffff&size=64`;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-medium text-gray-800 truncate">
                      {userData.name}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">
                      {userData.email}
                    </p>
                  </div>
                </div>
                <div className="p-2">
                  <Link
                    to="/app/settings"
                    className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors"
                  >
                    <Settings size={18} className="mr-3" />
                    <span>Settings</span>
                  </Link>{" "}
                  <button
                    onClick={confirmLogout}
                    className="flex w-full items-center p-3 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors"
                  >
                    <LogOut size={18} className="mr-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AppNavbar;
