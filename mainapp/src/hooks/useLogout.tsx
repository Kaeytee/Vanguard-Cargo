import Swal from "sweetalert2";
import { useAppDispatch } from "@/store/hooks";
import { logoutUser, clearUser } from "@/store/slices/authSlice";
import { persistor } from "@/store/store";
import { supabase } from "@/lib/supabase";
import { PackageNotificationService } from "@/services/packageNotificationService";
import { broadcastLogout } from "@/utils/tabSyncManager";

/**
 * useLogout Hook
 * 
 * Handles user logout with comprehensive state cleanup:
 * - Shows confirmation dialog
 * - Clears singleton services (PackageNotificationService, etc.)
 * - Clears Supabase session
 * - Clears Redux state
 * - Purges Redux Persist storage
 * - Clears localStorage
 * - Redirects to login page
 * 
 * SECURITY CRITICAL: Ensures no data leakage between users on shared devices
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
        
        // STEP 1: Clear singleton services (CRITICAL for privacy)
        console.log('🧹 Clearing singleton services...');
        PackageNotificationService.resetInstance();
        console.log('✅ Singleton services cleared');
        
        // STEP 2: Dispatch Redux logout action (clears Supabase session)
        await dispatch(logoutUser()).unwrap();
        console.log('✅ Redux logout completed');
        
        // STEP 3: Force clear Redux state immediately
        dispatch(clearUser());
        console.log('✅ Redux state cleared');
        
        // STEP 4: Purge Redux Persist storage (critical!)
        await persistor.purge();
        console.log('✅ Redux Persist purged');
        
        // STEP 5: Force clear Supabase session (failsafe)
        await supabase.auth.signOut({ scope: 'local' });
        console.log('✅ Supabase session cleared');
        
        // STEP 6: Broadcast logout to all other tabs
        broadcastLogout();
        console.log('📡 Logout broadcasted to other tabs');
        
        // STEP 7: Clear all auth-related localStorage items
        const authKeys = [
          'supabase.auth.token',
          'sb-access-token',
          'sb-refresh-token',
          'persist:vanguard-cargo-root',
          'package_notifications', // Already cleared by service but failsafe
        ];
        authKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.warn(`Failed to remove ${key}:`, e);
          }
        });
        console.log('✅ localStorage cleared');
        
        // STEP 8: Show success message (non-blocking)
        Swal.fire({
          title: "Logged Out",
          text: "You have been logged out successfully",
          icon: "success",
          confirmButtonColor: "#ef4444",
          timer: 1500,
          showConfirmButton: false,
        });
        
        // STEP 9: Immediate redirect to login page (hard refresh)
        console.log('🔄 Redirecting to login...');
        window.location.href = '/login'; // Use window.location for hard refresh
      } catch (error) {
        // Handle logout error (rare)
        console.error("❌ Logout error:", error);
        
        // Force cleanup even if error occurs (CRITICAL for security)
        console.log('⚠️ Error occurred, forcing cleanup...');
        
        // Clear singleton services
        PackageNotificationService.resetInstance();
        
        // Clear Redux
        dispatch(clearUser());
        await persistor.purge();
        
        // Nuclear option: clear all localStorage
        localStorage.clear();
        
        console.log('✅ Emergency cleanup completed');
        
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
 * CRITICAL FIXES & SECURITY FEATURES:
 * 
 * 1. **Singleton Service Cleanup**: Resets PackageNotificationService to prevent data leakage
 * 2. **Redux Persist Purge**: Calls persistor.purge() to clear persisted state
 * 3. **Force Clear State**: Dispatches clearUser() to immediately clear Redux state
 * 4. **Supabase Cleanup**: Force signs out with scope: 'local'
 * 5. **localStorage Cleanup**: Removes all auth-related keys
 * 6. **Hard Redirect**: Uses window.location.href for complete page reload
 * 7. **Emergency Fallback**: Even if logout fails, forces cleanup and redirect
 * 
 * PRIVACY PROTECTION:
 * - Prevents User A's notifications from showing to User B on shared devices
 * - Clears all in-memory data (singleton instances)
 * - Clears all persistent data (localStorage, Redux Persist)
 * - Ensures fresh state for next user login
 * 
 * This ensures logout works even if Redux Persist was preventing state clearing.
 */
