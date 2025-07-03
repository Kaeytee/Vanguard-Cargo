import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiGrid, 
  FiFileText, 
  FiClock, 
  FiUsers, 
  FiBarChart2, 
  FiDatabase,
  FiLogOut,
  FiX,
  FiPackage
} from 'react-icons/fi';

/**
 * Sidebar Component
 * 
 * This component renders the application sidebar with navigation links.
 * It includes links to all main sections of the application and logout functionality.
 * The sidebar has a dark blue background with white text as per design requirements.
 * Fully responsive with mobile menu functionality.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Mobile sidebar open state
 * @param {function} props.onToggle - Mobile sidebar toggle function
 * @returns {React.ReactElement} The Sidebar component
 */
interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onToggle }) => {
  // Navigation hook for logout functionality
  const navigate = useNavigate();
  
  // Loading state for logout process
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Handle user logout
   * Clears authentication state and redirects to login page
   */
  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // Simulate logout delay (you can remove this in production)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear authentication state
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('user');
      
      // Redirect to login page
      navigate('/login');
      
      // Close mobile menu if open
      if (onToggle) {
        onToggle();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle navigation click on mobile
   */
  const handleNavClick = () => {
    if (onToggle && window.innerWidth < 768) {
      onToggle();
    }
  };
  
  /**
   * Navigation link item component
   * 
   * @param {Object} props - Component props
   * @param {React.ReactNode} props.icon - Icon component to display
   * @param {string} props.to - Route path
   * @param {string} props.label - Link text
   * @returns {React.ReactElement} Navigation link item
   */
  const NavItem: React.FC<{ 
    icon: React.ReactNode; 
    to: string; 
    label: string;
  }> = ({ icon, to, label }) => (
    <NavLink
      to={to}
      onClick={handleNavClick}
      className={({ isActive }) => 
        `flex items-center px-6 py-4 text-white hover:bg-blue-900 transition-colors duration-200 group ${
          isActive ? 'bg-[#0D1637] border-l-4 border-white' : ''
        }`
      }
    >
      <span className="mr-4 text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </NavLink>
  );
  
  const sidebarContent = (
    <>
      {/* Logo section */}
      <div className="px-6 py-6 bg-transparent">
        <h1 className="text-xl font-bold text-white tracking-wide">TTarius logistics.</h1>
      </div>
      
      {/* Main navigation */}
      <nav className="flex-1 py-6">
        <div>
          <NavItem icon={<FiGrid size={20} />} to="/dashboard" label="Dashboard" />
          <NavItem icon={<FiPackage size={20} />} to="/create-shipment" label="Create Shipment" />
          <NavItem icon={<FiFileText size={20} />} to="/incoming-request" label="Incoming Request" />
          <NavItem icon={<FiClock size={20} />} to="/shipment-history" label="Shipment History" />
          <NavItem icon={<FiUsers size={20} />} to="/client-management" label="Client Management" />
          <NavItem icon={<FiBarChart2 size={20} />} to="/analysis-report" label="Analysis Report" />
          <NavItem icon={<FiDatabase size={20} />} to="/inventory" label="Inventory" />
          {/* <NavItem icon={<FiLayers size={20} />} to="/group-management" label="Group Management" /> */}
          {/* // Removed from sidebar: group-management functionality is not part of current workflow */}
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 md:my-8"></div>
        
        {/* Secondary navigation */}
        <div className="mt-auto">
          {/* <NavItem icon={<FiInfo size={20} />} to="/about" label="About us" /> */}
          {/* // Removed for admin context */}
          {/* <NavItem icon={<FiHeadphones size={20} />} to="/support" label="Support" /> */}
{/* // Removed for admin context: support/complaints not needed for admin */}
          {/* Logout button */}
          <button 
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center w-full px-6 py-4 text-white hover:bg-blue-900 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="mr-4 text-xl"><FiLogOut size={20} /></span>
            <span className="font-medium">
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging out...
                </span>
              ) : 'Log Out'}
            </span>
          </button>
        </div>
      </nav>
      
      {/* User profile section */}
      <div className="bg-[#0D1637] p-6 mt-auto">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-900 font-bold text-lg">
            AD
          </div>
          <div className="ml-4">
            <p className="text-white font-semibold text-sm">Admin</p>
            <p className="text-blue-200 text-xs mt-1">#AD123456789</p>
          </div>
        </div>
      </div>
    </>
  );
  
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-blue-950 h-full overflow-y-auto">
        {sidebarContent}
      </aside>
      
      {/* Mobile Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 w-64 h-full bg-blue-950 transform transition-transform duration-300 ease-in-out md:hidden overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile close button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onToggle}
            className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors duration-200"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="flex flex-col h-full -mt-16">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;