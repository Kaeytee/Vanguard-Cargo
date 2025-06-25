# Ttarius Logistics - Client App Backend Requirements

## Overview

This document provides comprehensive information for backend developers to design and implement the necessary API endpoints and database structures to support the Ttarius Logistics client application. The frontend is built with React, TypeScript, and Vite, following clean code architecture and object-oriented programming principles.

## Table of Contents

1. [User Authentication & Management](#user-authentication--management)
2. [Client Information Management](#client-information-management)
3. [Shipment Management](#shipment-management)
4. [Package Tracking](#package-tracking)
5. [Settings & Preferences](#settings--preferences)
6. [Notifications](#notifications)
7. [Data Models](#data-models)
8. [API Endpoints](#api-endpoints)
9. [Security Requirements](#security-requirements)

## User Authentication & Management

The application requires a robust authentication system with the following features:

- User registration with email verification
- Login with email/password
- Password reset functionality
- Session management (JWT recommended)
- Role-based access control (client, admin, etc.)
- Social login integration (optional)

### User Data Structure

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Client Information Management

The application collects and stores comprehensive client information during registration and allows updates through the account settings page:

### Key Features

- Auto-detection of country based on phone number input
- Validation of all client information fields
- Storage and retrieval of client profile data
- Profile image upload and management

### Client Data Structure

```typescript
interface ClientProfile {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Shipment Management

The application allows clients to create, track, and manage shipments:

### Key Features

- Multi-step shipment creation process
- Auto-population of client information in shipment forms
- Support for different package types and delivery methods
- Shipment status updates and history

### Shipment Data Structure

```typescript
interface Shipment {
  id: string;
  userId: string;
  
  // Client information
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientCity: string;
  clientState: string;
  clientZip: string;
  clientCountry: string;
  
  // Origin information
  originCountry: string;
  originCity: string;
  originAddress: string;
  originState: string;
  originContactName: string;
  
  // Recipient information
  recipientName: string;
  recipientAddress: string;
  recipientContact: string;
  recipientEmail: string;
  recipientPhone: string;
  recipientCity: string;
  recipientState: string;
  recipientZip: string;
  recipientCountry: string;
  recipientId?: string;
  
  // Package information
  freightType: string;
  packageType: string;
  packageCategory: string;
  packageDescription: string;
  packageNote: string;
  packageValue: string;
  packageWeight: string;
  
  // Tracking information
  trackingNumber: string;
  status: ShipmentStatus;
  estimatedDelivery?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

enum ShipmentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned'
}
```

## Package Tracking

The application provides real-time tracking of packages:

### Key Features

- Tracking by tracking number
- Detailed shipment status history
- Estimated delivery dates
- Delivery confirmation

### Tracking Data Structure

```typescript
interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  location: string;
  timestamp: Date;
  description: string;
  updatedBy: string;
}
```

## Settings & Preferences

The application allows clients to manage their account settings and preferences:

### Key Features

- Profile information management
- Notification preferences
- Security settings (password change, etc.)
- Account deletion

## Notifications

The application sends notifications to clients about their shipments:

### Key Features

- Email notifications for shipment status updates
- Optional SMS notifications
- In-app notifications

### Notification Data Structure

```typescript
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityId?: string; // e.g., shipmentId
  createdAt: Date;
}

enum NotificationType {
  SHIPMENT_STATUS = 'shipment_status',
  ACCOUNT = 'account',
  SYSTEM = 'system'
}
```

## Data Models

### Core Models

1. **User** - Authentication and basic user information
2. **ClientProfile** - Detailed client information
3. **Shipment** - Shipment details and status
4. **TrackingEvent** - Shipment tracking history
5. **Notification** - User notifications

### Supporting Models

1. **DeliveryType** - Types of delivery services
   ```typescript
   const DELIVERY_TYPES = [
     { id: "ground", label: "Ground" },
     { id: "air", label: "Air" },
     { id: "sea", label: "Sea" },
     { id: "express", label: "Express" }
   ];
   ```

2. **PackageType** - Types of packages
   ```typescript
   const PACKAGE_TYPES = [
     { id: "box", label: "Box" },
     { id: "envelope", label: "Envelope" },
     { id: "pallet", label: "Pallet" },
     { id: "tube", label: "Tube" }
   ];
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user information

### Client Profile

- `GET /api/profile` - Get client profile
- `PUT /api/profile` - Update client profile
- `POST /api/profile/image` - Upload profile image

### Shipments

- `POST /api/shipments` - Create a new shipment
- `GET /api/shipments` - Get all shipments for the current user
- `GET /api/shipments/:id` - Get a specific shipment
- `PUT /api/shipments/:id` - Update a shipment (admin only)
- `DELETE /api/shipments/:id` - Cancel a shipment

### Tracking

- `GET /api/tracking/:trackingNumber` - Get tracking information by tracking number
- `GET /api/shipments/:id/tracking` - Get tracking history for a shipment

### Notifications

- `GET /api/notifications` - Get all notifications for the current user
- `PUT /api/notifications/:id/read` - Mark a notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

### Settings

- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## Security Requirements

1. **Authentication**
   - JWT-based authentication
   - Token expiration and refresh mechanism
   - HTTPS for all API communications

2. **Data Protection**
   - Encryption of sensitive data
   - Password hashing (bcrypt recommended)
   - Input validation and sanitization

3. **Access Control**
   - Role-based access control
   - Resource ownership validation
   - Rate limiting for API endpoints

4. **Compliance**
   - GDPR compliance for EU users
   - Data retention policies
   - Privacy policy implementation

## Implementation Notes

1. **Database**
   - Recommend using PostgreSQL or MongoDB
   - Implement proper indexing for performance
   - Consider data partitioning for large datasets

2. **API Design**
   - RESTful API design principles
   - Consistent error handling and status codes
   - Comprehensive API documentation (Swagger/OpenAPI)

3. **Integration**
   - The frontend currently uses localStorage for data persistence
   - Replace with proper API calls to the backend
   - Implement proper error handling and loading states

4. **Deployment**
   - Support for containerization (Docker)
   - CI/CD pipeline integration
   - Environment-specific configuration

## Special Features

### Phone Number to Country Auto-Detection

The frontend implements automatic country selection based on phone number input using `libphonenumber-js`. The backend should:

1. Validate that phone numbers match their specified countries
2. Support international phone number formats
3. Provide country code lookup functionality if needed

### Client Information Auto-Population

The application collects client information during registration and uses it throughout the application. The backend should:

1. Store comprehensive client profiles
2. Provide efficient retrieval of client information
3. Support partial updates to client profiles

## Testing Requirements

1. Unit tests for all API endpoints
2. Integration tests for complex workflows
3. Performance testing for high-traffic endpoints
4. Security testing (authentication, authorization, data protection)

## Documentation

1. API documentation with examples
2. Database schema documentation
3. Authentication flow documentation
4. Deployment instructions

---

This document provides a comprehensive overview of the backend requirements for the Ttarius Logistics client application. For any questions or clarifications, please contact the frontend development team.

Last Updated: June 25, 2025
