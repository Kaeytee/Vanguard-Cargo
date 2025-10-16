import { Star } from 'lucide-react';
import TrustpilotWidget from './TrustpilotWidget';
import { 
  TRUSTPILOT_CONFIG, 
  TRUSTPILOT_TEMPLATES, 
  isTrustpilotConfigured 
} from '../config/trustpilot';

/**
 * CustomerRating Component
 * 
 * Displays customer rating using Trustpilot widget when configured,
 * or falls back to static rating display.
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {('micro'|'mini'|'star')} props.variant - Display variant
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showText - Whether to show "Customer Rating" text
 * @param {boolean} props.centerAlign - Center align the content
 * 
 * @example
 * // Micro variant (compact)
 * <CustomerRating variant="micro" />
 * 
 * @example
 * // Mini variant with text
 * <CustomerRating variant="mini" showText={true} />
 * 
 * @example
 * // Star-only variant
 * <CustomerRating variant="star" centerAlign={true} />
 */

interface CustomerRatingProps {
  /** Display variant: micro (compact), mini (with count), or star (stars only) */
  variant?: 'micro' | 'mini' | 'star';
  /** Additional CSS classes */
  className?: string;
  /** Whether to show "Customer Rating" text label */
  showText?: boolean;
  /** Center align the content */
  centerAlign?: boolean;
}

export default function CustomerRating({ 
  variant = 'mini',
  className = '',
  showText = true,
  centerAlign = false
}: CustomerRatingProps) {
  // Check if Trustpilot is configured
  const isConfigured = isTrustpilotConfigured();

  // If Trustpilot is configured, show the widget
  if (isConfigured) {
    return (
      <div className={`${centerAlign ? 'flex flex-col items-center' : ''} ${className}`}>
        {variant === 'micro' && (
          <div className="flex flex-col items-center gap-1">
            <TrustpilotWidget
              templateId={TRUSTPILOT_TEMPLATES.MICRO}
              businessUnitId={TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID}
              height={24}
              styleHeight="24px"
              styleWidth="100%"
              theme={TRUSTPILOT_CONFIG.THEME}
              locale={TRUSTPILOT_CONFIG.LOCALE}
            />
            {showText && (
              <div className="text-xs text-gray-600 mt-1">Customer Rating</div>
            )}
          </div>
        )}

        {variant === 'mini' && (
          <div className="flex flex-col items-center gap-2">
            <TrustpilotWidget
              templateId={TRUSTPILOT_TEMPLATES.MINI}
              businessUnitId={TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID}
              height={100}
              styleHeight="100px"
              styleWidth="100%"
              theme={TRUSTPILOT_CONFIG.THEME}
              locale={TRUSTPILOT_CONFIG.LOCALE}
            />
            {showText && (
              <div className="text-sm text-gray-600">Customer Rating</div>
            )}
          </div>
        )}

        {variant === 'star' && (
          <div className="flex flex-col items-center gap-1">
            <TrustpilotWidget
              templateId={TRUSTPILOT_TEMPLATES.MICRO_STAR}
              businessUnitId={TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID}
              height={20}
              styleHeight="20px"
              styleWidth="100%"
              theme={TRUSTPILOT_CONFIG.THEME}
              locale={TRUSTPILOT_CONFIG.LOCALE}
            />
            {showText && (
              <div className="text-xs text-gray-600 mt-1">Customer Rating</div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Fallback display when Trustpilot is not configured
  return (
    <div className={`${centerAlign ? 'text-center' : ''} ${className}`}>
      <div className="flex items-center gap-1 justify-center">
        <div className="text-2xl font-bold text-red-600 flex items-center gap-1">
          {TRUSTPILOT_CONFIG.FALLBACK_RATING}
          <Star className="w-6 h-6 fill-current" />
        </div>
      </div>
      {showText && (
        <div className="text-sm text-gray-600 mt-1">
          Customer Rating
        </div>
      )}
      {/* Setup reminder - only visible in development */}
      {import.meta.env.DEV && (
        <div className="text-xs text-orange-500 mt-2 max-w-xs">
          ⚠️ Trustpilot not configured. See /src/config/trustpilot.ts for setup instructions.
        </div>
      )}
    </div>
  );
}

/**
 * CustomerRatingInline Component
 * 
 * Inline variant that displays rating in a single line.
 * Useful for headers, cards, and compact layouts.
 * 
 * @example
 * <CustomerRatingInline />
 */
export function CustomerRatingInline({ className = '' }: { className?: string }) {
  const isConfigured = isTrustpilotConfigured();

  if (isConfigured) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <TrustpilotWidget
          templateId={TRUSTPILOT_TEMPLATES.MICRO}
          businessUnitId={TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID}
          height={24}
          styleHeight="24px"
          styleWidth="auto"
          theme={TRUSTPILOT_CONFIG.THEME}
          locale={TRUSTPILOT_CONFIG.LOCALE}
        />
      </div>
    );
  }

  // Fallback inline display
  return (
    <div className={`inline-flex items-center gap-1 text-red-600 ${className}`}>
      <span className="font-bold">{TRUSTPILOT_CONFIG.FALLBACK_RATING}</span>
      <Star className="w-4 h-4 fill-current" />
    </div>
  );
}

/**
 * CustomerRatingLarge Component
 * 
 * Large variant for prominent display on hero sections and landing pages.
 * 
 * @example
 * <CustomerRatingLarge />
 */
export function CustomerRatingLarge({ className = '' }: { className?: string }) {
  const isConfigured = isTrustpilotConfigured();

  if (isConfigured) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <TrustpilotWidget
          templateId={TRUSTPILOT_TEMPLATES.MINI}
          businessUnitId={TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID}
          height={120}
          styleHeight="120px"
          styleWidth="100%"
          theme={TRUSTPILOT_CONFIG.THEME}
          locale={TRUSTPILOT_CONFIG.LOCALE}
        />
        <div className="text-base text-gray-600 mt-2">Trusted by 5000+ customers</div>
      </div>
    );
  }

  // Fallback large display
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-4xl font-bold text-red-600">
          {TRUSTPILOT_CONFIG.FALLBACK_RATING}
        </span>
        <Star className="w-8 h-8 fill-current text-red-600" />
      </div>
      <div className="text-sm text-gray-600 mt-2">Customer Rating</div>
      <div className="text-xs text-gray-500 mt-1">
        Based on {TRUSTPILOT_CONFIG.FALLBACK_REVIEW_COUNT.toLocaleString()}+ reviews
      </div>
    </div>
  );
}
