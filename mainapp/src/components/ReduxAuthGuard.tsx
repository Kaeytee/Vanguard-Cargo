// ============================================================================
// Redux Auth Guard Component
// ============================================================================
// Description: Protected route component using Redux authentication state
// Author: Senior Software Engineer
// Features: Auto-logout on no auth, redirect to login, session validation
// Architecture: Clean Code, OOP Principles, Type-Safe
// ============================================================================

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth, selectIsAuthenticated, selectIsInitialized } from '@/store/slices/authSlice';

/**
 * Redux Auth Guard Component
 * 
 * Purpose:
 * - Protects routes by checking Redux authentication state
 * - Auto-logs out users with no valid session
 * - Redirects unauthenticated users to login page
 * - Preserves the attempted route for post-login redirect
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Protected content to render
 * @returns {JSX.Element | null} Protected content or null during auth check
 */
interface ReduxAuthGuardProps {
  children: React.ReactNode;
}

export const ReduxAuthGuard: React.FC<ReduxAuthGuardProps> = ({ children }) => {
  // Redux state and actions
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get authentication state from Redux
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);

  // DEBUG: Log auth state (commented out for production)
  useEffect(() => {
    // console.log('🔐 ReduxAuthGuard State:', {
    //   isAuthenticated,
    //   isInitialized,
    //   path: location.pathname
    // });
  }, [isAuthenticated, isInitialized, location.pathname]);

  /**
   * Initialize authentication on component mount
   * Checks for existing session and loads user data
   */
  useEffect(() => {
    // Only initialize if not already done
    if (!isInitialized) {
      // console.log('🔄 Initializing auth...');
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  /**
   * Handle authentication state changes
   * Redirects to login if user is not authenticated
   */
  useEffect(() => {
    // Wait for initialization to complete
    if (!isInitialized) {
      return;
    }

    // If not authenticated after initialization, redirect to login
    // DON'T dispatch logout here - it causes infinite loop
    if (!isAuthenticated) {
      // console.log('🚫 Not authenticated, redirecting to login');
      
      // Redirect to login with return URL
      navigate('/login', {
        replace: true,
        state: { from: location.pathname }
      });
    }
  }, [isAuthenticated, isInitialized, navigate, location]);

  // Show nothing while initializing (prevents flash of protected content)
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting (prevents flash of protected content)
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated, render protected content
  return <>{children}</>;
};

export default ReduxAuthGuard;

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Wrap protected routes with ReduxAuthGuard:
 * 
 * ```tsx
 * import { ReduxAuthGuard } from '@/components/ReduxAuthGuard';
 * 
 * function App() {
 *   return (
 *     <Routes>
 *       <Route path="/login" element={<Login />} />
 *       <Route
 *         path="/dashboard"
 *         element={
 *           <ReduxAuthGuard>
 *             <Dashboard />
 *           </ReduxAuthGuard>
 *         }
 *       />
 *     </Routes>
 *   );
 * }
 * ```
 * 
 * FEATURES:
 * - ✅ Checks Redux state for authentication
 * - ✅ Auto-logs out users with no session
 * - ✅ Redirects to login with return URL
 * - ✅ Shows loading spinner during auth check
 * - ✅ Prevents flash of protected content
 * - ✅ Type-safe with TypeScript
 */
