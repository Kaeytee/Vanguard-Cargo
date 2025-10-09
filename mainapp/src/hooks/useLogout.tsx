import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";

/**
 * useLogout Hook
 * 
 * Handles user logout with Redux state management
 * - Shows confirmation dialog
 * - Dispatches Redux logout action
 * - Clears all auth state
 * - Redirects to login page
 * 
 * @returns {Object} { confirmLogout } - Logout confirmation function
 */
export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  /**
   * Confirm and execute logout
   * Shows SweetAlert confirmation dialog before logging out
   */
  const confirmLogout = async (): Promise<void> => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // Dispatch Redux logout action (clears auth state + Supabase session)
        await dispatch(logoutUser()).unwrap();
        
        // Show success message
        await Swal.fire({
          title: "Logged Out",
          text: "You have been logged out successfully",
          icon: "success",
          confirmButtonColor: "#ef4444",
          timer: 2000,
          showConfirmButton: false,
        });
        
        // Redirect to login page
        navigate("/login", { replace: true });
      } catch (error) {
        // Handle logout error (rare)
        console.error("Logout error:", error);
        
        // Still redirect to login even if logout fails
        navigate("/login", { replace: true });
      }
    }
  };

  return { confirmLogout };
};

// Default export for backward compatibility
export default useLogout;
