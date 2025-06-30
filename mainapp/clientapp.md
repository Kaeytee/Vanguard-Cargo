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
8. [Cross-Border Warehouse Communication](#cross-border-warehouse-communication)
9. [Package Processing Workflow & WhatsApp Business Integration](#package-processing-workflow--whatsapp-business-integration)
10. [Customer Account Status Management](#customer-account-status-management)
9. [Customer Account Status Management](#customer-account-status-management)

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

### Delivery Types (Air Freight Primary)
- **AIR**: International air freight shipping (PRIMARY SERVICE - currently operational)
- **GROUND**: Cross-border ground transportation (future expansion)
- **SEA**: International sea freight shipping (future expansion)
- **EXPRESS**: Premium express international delivery (future expansion)

### Pure International Logistics Model
**Ttarius Logistics operates exclusively as an international logistics company:**
- **No Domestic Services**: No deliveries within the same country
- **Cross-Border Only**: All packages move between different countries
- **Current Operations**: Ghana ↔ USA routes exclusively
- **Business Focus**: International package logistics and cross-border coordination

### Origin Country Selection Logic (Critical UI Rule)
**Client Country Restriction Implementation:**
- **Ghana Clients**: Can ONLY select non-Ghana countries as origin (USA, future countries)
- **USA Clients**: Can ONLY select non-USA countries as origin (Ghana, future countries)
- **UI Enforcement**: Client's own country must be disabled/hidden in origin country dropdown

**Frontend Implementation Logic:**
```
Origin Country Dropdown Logic:
IF user.country === "Ghana" 
  THEN availableOrigins = ["USA", ...futureCountries] (Ghana excluded)
IF user.country === "USA" 
  THEN availableOrigins = ["Ghana", ...futureCountries] (USA excluded)

Validation Rule:
selectedOriginCountry !== user.country (enforced at form submission)
```

**Business Justification:**
- Prevents impossible domestic requests that don't align with business model
- Ensures all requests are international by design
- Reduces user confusion about service offerings
- Enforces cross-border logistics business focus

### Request Status Flow (Aligned with Warehouse System)

**Client App Displays (Simplified View):**
1. **SUBMITTED**: Request submitted and received by warehouse
2. **UNDER_REVIEW**: Warehouse reviewing and processing request  
3. **PROCESSING**: Package being processed in warehouse (multiple internal stages)
4. **READY_FOR_PICKUP**: Package ready for collection/shipment
5. **COMPLETED**: Package delivered to destination

**Status Mapping from Warehouse System:**
```
Warehouse Internal Status    →    Client App Display
AWAITING_PICKUP             →    UNDER_REVIEW
RECEIVED                    →    PROCESSING  
PROCESSING                  →    PROCESSING
PROCESSED                   →    PROCESSING
GROUPED                     →    READY_FOR_PICKUP
SHIPPED                     →    READY_FOR_PICKUP
IN_TRANSIT                  →    READY_FOR_PICKUP
DELIVERED                   →    COMPLETED
EXCEPTION                   →    PROCESSING (with notes)
```

**Note**: The client app shows a simplified 5-status view while the warehouse system manages 8 detailed internal statuses. This provides clients with clear progress updates without overwhelming them with operational details.

## API Endpoint Structure

### Client App Endpoints (International Focus)
```
Authentication:
POST /api/client/auth/register     # Register new client
POST /api/client/auth/login        # Client login
GET  /api/client/auth/me          # Get current client info

Profile Management:
GET  /api/client/profile          # Get client profile
PUT  /api/client/profile          # Update client profile

International Package Requests:
POST /api/client/requests         # Submit new international request
GET  /api/client/requests         # Get user's international requests
GET  /api/client/requests/{id}    # Get specific international request
GET  /api/client/requests/{id}/track # Track international request status

Origin Country Validation:
GET  /api/client/countries/available  # Get available origin countries for current client
POST /api/client/requests/validate   # Validate international request before submission
GET  /api/client/routes/supported     # Get supported international shipping routes
```

### International Request Validation Endpoints
```
Backend Validation Logic for International Requests:

GET /api/client/countries/available:
- Returns list of countries client can select as origin
- Excludes client's own country
- Example: Ghana client gets ["USA", "Nigeria", "UK"] (Ghana excluded)

POST /api/client/requests/validate:
- Validates origin country ≠ client country
- Confirms international route is supported
- Checks service availability for selected route

POST /api/client/requests (Submit Request):
- Enforces origin country ≠ client country at API level
- Returns error if domestic request attempted
- Creates international package request only
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

## Cross-Border Warehouse Communication (Pure International Logistics)

### Multi-Country Warehouse Architecture

```
Ghana Warehouse System ←──────────────→ USA Warehouse System
        │                                       │
        │ ← Real-time API Communication →       │
        │                                       │
    ┌───▼────┐                             ┌───▼────┐
    │ Ghana  │ ←─── Shared Database ────→  │  USA   │
    │   DB   │        Cluster             │   DB   │
    └────────┘                             └────────┘
```

### International Package Flow Logic

#### Scenario 1: Ghana Client → USA Package → Ghana Warehouse Pickup

1. **Client Request (Ghana)**
   ```
   Ghana Client submits international request:
   - Origin: USA (only option for Ghana clients)
   - Destination: Ghana (automatically derived from client country)
   - Package Type: Document/Non-Document
   - Delivery Type: Air (primary service)
   - Pickup Location: Ttarius Warehouse - Accra, Ghana
   ```

2. **International Request Processing Flow**
   ```
   Ghana System ──► USA System ──► Ghana System
        │              │              │
     Receives        Processes      Receives
     Request         Package        International
     Routes to USA   at Origin      Shipment for
                                   Warehouse Pickup
   ```

#### Scenario 2: USA Client → Ghana Package → USA Warehouse Pickup

1. **Client Request (USA)**
   ```
   USA Client submits international request:
   - Origin: Ghana (only option for USA clients)
   - Destination: USA (automatically derived from client country)
   - Package Type: Document/Non-Document
   - Delivery Type: Air (primary service)
   - Pickup Location: Ttarius Warehouse - [USA Location]
   ```

2. **International Request Processing Flow**
   ```
   USA System ──► Ghana System ──► USA System
        │              │              │
     Receives        Processes      Receives
     Request         Package        International
     Routes to Ghana at Origin      Shipment for
                                   Warehouse Pickup
     Routes to Ghana at Origin      Shipment
   ```

2. **Request Processing Flow**
   ```
   Ghana System ──► USA System ──► Ghana System
        │              │              │
     Receives        Processes      Delivers
     Request         Package        Package
   ```

3. **System Communication Protocol**
   ```
   POST /api/international/transfer-request
   {
     "requestId": "REQ-GH-001",
     "originCountry": "USA",
     "originWarehouse": "USA-NY-001",
     "destinationCountry": "GHA", 
     "destinationWarehouse": "GHA-AC-001",
     "clientInfo": { /* Complete client data */ },
     "packageDetails": { /* Package information */ }
   }
   ```

### Database Synchronization Strategy

#### Master-Slave Replication
```
Primary Database (Ghana) ←──── Bidirectional Sync ────→ Secondary Database (USA)
         │                                                      │
    All client data                                      Package processing data
    Request management                                   Local warehouse operations
    Final delivery status                                Origin country operations
```

#### Data Distribution Logic
```typescript
// Request data flows
interface CrossBorderRequest {
  // Stored in BOTH databases
  globalRequestId: string;
  clientCountry: "GHA" | "USA";
  originCountry: "GHA" | "USA";
  destinationCountry: "GHA" | "USA";
  
  // Replicated data
  clientInfo: ClientData;
  packageDetails: PackageData;
  statusHistory: StatusEntry[];
  
  // Country-specific data
  localWarehouseId: string;
  localStaffAssignment: string;
  localProcessingNotes: string[];
}
```

### API Communication Endpoints

#### Ghana-to-USA Communication
```
// Ghana system calls USA system
POST /api/usa/warehouse/receive-international-request
PUT  /api/usa/warehouse/requests/{id}/status-update
GET  /api/usa/warehouse/requests/{id}/processing-status
POST /api/usa/warehouse/requests/{id}/ready-for-shipment
```

#### USA-to-Ghana Communication  
```
// USA system calls Ghana system
POST /api/ghana/warehouse/package-ready-for-shipment
PUT  /api/ghana/warehouse/requests/{id}/in-transit-update  
POST /api/ghana/warehouse/requests/{id}/arrived-in-ghana
PUT  /api/ghana/warehouse/requests/{id}/delivery-status
```

### Real-Time Communication Protocol

#### WebSocket Connections
```
Ghana Warehouse ←─── WebSocket Channel ───→ USA Warehouse
      │                                          │
Status updates                            Status updates
Package movements                         Package movements
Client notifications                      Processing updates
```

#### Event Broadcasting System
```typescript
// Cross-border events
enum InternationalEvents {
  PACKAGE_RECEIVED_AT_ORIGIN = 'package_received_at_origin',
  PACKAGE_PROCESSED_USA = 'package_processed_usa',
  PACKAGE_SHIPPED_TO_GHANA = 'package_shipped_to_ghana',
  PACKAGE_ARRIVED_IN_GHANA = 'package_arrived_ghana',
  PACKAGE_READY_FOR_PICKUP = 'package_ready_for_pickup',
  PACKAGE_DELIVERED = 'package_delivered'
}

// Event payload structure
interface InternationalEventPayload {
  requestId: string;
  event: InternationalEvents;
  timestamp: string;
  originWarehouse: string;
  destinationWarehouse: string;
  statusData: StatusUpdateData;
  clientNotification: NotificationData;
}
```

### Status Synchronization Logic

#### Unified Status Flow
```
1. SUBMITTED (Ghana) → Synced to USA
2. RECEIVED_AT_ORIGIN (USA) → Synced to Ghana
3. PROCESSING_USA (USA) → Synced to Ghana  
4. READY_FOR_SHIPMENT (USA) → Synced to Ghana
5. IN_TRANSIT_TO_GHANA (USA) → Synced to Ghana
6. ARRIVED_IN_GHANA (Ghana) → Final processing
7. READY_FOR_PICKUP (Ghana) → Client notified for warehouse pickup
8. DELIVERED (Ghana) → Request completed
```

#### Status Update API Calls
```typescript
// Automatic status synchronization
class CrossBorderStatusService {
  
  async updateStatus(requestId: string, newStatus: RequestStatus) {
    // Update local database
    await this.localDB.updateRequestStatus(requestId, newStatus);
    
    // Sync with partner warehouse
    const partnerCountry = this.getPartnerCountry(requestId);
    await this.syncWithPartner(partnerCountry, requestId, newStatus);
    
    // Notify client (from primary country)
    await this.notifyClient(requestId, newStatus);
  }
  
  private async syncWithPartner(country: string, requestId: string, status: RequestStatus) {
    const endpoint = country === 'USA' 
      ? '/api/usa/warehouse/sync-status'
      : '/api/ghana/warehouse/sync-status';
      
    return await this.httpClient.put(endpoint, {
      requestId,
      status,
      timestamp: new Date().toISOString(),
      syncSource: this.currentCountry
    });
  }
}
```

## Package Processing Workflow & WhatsApp Business Integration

### Status Flow with Automatic Progression (Aligned with Warehouse)

The system uses the warehouse's comprehensive status system but displays a simplified view to clients:

**Internal Warehouse Statuses (8 stages):**
```
AWAITING_PICKUP → RECEIVED → PROCESSING → PROCESSED → GROUPED → SHIPPED → IN_TRANSIT → DELIVERED
```

**Client App Display (5 simplified stages):**
```
SUBMITTED → UNDER_REVIEW → PROCESSING → READY_FOR_PICKUP → COMPLETED
```

### Processing Stages Logic

#### Stage 1: Initial Processing (AWAITING_PICKUP → RECEIVED)
**Client Sees**: UNDER_REVIEW → PROCESSING
**Trigger**: Warehouse staff completes initial processing with required data
**Required Data**:
- Package weight (kg)
- Package dimensions (length × width × height)
- Package condition assessment (EXCELLENT/GOOD/FAIR/DAMAGED)
- **Up to 3 photos** of the package
- Processing notes (optional)

**Automatic Action**: Warehouse status changes from AWAITING_PICKUP to RECEIVED
**Client Status**: Changes from UNDER_REVIEW to PROCESSING
**Notifications Sent**: WhatsApp + Email + SMS + Push notification to client

#### Stage 2: Warehouse Processing (RECEIVED → PROCESSING → PROCESSED)
**Client Sees**: PROCESSING (no change - internal warehouse stages)
**Trigger**: Warehouse staff processes package through internal stages
**Internal Actions**: Package inspection, labeling, preparation for shipment
**Client Experience**: Continues to see PROCESSING status

#### Stage 3: Shipment Preparation (PROCESSED → GROUPED → SHIPPED)
**Client Sees**: PROCESSING → READY_FOR_PICKUP
**Trigger**: Package grouped into shipment and dispatched
**Required Data**:
- Shipping method selection (Air/Sea/Ground/Express)
- Tracking number generation
- **Up to 3 dispatch photos**
- Estimated pickup availability timeframe

**Automatic Action**: Warehouse progresses through PROCESSED → GROUPED → SHIPPED
**Client Status**: Changes from PROCESSING to READY_FOR_PICKUP
**Notifications Sent**: Multi-channel notifications with tracking details

#### Stage 4: Final Warehouse Arrival (IN_TRANSIT → DELIVERED)
**Client Sees**: READY_FOR_PICKUP → COMPLETED
**Trigger**: Package arrives at local warehouse and is ready for customer pickup
**Required Data**:
- Pickup ready confirmation
- Warehouse address and pickup hours
- **Up to 3 arrival photos**
- Arrival timestamp and warehouse location

**Automatic Action**: Status changes from IN_TRANSIT to DELIVERED
**Client Status**: Changes from READY_FOR_PICKUP to COMPLETED
**Notifications Sent**: Pickup ready notification across all channels

### WhatsApp Business API Integration

#### WhatsApp Business Setup Requirements
- **WhatsApp Business Account**: Verified business account with Facebook
- **WhatsApp Business API Access**: Official API access for automated messaging
- **Message Templates**: Pre-approved templates for different status updates
- **Phone Number Verification**: Clients must provide valid WhatsApp numbers
- **Webhook Configuration**: For delivery status and read receipts

#### Message Template Structure
Each status change triggers a WhatsApp message with:
- **Header**: Package/shipment image (when available)
- **Body**: Personalized message with status details
- **Footer**: Ttarius Logistics branding
- **Action Buttons**: Quick reply options (Track Package, Contact Support)

#### Sample Message Templates

**PROCESSING Status Template (when warehouse receives package)**:
```
Hello [Client Name],

✅ Your package [Package ID] is now being PROCESSED!

📦 Processing Details:
Weight: [X]kg
Dimensions: [L×W×H]cm
Condition: [EXCELLENT/GOOD/FAIR]

📸 Photos taken for documentation
Next: Preparing for shipment

Track: [Tracking URL]
```

**READY_FOR_PICKUP Status Template (when package shipped)**:
```
Hello [Client Name],

🚚 Your package [Package ID] is READY FOR PICKUP!

🚛 Shipping Details:
Method: [Air/Sea/Ground/Express]
Tracking: [Tracking Number]
Estimated Pickup Ready: [X] days

Track: [Tracking URL]
```

### Package Grouping & Shipment Management

#### Intelligent Package Grouping Logic
Warehouse admins can group multiple packages into a single shipment based on:
- **Destination Country/Region**: Packages going to same area
- **Shipping Method**: Same shipping method (Air/Sea/Ground)
- **Priority Level**: Express vs standard shipping
- **Size/Weight Constraints**: Optimal container/vehicle capacity
- **Departure Schedule**: Packages ready for same departure date

#### Shipment Group Creation Process
1. **Selection**: Admin selects packages with status PROCESSED (internal warehouse status)
2. **Grouping**: System suggests optimal groupings based on criteria above
3. **Validation**: Admin reviews and confirms shipment groups
4. **ID Assignment**: Each package gets assigned same shipment ID (SHIP-GH-2025-001)
5. **Status Update**: All packages in group move from PROCESSING to READY_FOR_PICKUP simultaneously

#### Cascading Status Updates
When a shipment status changes, **ALL packages in that shipment are affected**:

**Example**: Shipment SHIP-GH-2025-001 contains packages PKG-001, PKG-002, PKG-003
- Admin updates shipment status to "DELIVERED"
- System automatically updates all 3 packages to COMPLETED status (client view)
- Notifications sent to all 3 clients simultaneously
- Each client receives personalized message about their specific package

### Multi-Channel Notification System

#### Notification Channels Configuration
For each status update, the system sends notifications via:
1. **WhatsApp Business API**: Rich messages with images and action buttons
2. **Email**: Detailed status report with package photos and tracking info
3. **SMS**: Short status update with tracking link
4. **Push Notifications**: Real-time alerts for mobile app users
5. **In-App Toast**: Live notifications for users browsing the website

#### Client Notification Preferences
Clients can configure which channels they want to receive notifications on:
- **All Channels**: Maximum communication (default)
- **WhatsApp + Email**: Primary channels only
- **SMS Only**: Minimal communication
- **Custom**: Client selects specific channels for different status types

#### Notification Failure Handling
- **Retry Logic**: Failed notifications are retried with exponential backoff
- **Channel Fallback**: If WhatsApp fails, system falls back to SMS
- **Pickup Tracking**: System tracks which notifications were successfully delivered to customers about pickup readiness
- **Manual Resend**: Admins can manually resend failed notifications

### Integration Points for Development

#### API Endpoints for Processing
- `POST /api/warehouse/packages/{id}/process-received` - Complete initial processing
- `POST /api/warehouse/packages/{id}/dispatch` - Prepare for shipment
- `POST /api/warehouse/packages/{id}/mark-arrived` - Mark as arrived
- `POST /api/warehouse/packages/{id}/complete-delivery` - Complete delivery
- `POST /api/warehouse/shipments/create-group` - Create shipment group
- `PUT /api/warehouse/shipments/{id}/status` - Update shipment status

#### WhatsApp Business Integration Points
- Template management system for message formatting
- Webhook handlers for delivery status confirmation
- Phone number validation and WhatsApp availability checking
- Message queuing system for reliable delivery
- Error handling and retry mechanisms

#### Notification Service Architecture
- Multi-channel notification dispatcher
- Client preference management system
- Delivery tracking and confirmation system
- Template engine for personalized messages
- Audit logging for all sent notifications

---

## Customer Account Status Management

### Account Status Types

#### Primary Account Statuses
- **ACTIVE**: Full access to all system features - can submit requests, track packages, update profile
- **SUSPENDED**: Temporary restriction - cannot submit new requests but can track existing packages
- **RESTRICTED**: Limited access - can only view existing requests, cannot create new ones or update profile
- **BANNED**: Complete access denial - cannot login or access any system features
- **PENDING_VERIFICATION**: New account awaiting email/phone verification before full activation
- **DORMANT**: Inactive account (no activity for extended period) - requires reactivation

### Account Status Workflow

#### Status Implementation Process
1. **Admin Assessment**: Warehouse admin reviews client account and behavior
2. **Status Decision**: Admin selects appropriate status based on violation/issue type
3. **Implementation**: System immediately applies status restrictions
4. **Client Notification**: Multi-channel notification sent to inform client of status change
5. **Appeal Process**: Client can request status review through support channels

#### Status Change Authority Matrix
| Admin Role | Can Implement | Can Revoke | Scope |
|------------|---------------|------------|-------|
| WAREHOUSE_ADMIN | SUSPENDED, RESTRICTED | Own implementations | Department clients |
| SENIOR_ADMIN | All except BANNED | All except BANNED | Regional clients |
| SUPER_ADMIN | All statuses | All statuses | System-wide |
| HR_ADMIN | SUSPENDED, RESTRICTED | Own implementations | All clients |

### Account Status Effects

#### ACTIVE Status (Default)
**Access Level**: Full system access
**Capabilities**:
- Submit unlimited package requests
- Track all packages in real-time
- Update profile information
- Access customer support
- Receive all notification types
- Use mobile app features

**Implementation**: Default status for verified accounts
**Revocation**: Can be changed to any other status by authorized admin

#### SUSPENDED Status
**Access Level**: Read-only access to existing data
**Capabilities**:
- View existing package requests
- Track current packages
- Cannot submit new requests
- Cannot update profile
- Limited customer support access

**Typical Reasons for Implementation**:
- Late payment on multiple shipments
- Disputed package claims under investigation
- Temporary compliance issues
- Account security concerns

**Implementation Process**:
- Admin selects SUSPENDED status
- System blocks new request submissions
- Client receives suspension notification via WhatsApp/Email/SMS
- Suspension reason and duration communicated

**Revocation Process**:
- Issue resolution confirmation
- Admin reviews and approves reactivation
- Status changed back to ACTIVE
- Client receives reactivation notification

#### RESTRICTED Status
**Access Level**: View-only access
**Capabilities**:
- View existing requests (limited details)
- Basic package tracking
- Cannot submit new requests
- Cannot update any information
- No customer support access

**Typical Reasons for Implementation**:
- Multiple package delivery failures
- Fraudulent activity suspicions
- Terms of service violations
- Incomplete documentation issues

**Implementation Process**:
- Admin documents restriction reason
- System applies comprehensive access limitations
- Client receives detailed restriction notice
- Clear steps for restriction removal provided

#### BANNED Status
**Access Level**: Complete system lockout
**Capabilities**:
- Cannot login to system
- No access to any data
- No new request submissions
- No tracking capabilities
- All notifications disabled

**Typical Reasons for Implementation**:
- Confirmed fraudulent activities
- Severe terms of service violations
- Legal compliance requirements
- Security breach involvement

**Implementation Process** (SUPER_ADMIN only):
- Comprehensive investigation documentation required
- Senior management approval needed
- Legal team consultation (if applicable)
- Permanent account lockout implemented
- Client receives final notification with appeal process

**Revocation Process** (SUPER_ADMIN only):
- Legal clearance required
- Senior management approval
- Complete account audit performed
- New security measures implemented

#### PENDING_VERIFICATION Status
**Access Level**: Limited registration access
**Capabilities**:
- Cannot submit requests
- Cannot access full dashboard
- Limited to verification processes
- Basic profile completion only

**Automatic Implementation**:
- New account registration
- Email verification pending
- Phone number verification pending
- Identity verification incomplete

**Automatic Revocation**:
- Email verification completed
- Phone verification completed
- Identity documents approved
- Status automatically changes to ACTIVE

#### DORMANT Status
**Access Level**: Reactivation required
**Capabilities**:
- Cannot perform any actions
- Account data preserved
- Requires reactivation process
- Previous data remains accessible after reactivation

**Automatic Implementation Triggers**:
- No login activity for 12 months
- No package requests for 18 months
- No profile updates for 24 months
- Client request for account deactivation

**Reactivation Process**:
- Client attempts login
- System prompts for reactivation
- Identity verification required
- Security questions answered
- Status changed to ACTIVE

### Admin Implementation Interface Logic

#### Status Change Dashboard
**Implementation Screen Components**:
- Client account overview
- Current status display
- Available status options based on admin role
- Reason selection dropdown
- Custom reason text field
- Duration setting (for temporary restrictions)
- Notification preference selection
- Implementation confirmation dialog

#### Bulk Status Management
**Bulk Operations Available**:
- Suspend multiple accounts for payment issues
- Restrict accounts in specific geographic regions
- Reactivate dormant accounts in batches
- Apply verification requirements to account groups

**Bulk Implementation Process**:
- Admin selects multiple client accounts
- System validates admin authority for each account
- Uniform status and reason applied to all selected
- Batch notification system sends personalized messages
- Audit log created for each individual status change

### Account Status Notifications

#### Implementation Notification Templates

**SUSPENDED Status WhatsApp Template**:
```
Hello [Client Name],

⚠️ Your Ttarius Logistics account has been SUSPENDED

📋 Details:
Reason: [Suspension Reason]
Duration: [X days/Until resolved]
Effective: [Date/Time]

🔒 Current Limitations:
- Cannot submit new requests
- Can track existing packages
- Profile updates disabled

📞 Next Steps:
[Resolution steps based on reason]

Support: [Contact Information]
Reference: [Case ID]
```

**Status Revocation Notification**:
```
Hello [Client Name],

✅ Your Ttarius Logistics account has been REACTIVATED

🎉 Welcome back! Your account is now ACTIVE

✨ Restored Access:
- Submit new package requests
- Full tracking capabilities
- Profile management
- Customer support access

Thank you for resolving the previous issue.

Happy shipping! 📦
```

### Account Status Audit System

#### Comprehensive Logging Requirements
**Status Change Records Must Include**:
- Client account ID and details
- Previous status and new status
- Admin who made the change (with role)
- Exact timestamp of change
- Detailed reason for status change
- Duration (if temporary restriction)
- Resolution steps provided to client
- Notification delivery confirmation
- Client acknowledgment (if received)

#### Audit Trail Accessibility
**Super Admin Access**: Complete audit history for all accounts
**Warehouse Admin Access**: Own status changes and department clients only
**HR Admin Access**: All status changes with detailed reasons
**Legal Compliance**: Audit logs available for legal/regulatory requirements

#### Status Change Analytics
**Reporting Capabilities**:
- Number of accounts by status (daily/weekly/monthly)
- Status change frequency by admin
- Most common suspension/restriction reasons
- Average time to status resolution
- Client appeal success rates
- Geographic patterns in account issues

### Integration with Existing Systems

#### Cross-Border Account Status Sync
**Ghana-USA Status Synchronization**:
- Account status changes sync between both systems
- Client experiences consistent restrictions regardless of request origin
- Status changes in one country immediately reflect in partner country
- Audit logs maintained in both systems for compliance

#### Package Request Impact
**Status-Based Request Handling**:
- ACTIVE clients: Normal request processing
- SUSPENDED clients: Existing requests continue, new requests blocked
- RESTRICTED clients: Limited request visibility, no new submissions
- BANNED clients: All requests frozen, no processing continuation
- PENDING_VERIFICATION: No request processing until verification complete

#### WhatsApp Business Integration
**Status-Based Messaging**:
- ACTIVE clients: Receive all notification types
- SUSPENDED clients: Receive tracking updates only
- RESTRICTED clients: Receive critical updates only
- BANNED clients: No automated messages sent
- System automatically adjusts notification preferences based on account status

### Customer Appeal Process

#### Appeal Submission Methods
**Available Channels**:
- Email appeal to dedicated support address
- Phone call to customer service
- In-person visit to warehouse office
- Online appeal form (if account allows limited access)
- Third-party mediation (for banned accounts)

#### Appeal Processing Workflow
1. **Appeal Receipt**: Customer submits appeal with case details
2. **Initial Review**: Support team validates appeal legitimacy
3. **Investigation**: Detailed review of original status change reason
4. **Decision Making**: Admin review with senior management if needed
5. **Resolution Communication**: Client informed of appeal decision
6. **Status Update**: Account status changed if appeal approved
7. **Follow-up**: Monitoring period to ensure issue resolution

#### Appeal Decision Matrix
**Suspension Appeals**:
- Payment resolved: AUTOMATIC approval
- Dispute clarified: MANUAL review required
- Compliance met: AUTOMATIC approval
- Security cleared: MANUAL review with IT approval

**Restriction Appeals**:
- Documentation provided: MANUAL review
- Identity verified: AUTOMATIC approval
- Terms compliance: MANUAL review
- Process completion: AUTOMATIC approval

**Ban Appeals**:
- Legal clearance: SUPER_ADMIN review only
- Fraud investigation cleared: Senior management approval
- Security breach resolved: IT and legal approval
- Compliance violations addressed: Legal team approval

### API Endpoints for Account Status Management

#### Admin Status Management Endpoints
```
Status Implementation:
PUT /api/admin/clients/{id}/status          # Change client account status
POST /api/admin/clients/bulk-status         # Bulk status change operation
GET /api/admin/clients/{id}/status-history  # Get status change history

Status Monitoring:
GET /api/admin/clients/by-status/{status}   # Get clients by status
GET /api/admin/status-analytics             # Status change analytics
GET /api/admin/pending-appeals              # Get pending appeal requests

Appeal Management:
POST /api/admin/appeals/{id}/review         # Review and decide on appeal
GET /api/admin/appeals/history              # Appeal decision history
PUT /api/admin/appeals/{id}/status          # Update appeal status
```

#### Client Status Endpoints
```
Status Information:
GET /api/client/account/status              # Get own account status
POST /api/client/account/appeal             # Submit status appeal
GET /api/client/account/restrictions        # Get current restrictions

Reactivation:
POST /api/client/account/reactivate         # Request account reactivation
PUT /api/client/account/verify              # Complete verification process
GET /api/client/account/verification-status # Check verification progress
```

---

## Frontend Routing & Account Status Integration

### Account Status-Based Route Protection

The frontend must implement dynamic routing that responds to user account status changes in real-time. This ensures users only access features they're authorized to use based on their current account status.

#### Route Access Matrix by Account Status

| Route/Feature | ACTIVE | SUSPENDED | RESTRICTED | BANNED | PENDING_VERIFICATION | DORMANT |
|---------------|--------|-----------|------------|--------|---------------------|---------|
| `/dashboard` | ✅ Full | ✅ Limited | ✅ Read-only | ❌ Redirect | ❌ Redirect | ❌ Redirect |
| `/submit-request` | ✅ Yes | ❌ Block | ❌ Block | ❌ Block | ❌ Block | ❌ Block |
| `/track-packages` | ✅ All | ✅ Existing only | ✅ Basic view | ❌ Block | ❌ Block | ❌ Block |
| `/profile` | ✅ Edit | ❌ View only | ❌ View only | ❌ Block | ✅ Limited | ❌ Block |
| `/support` | ✅ Full | ✅ Limited | ❌ Block | ❌ Block | ✅ Yes | ❌ Block |
| `/verification` | ➖ N/A | ➖ N/A | ➖ N/A | ➖ N/A | ✅ Required | ➖ N/A |
| `/reactivation` | ➖ N/A | ➖ N/A | ➖ N/A | ➖ N/A | ➖ N/A | ✅ Required |
| `/appeal` | ➖ N/A | ✅ Yes | ✅ Yes | ✅ Limited | ➖ N/A | ➖ N/A |

### Frontend Route Guard Implementation

#### Protected Route Component Logic
```typescript
// Route protection based on account status
interface RouteGuardProps {
  children: React.ReactNode;
  requiredStatus?: AccountStatus[];
  fallbackRoute?: string;
  showStatusMessage?: boolean;
}

function ProtectedRoute({ 
  children, 
  requiredStatus = ['ACTIVE'], 
  fallbackRoute = '/account-restricted',
  showStatusMessage = true 
}: RouteGuardProps) {
  
  const { user, accountStatus, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Loading state while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if current status allows access
  if (!requiredStatus.includes(accountStatus)) {
    // Show status-specific message if enabled
    if (showStatusMessage) {
      return <AccountStatusBlocker 
        currentStatus={accountStatus}
        attemptedRoute={window.location.pathname}
        fallbackRoute={fallbackRoute}
      />;
    }
    
    // Silent redirect for better UX
    return <Navigate to={fallbackRoute} replace />;
  }
  
  // Access granted - render protected content
  return <>{children}</>;
}
```

#### Dynamic Navigation Menu
```typescript
// Navigation items based on account status
function useNavigationItems() {
  const { accountStatus } = useAuth();
  
  return useMemo(() => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: 'home' }
    ];
    
    // Add items based on account status
    switch (accountStatus) {
      case 'ACTIVE':
        return [
          ...baseItems,
          { path: '/submit-request', label: 'Submit Request', icon: 'plus' },
          { path: '/track-packages', label: 'Track Packages', icon: 'search' },
          { path: '/profile', label: 'Profile', icon: 'user' },
          { path: '/support', label: 'Support', icon: 'help' }
        ];
        
      case 'SUSPENDED':
        return [
          ...baseItems,
          { path: '/track-packages', label: 'Track Packages', icon: 'search' },
          { path: '/support', label: 'Limited Support', icon: 'help' },
          { path: '/appeal', label: 'Appeal Suspension', icon: 'appeal' }
        ];
        
      case 'RESTRICTED':
        return [
          ...baseItems,
          { path: '/track-packages', label: 'View Packages', icon: 'view' },
          { path: '/appeal', label: 'Appeal Restriction', icon: 'appeal' }
        ];
        
      case 'BANNED':
        return [
          { path: '/account-banned', label: 'Account Status', icon: 'warning' },
          { path: '/appeal', label: 'Appeal Ban', icon: 'appeal' }
        ];
        
      case 'PENDING_VERIFICATION':
        return [
          { path: '/verification', label: 'Complete Verification', icon: 'verify' },
          { path: '/support', label: 'Support', icon: 'help' }
        ];
        
      case 'DORMANT':
        return [
          { path: '/reactivation', label: 'Reactivate Account', icon: 'refresh' }
        ];
        
      default:
        return baseItems;
    }
  }, [accountStatus]);
}
```

### Status-Specific Page Components

#### Account Status Blocker Component
```typescript
interface AccountStatusBlockerProps {
  currentStatus: AccountStatus;
  attemptedRoute: string;
  fallbackRoute: string;
}

function AccountStatusBlocker({ 
  currentStatus, 
  attemptedRoute, 
  fallbackRoute 
}: AccountStatusBlockerProps) {
  
  const statusMessages = {
    SUSPENDED: {
      title: "Account Suspended",
      message: "Your account has been temporarily suspended. You cannot access this feature.",
      actions: [
        { label: "View Appeal Process", route: "/appeal" },
        { label: "Contact Support", route: "/support" },
        { label: "Go to Dashboard", route: "/dashboard" }
      ]
    },
    RESTRICTED: {
      title: "Limited Access",
      message: "Your account has restricted access. This feature is not available.",
      actions: [
        { label: "Submit Appeal", route: "/appeal" },
        { label: "View Available Features", route: "/dashboard" }
      ]
    },
    BANNED: {
      title: "Account Banned",
      message: "Your account has been permanently banned. Access to this feature is denied.",
      actions: [
        { label: "Appeal Process", route: "/appeal" },
        { label: "View Ban Details", route: "/account-banned" }
      ]
    },
    PENDING_VERIFICATION: {
      title: "Verification Required",
      message: "Please complete account verification to access this feature.",
      actions: [
        { label: "Complete Verification", route: "/verification" },
        { label: "Verification Help", route: "/support" }
      ]
    },
    DORMANT: {
      title: "Account Dormant",
      message: "Your account requires reactivation to access this feature.",
      actions: [
        { label: "Reactivate Account", route: "/reactivation" }
      ]
    }
  };
  
  const config = statusMessages[currentStatus];
  
  return (
    <div className="account-status-blocker">
      <div className="status-icon">
        <StatusIcon status={currentStatus} />
      </div>
      
      <h2>{config.title}</h2>
      <p>{config.message}</p>
      
      <div className="attempted-route-info">
        <small>Attempted to access: {attemptedRoute}</small>
      </div>
      
      <div className="action-buttons">
        {config.actions.map((action, index) => (
          <Link 
            key={index}
            to={action.route}
            className="btn btn-primary"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### Router Configuration with Status Guards

#### Main App Router Setup
```typescript
function AppRouter() {
  const { accountStatus } = useAuth();
  
  return (
    <Router>
      <Routes>
        {/* Public routes - no authentication required */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Status-specific landing pages */}
        <Route path="/account-restricted" element={<AccountRestrictedPage />} />
        <Route path="/account-banned" element={<AccountBannedPage />} />
        
        {/* Protected routes with status-based access */}
        
        {/* ACTIVE status routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredStatus={['ACTIVE', 'SUSPENDED', 'RESTRICTED']}>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/submit-request" element={
          <ProtectedRoute requiredStatus={['ACTIVE']}>
            <DashboardLayout>
              <SubmitRequestPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/track-packages" element={
          <ProtectedRoute requiredStatus={['ACTIVE', 'SUSPENDED', 'RESTRICTED']}>
            <DashboardLayout>
              <TrackPackagesPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute requiredStatus={['ACTIVE', 'PENDING_VERIFICATION']}>
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* Appeal and support routes */}
        <Route path="/appeal" element={
          <ProtectedRoute requiredStatus={['SUSPENDED', 'RESTRICTED', 'BANNED']}>
            <DashboardLayout>
              <AppealPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/support" element={
          <ProtectedRoute requiredStatus={['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']}>
            <DashboardLayout>
              <SupportPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* Verification routes */}
        <Route path="/verification" element={
          <ProtectedRoute requiredStatus={['PENDING_VERIFICATION']}>
            <VerificationLayout>
              <VerificationPage />
            </VerificationLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/reactivation" element={
          <ProtectedRoute requiredStatus={['DORMANT']}>
            <ReactivationLayout>
              <ReactivationPage />
            </ReactivationLayout>
          </ProtectedRoute>
        } />
        
        {/* Default redirects based on status */}
        <Route path="/" element={<StatusBasedRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
```

#### Status-Based Default Redirect
```typescript
function StatusBasedRedirect() {
  const { accountStatus, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to appropriate default page based on status
  switch (accountStatus) {
    case 'ACTIVE':
    case 'SUSPENDED':
    case 'RESTRICTED':
      return <Navigate to="/dashboard" replace />;
      
    case 'PENDING_VERIFICATION':
      return <Navigate to="/verification" replace />;
      
    case 'DORMANT':
      return <Navigate to="/reactivation" replace />;
      
    case 'BANNED':
      return <Navigate to="/account-banned" replace />;
      
    default:
      return <Navigate to="/dashboard" replace />;
  }
}
```

### Real-Time Status Change Handling

#### Status Change Listener Hook
```typescript
function useAccountStatusListener() {
  const { user, updateAccountStatus } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  useEffect(() => {
    if (!user) return;
    
    // WebSocket connection for real-time status updates
    const ws = new WebSocket(`${WS_URL}/account-status/${user.id}`);
    
    ws.onmessage = (event) => {
      const statusUpdate = JSON.parse(event.data);
      
      if (statusUpdate.type === 'ACCOUNT_STATUS_CHANGE') {
        const { newStatus, reason, effectiveDate } = statusUpdate.data;
        
        // Update auth context
        updateAccountStatus(newStatus);
        
        // Show status change notification
        addToast({
          type: getToastType(newStatus),
          title: `Account Status Changed`,
          message: `Your account status has been changed to ${newStatus}. ${reason}`,
          duration: 8000,
          actions: getStatusChangeActions(newStatus)
        });
        
        // Redirect if current route is no longer accessible
        const currentRoute = window.location.pathname;
        if (!isRouteAccessible(currentRoute, newStatus)) {
          navigate(getDefaultRouteForStatus(newStatus));
        }
      }
    };
    
    return () => ws.close();
  }, [user, updateAccountStatus, navigate, addToast]);
}

function isRouteAccessible(route: string, status: AccountStatus): boolean {
  const routeAccess = {
    '/submit-request': ['ACTIVE'],
    '/track-packages': ['ACTIVE', 'SUSPENDED', 'RESTRICTED'],
    '/profile': ['ACTIVE', 'PENDING_VERIFICATION'],
    '/support': ['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
    '/appeal': ['SUSPENDED', 'RESTRICTED', 'BANNED'],
    '/verification': ['PENDING_VERIFICATION'],
    '/reactivation': ['DORMANT']
  };
  
  const allowedStatuses = routeAccess[route];
  return allowedStatuses ? allowedStatuses.includes(status) : true;
}
```

### Feature-Level Access Control

#### Component-Level Status Checks
```typescript
// Higher-order component for feature access control
function withStatusCheck<T extends object>(
  Component: React.ComponentType<T>,
  requiredStatus: AccountStatus[],
  fallbackComponent?: React.ComponentType
) {
  return function StatusCheckedComponent(props: T) {
    const { accountStatus } = useAuth();
    
    if (!requiredStatus.includes(accountStatus)) {
      if (fallbackComponent) {
        const FallbackComponent = fallbackComponent;
        return <FallbackComponent {...props} />;
      }
      
      return (
        <div className="feature-disabled">
          <p>This feature is not available with your current account status.</p>
          <small>Current status: {accountStatus}</small>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}

// Usage example
const SubmitRequestButton = withStatusCheck(
  ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="btn btn-primary">
      Submit New Request
    </button>
  ),
  ['ACTIVE'],
  ({ onClick }: { onClick: () => void }) => (
    <button disabled className="btn btn-disabled">
      Submit New Request (Account Suspended)
    </button>
  )
);
```

### Status-Specific Dashboard Layouts

#### Dynamic Dashboard Based on Status
```typescript
function Dashboard() {
  const { accountStatus } = useAuth();
  
  switch (accountStatus) {
    case 'ACTIVE':
      return <ActiveUserDashboard />;
      
    case 'SUSPENDED':
      return <SuspendedUserDashboard />;
      
    case 'RESTRICTED':
      return <RestrictedUserDashboard />;
      
    case 'PENDING_VERIFICATION':
      return <VerificationRequiredDashboard />;
      
    case 'DORMANT':
      return <DormantAccountDashboard />;
      
    case 'BANNED':
      return <BannedAccountDashboard />;
      
    default:
      return <DefaultDashboard />;
  }
}

function SuspendedUserDashboard() {
  const { suspensionDetails } = useAccountStatus();
  
  return (
    <div className="dashboard suspended">
      <StatusBanner 
        type="warning"
        title="Account Suspended"
        message={`Your account has been suspended. ${suspensionDetails.reason}`}
        showAppealButton={true}
      />
      
      <div className="dashboard-grid">
        {/* Limited features for suspended users */}
        <DashboardCard 
          title="Track Existing Packages"
          description="View and track your current packages"
          link="/track-packages"
          icon="search"
          enabled={true}
        />
        
        <DashboardCard 
          title="Submit New Request"
          description="Create new package requests"
          link="/submit-request"
          icon="plus"
          enabled={false}
          disabledReason="Not available during suspension"
        />
        
        <DashboardCard 
          title="Appeal Suspension"
          description="Submit an appeal to reactivate your account"
          link="/appeal"
          icon="appeal"
          enabled={true}
          highlighted={true}
        />
        
        <DashboardCard 
          title="Contact Support"
          description="Get help with your account"
          link="/support"
          icon="help"
          enabled={true}
        />
      </div>
    </div>
  );
}
```

### Implementation Checklist for Frontend Developers

#### Required Changes Summary
1. **Authentication Context Updates**:
   - Add `accountStatus` field to user context
   - Implement status change listeners
   - Add status-based permission checks

2. **Route Protection**:
   - Create `ProtectedRoute` component with status checking
   - Update all route definitions with status requirements
   - Implement status-based redirects

3. **Navigation Updates**:
   - Dynamic menu items based on account status
   - Status-specific sidebar content
   - Disabled state for unavailable features

4. **Component Modifications**:
   - Add status checks to action buttons
   - Implement feature-level access control
   - Create status-specific page variants

5. **Real-Time Updates**:
   - WebSocket integration for status changes
   - Toast notifications for status updates
   - Automatic route redirects on status change

6. **New Pages Required**:
   - Account status blocker pages
   - Appeal submission forms
   - Verification completion flows
   - Account reactivation process

7. **UI/UX Considerations**:
   - Status indicator in header/sidebar
   - Clear messaging for disabled features
   - Helpful action buttons for status resolution

This implementation ensures your frontend dynamically adapts to user account status changes while providing clear feedback and appropriate access control throughout the application.

---