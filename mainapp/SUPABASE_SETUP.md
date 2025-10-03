# Supabase Database Setup Guide

## Complete Backend Setup for Vanguard Cargo

This guide provides step-by-step instructions to set up your Supabase database with warehouse intake workflow, WhatsApp/SMS notifications, and admin management.

## 🚀 Quick Setup Instructions

### 1. Execute SQL Files in Order

Run these SQL files in your Supabase SQL Editor **in this exact order**:

```sql
-- Step 1: Create all tables and indexes
\i 01_create_tables.sql

-- Step 2: Set up authentication functions and triggers
\i 02_auth_functions.sql

-- Step 3: Enable Row Level Security policies
\i 03_rls_policies.sql

-- Step 4: Add package management functions
\i 04_package_functions.sql

-- Step 5: Set up automatic timestamp updates
\i 05_updated_at_triggers.sql
```

### 2. Configure Supabase Authentication

In your Supabase Dashboard → Authentication → Settings:

1. **Enable Email Confirmations**:
   - Go to Authentication → Settings → Email
   - Enable "Confirm email"
   - Customize email templates if needed

2. **Enable Password Reset**:
   - Ensure "Enable email confirmations" is checked
   - Configure "Reset password" email template

3. **Set Site URL**:
   - Add your domain: `https://yourdomain.com`
   - For development: `http://localhost:5173`

### 3. Environment Variables

Update your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 Database Schema Overview

### Core Tables Created:

1. **warehouses** - Warehouse locations (hardcoded in frontend)
2. **users** - User profiles with suite numbers (VC-001, VC-002, etc.)
3. **addresses** - User shipping addresses
4. **packages** - Package tracking with simple status flow
5. **shipments** - Consolidated shipments
6. **notifications** - User notifications
7. **user_preferences** - User settings and preferences

### Key Features:

- **Automatic Suite Numbers**: Users get unique VC-### numbers
- **Simple Status Flow**: pending → received → processing → shipped → delivered
- **Admin Controls**: Admins can update package status
- **Real-time Sync**: Status changes sync instantly to client app
- **Email Flows**: Registration confirmation, password reset
- **Secure Access**: Row Level Security for data protection

## 🔐 Authentication Flows

### Registration Flow:
1. User registers → Email confirmation sent
2. User confirms email → Account activated
3. Auto-assigned suite number (VC-001, VC-002, etc.)
4. Default warehouse address created
5. User preferences initialized

### Password Reset Flow:
1. User clicks "Forgot Password"
2. Email sent with reset link
3. User sets new password
4. Redirected to login

### Admin Features:
- Update package status
- View all packages
- Manage users
- System notifications

## 🎯 Frontend Integration

Your existing frontend components will work with these endpoints:

- **Authentication**: Login, Register, Password Reset
- **Dashboard**: User profile, suite number display
- **Package Tracking**: Real-time status updates
- **Settings**: User preferences, account management
- **Notifications**: In-app notifications

## 📱 Real-time Features

Supabase Realtime is enabled for:
- Package status updates
- New notifications
- Shipment tracking changes

## 🛡️ Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Admins have elevated permissions
- Secure function execution with SECURITY DEFINER

## 🚨 Important Notes

1. **No Complex Triggers**: Simple, error-free functions only
2. **No Capacity Management**: Warehouses are hardcoded in frontend
3. **Simple Tracking**: Just tracking number + status
4. **Admin Updates**: Status changes sync to client app instantly
5. **Suite Numbers**: Unique VC-### format for warehouse identification

## ✅ Testing

After setup, test these features:
1. User registration with email confirmation
2. Password reset flow
3. Package creation and status updates
4. Real-time notifications
5. Admin status changes

Your database is now ready for production use with all authentication flows, package tracking, and admin functionality!
