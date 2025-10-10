import Swal from "sweetalert2";
import { useAppDispatch } from "@/store/hooks";
import { logoutUser, clearUser } from "@/store/slices/authSlice";
import { persistor } from "@/store/store";
import { supabase } from "@/lib/supabase";

/**
 * useLogout Hook
 * 
 * Handles user logout with comprehensive state cleanup:
 * - Shows confirmation dialog
 * - Clears Supabase session
 * - Clears Redux state
 * - Purges Redux Persist storage
 * - Clears localStorage
 * - Redirects to login page
 * 
 * @returns {Object} { confirmLogout } - Logout confirmation function
 */
export const useLogout = () => {
  const dispatch = useAppDispatch();

  /**
   * Confirm and execute logout with comprehensive cleanup
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
        console.log('🚪 Starting logout process...');
        
        // STEP 1: Dispatch Redux logout action (clears Supabase session)
        await dispatch(logoutUser()).unwrap();
        console.log('✅ Redux logout completed');
        
        // STEP 2: Force clear Redux state immediately
        dispatch(clearUser());
        console.log('✅ Redux state cleared');
        
        // STEP 3: Purge Redux Persist storage (critical!)
        await persistor.purge();
        console.log('✅ Redux Persist purged');
        
        // STEP 4: Force clear Supabase session (failsafe)
        await supabase.auth.signOut({ scope: 'local' });
        console.log('✅ Supabase session cleared');
        
        // STEP 5: Clear all auth-related localStorage items
        const authKeys = [
          'supabase.auth.token',
          'sb-access-token',
          'sb-refresh-token',
          'persist:vanguard-cargo-root',
        ];
        authKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.warn(`Failed to remove ${key}:`, e);
          }
        });
        console.log('✅ localStorage cleared');
        
        // STEP 6: Show success message (non-blocking)
        Swal.fire({
          title: "Logged Out",
          text: "You have been logged out successfully",
          icon: "success",
          confirmButtonColor: "#ef4444",
          timer: 1500,
          showConfirmButton: false,
        });
        
        // STEP 7: Immediate redirect to login page
        console.log('🔄 Redirecting to login...');
        window.location.href = '/login'; // Use window.location for hard refresh
      } catch (error) {
        // Handle logout error (rare)
        console.error("❌ Logout error:", error);
        
        // Force cleanup even if error occurs
        dispatch(clearUser());
        await persistor.purge();
        localStorage.clear();
        
        // Hard redirect to login
        window.location.href = '/login';
      }
    }
  };

  return { confirmLogout };
};

// Default export for backward compatibility
export default useLogout;

/**
 * CRITICAL FIXES:
 * 
 * 1. **Redux Persist Purge**: Calls persistor.purge() to clear persisted state
 * 2. **Force Clear State**: Dispatches clearUser() to immediately clear Redux state
 * 3. **Supabase Cleanup**: Force signs out with scope: 'local'
 * 4. **localStorage Cleanup**: Removes all auth-related keys
 * 5. **Hard Redirect**: Uses window.location.href for complete page reload
 * 
 * This ensures logout works even if Redux Persist was preventing state clearing.
 */
