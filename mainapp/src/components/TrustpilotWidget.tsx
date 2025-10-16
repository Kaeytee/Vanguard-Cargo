import { useEffect, useRef } from 'react';

/**
 * TrustpilotWidget Component
 * 
 * Displays a Trustpilot TrustBox widget for showing customer reviews and ratings.
 * This component automatically loads the Trustpilot script and renders the widget.
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {string} props.templateId - The Trustpilot template ID for the widget style
 * @param {string} props.businessUnitId - Your Trustpilot business unit ID
 * @param {number} props.height - Height of the widget in pixels (default: 100)
 * @param {string} props.theme - Widget theme: 'light' or 'dark' (default: 'light')
 * @param {number} props.stars - Filter to show only reviews with specific star rating (1-5)
 * @param {string} props.locale - Language locale (e.g., 'en-US', 'en-GB')
 * @param {string} props.styleHeight - Custom height style (e.g., '100px', '200px')
 * @param {string} props.styleWidth - Custom width style (e.g., '100%', '300px')
 * 
 * @example
 * // Micro TrustBox (compact rating display)
 * <TrustpilotWidget 
 *   templateId="5419b6a8b0d04a076446a9ad" 
 *   businessUnitId="YOUR_BUSINESS_UNIT_ID"
 *   height={24}
 *   styleHeight="24px"
 *   styleWidth="100%"
 * />
 * 
 * @example
 * // Mini TrustBox (with star rating)
 * <TrustpilotWidget 
 *   templateId="53aa8807dec7e10d38f59f32" 
 *   businessUnitId="YOUR_BUSINESS_UNIT_ID"
 *   height={100}
 * />
 */

interface TrustpilotWidgetProps {
  /** Trustpilot template ID for widget style */
  templateId: string;
  /** Your Trustpilot business unit ID */
  businessUnitId: string;
  /** Widget height in pixels */
  height?: number;
  /** Widget theme (light/dark) */
  theme?: 'light' | 'dark';
  /** Filter by star rating (1-5) */
  stars?: number;
  /** Language locale */
  locale?: string;
  /** Custom height style */
  styleHeight?: string;
  /** Custom width style */
  styleWidth?: string;
}

export default function TrustpilotWidget({
  templateId,
  businessUnitId,
  height = 100,
  theme = 'light',
  stars,
  locale = 'en-US',
  styleHeight,
  styleWidth = '100%'
}: TrustpilotWidgetProps) {
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
    <div
      ref={ref}
      className="trustpilot-widget"
      data-locale={locale}
      data-template-id={templateId}
      data-businessunit-id={businessUnitId}
      data-style-height={styleHeight || `${height}px`}
      data-style-width={styleWidth}
      data-theme={theme}
      data-stars={stars}
      data-schema-type="Organization"
    >
      {/* Fallback link while widget loads */}
      <a
        href={`https://www.trustpilot.com/review/${businessUnitId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-gray-600 hover:text-red-600"
      >
        Trustpilot
      </a>
    </div>
  );
}

/**
 * Common Trustpilot Template IDs:
 * 
 * Micro TrustBox (Compact): 5419b6a8b0d04a076446a9ad
 * Mini TrustBox: 53aa8807dec7e10d38f59f32
 * Horizontal Slider: 54ad5defc6454f065c28af8b
 * Carousel: 53aa8912dec7e10d38f59f36
 * Review Collector: 56278e9abfbbba0bdcd568bc
 * Product Review: 5419b637fa0340045cd0c936
 * Evaluation: 5406e65db0d04a09e042d5fc
 */

// Extend Window interface to include Trustpilot
declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (element: HTMLElement | null, forceReload: boolean) => void;
    };
  }
}
