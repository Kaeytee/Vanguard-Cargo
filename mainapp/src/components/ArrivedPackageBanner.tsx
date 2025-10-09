import { Package as PackageIcon, MapPin, ChevronRight } from 'lucide-react';
import type { Package } from '../services/packageService';

/**
 * ArrivedPackageBanner Component - Highlight packages ready for pickup
 * 
 * This component displays a prominent banner for packages with "arrived" or
 * "ready_for_pickup" status, alerting customers that their package is ready
 * for collection.
 * 
 * Features:
 * - Eye-catching animated banner
 * - Display authentication code snippet
 * - Quick action to view full details
 * - Pulsing animation for attention
 * - Responsive design
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

interface ArrivedPackageBannerProps {
  /** Package that is ready for pickup */
  package: Package;
  /** Callback when user clicks to view details */
  onViewDetails: () => void;
  /** Custom CSS class */
  className?: string;
}

const ArrivedPackageBanner = ({ 
  package: pkg, 
  onViewDetails,
  className = '' 
}: ArrivedPackageBannerProps) => {
  return (
    <div 
      className={`arrived-package-banner relative overflow-hidden ${className}`}
      role="alert"
      aria-live="polite"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 animate-gradient-x"></div>
      
      {/* Pulsing animation overlay */}
      <div className="absolute inset-0 bg-green-400 opacity-20 animate-pulse"></div>

      {/* Content */}
      <div className="relative z-10 bg-gradient-to-r from-green-600/95 to-emerald-600/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left section - Info */}
            <div className="flex items-start sm:items-center gap-3 flex-1">
              {/* Icon */}
              <div className="flex-shrink-0 bg-white/20 rounded-full p-3 animate-bounce">
                <PackageIcon className="w-6 h-6 text-white" aria-hidden="true" />
              </div>

              {/* Text content */}
              <div className="flex-1 text-white">
                <h3 className="text-lg sm:text-xl font-bold mb-1 flex items-center gap-2">
                  📦 Package Ready for Pickup!
                </h3>
                <p className="text-green-100 text-sm mb-2">
                  Your package <span className="font-mono font-semibold">{pkg.tracking_number}</span> is waiting at our warehouse
                </p>
                
                {/* Auth code snippet */}
                {pkg.delivery_auth_code && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-green-200">Pickup Code:</span>
                    <div className="bg-white/20 px-3 py-1 rounded-lg">
                      <span className="font-mono font-bold text-white tracking-widest">
                        {pkg.delivery_auth_code}
                      </span>
                    </div>
                  </div>
                )}

                {/* Warehouse info */}
                <div className="flex items-center gap-2 mt-2 text-green-100 text-xs">
                  <MapPin className="w-3 h-3" aria-hidden="true" />
                  <span>ALX-E2 Warehouse: 4700 Eisenhower Ave,  VA</span>
                </div>
              </div>
            </div>

            {/* Right section - Action button */}
            <button
              onClick={onViewDetails}
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-white hover:bg-green-50 text-green-700 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              aria-label="View pickup details"
            >
              <span>View Pickup Details</span>
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Instructions hint */}
          <div className="mt-3 pt-3 border-t border-green-400/30">
            <p className="text-green-100 text-xs text-center sm:text-left">
              💡 Bring your photo ID and pickup code to collect your package during warehouse hours
            </p>
          </div>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-br-full"></div>
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-tl-full"></div>

      {/* Custom animations - Add to your global CSS or Tailwind config */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default ArrivedPackageBanner;
