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
 * To revert authentication functionality in the future:
 * 1. Change authEnabled from false to true
 * 2. The UI will automatically show auth buttons normally
 * 3. Auth routes will work as expected
 */
export const featureFlags: FeatureFlags = {
  authEnabled: false, // TODO: Set to true when ready to re-enable authentication
};
