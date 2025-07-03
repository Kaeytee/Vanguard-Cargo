# API Integration Guide

This guide explains how to integrate your Ttarius Logistics client app with real backend endpoints using the simplified API service.

## Quick Start - Single Environment File

### 1. Environment Configuration

The app uses ONE environment file (`.env`) to control everything:

**.env** (single file for all environments):
```env
# Mock Data Toggle - Change this single line to switch modes
REACT_APP_USE_MOCK_DATA=true   # true = mock data, false = real API

# API URL (change when using real API)
REACT_APP_API_BASE_URL=http://localhost:8080/api

# Environment (development/production)
REACT_APP_ENVIRONMENT=development
```

### 2. How to Switch Between Mock and Real API

**To use mock data (current setup):**
- Set `REACT_APP_USE_MOCK_DATA=true` in your `.env` file
- The app will use mock data automatically
- No backend server needed

**To use real API:**
- Set `REACT_APP_USE_MOCK_DATA=false` in your `.env` file
- Update `REACT_APP_API_BASE_URL=https://your-api.com/api`
- The app will make real HTTP requests to your backend
- If the API fails, it automatically falls back to mock data

### 3. Current Implementation

The app uses a single API service (`src/services/api.ts`) that:
- Automatically checks the environment variable for every API call
- Uses mock data when `REACT_APP_USE_MOCK_DATA=true`
- Makes real API calls when `REACT_APP_USE_MOCK_DATA=false`
- Falls back to mock data if the real API is unavailable

## API Endpoints Your Backend Should Implement

### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout
```

### Shipment Endpoints
```
GET  /api/shipments?page=1&limit=10&status=pending&search=query
POST /api/shipments
GET  /api/shipments/{id}
PUT  /api/shipments/{id}
POST /api/shipments/{id}/cancel
```

### Tracking Endpoints
```
GET /api/tracking/{trackingId}
```

### User Endpoints
```
GET /api/user/profile
PUT /api/user/profile
POST /api/user/change-password
```

### Support Endpoints
```
GET  /api/support/tickets
POST /api/support/tickets
GET  /api/support/tickets/{id}
```

### Utility Endpoints
```
GET /api/countries
GET /api/countries/origins/{clientCountry}
GET /api/addresses/search?q=query&country=US
```

## Expected API Response Format

All API endpoints should return responses in this format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Your actual data here
  },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "data": null
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "totalPages": 10,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

## Shipment Data Structure

Your API should return shipment data in this format:

```typescript
{
  "id": "SHIP2158",
  "date": "Feb 18, 2025",
  "destination": "Washington, DC",
  "recipient": "James Simmons",
  "type": "Box",
  "status": "pending", // pending | transit | arrived | received | delivered
  "origin": "Ghana, Accra",
  "weight": "3.2 kg",
  "service": "International Express",
  "recipientDetails": {
    "name": "James Simmons",
    "phone": "+1 (202) 555-0123",
    "email": "james.simmons@email.com",
    "address": "1600 Pennsylvania Avenue NW, Washington, DC 20500, USA"
  },
  "warehouseDetails": {
    "name": "Ttarius Logistics Ghana",
    "phone": "+233 30 123 4567",
    "email": "warehouse@ttariuslogistics.com",
    "address": "15 Independence Avenue, Accra, Ghana"
  },
  "estimatedDelivery": "2025-02-25",
  "created": "2025-02-18"
}
```

## Authentication

The client app expects JWT-based authentication:

1. **Login** returns a JWT token
2. **Token** is stored in localStorage
3. **All API requests** include `Authorization: Bearer <token>` header
4. **Refresh token** endpoint to get new tokens

## Testing Your Integration

### 1. Start with Mock Data
- Set `REACT_APP_USE_MOCK_DATA=true`
- Verify the UI works with mock data
- Test all user flows

### 2. Switch to API Mode
- Set `REACT_APP_USE_MOCK_DATA=false`
- Set your API URL in `REACT_APP_API_BASE_URL`
- Test with your real backend

### 3. Error Handling
The app includes built-in error handling for:
- Network failures
- Authentication errors
- Validation errors
- Server errors

## Files Modified for API Integration

- `src/services/api.ts` - Simplified API service with automatic toggle
- `src/config/app.ts` - App configuration with mock data toggle
- `src/app/tracking/tracking.tsx` - Tracking page using API service
- `src/app/shipmentHistory/shipmentHistory.tsx` - Shipment history using API service
- `.env` - Single environment configuration file

## Deployment Notes

### Development
```bash
npm run dev
# Uses .env.development automatically
```

### Production Build
```bash
npm run build
# Uses .env.production for the build
```

### Environment Variables in Deployment
Make sure your deployment platform (Vercel, Netlify, etc.) has these environment variables set:
- `REACT_APP_API_BASE_URL`
- `REACT_APP_USE_MOCK_DATA`
- `REACT_APP_ENVIRONMENT`

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your backend allows requests from your frontend domain
2. **Authentication Issues**: Check that JWT tokens are being sent correctly
3. **API Format Mismatch**: Ensure your API returns data in the expected format
4. **Environment Variables**: Verify environment variables are loaded correctly

### Debug Mode
Set `REACT_APP_DEBUG=true` to enable additional logging in the browser console.

## Next Steps

1. **Set up your backend** to implement the required endpoints
2. **Test with mock data** first to ensure the UI works
3. **Switch to API mode** and test with real data
4. **Deploy to production** with the correct environment variables

The app is designed to work seamlessly with both mock data (for development) and real APIs (for production) with minimal configuration changes.
