// ============================================================================
// useTabSync Hook - React Integration for Tab Synchronization
// ============================================================================
// Description: React hook for handling multi-tab auth synchronization
// Author: Senior Software Engineer
// Features: Login/logout sync, session updates, Redux integration
// ============================================================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setUser, clearUser } from '../store/slices/authSlice';
import { tabSyncManager, TabSyncEventType, type TabSyncMessage } from '../utils/tabSyncManager';

/**
 * useTabSync Hook
 * 
 * Listens for authentication events from other browser tabs and
 * synchronizes the Redux auth state accordingly.
 * 
 * Features:
 * - Automatically logs out when another tab logs out
 * - Updates user state when another tab logs in
 * - Handles session updates from other tabs
 * - Redirects to appropriate pages on auth changes
 * 
 * Usage:
 * ```typescript
 * function App() {
 *   useTabSync(); // Add to root component
 *   return <AppContent />;
 * }
 * ```
 * 
 * @returns {void}
 */
export function useTabSync(): void {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  useEffect(() => {
    /**
     * Handle logout event from another tab
     * Immediately logs out the current tab
     */
    const handleLogoutSync = () => {
      console.log('🔄 Logout detected in another tab, logging out this tab...');
      
      // Clear Redux auth state
      dispatch(clearUser());
      
      // Redirect to login page
      navigate('/login', {
        replace: true,
        state: { message: 'You have been logged out in another tab' }
      });
      
      console.log('✅ Logged out successfully (synced from another tab)');
    };
    
    /**
     * Handle login event from another tab
     * Updates the current tab with the new user data
     */
    const handleLoginSync = (message: TabSyncMessage) => {
      console.log('🔄 Login detected in another tab, updating this tab...');
      
      if (message.data?.user) {
        // Update Redux auth state with user from other tab
        dispatch(setUser(message.data.user));
        
        console.log('✅ User updated successfully (synced from another tab)');
        
        // Optionally navigate to dashboard if currently on login/register page
        const currentPath = window.location.pathname;
        if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
          navigate('/app/dashboard', { replace: true });
        }
      }
    };
    
    /**
     * Handle session update from another tab
     * Updates the current session data
     */
    const handleSessionUpdate = (message: TabSyncMessage) => {
      console.log('🔄 Session updated in another tab');
      
      if (message.data?.session) {
        // Update session data if needed
        // This can be expanded based on your session management needs
        console.log('Session data:', message.data.session);
      }
    };
    
    /**
     * Handle profile update from another tab
     * Updates the current user profile data
     */
    const handleProfileUpdate = (message: TabSyncMessage) => {
      console.log('🔄 Profile updated in another tab');
      
      if (message.data?.profile) {
        // Update user profile in Redux state
        dispatch(setUser(message.data.profile));
        console.log('✅ Profile updated (synced from another tab)');
      }
    };
    
    // Register event handlers
    tabSyncManager.on(TabSyncEventType.LOGOUT, handleLogoutSync);
    tabSyncManager.on(TabSyncEventType.LOGIN, handleLoginSync);
    tabSyncManager.on(TabSyncEventType.SESSION_UPDATE, handleSessionUpdate);
    tabSyncManager.on(TabSyncEventType.PROFILE_UPDATE, handleProfileUpdate);
    
    console.log('🔄 Tab sync handlers registered');
    
    // Cleanup: Unregister handlers on unmount
    return () => {
      tabSyncManager.off(TabSyncEventType.LOGOUT, handleLogoutSync);
      tabSyncManager.off(TabSyncEventType.LOGIN, handleLoginSync);
      tabSyncManager.off(TabSyncEventType.SESSION_UPDATE, handleSessionUpdate);
      tabSyncManager.off(TabSyncEventType.PROFILE_UPDATE, handleProfileUpdate);
      
      console.log('🔄 Tab sync handlers unregistered');
    };
  }, [dispatch, navigate]);
}

/**
 * useTabSyncStatus Hook
 * 
 * Returns the current tab sync status and statistics
 * Useful for debugging and monitoring
 * 
 * @returns {Object} Tab sync status
 */
export function useTabSyncStatus() {
  return {
    isReady: tabSyncManager.isReady(),
    tabId: tabSyncManager.getTabId(),
    statistics: tabSyncManager.getStatistics()
  };
}
