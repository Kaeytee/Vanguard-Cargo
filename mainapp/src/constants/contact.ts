/**
 * Contact Information Constants
 * Centralized contact details for Vanguard Cargo
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 * @created 2025-09-30
 */

export const CONTACT_INFO = {
  // Phone Numbers
  MOBILE_PHONE: '+233544197819',
  LANDLINE_PHONE: '0303982320',
  LANDLINE_PHONE_2: '0303982330',
  LANDLINE_PHONE_3: '0302982329',
  
  // Formatted Display Numbers
  MOBILE_DISPLAY: '+233 544 197 819',
  LANDLINE_DISPLAY: '030 398 2320',
  LANDLINE_DISPLAY_2: '030 398 2330',
  LANDLINE_DISPLAY_3: '030 298 2329',
  
  // All Business Landlines (for easy iteration)
  BUSINESS_LANDLINES: [
    { number: '0303982320', display: '030 398 2320' },
    { number: '0303982330', display: '030 398 2330' },
    { number: '0302982329', display: '030 298 2329' }
  ],
  
  // Email Addresses
  SUPPORT_EMAIL: 'support@vanguardcargo.co',
  INFO_EMAIL: 'info@vanguardcargo.co',
  
  // Physical Address
  ADDRESS: {
    LINE1: 'Vanguard Cargo Center',
    LINE2: 'East Legon, Accra, Ghana',
    FULL: 'Vanguard Cargo Center\nEast Legon, Accra, Ghana'
  },
  
  // Business Hours
  BUSINESS_HOURS: {
    WEEKDAYS: 'Mon - Fri: 8:00 AM – 8:00 PM',
    SATURDAY: 'Sat: 9:00 AM – 5:00 PM',
    SUNDAY: 'Sun: Closed'
  },
  
  // Social Media (placeholder for future use)
  SOCIAL_MEDIA: {
    FACEBOOK: 'https://www.facebook.com/profile.php?id=61583182550816',
    LINKEDIN: '#',
    TWITTER: '#',
    INSTAGRAM: '#'
  }
} as const;

/**
 * Helper function to format phone number for tel: links
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number for tel: links
 */
export const formatPhoneForTel = (phoneNumber: string): string => {
  return phoneNumber.replace(/\s+/g, '');
};

/**
 * Helper function to get clickable phone link
 * @param phoneNumber - The phone number
 * @returns Complete tel: link
 */
export const getPhoneLink = (phoneNumber: string): string => {
  return `tel:${formatPhoneForTel(phoneNumber)}`;
};

/**
 * Helper function to get clickable email link
 * @param email - The email address
 * @returns Complete mailto: link
 */
export const getEmailLink = (email: string): string => {
  return `mailto:${email}`;
};
