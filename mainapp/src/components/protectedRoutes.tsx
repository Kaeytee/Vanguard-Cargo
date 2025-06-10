import type { ReactNode } from "react";


interface ProtectedRoutesProps {
	children: ReactNode;
}

const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({ children }) => {
	// (your existing logic, just use children as before)
	return (
		// your logic, for example:
		// isAuthenticated ? children : <Navigate to="/login" />
		<>{children}</>
	);
};

export default ProtectedRoutes;