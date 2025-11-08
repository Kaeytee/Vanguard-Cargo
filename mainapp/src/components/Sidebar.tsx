import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Clock,
  Settings,
  LogOut,
  Search,
  Package,
  Headphones,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectUser, selectProfile } from "@/store/slices/authSlice";
import useLogout from "../hooks/useLogout";
import { useTranslation } from "../lib/translations";
import { getAvatarUrl } from "../utils/imageUtils";

/**
{{ ... }}
 */
interface SidebarProps {
  onNavigate?: () => void;
}

/**
 * Sidebar - Navigation sidebar component for the application
 *
 * This component renders the red sidebar with navigation links to different sections
 * of the application. It implements OOP principles by encapsulating all sidebar-related
 * functionality within this component.
 *
 * @param {SidebarProps} props - The component props
 * @param {() => void} props.onNavigate - Optional callback to trigger when navigation occurs
 * @returns {JSX.Element} The Sidebar component
 */
const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  // Get user data from Redux (protected by ReduxAuthGuard - always authenticated here)
  const user = useAppSelector(selectUser);
  const profile = useAppSelector(selectProfile);
  const { confirmLogout } = useLogout();
  const { t } = useTranslation();

  // DEBUG: Log user state
  // console.log('👤 Sidebar - User State:', { user: !!user, profile: !!profile });

  // Safety check: If no user data, show loading
  if (!user) {
    return (
      <div className="w-64 bg-red-600 text-white flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-2 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // User data (guaranteed to exist due to ReduxAuthGuard)
  const userData = {
    name: profile ? `${profile.firstName} ${profile.lastName}` : "User",
    email: user?.email || "",
    image: getAvatarUrl(profile?.avatarUrl || profile?.profileImage),
  };
  /**
   * Navigation menu items configuration
   */
  const navigationItems = [
    { to: "/app/dashboard", icon: BarChart3, label: t('dashboard') },
    { to: "/app/package-intake", icon: Package, label: t('packageIntake') },
    { to: "/app/shipment-history", icon: Clock, label: t('shipmentHistory') },
    { to: "/app/tracking", icon: Search, label: t('tracking') },
    { to: "/app/settings", icon: Settings, label: t('settings') },
  ];

  /**
   * Footer navigation items configuration
   */
  const footerItems = [
  { to: "/app/support", icon: Headphones, label: t('support') },
  ];

  /**
   * Render the sidebar component with navigation links
   */
  return (
    <div className="w-64 bg-red-600 text-white flex flex-col h-full overflow-y-auto shadow-lg transition-all duration-300 ease-in-out lg:w-64 md:w-60 sm:w-56">
      {/* Logo and app name */}
      <div className="p-6 text-center border-red-500/20">
        <h1 className="text-2xl font-bold m-0 tracking-wide">Vanguard Cargo</h1>
      </div>

      {/* User profile section */}
      <div className="flex flex-col items-center p-6 border-red-500/20">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-white/30 transition-transform duration-200 hover:scale-105 shadow-lg">
          <img
            src={userData.image}
            alt="User Avatar"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div className="text-center space-y-1">
          <h3 className="m-0 text-lg font-bold truncate max-w-full">
            {userData.name}
          </h3>
          <p className="text-sm opacity-90 truncate max-w-full">
            {userData.email}
          </p>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 py-4">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => onNavigate?.()} // Close sidebar on mobile when navigation link is clicked
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-white no-underline transition-all duration-200 group ${
                  isActive
                    ? "bg-white/15 border-l-4 border-white shadow-lg"
                    : "hover:bg-white/10 hover:translate-x-1"
                }`
              }
            >
              <IconComponent
                size={20}
                className="mr-4 transition-transform duration-200 group-hover:scale-110"
              />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer navigation */}
      <div className="py-4 border-t border-red-500/20">
        {footerItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => onNavigate?.()} // Close sidebar on mobile when navigation link is clicked
              className="flex items-center px-6 py-3 text-white no-underline group"
            >
              <IconComponent
                size={20}
                className="mr-4"
              />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          );
        })}{" "}
        {/* Logout button */}
        <button
          onClick={confirmLogout}
          className="w-full flex items-center px-6 py-3 text-white bg-transparent border-0 cursor-pointer text-left text-sm font-medium group"
        >
          <LogOut
            size={20}
            className="mr-4"
          />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
