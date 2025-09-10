// Image preloading and caching utility
import { useState, useEffect } from 'react';

// Import all images to get their bundled URLs
import aboutImg from '../images/about.png';
import airImg from '../images/air.png';
import awaitingDeliveriesImg from '../images/awaiting-deliveries.png';
import customsImg from '../images/customs.png';
import deliveryManImg from '../images/delivery-man.png';
import deliveryImg from '../images/delivery.jpg';
import deliveryParcelImg from '../images/deliveryparcel.jpg';
import forgotImg from '../images/forgot.jpg';
import loginBgImg from '../images/loginbg.png';
import cargoBackground2Img from '../images/cargo-background-2.png';
import cargoBackground3Img from '../images/cargo-background-3.png';
import cargoBackground4Img from '../images/cargo-background-4.jpg';
import cargoBackgroundImg from '../images/cargo-background.png';
import cargoContainerPortImg from '../images/cargo-container-port.jpg';
import packagingImg from '../images/packaging.png';
import registerBgImg from '../images/register-bg.jpg';
import shipmentHistoryImg from '../images/shipment-history.png';
import submitShipmentImg from '../images/submit-shipment.png';
import trackShipmentImg from '../images/track-shipment.png';

// Image registry with metadata
export interface ImageMetadata {
  src: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  category: 'background' | 'icon' | 'illustration' | 'ui';
  preloadStrategy: 'immediate' | 'viewport' | 'interaction';
}

export const IMAGE_REGISTRY: Record<string, ImageMetadata> = {
  // High priority - visible on landing/login pages
  registerBg: {
    src: registerBgImg,
    name: 'Register Background',
    priority: 'high',
    category: 'background',
    preloadStrategy: 'immediate'
  },
  loginBg: {
    src: loginBgImg,
    name: 'Login Background',
    priority: 'high',
    category: 'background',
    preloadStrategy: 'immediate'
  },
  deliveryParcel: {
    src: deliveryParcelImg,
    name: 'Delivery Parcel',
    priority: 'high',
    category: 'illustration',
    preloadStrategy: 'immediate'
  },
  deliveryMan: {
    src: deliveryManImg,
    name: 'Delivery Man',
    priority: 'high',
    category: 'illustration',
    preloadStrategy: 'immediate'
  },
  
  // Medium priority - dashboard and common UI elements
  cargoBackground: {
    src: cargoBackgroundImg,
    name: 'cargo Background',
    priority: 'medium',
    category: 'background',
    preloadStrategy: 'viewport'
  },
  submitShipment: {
    src: submitShipmentImg,
    name: 'Submit Shipment',
    priority: 'medium',
    category: 'ui',
    preloadStrategy: 'viewport'
  },
  trackShipment: {
    src: trackShipmentImg,
    name: 'Track Shipment',
    priority: 'medium',
    category: 'ui',
    preloadStrategy: 'viewport'
  },
  shipmentHistory: {
    src: shipmentHistoryImg,
    name: 'Shipment History',
    priority: 'medium',
    category: 'ui',
    preloadStrategy: 'viewport'
  },
  
  // Low priority - secondary pages and less common elements
  forgot: {
    src: forgotImg,
    name: 'Forgot Password',
    priority: 'low',
    category: 'illustration',
    preloadStrategy: 'interaction'
  },
  about: {
    src: aboutImg,
    name: 'About',
    priority: 'low',
    category: 'illustration',
    preloadStrategy: 'interaction'
  },
  air: {
    src: airImg,
    name: 'Air Shipping',
    priority: 'low',
    category: 'icon',
    preloadStrategy: 'interaction'
  },
  awaitingDeliveries: {
    src: awaitingDeliveriesImg,
    name: 'Awaiting Deliveries',
    priority: 'low',
    category: 'ui',
    preloadStrategy: 'interaction'
  },
  customs: {
    src: customsImg,
    name: 'Customs',
    priority: 'low',
    category: 'icon',
    preloadStrategy: 'interaction'
  },
  delivery: {
    src: deliveryImg,
    name: 'Delivery',
    priority: 'low',
    category: 'illustration',
    preloadStrategy: 'interaction'
  },
  cargoBackground2: {
    src: cargoBackground2Img,
    name: 'cargo Background 2',
    priority: 'low',
    category: 'background',
    preloadStrategy: 'interaction'
  },
  cargoBackground3: {
    src: cargoBackground3Img,
    name: 'cargo Background 3',
    priority: 'low',
    category: 'background',
    preloadStrategy: 'interaction'
  },
  cargoBackground4: {
    src: cargoBackground4Img,
    name: 'cargo Background 4',
    priority: 'low',
    category: 'background',
    preloadStrategy: 'interaction'
  },
  cargoContainerPort: {
    src: cargoContainerPortImg,
    name: 'cargo Container Port',
    priority: 'low',
    category: 'background',
    preloadStrategy: 'interaction'
  },
  packaging: {
    src: packagingImg,
    name: 'Packaging',
    priority: 'low',
    category: 'icon',
    preloadStrategy: 'interaction'
  }
};

// Image cache class
class ImageCache {
  private cache = new Map<string, HTMLImageElement>();
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>();
  private preloadedImages = new Set<string>();

  async preloadImage(src: string): Promise<HTMLImageElement> {
    // Return cached image if available
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    // Create new loading promise
    const loadingPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.set(src, img);
        this.preloadedImages.add(src);
        this.loadingPromises.delete(src);
        resolve(img);
      };
      
      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      // Set crossOrigin to handle CORS if needed
      img.crossOrigin = 'anonymous';
      img.src = src;
    });

    this.loadingPromises.set(src, loadingPromise);
    return loadingPromise;
  }

  async preloadImagesBatch(images: ImageMetadata[], onProgress?: (loaded: number, total: number) => void): Promise<void> {
    let loadedCount = 0;
    const total = images.length;
    
    onProgress?.(loadedCount, total);

    const promises = images.map(async (imageData) => {
      try {
        await this.preloadImage(imageData.src);
        loadedCount++;
        onProgress?.(loadedCount, total);
      } catch (error) {
        console.warn(`Failed to preload image: ${imageData.name}`, error);
        loadedCount++;
        onProgress?.(loadedCount, total);
      }
    });

    await Promise.allSettled(promises);
  }

  isImageCached(src: string): boolean {
    return this.cache.has(src);
  }

  getCachedImage(src: string): HTMLImageElement | null {
    return this.cache.get(src) || null;
  }

  isImagePreloaded(src: string): boolean {
    return this.preloadedImages.has(src);
  }

  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
    this.preloadedImages.clear();
  }

  getCacheStats() {
    return {
      cachedImages: this.cache.size,
      loadingImages: this.loadingPromises.size,
      preloadedImages: this.preloadedImages.size,
      totalRegistered: Object.keys(IMAGE_REGISTRY).length
    };
  }
}

// Singleton image cache instance
export const imageCache = new ImageCache();

// Hook for image preloading
export const useImagePreloader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const preloadImagesByPriority = async (priority: 'high' | 'medium' | 'low') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const imagesToPreload = Object.values(IMAGE_REGISTRY).filter(
        img => img.priority === priority
      );
      
      await imageCache.preloadImagesBatch(imagesToPreload, (loaded, total) => {
        setProgress({ loaded, total });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preload images');
    } finally {
      setIsLoading(false);
    }
  };

  const preloadImagesByStrategy = async (strategy: 'immediate' | 'viewport' | 'interaction') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const imagesToPreload = Object.values(IMAGE_REGISTRY).filter(
        img => img.preloadStrategy === strategy
      );
      
      await imageCache.preloadImagesBatch(imagesToPreload, (loaded, total) => {
        setProgress({ loaded, total });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preload images');
    } finally {
      setIsLoading(false);
    }
  };

  const preloadAllImages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allImages = Object.values(IMAGE_REGISTRY);
      
      await imageCache.preloadImagesBatch(allImages, (loaded, total) => {
        setProgress({ loaded, total });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preload images');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    progress,
    error,
    preloadImagesByPriority,
    preloadImagesByStrategy,
    preloadAllImages,
    cacheStats: imageCache.getCacheStats()
  };
};

// Hook for using cached images
export const useCachedImage = (imageKey: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const imageData = IMAGE_REGISTRY[imageKey];
  
  useEffect(() => {
    if (!imageData) {
      setError(`Image key "${imageKey}" not found in registry`);
      return;
    }

    if (imageCache.isImageCached(imageData.src)) {
      setIsLoaded(true);
      return;
    }

    // Preload the image if not cached
    imageCache.preloadImage(imageData.src)
      .then(() => setIsLoaded(true))
      .catch(err => setError(err.message));
  }, [imageKey, imageData]);

  return {
    src: imageData?.src || '',
    isLoaded: isLoaded && imageCache.isImageCached(imageData?.src || ''),
    error,
    metadata: imageData
  };
};

// Export for direct access to image URLs
export const getImageUrl = (imageKey: string): string => {
  const imageData = IMAGE_REGISTRY[imageKey];
  return imageData?.src || '';
};

// Export image keys for easier usage
export const ImageKeys = Object.keys(IMAGE_REGISTRY) as Array<keyof typeof IMAGE_REGISTRY>;

// Convenience methods for easier usage
export const imagePreloader = {
  preloadByPriority: (priority: 'high' | 'medium' | 'low') => {
    const imagesToPreload = Object.values(IMAGE_REGISTRY).filter(
      img => img.priority === priority
    );
    
    return Promise.allSettled(
      imagesToPreload.map(imageData => imageCache.preloadImage(imageData.src))
    );
  },
  
  preloadByStrategy: (strategy: 'immediate' | 'viewport' | 'interaction') => {
    const imagesToPreload = Object.values(IMAGE_REGISTRY).filter(
      img => img.preloadStrategy === strategy
    );
    
    return Promise.allSettled(
      imagesToPreload.map(imageData => imageCache.preloadImage(imageData.src))
    );
  },
  
  preloadAll: () => {
    const allImages = Object.values(IMAGE_REGISTRY);
    
    return Promise.allSettled(
      allImages.map(imageData => imageCache.preloadImage(imageData.src))
    );
  },
  
  cache: imageCache
};
