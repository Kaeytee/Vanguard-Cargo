import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Clock,
  Settings,
  Headphones,
  Info,
  LogOut,
  Search,
} from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { useLogout } from "../hooks/useLogout";
import { useTranslation } from "../lib/translations";
// Import default avatar for user profile
import defaultAvatar from "../assets/default-avatar.svg";

/**
 * Props interface for the Sidebar component
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
  // Get user data and logout function from auth context
  const { user } = useAuth();
  const { confirmLogout } = useLogout();
  const { t } = useTranslation();

  // Fallback user data if auth context user is null
  const userData = user || {
    name: "Guest User",
    email: "guest@example.com",
    image: defaultAvatar,
  };
  /**
   * Navigation menu items configuration
   */
  const navigationItems = [
    { to: "/app/dashboard", icon: BarChart3, label: t('dashboard') },
    { to: "/app/shipment-history", icon: Clock, label: t('shipmentHistory') },
    { to: "/app/tracking", icon: Search, label: t('tracking') },
    { to: "/app/settings", icon: Settings, label: t('settings') },
  ];

  /**
   * Footer navigation items configuration
   */
  const footerItems = [
    { to: "/app/support", icon: Headphones, label: t('support') },
    { to: "/app/about", icon: Info, label: t('about') },
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
        <div className="w-16 h-16 rounded-full overflow-hidden mb-3 ring-2 ring-white/20 transition-transform duration-200 hover:scale-105">
          <img
            src={userData.image || defaultAvatar}
            alt="User Avatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to our local default avatar if the user image fails to load
              const target = e.target as HTMLImageElement;
              target.src = defaultAvatar;
            }}
          />
        </div>
        <div className="text-center">
          <h3 className="m-0 text-base font-semibold truncate max-w-full">
            {userData.name}
          </h3>
          <p className="mt-1 text-xs opacity-80 truncate max-w-full">
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
