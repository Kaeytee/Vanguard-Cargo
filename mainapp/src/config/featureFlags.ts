/**
 * Feature Flags Configuration
 * 
 * This file contains feature flags that can be easily toggled to enable/disable
 * certain features in the application. This is particularly useful for temporary
 * changes that need to be easily reverted in the future.
 */

export interface FeatureFlags {
  /** 
   * Controls whether authentication features (login/register) are enabled
   * Set to false to fade out auth buttons and redirect auth routes to home
   * Set to true to restore normal authentication functionality
   */
  authEnabled: boolean;
}

/**
 * Current feature flag configuration
 * 
 * Authentication functionality has been restored:
 * 1. authEnabled set to true to re-enable authentication
 * 2. Login and register routes are now active
 * 3. Auth buttons will show normally in the UI
 */
export const featureFlags: FeatureFlags = {
  authEnabled: true, // Authentication routes and functionality enabled
};
