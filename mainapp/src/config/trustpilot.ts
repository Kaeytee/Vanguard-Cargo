/**
 * Trustpilot Configuration
 * 
 * Configure your Trustpilot integration settings here.
 * 
 * SETUP INSTRUCTIONS:
 * ====================
 * 
 * 1. Create a Trustpilot Business Account:
 *    - Go to https://business.trustpilot.com/signup
 *    - Sign up with your business email
 *    - Verify your email address
 * 
 * 2. Claim Your Business Profile:
 *    - Search for "Vanguard Cargo" or create new profile
 *    - Complete verification process (may require documentation)
 *    - This can take 1-3 business days
 * 
 * 3. Get Your Business Unit ID:
 *    - Log into Trustpilot Business
 *    - Go to Settings > Integrations > TrustBox
 *    - Copy your Business Unit ID (format: xxxxxxxxxxxxxxxxxxxxxxxx)
 *    - Paste it in the VITE_TRUSTPILOT_BUSINESS_UNIT_ID below
 * 
 * 4. Enable TrustBox Widgets:
 *    - In Trustpilot Business, go to TrustBox
 *    - Enable the widgets you want to use
 *    - Copy template IDs if needed (default ones provided below)
 * 
 * 5. Set Environment Variable:
 *    - Add to .env file: VITE_TRUSTPILOT_BUSINESS_UNIT_ID=your_business_unit_id
 *    - Or directly update BUSINESS_UNIT_ID constant below for testing
 * 
 * 6. Collect Your First Reviews:
 *    - Send review invitations from Trustpilot dashboard
 *    - Or use automatic review collection after orders
 *    - Reviews will appear on your profile and in widgets
 * 
 * @see https://support.trustpilot.com/hc/en-us/articles/115004149487-Getting-Started-with-Trustpilot
 */

// ============================================================================
// TRUSTPILOT CONFIGURATION
// ============================================================================

/**
 * Your Trustpilot Business Unit ID
 * 
 * REPLACE THIS with your actual Business Unit ID from Trustpilot
 * Get it from: Trustpilot Business > Settings > Integrations > TrustBox
 * 
 * Example format: "5f8b1c2d3e4f5a6b7c8d9e0f"
 */
export const TRUSTPILOT_CONFIG = {
  // Your Trustpilot Business Unit ID (from .env)
  BUSINESS_UNIT_ID: import.meta.env.VITE_TRUSTPILOT_BUSINESS_UNIT_ID || '',
  
  // Enable/disable Trustpilot integration
  ENABLED: import.meta.env.VITE_TRUSTPILOT_ENABLED !== 'false',
  
  // Default locale for widgets
  LOCALE: 'en-US',
  
  // Widget theme (light/dark)
  THEME: 'light' as const,
  
  // Review Collector Token (from .env)
  REVIEW_COLLECTOR_TOKEN: import.meta.env.VITE_TRUSTPILOT_REVIEW_COLLECTOR_TOKEN || '',
  
  // Fallback rating when Trustpilot is not configured
  FALLBACK_RATING: 4.9,
  FALLBACK_REVIEW_COUNT: 5000,
};

/**
 * Trustpilot Widget Template IDs
 * 
 * Common widget templates provided by Trustpilot.
 * Use these to display different styles of rating widgets.
 */
export const TRUSTPILOT_TEMPLATES = {
  // Micro TrustBox - Compact star rating (24px height)
  MICRO: '5419b6a8b0d04a076446a9ad',
  
  // Mini TrustBox - Star rating with review count (100px height)
  MINI: '53aa8807dec7e10d38f59f32',
  
  // Micro Star - Just stars without text (20px height)
  MICRO_STAR: '5419b6ffb0d04a076446a9af',
  
  // Review Collector - Allow customers to leave reviews directly from your site
  REVIEW_COLLECTOR: '56278e9abfbbba0bdcd568bc',
  
  // Horizontal Slider - Scrolling reviews
  HORIZONTAL_SLIDER: '54ad5defc6454f065c28af8b',
  
  // Carousel - Review carousel
  CAROUSEL: '53aa8912dec7e10d38f59f36',
  
  // Grid - Review grid layout
  GRID: '539ad0ffdec7e10e686debd7',
  
  // List - Vertical list of reviews
  LIST: '539ad60defb9600b94d7df2c',
  
  // Quote - Single review quote
  QUOTE: '53aa8912dec7e10d38f59f37',
};

/**
 * Check if Trustpilot is properly configured
 * @returns {boolean} True if Business Unit ID is set
 */
export function isTrustpilotConfigured(): boolean {
  return TRUSTPILOT_CONFIG.ENABLED && !!TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID && TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID.length > 0;
}

/**
 * Get Trustpilot profile URL
 * @returns {string} URL to business Trustpilot profile
 */
export function getTrustpilotProfileUrl(): string {
  if (!TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID) {
    return 'https://www.trustpilot.com';
  }
  return `https://www.trustpilot.com/review/${TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID}`;
}

/**
 * Get Trustpilot review invitation URL
 * @returns {string} URL to send review invitations
 */
export function getTrustpilotInviteUrl(): string {
  if (!TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID) {
    return 'https://business.trustpilot.com';
  }
  return `https://business.trustpilot.com/review-invitations`;
}

export default TRUSTPILOT_CONFIG;
