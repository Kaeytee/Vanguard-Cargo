import toast from 'react-hot-toast';
import { Bell, Package, CreditCard, AlertTriangle, Info } from 'lucide-react';

/**
 * Custom Notification Toast Hook
 * 
 * Provides toast notifications for real-time notification updates
 * with custom styled components matching the app's design
 * 
 * @author Senior Software Engineer
 */

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  category?: 'shipment' | 'payment' | 'system' | 'security';
  priority?: 'low' | 'normal' | 'high';
  created_at?: string;
}

/**
 * Get icon based on notification category
 */
const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'shipment':
      return <Package className="w-5 h-5 text-blue-600" />;
    case 'payment':
      return <CreditCard className="w-5 h-5 text-green-600" />;
    case 'security':
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    case 'system':
      return <Info className="w-5 h-5 text-gray-600" />;
    default:
      return <Bell className="w-5 h-5 text-indigo-600" />;
  }
};

/**
 * Get border color based on priority
 */
const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'high':
      return 'border-l-red-500';
    case 'normal':
      return 'border-l-blue-500';
    case 'low':
      return 'border-l-gray-400';
    default:
      return 'border-l-indigo-500';
  }
};

/**
 * Custom notification toast component
 */
const NotificationToast = ({ notification }: { notification: NotificationData }) => {
  return (
    <div
      className={`flex items-start gap-3 p-4 bg-white rounded-lg shadow-lg border-l-4 ${getPriorityColor(
        notification.priority
      )} min-w-[320px] max-w-[420px]`}
      onClick={() => {
        // Navigate to notifications page
        window.location.href = '/app/notifications';
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getCategoryIcon(notification.category)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {notification.title}
        </p>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Click to view all notifications
        </p>
      </div>
    </div>
  );
};

/**
 * Hook to show notification toasts
 */
export const useNotificationToast = () => {
  /**
   * Show a notification toast
   */
  const showNotification = (notification: NotificationData) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } cursor-pointer hover:shadow-xl transition-shadow`}
          onClick={() => toast.dismiss(t.id)}
        >
          <NotificationToast notification={notification} />
        </div>
      ),
      {
        duration: 6000,
        position: 'top-right',
      }
    );
  };

  /**
   * Show a success notification
   */
  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 4000,
    });
  };

  /**
   * Show an error notification
   */
  const showError = (message: string) => {
    toast.error(message, {
      duration: 5000,
    });
  };

  /**
   * Show info notification
   */
  const showInfo = (message: string) => {
    toast(message, {
      icon: <Info className="w-5 h-5" />,
      duration: 4000,
    });
  };

  return {
    showNotification,
    showSuccess,
    showError,
    showInfo,
  };
};

/**
 * Toast animations CSS
 * Add this to your global CSS or tailwind config
 */
export const toastAnimations = `
@keyframes enter {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes leave {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-enter {
  animation: enter 0.3s ease-out;
}

.animate-leave {
  animation: leave 0.2s ease-in forwards;
}
`;
