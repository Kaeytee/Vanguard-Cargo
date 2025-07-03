import React, { useState, useEffect } from 'react';
import { useCachedImage } from '../../utils/imagePreloader';

interface PreloadedImageProps {
  imageKey: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: string) => void;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * PreloadedImage component that automatically uses cached images
 * and provides loading states and error handling
 */
export const PreloadedImage: React.FC<PreloadedImageProps> = ({
  imageKey,
  alt,
  className = '',
  style,
  fallbackSrc,
  placeholder,
  onLoad,
  onError,
  priority = 'medium'
}) => {
  const { src, isLoaded, error, metadata } = useCachedImage(imageKey);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer for lazy loading low priority images
  useEffect(() => {
    if (priority === 'high') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    // Create a temporary element to observe
    const element = document.createElement('div');
    observer.observe(element);

    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  useEffect(() => {
    if (isLoaded) {
      onLoad?.();
    }
  }, [isLoaded, onLoad]);

  const handleImageError = () => {
    setImageError(true);
    onError?.('Failed to load image');
  };

  const handleImageLoad = () => {
    setImageError(false);
    onLoad?.();
  };

  // Show placeholder while loading
  if (!isVisible || (!isLoaded && !error)) {
    return (
      <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`} style={style}>
        {placeholder || (
          <div className="text-gray-400 text-sm">
            Loading...
          </div>
        )}
      </div>
    );
  }

  // Show fallback or error state
  if (error || imageError) {
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
          style={style}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      );
    }
    
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`} style={style}>
        <div className="text-center text-gray-500 p-4">
          <div className="text-sm">Failed to load image</div>
          <div className="text-xs mt-1">{metadata?.name || imageKey}</div>
        </div>
      </div>
    );
  }

  // Show the cached image
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={handleImageError}
      onLoad={handleImageLoad}
      loading={priority === 'high' ? 'eager' : 'lazy'}
    />
  );
};

/**
 * Background image component that uses cached images
 */
interface PreloadedBackgroundProps {
  imageKey: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  fallbackColor?: string;
}

export const PreloadedBackground: React.FC<PreloadedBackgroundProps> = ({
  imageKey,
  children,
  className = '',
  style,
  backgroundSize = 'cover',
  backgroundPosition = 'center',
  backgroundRepeat = 'no-repeat',
  fallbackColor = '#f3f4f6'
}) => {
  const { src, isLoaded, error } = useCachedImage(imageKey);

  const backgroundStyle: React.CSSProperties = {
    ...style,
    backgroundColor: fallbackColor,
    ...(isLoaded && !error && {
      backgroundImage: `url(${src})`,
      backgroundSize,
      backgroundPosition,
      backgroundRepeat,
    }),
  };

  return (
    <div className={className} style={backgroundStyle}>
      {children}
    </div>
  );
};

/**
 * Image preloader progress component
 */
interface ImagePreloaderProgressProps {
  isLoading: boolean;
  progress: { loaded: number; total: number };
  className?: string;
}

export const ImagePreloaderProgress: React.FC<ImagePreloaderProgressProps> = ({
  isLoading,
  progress,
  className = ''
}) => {
  if (!isLoading && progress.loaded === 0) {
    return null;
  }

  const percentage = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0;

  return (
    <div className={`fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="text-sm font-medium text-gray-700">
          Loading images...
        </div>
        <div className="text-sm text-gray-500">
          {progress.loaded}/{progress.total}
        </div>
      </div>
      <div className="mt-2 w-48 bg-gray-200 rounded-full h-2">
        <div
          className="bg-red-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-500 text-center">
        {percentage}%
      </div>
    </div>
  );
};
