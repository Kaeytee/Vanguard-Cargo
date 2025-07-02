import React, { useEffect, useState } from 'react';
import { useImagePreloader } from '../../utils/imagePreloader';

/**
 * ImageCacheNotification - Shows a brief notification when images are being cached
 * This provides user feedback about the image preloading process
 */
export const ImageCacheNotification: React.FC = () => {
  const { isLoading, progress } = useImagePreloader();
  const [show, setShow] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (isLoading && !hasShown) {
      setShow(true);
      setHasShown(true);
      
      // Hide after 3 seconds
      const timer = setTimeout(() => {
        setShow(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, hasShown]);

  if (!show) return null;

  const percentage = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0;

  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50 border border-gray-200 animate-fade-in">
      <div className="flex items-center space-x-3">
        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <div>
          <div className="text-sm font-medium text-gray-800">
            Optimizing images...
          </div>
          <div className="text-xs text-gray-500">
            {progress.loaded}/{progress.total} cached ({percentage}%)
          </div>
        </div>
      </div>
      <div className="mt-2 w-48 bg-gray-200 rounded-full h-1">
        <div
          className="bg-red-500 h-1 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
