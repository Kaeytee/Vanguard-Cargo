import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useReduxAuth as useAuth } from "../hooks/useReduxAuth";

/**
 * ProtectedRoutes - Component to protect routes that require authentication
 * 
 * This component checks if the user is authenticated before rendering its children.
 * If not authenticated, it redirects to the login page.
 * It also handles account status restrictions for email verification and other statuses.
 * 
 * @param {ReactNode} children - The child components to render if authenticated
 * @returns {JSX.Element} The protected route component
 */
interface ProtectedRoutesProps {
	children: ReactNode;
}

const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({ children }) => {
	// Get user from auth context
	const { user, profile } = useAuth();
	// Get current location to redirect back after login
	const location = useLocation();
	// State to track initial loading
	const [isLoading, setIsLoading] = useState(true);
	
	// Check authentication status on component mount
	useEffect(() => {
		// Short timeout to allow auth context to initialize
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 500);
		
		return () => clearTimeout(timer);
	}, []);

	// Show loading state while checking authentication
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-50">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
					<p className="text-sm font-medium text-gray-600">Loading your account...</p>
				</div>
			</div>
		);
	}

	// If not authenticated, redirect to login page with return URL
	if (!user) {
		return <Navigate to="/login" state={{ from: location.pathname }} replace />;
	}

	// Check if email is verified - this is now mandatory for all app access
	if (user && !user.email_confirmed_at) {
		// Email not verified - redirect to verification page
		return <Navigate to="/verify-email" replace />;
	}

	// If user is authenticated and email is verified, check account status
	if (user) {
		const accountStatus = profile?.status || 'active';
		
		switch (accountStatus) {
			case 'pending_verification': {
				// Email is verified (checked above) but other verification pending
				// Allow basic access but restrict sensitive operations
				const restrictedPaths = ['/app/admin', '/app/settings/billing', '/app/settings/security'];
				if (restrictedPaths.some(path => location.pathname.includes(path))) {
					return <Navigate to="/verify-email" replace />;
				}
				break;
			}
				
			case 'suspended': {
				// Limited access - only allow viewing existing data
				const allowedPaths = ['/app/dashboard', '/app/tracking', '/app/shipment-history', '/app/profile'];
				if (!allowedPaths.some(path => location.pathname.includes(path))) {
					return <Navigate to="/app/dashboard" replace />;
				}
				break;
			}
				
			default:
				// ACTIVE status - full access
				break;
		}
	}

	// If authenticated and status allows access, render the protected content
	return <>{children}</>;
};

export default ProtectedRoutes;