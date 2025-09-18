import Swal from "sweetalert2";
import { useAuth } from "./useAuth";

export const useLogout = () => {
  const { signOut } = useAuth();

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
      signOut();
    }
  };

  return { confirmLogout };
};
