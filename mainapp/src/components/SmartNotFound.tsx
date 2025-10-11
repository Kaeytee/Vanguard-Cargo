import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import NotFoundWithLayout from '../landing/layouts/NotFoundWithLayout';
import AppNotFoundWithLayout from '../app/layouts/AppNotFoundWithLayout';

/**
 * SmartNotFound - Conditional 404 component
 * 
 * This component determines which 404 page to show based on authentication status:
 * - If user is logged in: Shows AppNotFound (with app layout)
 * - If user is not logged in: Shows NotFound (landing page layout)
 */
const SmartNotFound = () => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Show appropriate 404 page based on authentication status
  if (user) {
    // For authenticated users, show 404 page with app layout (sidebar + navbar)
    return <AppNotFoundWithLayout />;
  } else {
    // For unauthenticated users, show landing page 404 with navbar and footer
    return <NotFoundWithLayout />;
  }
};

export default SmartNotFound;
