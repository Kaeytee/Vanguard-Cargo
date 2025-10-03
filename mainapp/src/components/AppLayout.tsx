import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppNavbar from './AppNavbar';

interface AppLayoutProps {
  children?: React.ReactNode;
}

/**
 * AppLayout - Main layout component for the application dashboard
 * 
 * This component serves as the container for the application's dashboard layout.
 * It follows the clean code architecture principles by separating concerns:
 * - Sidebar: Navigation component with responsive behavior
 * - AppNavbar: Top navigation bar component
 * - Outlet: Content area where child routes will be rendered (when used with Router)
 * - Children: Content area for direct component rendering (when used without Router)
 * 
 * Features:
 * - Responsive design with mobile-first approach
 * - Collapsible sidebar on mobile/tablet
 * - Overlay sidebar on smaller screens
 * - Persistent sidebar state
 * - Supports both Router Outlet and direct children rendering
 * 
 * @param {AppLayoutProps} props - Component props
 * @returns {JSX.Element} The AppLayout component
 */
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // State for sidebar visibility on mobile/tablet
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  
  // State for screen size detection
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(false);

  /**
   * Handle window resize to manage responsive behavior
   */
  useEffect(() => {
    const handleResize = () => {
      const isLarge = window.innerWidth >= 1024; // lg breakpoint
      setIsLargeScreen(isLarge);
      
      // Auto-close mobile sidebar when switching to desktop
      if (isLarge && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  /**
   * Close sidebar (used for mobile overlay clicks)
   */
  const closeSidebar = (): void => {
    setIsSidebarOpen(false);
  };

  /**
   * Handle body scroll lock when mobile sidebar is open
   */
  useEffect(() => {
    if (isSidebarOpen && !isLargeScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen, isLargeScreen]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Mobile/Tablet overlay - Transparent to show content behind */}
      {isSidebarOpen && !isLargeScreen && (
        <div 
          className="fixed inset-0 bg-transparent z-40 lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isLargeScreen ? 'block' : ''}
      `}>
        <div className="h-full">
          <Sidebar onNavigate={closeSidebar} />
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top navbar */}
        <div className="relative z-30">
          <AppNavbar 
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />
        </div>
        
        {/* Main content area where child routes will be rendered */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8 min-h-full bg-gray-50 relative">
              {/* Logo watermark background */}
              <div 
                className="absolute inset-0 bg-no-repeat bg-center bg-cover pointer-events-none"
                style={{
                  backgroundImage: "url('/src/assets/logo.png')",
                  backgroundSize: '300px 300px',
                  backgroundPosition: 'center center'
                }}
              />
              {/* Content overlay */}
              <div className="relative z-10 max-w-full">
                {children ? children : <Outlet />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;