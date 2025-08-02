# Authentication Feature Toggle

This application has been temporarily configured to disable authentication features (login/register functionality). The changes have been implemented using feature flags to make it easy to revert in the future.

## Current State
- Login and Register buttons are faded out (30% opacity) and non-interactive
- Login and Register routes redirect to the home page
- Authentication functionality is completely disabled

## How to Re-enable Authentication

To restore authentication functionality in the future, simply:

1. Open `src/config/featureFlags.ts`
2. Change `authEnabled: false` to `authEnabled: true`
3. Save the file

That's it! The application will automatically:
- Restore full opacity and functionality to login/register buttons
- Make login/register routes work normally again
- Enable all authentication features

## Files Modified
- `src/config/featureFlags.ts` - New feature flag configuration
- `src/components/navbar.tsx` - Updated to use feature flags and add fade-out styling
- `src/App.tsx` - Updated routes to conditionally redirect based on feature flags

## Implementation Details
- Uses CSS classes with `opacity-30`, `cursor-not-allowed`, and `pointer-events-none` for visual feedback
- Buttons redirect to home page (`/`) when auth is disabled
- All changes are controlled by a single boolean flag for easy maintenance
- No authentication code was removed, only temporarily disabled

## Benefits
- Quick and easy to toggle on/off
- No code deletion required
- Visual feedback to users that auth is temporarily unavailable
- Single point of configuration for the entire feature
