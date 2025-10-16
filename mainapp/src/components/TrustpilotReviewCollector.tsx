import { useEffect, useRef } from 'react';
import { TRUSTPILOT_CONFIG, TRUSTPILOT_TEMPLATES } from '../config/trustpilot';

/**
 * TrustpilotReviewCollector Component
 * 
 * Displays a Trustpilot Review Collector widget that allows customers
 * to leave reviews directly from your website without being redirected.
 * 
 * This widget is perfect for:
 * - Post-delivery confirmation pages
 * - Thank you pages
 * - Customer dashboard
 * - Email signatures (with link)
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {string} props.height - Height of the widget (default: '52px')
 * @param {string} props.width - Width of the widget (default: '100%')
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * // Basic usage on thank you page
 * <TrustpilotReviewCollector />
 * 
 * @example
 * // Custom size
 * <TrustpilotReviewCollector height="80px" width="500px" />
 * 
 * @example
 * // With custom styling
 * <TrustpilotReviewCollector className="my-4" />
 */

interface TrustpilotReviewCollectorProps {
  /** Widget height */
  height?: string;
  /** Widget width */
  width?: string;
  /** Additional CSS classes */
  className?: string;
}

export default function TrustpilotReviewCollector({
  height = '52px',
  width = '100%',
  className = ''
}: TrustpilotReviewCollectorProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Trustpilot widget script if not already loaded
    if (window.Trustpilot) {
      window.Trustpilot.loadFromElement(ref.current, true);
    } else {
      // Create script element for Trustpilot widget
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
      
      // Load widget after script loads
      script.onload = () => {
        if (window.Trustpilot && ref.current) {
          window.Trustpilot.loadFromElement(ref.current, true);
        }
      };
      
      document.head.appendChild(script);

      // Cleanup function to remove script on unmount
      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);

  return (
    <div className={className}>
      <div
        ref={ref}
        className="trustpilot-widget"
        data-locale={TRUSTPILOT_CONFIG.LOCALE}
        data-template-id={TRUSTPILOT_TEMPLATES.REVIEW_COLLECTOR}
        data-businessunit-id={TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID}
        data-style-height={height}
        data-style-width={width}
        data-token={TRUSTPILOT_CONFIG.REVIEW_COLLECTOR_TOKEN}
      >
        {/* Fallback link while widget loads */}
        <a
          href={`https://www.trustpilot.com/review/vanguardcargo.co`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
        >
          Leave a review on Trustpilot
        </a>
      </div>
    </div>
  );
}

/**
 * ReviewCollectorSection Component
 * 
 * A complete section with heading and description for the review collector.
 * Perfect for thank you pages, delivery confirmations, or customer dashboards.
 * 
 * @example
 * <ReviewCollectorSection />
 */
export function ReviewCollectorSection() {
  return (
    <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        How was your experience?
      </h3>
      <p className="text-gray-600 mb-6 max-w-xl mx-auto">
        We'd love to hear about your experience with Vanguard Cargo! 
        Your feedback helps us improve and helps other customers make informed decisions.
      </p>
      <TrustpilotReviewCollector className="max-w-xl mx-auto" />
      <p className="text-sm text-gray-500 mt-4">
        Your review will be posted on Trustpilot and may be displayed on our website.
      </p>
    </div>
  );
}

/**
 * CompactReviewCollector Component
 * 
 * A minimal, compact version of the review collector for sidebars,
 * footers, or compact layouts.
 * 
 * @example
 * // In sidebar
 * <CompactReviewCollector />
 */
export function CompactReviewCollector() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-semibold text-gray-900">Leave a Review</span>
      </div>
      <TrustpilotReviewCollector height="40px" />
    </div>
  );
}

/**
 * PostDeliveryReviewPrompt Component
 * 
 * Special component for post-delivery pages with delivery confirmation
 * and review collection in one card.
 * 
 * @param {Object} props
 * @param {string} props.trackingNumber - Package tracking number
 * @param {string} props.deliveryDate - Date of delivery
 * 
 * @example
 * <PostDeliveryReviewPrompt 
 *   trackingNumber="VC-12345" 
 *   deliveryDate="2025-10-16"
 * />
 */
interface PostDeliveryReviewPromptProps {
  trackingNumber: string;
  deliveryDate: string;
}

export function PostDeliveryReviewPrompt({ 
  trackingNumber, 
  deliveryDate 
}: PostDeliveryReviewPromptProps) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 sm:p-8 border-2 border-green-200">
      {/* Delivery Confirmation */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Package Delivered Successfully!
        </h2>
        <div className="space-y-1 text-gray-600">
          <p>Tracking: <span className="font-semibold">{trackingNumber}</span></p>
          <p>Delivered: <span className="font-semibold">{new Date(deliveryDate).toLocaleDateString()}</span></p>
        </div>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-green-50 text-gray-600 font-medium">We'd love your feedback!</span>
        </div>
      </div>

      {/* Review Collector */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          How was your experience?
        </h3>
        <p className="text-gray-600 mb-6">
          Help others by sharing your experience with Vanguard Cargo
        </p>
        <TrustpilotReviewCollector className="max-w-xl mx-auto" />
        <p className="text-xs text-gray-500 mt-4">
          Takes less than 1 minute • Helps us serve you better
        </p>
      </div>
    </div>
  );
}

// Extend Window interface to include Trustpilot
declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (element: HTMLElement | null, forceReload: boolean) => void;
    };
  }
}
