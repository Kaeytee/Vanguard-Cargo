import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, Clock, AlertCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePackageNotifications } from '../hooks/usePackageNotifications';

/**
 * Package Intake Widget for Dashboard
 * 
 * Shows a summary of packages awaiting action with quick access to the Package Intake page.
 * Displays real-time updates and encourages user engagement.
 */
export default function PackageIntakeWidget() {
  const { notifications } = usePackageNotifications();
  const [newPackagesCount, setNewPackagesCount] = useState(0);
  
  // Filter for package arrival notifications
  const packageArrivalNotifications = notifications.filter(n => 
    n.type === 'package_arrived' && !n.read
  );

  useEffect(() => {
    setNewPackagesCount(packageArrivalNotifications.length);
  }, [packageArrivalNotifications.length]);

  // Don't show widget if no packages need attention
  if (newPackagesCount === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              New Packages Arrived!
            </h3>
            <p className="text-sm text-gray-600">
              {newPackagesCount} package{newPackagesCount !== 1 ? 's' : ''} waiting for your review
            </p>
          </div>
        </div>
        
        {/* Urgent indicator */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          className="flex-shrink-0"
        >
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      </div>

      {/* Package Preview */}
      <div className="space-y-2 mb-4">
        {packageArrivalNotifications.slice(0, 3).map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3 bg-white bg-opacity-50 rounded-md p-3"
          >
            {/* Store logo */}
            <div className="flex-shrink-0 w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
              {notification.packageDetails.storeLogoUrl ? (
                <img
                  src={notification.packageDetails.storeLogoUrl}
                  alt={notification.packageDetails.storeName}
                  className="w-6 h-6 object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.setAttribute('style', 'display: block');
                  }}
                />
              ) : null}
              <Package className="w-4 h-4 text-gray-400" style={{ display: notification.packageDetails.storeLogoUrl ? 'none' : 'block' }} />
            </div>
            
            {/* Package info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {notification.title}
                </p>
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimeAgo(notification.timestamp)}
                </span>
              </div>
              <p className="text-xs text-gray-600 truncate">
                {notification.message}
              </p>
            </div>
          </motion.div>
        ))}
        
        {newPackagesCount > 3 && (
          <div className="text-center py-2">
            <p className="text-sm text-gray-600">
              +{newPackagesCount - 3} more packages waiting
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-orange-700">
          <AlertCircle className="w-4 h-4 mr-1" />
          <span>Action required</span>
        </div>
        
        <Link
          to="/app/package-intake"
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors shadow-sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          Review Now
        </Link>
      </div>
    </motion.div>
  );
}

// Helper function to format time ago
function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}
