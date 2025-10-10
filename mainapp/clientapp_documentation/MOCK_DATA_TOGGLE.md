# Mock Data vs Real API Toggle

This project is set up to use **mock data by default** for easy development and testing. You can easily switch between mock data and real API endpoints with a simple toggle.

## How to Switch Between Mock Data and Real API

### Option 1: Environment Variable (Recommended)

1. **To use mock data (default):**
   ```bash
   # In .env.development or .env.production
   REACT_APP_USE_MOCK_DATA=true
   ```

2. **To use real API:**
   ```bash
   # In .env.development or .env.production
   REACT_APP_USE_MOCK_DATA=false
   ```

### Option 2: Direct Configuration

You can also modify the config file directly:

1. Open `src/config/app.ts`
2. Change the `useMockData` property:
   ```typescript
   export const APP_CONFIG = {
     // Use mock data by default unless explicitly set to false
     useMockData: false, // Change this to false to use real API
     // ... rest of config
   };
   ```

## Current Setup

- **Default Mode**: Mock data is used by default
- **Automatic Fallback**: If real API fails, the system automatically falls back to mock data
- **No Code Changes**: Switch between modes without changing any component code

## Mock Data Features

The mock data includes:
- Complete shipment history with various statuses
- Realistic tracking events and status updates
- Warehouse pickup model (no home delivery)
- Paginated responses for testing
- Search and filter functionality

## Real API Integration

When switching to real API mode:
- All endpoints are automatically called
- Same data structure is expected from the API
- Authentication tokens are handled automatically
- Error handling with fallback to mock data

## Files Involved

- `src/config/app.ts` - Configuration and toggle logic
- `src/services/api.ts` - Simplified API service with automatic toggle
- `src/lib/mockShipmentData.ts` - Mock data and types
- `.env.development` - Development environment variables
- `.env.production` - Production environment variables

## Testing

To test both modes:

1. **Mock Data Mode**: 
   ```bash
   npm start
   # Uses mock data by default
   ```

2. **Real API Mode**:
   ```bash
   # Set REACT_APP_USE_MOCK_DATA=false in .env.development
   npm start
   ```

## Rollback Strategy

To rollback to mock data at any time:
1. Set `REACT_APP_USE_MOCK_DATA=true` in your `.env` file
2. Restart the development server
3. The app will immediately use mock data without any code changes

This approach ensures you can quickly switch between development and production modes while maintaining the same user experience.
