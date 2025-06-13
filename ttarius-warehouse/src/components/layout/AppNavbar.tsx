import React, { useState, useEffect } from 'react';
import { FiBell, FiSearch } from 'react-icons/fi';

/**
 * AppNavbar Component
 * 
 * This component renders the top navigation bar for the application.
 * It includes a search bar, notifications icon, and user welcome message.
 * 
 * @returns {React.ReactElement} The AppNavbar component
 */
const AppNavbar: React.FC = () => {
  // State for user information
  const [user, setUser] = useState<{ username: string } | null>(null);
  // State for search query
  const [searchQuery, setSearchQuery] = useState<string>('');
  // State for notification count
  // Using a static value for now, will be updated from API in future
  const [notificationCount] = useState<number>(3);
  
  /**
   * Load user information from session storage on component mount
   */
  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);
  
  /**
   * Handle search input change
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  /**
   * Handle search form submission
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
  };
  
  return (
    <header className="bg-white border-b border-gray-200 z-30">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Search bar */}
          <div className="flex-1 max-w-md">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search"
              />
            </form>
          </div>
          
          {/* Right side items */}
          <div className="flex items-center">
            {/* Notifications */}
            <div className="relative ml-4">
              <button className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none">
                <FiBell className="h-6 w-6" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* User welcome */}
            <div className="ml-6">
              <p className="text-sm font-medium text-gray-800">
                Welcome, {user?.username || 'Admin'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppNavbar;
