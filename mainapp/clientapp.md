# Ttarius Logistics - Client App Backend Requirements

## Overview

This document provides comprehensive backend API requirements for the **Ttarius Logistics Client Application**. This is a **cross-platform system** where:

- **`mainapp/` directory**: Contains the client-side React/TypeScript application with Vite and Vitest
- **Backend**: Spring Boot REST API with PostgreSQL database
- **Multiple frontends**: Client app, warehouse admin panel, super-admin dashboard

The client application is built with React, TypeScript, Vite, and Vitest for testing, following clean code architecture and object-oriented programming principles.

**Note**: This document focuses on system architecture, data flow, and business logic rather than implementation details.

## System Architecture

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Client App        │    │   Warehouse Admin   │    │   Super Admin       │
│   (mainapp/)        │    │   (separate)        │    │   (separate)        │
│   - React/TS/Vite   │    │   - Admin Dashboard │    │   - System Control  │
│   - Vitest Testing  │    │   - Request mgmt    │    │   - User management │
│   - User requests   │    │   - Staff mgmt      │    │   - Role control    │
│   - Tracking        │    │   - Multi-role      │    │   - Analytics       │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
           │                           │                           │
           └───────────────────────────┼───────────────────────────┘
                                      │
                              ┌───────▼────────┐
                              │  Spring Boot   │
                              │  REST API      │
                              │  + Security    │
                              └────────────────┘
                                      │
                              ┌───────▼────────┐
                              │  PostgreSQL    │
                              │   Database     │
                              └────────────────┘
```

## Technology Stack

### Backend (Spring Boot)
- Spring Boot with Web, Security, Data JPA, and Validation
- PostgreSQL database with UUID primary keys
- JWT authentication and authorization
- RESTful API design
- Bean validation for input validation
- CORS configuration for frontend integration

### Frontend Applications
- **Client App**: React/TypeScript/Vite/Vitest (mainapp/)
- **Warehouse Admin**: Separate frontend (technology TBD)
- **Super Admin**: Separate frontend (technology TBD)

## Table of Contents

1. [Role Hierarchy & Access Control](#role-hierarchy--access-control)
2. [Application Workflow](#application-workflow)
3. [Data Models & Structure](#data-models--structure)
4. [API Endpoint Structure](#api-endpoint-structure)
5. [Security & Authentication](#security--authentication)
6. [Database Design](#database-design)
7. [Cross-Platform Integration](#cross-platform-integration)

## Role Hierarchy & Access Control

### Role Structure
```
Super Admin (System Controller)
├── Can manage all warehouse admins
├── Can create/remove warehouse users
├── System-wide analytics and control
├── Database management
└── Platform configuration

Warehouse Admin (Departmental Management)
├── Workers (Package handlers, drivers, etc.)
├── Managers (Department heads, supervisors)
├── HR (Human resources staff)
├── Custom roles (To be defined)
└── Can create/manage subordinate roles

Client (End Users)
├── Submit package requests
├── Track packages
├── Manage profile
└── View personal data only
```

### Access Control Matrix
| Role | Client Data | Package Requests | User Management | System Config |
|------|-------------|------------------|-----------------|---------------|
| CLIENT | Own only | Own only | None | None |
| WORKER | Assigned only | Assigned only | None | None |
| MANAGER | Department | Department | Team only | None |
| HR | All clients | All requests | Staff only | None |
| WAREHOUSE_ADMIN | All | All | All warehouse | Department |
| SUPER_ADMIN | All | All | All users | Full system |

## Application Workflow

### User Journey (Client App)
1. **Registration** → User creates account with complete profile
2. **Login Redirect** → After registration, redirect to login
3. **Dashboard Access** → After login, user accesses dashboard
4. **Request Submission** → User submits package requests (minimal data)
5. **Request Tracking** → User tracks request status

### Data Flow Process
```
Client App (mainapp/) ──────► Spring Boot API ──────► Warehouse Dashboard
     │                           │                       │
     │ Submit requests            │ Store data            │ Process requests
     │ Track status              │ Manage users          │ Update status
     │ Update profile            │ Handle auth           │ Add notes
     └─────────────────────────────────────────────────────┘
                    Status updates flow back
```

## Data Models & Structure

### User Data Structure
- **Basic Info**: ID, name, email, phone, address details
- **Authentication**: Password hash, email verification status
- **Role Management**: Role assignment, department, manager hierarchy
- **Audit Fields**: Created date, updated date, created by

### Package Request Structure
- **Request Info**: ID, request number, user reference
- **Origin Details**: Country and city (user-selected)
- **Package Details**: Delivery type, package type, category, description
- **Status Management**: Current status, assigned staff, processing notes
- **Timestamps**: Created, updated, processed dates

### Package Types (Only 2 Options)
- **DOCUMENT**: Papers, contracts, certificates, legal documents
- **NON_DOCUMENT**: Physical items, goods, products, packages

### Delivery Types
- **GROUND**: Standard ground transportation
- **AIR**: Air freight shipping
- **SEA**: Sea freight shipping  
- **EXPRESS**: Express delivery service

### Request Status Flow
1. **SUBMITTED**: Initial request submission
2. **UNDER_REVIEW**: Warehouse reviewing request
3. **PROCESSING**: Request being processed
4. **READY_FOR_PICKUP**: Package ready for collection
5. **COMPLETED**: Request fulfilled
6. **CANCELLED**: Request cancelled

## API Endpoint Structure

### Client App Endpoints
```
Authentication:
POST /api/client/auth/register     # Register new client
POST /api/client/auth/login        # Client login
GET  /api/client/auth/me          # Get current client info

Profile Management:
GET  /api/client/profile          # Get client profile
PUT  /api/client/profile          # Update client profile

Package Requests:
POST /api/client/requests         # Submit new request
GET  /api/client/requests         # Get user's requests
GET  /api/client/requests/{id}    # Get specific request
GET  /api/client/requests/{id}/track # Track request status
```

### Warehouse Admin Endpoints
```
Request Management:
GET  /api/warehouse/requests              # All requests with client info
PUT  /api/warehouse/requests/{id}/status  # Update request status
PUT  /api/warehouse/requests/{id}/assign  # Assign to staff
POST /api/warehouse/requests/{id}/notes   # Add processing notes

Staff Management:
POST /api/warehouse/staff                 # Create staff member
GET  /api/warehouse/staff                 # Get department staff
PUT  /api/warehouse/staff/{id}           # Update staff info
DELETE /api/warehouse/staff/{id}         # Remove staff member
```

### Super Admin Endpoints
```
System-wide User Management:
POST /api/super-admin/warehouse-admin    # Create warehouse admin
GET  /api/super-admin/users             # All system users
PUT  /api/super-admin/users/{id}/role   # Change user role
DELETE /api/super-admin/users/{id}      # Remove any user

System Management:
GET  /api/super-admin/analytics         # System-wide analytics
GET  /api/super-admin/audit-logs        # System audit logs
```

## Security & Authentication

### JWT Token Structure
- **User ID**: Unique identifier
- **Email**: User email address
- **Role**: User role for authorization
- **Expiration**: Token validity period

### Role-Based Access Control
- **Method-level security**: @PreAuthorize annotations
- **Endpoint-level security**: URL pattern matching
- **Resource ownership**: Users can only access own data
- **Hierarchical permissions**: Higher roles inherit lower role permissions

### CORS Configuration
- **Allowed Origins**: React dev server (localhost:5173), production domains
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: All headers for development
- **Credentials**: Enabled for JWT token handling

## Database Design

### Core Tables Structure

#### Users Table
- **Primary Key**: UUID
- **Unique Constraints**: Email
- **Indexes**: Email, role, manager_id, created_at
- **Foreign Keys**: Self-referencing for manager hierarchy

#### Package Requests Table  
- **Primary Key**: UUID
- **Foreign Keys**: User ID, assigned warehouse staff
- **Unique Constraints**: Request number
- **Indexes**: User ID, status, assigned staff, created_at

#### Request Status History Table
- **Primary Key**: UUID
- **Foreign Keys**: Request ID, updated by user
- **Indexes**: Request ID, timestamp
- **Purpose**: Track status changes over time

### Data Normalization Strategy
- **No data duplication**: Client info stored once in users table
- **Efficient joins**: Warehouse sees complete info via JOIN operations
- **Storage optimization**: Only unique request data stored per request
- **Referential integrity**: Foreign key constraints maintain data consistency

## Cross-Platform Integration

### Client App Data Access (Restricted)
- **Own data only**: Users can only see their own requests
- **JWT validation**: Token-based authentication required
- **Resource filtering**: Backend filters by user ID from token
- **Pre-filled forms**: Profile data auto-populates contact information

### Warehouse Admin Data Access (Full Access)
- **Complete request view**: All requests with client info via JOIN
- **Assignment capabilities**: Can assign requests to staff members
- **Status management**: Can update request status and add notes
- **Department filtering**: Can filter by department or staff member

### Super Admin Data Access (System Control)
- **User management**: Create/remove warehouse admins and staff
- **System analytics**: View system-wide performance metrics
- **Audit capabilities**: Access to all system logs and activities
- **Configuration control**: Manage system settings and permissions

## Request Submission Logic

### Client Submits (Minimal Data)
```
Request Payload:
- Origin country and city
- Delivery type (Ground/Air/Sea/Express)
- Package type (Document/Non-Document)
- Package category (optional)
- Package description
- User ID (from JWT token)
```

### Warehouse Views (Complete Data)
```
Response with JOIN:
- All request details
- Complete client profile information
- Request status history
- Assignment information
- Processing notes
```

### Data Efficiency Benefits
- **65% storage savings**: No duplicated client information
- **Consistent data**: Single source of truth for client profiles
- **Real-time updates**: Profile changes reflect immediately
- **Simplified maintenance**: Update client info in one place

---

## Summary: System Architecture & Logic

✅ **Cross-Platform Design**: Client app + Warehouse admin + Super admin
✅ **Role-Based Hierarchy**: Super Admin > Warehouse Admin > (Workers, Managers, HR)
✅ **Efficient Data Flow**: Minimal submission, complete retrieval via JOINs
✅ **Package Types**: Only Document and Non-Document options
✅ **Spring Boot Backend**: RESTful API with JWT security
✅ **PostgreSQL Database**: Normalized design with UUID keys
✅ **Authentication Flow**: Registration → Login → Dashboard → Requests
✅ **Status Tracking**: Complete lifecycle from submission to completion

**Key Business Logic**:
- Clients submit minimal data (origin + package details)
- Backend stores normalized data with user references
- Warehouse accesses complete information via database JOINs
- Super admins control entire system and user hierarchy
- Package types limited to Document/Non-Document for simplicity

Last Updated: June 28, 2025