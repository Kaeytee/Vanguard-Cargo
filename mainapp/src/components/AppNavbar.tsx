import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Settings, LogOut, Menu, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectUser, selectProfile } from "@/store/slices/authSlice";
import { useLogout } from "../hooks/useLogout";
import PackageNotificationBadge from "./PackageNotificationBadge";
import { getAvatarUrl } from "../utils/imageUtils";

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
  // Get user data from Redux (protected by ReduxAuthGuard - always authenticated here)
  const user = useAppSelector(selectUser);
  const profile = useAppSelector(selectProfile);
  const { confirmLogout } = useLogout();

  // State for user dropdown visibility
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);

  // Refs for click outside detection
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // DEBUG: Log user state
  // console.log('🔝 AppNavbar - User State:', { user: !!user, profile: !!profile });

  // Safety check: If no user data, show loading
  if (!user) {
    return (
      <div className="flex justify-between items-center px-4 py-3 bg-white shadow-md h-16">
        <div className="flex items-center gap-3">
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // User data (guaranteed to exist due to ReduxAuthGuard)
  const userData = {
    id: user?.id || "",
    name: profile ? `${profile.firstName} ${profile.lastName}` : "User",
    email: user?.email || "",
    image: getAvatarUrl(profile?.avatarUrl || profile?.profileImage),
  };

  /**
   * Handle click outside to close user dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
   * Toggle user dropdown visibility
   */
  const toggleUserDropdown = (): void => {
    setShowUserDropdown(!showUserDropdown);
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
          {/* Package Notifications */}
          <PackageNotificationBadge />

          {/* User profile */}
          <div className="relative" ref={userDropdownRef}>
            <button
              className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 transition-colors"
              onClick={toggleUserDropdown}
              aria-label="User menu"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-gray-200">
                <img
                  src={userData.image}
                  alt="User"
                  className="w-full h-full object-cover"
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
                      src={userData.image}
                      alt="User"
                      className="w-full h-full object-cover"
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
