import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/auth/hooks/useAuth';
import type { RolePermissions } from '../../app/auth/contexts/AuthContext';
import { 
  FiGrid, 
  FiFileText, 
  FiClock, 
  FiBarChart2, 
  FiDatabase,
  FiLogOut,
  FiX,
  FiPackage,
  FiLoader
} from 'react-icons/fi';

/**
 * Sidebar Component with Role-Based Access Control
 * 
 * This component renders the application sidebar with navigation links
 * filtered based on the authenticated user's role and permissions.
 * Supports Worker, Inventory Analyst, and Warehouse Manager roles.
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

interface NavigationItem {
  icon: React.ReactNode;
  to: string;
  label: string;
  permission: keyof RolePermissions;
  badge?: number;
}

interface PendingTasks {
  incomingRequests: number;
  pendingInventory: number;
  urgentTasks: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onToggle }) => {
  const navigate = useNavigate();
  const { user, logout, hasPermission, isLoading: authLoading } = useAuth();
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [pendingTasks, setPendingTasks] = useState<PendingTasks>({
    incomingRequests: 0,
    pendingInventory: 0,
    urgentTasks: 0,
  });
  const [tasksLoading, setTasksLoading] = useState(true);

  // Define all possible navigation items with their required permissions
  const allNavigationItems: NavigationItem[] = [
    {
      icon: <FiGrid size={20} />,
      to: "/dashboard",
      label: "Dashboard",
      permission: "dashboard"
    },
    {
      icon: <FiFileText size={20} />,
      to: "/incoming-request",
      label: "Incoming Requests",
      permission: "incomingRequests",
      badge: pendingTasks.incomingRequests
    },
    {
      icon: <FiPackage size={20} />,
      to: "/create-shipment",
      label: "Create Shipment",
      permission: "createShipment"
    },
    {
      icon: <FiClock size={20} />,
      to: "/shipment-history",
      label: "Shipment History",
      permission: "shipmentHistory"
    },
    {
      icon: <FiBarChart2 size={20} />,
      to: "/analysis-report",
      label: "Analysis Report",
      permission: "analysisReport"
    },
    {
      icon: <FiDatabase size={20} />,
      to: "/inventory",
      label: "Inventory",
      permission: "inventory",
      badge: pendingTasks.pendingInventory
    }
  ];

  // Filter navigation items based on user permissions
  const visibleNavigationItems = allNavigationItems.filter(item => 
    hasPermission(item.permission)
  );

  // Mock function to fetch pending tasks
  const fetchPendingTasks = async () => {
    setTasksLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data based on user role
      const mockTasks: PendingTasks = {
        incomingRequests: user?.role === 'WORKER' || user?.role === 'MANAGER' ? 5 : 0,
        pendingInventory: user?.role === 'INVENTORY_ANALYST' || user?.role === 'MANAGER' ? 8 : 0,
        urgentTasks: Math.floor(Math.random() * 5),
      };
      
      setPendingTasks(mockTasks);
    } catch (error) {
      console.error('Failed to fetch pending tasks:', error);
    } finally {
      setTasksLoading(false);
    }
  };

  // Fetch pending tasks when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      fetchPendingTasks();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  /**
   * Handle user logout with confirmation
   */
  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // Simulate logout delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logout();
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
   * Navigation link item component with badge support
   */
  const NavItem: React.FC<NavigationItem> = ({ icon, to, label, badge }) => (
    <NavLink
      to={to}
      onClick={handleNavClick}
      className={({ isActive }) => 
        `flex items-center justify-between px-6 py-4 text-white hover:bg-blue-900 transition-colors duration-200 group ${
          isActive ? 'bg-[#0D1637] border-l-4 border-white' : ''
        }`
      }
    >
      <div className="flex items-center">
        <span className="mr-4 text-xl">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  );

  /**
   * Role badge component
   */
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'WORKER': return 'bg-green-600';
      case 'INVENTORY_ANALYST': return 'bg-blue-600';
      case 'MANAGER': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'WORKER': return 'Worker';
      case 'INVENTORY_ANALYST': return 'Inventory Analyst';
      case 'MANAGER': return 'Warehouse Manager';
      default: return 'User';
    }
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <aside className="hidden md:flex md:flex-col w-64 bg-blue-950 h-full overflow-y-auto">
        <div className="flex items-center justify-center h-full">
          <FiLoader className="animate-spin text-white text-2xl" />
        </div>
      </aside>
    );
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const sidebarContent = (
    <>
      {/* Logo section */}
      <div className="px-6 py-6 bg-transparent">
        <h1 className="text-xl font-bold text-white tracking-wide">TTarius logistics.</h1>
      </div>

      {/* User role indicator */}
      <div className="px-6 py-3 bg-[#0D1637] border-b border-blue-800">
        <div className="flex items-center justify-between">
          <span className="text-blue-200 text-sm">Logged in as:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getRoleBadgeColor(user.role)}`}>
            {getRoleDisplayName(user.role)}
          </span>
        </div>
        <div className="text-white text-sm font-medium mt-1 truncate" title={user.name}>
          {user.name}
        </div>
      </div>
      
      {/* Main navigation */}
      <nav className="flex-1 py-6">
        <div>
          {visibleNavigationItems.length > 0 ? (
            visibleNavigationItems.map((item, index) => (
              <NavItem key={index} {...item} />
            ))
          ) : (
            <div className="px-6 py-4 text-blue-200 text-sm">
              No accessible features for your role.
            </div>
          )}
        </div>
        
        {/* Divider */}
        <div className="border-t border-blue-800 my-8"></div>
        
        {/* Tasks summary for managers and analysts */}
        {(user.role === 'MANAGER' || user.role === 'INVENTORY_ANALYST') && (
          <div className="px-6 mb-6">
            <h3 className="text-blue-200 text-sm font-medium mb-3">Quick Overview</h3>
            {tasksLoading ? (
              <div className="text-blue-300 text-xs">Loading tasks...</div>
            ) : (
              <div className="space-y-2">
                {hasPermission('incomingRequests') && pendingTasks.incomingRequests > 0 && (
                  <div className="text-blue-300 text-xs">
                    {pendingTasks.incomingRequests} pending requests
                  </div>
                )}
                {hasPermission('inventory') && pendingTasks.pendingInventory > 0 && (
                  <div className="text-blue-300 text-xs">
                    {pendingTasks.pendingInventory} inventory items to review
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Logout button */}
        <div className="mt-auto">
          <button 
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center w-full px-6 py-4 text-white hover:bg-blue-900 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="mr-4 text-xl">
              {isLoading ? <FiLoader className="animate-spin" /> : <FiLogOut size={20} />}
            </span>
            <span className="font-medium">
              {isLoading ? 'Logging out...' : 'Log Out'}
            </span>
          </button>
        </div>
      </nav>
      
      {/* User profile section */}
      <div className="bg-[#0D1637] p-6 mt-auto border-t border-blue-800">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-900 font-bold text-lg">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="ml-4 flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate" title={user.name}>
              {user.name}
            </p>
            <p className="text-blue-200 text-xs mt-1 truncate" title={user.email}>
              {user.email}
            </p>
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