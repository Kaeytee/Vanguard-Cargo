# Vanguard Cargo - API Integration

## Super Simple Single Environment Setup

This project uses ONE environment file (`.env`) to control everything. No more juggling multiple environment files!

### Quick Setup

**Your single `.env` file controls everything:**

1. **For Mock Data (Current Setup):**
   ```env
   REACT_APP_USE_MOCK_DATA=true
   ```
   - Uses local mock data
   - No backend server needed
   - Perfect for development and testing

2. **For Real API:**
   ```env
   REACT_APP_USE_MOCK_DATA=false
   REACT_APP_API_BASE_URL=https://your-api.com/api
   ```
   - Makes real HTTP requests to your backend
   - Automatically falls back to mock data if API fails

### Current Status

✅ **You have ONE environment file: `.env`**
✅ **Currently using: MOCK DATA** (REACT_APP_USE_MOCK_DATA=true)
- The app will work immediately without any backend
- All tracking and shipment history uses mock data
- You can test all features right away

### To Switch to Real API Later

1. Build your backend API (see `API_INTEGRATION.md` for endpoints)
2. Edit your single `.env` file:
   ```env
   REACT_APP_USE_MOCK_DATA=false
   REACT_APP_API_BASE_URL=https://your-backend.com/api
   REACT_APP_ENVIRONMENT=production
   ```
3. Restart the app - that's it!

### Files Structure

- `src/services/api.ts` - Main API service (handles the toggle automatically)
- `src/config/app.ts` - Configuration settings
- `src/lib/mockShipmentData.ts` - Mock data for testing
- `.env` - **SINGLE** environment file (controls everything!)

### Benefits of Single Environment File

- **No Confusion**: Only one file to manage
- **Easy Switching**: Change settings in one place
- **Zero Backend Dependency**: Works immediately with mock data
- **Easy Rollback**: Change one variable to switch back
- **Automatic Fallback**: If real API fails, uses mock data automatically
- **Type Safety**: Full TypeScript support for both modes

### How to Run

```bash
npm install
npm start
```

The app will start using mock data by default and work immediately!
