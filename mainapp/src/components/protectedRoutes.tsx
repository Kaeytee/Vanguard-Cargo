import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

/**
 * ProtectedRoutes - Component to protect routes that require authentication
 * 
 * This component checks if the user is authenticated before rendering its children.
 * If not authenticated, it redirects to the login page.
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
		// Also check localStorage as fallback for backward compatibility
		const fallbackAuth = localStorage.getItem('isAuthenticated') === 'true';
		if (!fallbackAuth) {
			return <Navigate to="/login" state={{ from: location.pathname }} replace />;
		}
	}

	// If authenticated, render the protected content
	return <>{children}</>;
};

export default ProtectedRoutes;