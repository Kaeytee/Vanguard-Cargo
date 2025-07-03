import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

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
	const { user } = useAuth();
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
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
			</div>
		);
	}

	// If not authenticated, redirect to login page with return URL
	if (!user) {
		return <Navigate to="/login" state={{ from: location.pathname }} replace />;
	}

	// If user is authenticated but has a restricted account status
	if (user) {
		const accountStatus = user.accountStatus || 'ACTIVE';
		
		switch (accountStatus) {
			case 'PENDING_VERIFICATION': {
				// Allow access but show verification reminder
				// Only redirect if they're trying to access certain features that require verification
				const restrictedPaths = ['/app/submit-request'];
				if (restrictedPaths.some(path => location.pathname.includes(path))) {
					return <Navigate to="/verify-email" replace />;
				}
				break;
			}
				
			case 'SUSPENDED':
			case 'RESTRICTED': {
				// Limited access - only allow viewing existing data
				const allowedPaths = ['/app/dashboard', '/app/tracking', '/app/shipment-history', '/app/profile'];
				if (!allowedPaths.some(path => location.pathname.includes(path))) {
					return <Navigate to="/app/dashboard" replace />;
				}
				break;
			}
				
			case 'BANNED':
				// Complete lockout - redirect to login and logout
				return <Navigate to="/login" replace />;
				
			case 'DORMANT':
				// Account needs reactivation - redirect to reactivation page
				return <Navigate to="/reactivate-account" replace />;
				
			default:
				// ACTIVE or unknown status - full access
				break;
		}
	}

	// If authenticated and status allows access, render the protected content
	return <>{children}</>;
};

export default ProtectedRoutes;