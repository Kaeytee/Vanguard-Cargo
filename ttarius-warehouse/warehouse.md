# Ttarius Logistics - Warehouse System: The Operational Core

## Executive Summary

**This warehouse system IS the Ttarius Logistics platform.** Every business decision, data flow, user interaction, and system integration flows through this warehouse backbone. This document serves as the definitive operational blueprint for backend developers, system architects, and business stakeholders to understand and implement the complete logistics operation.

### Why This Document Is Critical
- **For Backend Developers**: This is your implementation roadmap - every API, database table, and business rule is defined here
- **For System Architects**: This shows how all platform components integrate and depend on the warehouse core
- **For Business Stakeholders**: This defines what the system does, how it works, and why each component exists
- **For QA/Testing**: This provides the complete workflow and edge cases that must be validated

### Platform Architecture Reality
The client app is essentially a user interface that communicates with this warehouse system. The warehouse system:
- Processes every client request into actionable operations
- Manages all physical and digital package lifecycles  
- Orchestrates all shipment and delivery operations
- Enforces all business rules and data integrity
- Provides all tracking, status, and communication capabilities

## System Architecture

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Client App        │    │   Warehouse Core    │    │   Super Admin       │
│   (Request Submit)  │────┤   (Main Operations) ├────│   (System Control)  │
│   - Submit requests │    │   - Process requests│    │   - User management │
│   - Track packages  │    │   - Create packages │    │   - System config   │
│   - View status     │    │   - Build shipments │    │   - Analytics       │
└─────────────────────┘    │   - Track & notify  │    └─────────────────────┘
                           │   - Manage inventory│
                           │   - Handle delivery │
                           └─────────────────────┘
                                      │
                              ┌───────▼────────┐
                              │  Spring Boot   │
                              │  Backend API   │
                              │  + PostgreSQL  │
                              └────────────────┘
```

## Table of Contents

1. [Core Business Logic](#core-business-logic)
2. [Request-to-Package Workflow](#request-to-package-workflow)
3. [Package Management System](#package-management-system)
4. [Shipment Creation & Management](#shipment-creation--management)
5. [Status Management & Tracking](#status-management--tracking)
6. [Inventory & Warehouse Operations](#inventory--warehouse-operations)
7. [Client Communication System](#client-communication-system)
8. [Staff Management & Roles](#staff-management--roles)
9. [Integration with Client System](#integration-with-client-system)
10. [Data Models & Database Design](#data-models--database-design)
11. [API Endpoints](#api-endpoints)
12. [Security & Access Control](#security--access-control)

## Business Logic Framework: Pure International Logistics

### Package Types - Official Definition
**There are ONLY two package types in the entire Ttarius Logistics system:**
1. **DOCUMENT**: Legal documents, contracts, certificates, official papers
2. **NON_DOCUMENT**: Everything else - goods, products, personal items, equipment

*This is definitive. No other package types exist. Any documentation or code suggesting otherwise is incorrect and must be updated.*

### Delivery Types - Service Levels (Air Freight Primary)
**Current Primary Service:**
1. **AIR**: International air freight - fast, reliable cross-border shipping (PRIMARY SERVICE)

**Future Expansion Ready:**
2. **GROUND**: Cross-border ground transportation (future trucks/trains between countries)
3. **SEA**: International sea freight for large shipments (future cost-effective option)
4. **EXPRESS**: Premium express international service (future high-priority option)

### Core Business Model - Pure International Logistics
**Ttarius Logistics operates EXCLUSIVELY as an international logistics company:**
- **No Domestic Services**: We do not handle deliveries within the same country
- **Cross-Border Only**: All packages move between different countries
- **Current Routes**: Ghana ↔ USA exclusively
- **Future Expansion**: Additional countries (Nigeria, UK, etc.) following same cross-border model

### Origin Country Selection Rules - Critical Business Logic
**Client Country Restriction Logic:**
- **Ghana Clients**: Can ONLY select USA as origin country (cannot select Ghana)
- **USA Clients**: Can ONLY select Ghana as origin country (cannot select USA)
- **Future Countries**: Each client can select any origin country EXCEPT their own country

**UI Implementation Rule:**
```
Client's Country = Ghana → Origin Country Dropdown = [USA, Future Countries] (Ghana disabled/hidden)
Client's Country = USA → Origin Country Dropdown = [Ghana, Future Countries] (USA disabled/hidden)
```

**Business Justification:**
- Prevents impossible domestic requests
- Enforces international logistics business model
- Ensures all requests are cross-border by design

### The Universal Workflow - Every Package Follows This Path (International Only)
```
CLIENT REQUEST → ORIGIN WAREHOUSE → INTERNATIONAL SHIPPING → DESTINATION WAREHOUSE → CUSTOMER PICKUP
      │                │                   │                      │                      │
      │                │                   │                      │                      │
   (Client App)    (Origin Country)    (Air Freight)        (Destination Country)  (Warehouse Pickup)
   - Submit info   - Process package   - Ship internationally  - Clear customs       - Notify customer
   - Get tracking  - Prepare export    - Track transit        - Process arrival      - Customer pickup
   - Track status  - Ship package      - Handle logistics     - Store in warehouse   - Confirm collection
```

**This workflow is immutable. Every package moves between countries and ends with warehouse pickup - no home delivery exists.**

**Example Flows:**

- Ghana Client → USA Origin Package → Air Freight to Ghana → Ghana Warehouse Pickup
- USA Client → Ghana Origin Package → Air Freight to USA → USA Warehouse Pickup

### Critical Business Rules - Non-Negotiable (Updated for International Focus)

**Data Integrity Rules:**
1. **One Request = One Package**: Every client request generates exactly one warehouse package
2. **Unique Tracking**: Every package gets a unique tracking number (TT + 12 digits)
3. **Status Progression**: Packages can only move forward through status sequence (no backwards)
4. **Audit Trail**: Every status change, location change, and action must be logged with timestamp and user
5. **Cross-Border Only**: All requests must have different origin country and client country

**Package Type Rules:**
1. **DOCUMENT packages**: Must use special handling zone, enhanced security, dedicated storage
2. **NON_DOCUMENT packages**: Standard processing workflow, regular storage areas
3. **No mixed shipments**: Document and non-document packages cannot be in same shipment
4. **Type cannot change**: Once set, package type is immutable throughout lifecycle

**Delivery Type Rules (Air Freight Primary):**
1. **AIR**: Primary service - international air freight, expedited processing, airport coordination
2. **GROUND**: Future service - cross-border ground transportation between countries
3. **SEA**: Future service - international bulk shipping, port facility coordination
4. **EXPRESS**: Future service - premium international express service

**International Request Rules:**
1. **Origin Country ≠ Client Country**: System must enforce this rule at request creation
2. **Cross-Border Processing**: Origin country processes, destination country delivers
3. **No Domestic Requests**: Requests within same country are not allowed
4. **Country Validation**: UI must prevent clients from selecting their own country as origin

**Shipment Grouping Rules (International Focus):**
1. **Compatible types only**: Same delivery type packages can be grouped
2. **Same route logic**: Packages following same international route (e.g., USA → Ghana)
3. **Size/weight limits**: Must respect aircraft/container capacity constraints
4. **International coordination**: Groups must align with international shipping schedules

**Exception Handling Rules:**
1. **Damage**: Immediate photo documentation, client notification, damage report creation
2. **Customs Issues**: Automatic notification to both origin and destination warehouses
3. **Missing packages**: Full investigation protocol involving both countries
4. **Address issues**: Client communication required before international shipping

```
Client Request → Package Creation → Physical Receipt → Processing → Shipment → Warehouse Arrival → Customer Pickup
     │               │                    │              │           │              │                    │
     │               │                    │              │           │              │                    │
   CLIENT         WAREHOUSE           WAREHOUSE      WAREHOUSE   WAREHOUSE      WAREHOUSE           CLIENT
   SUBMITS        CREATES             RECEIVES       PROCESSES   SHIPS          STORES             COLLECTS
   REQUEST        PACKAGE             PACKAGE        PACKAGE     PACKAGE        PACKAGE            PACKAGE
```

### Core Responsibilities

1. **Request Processing**: Convert client requests into actionable packages
2. **Package Management**: Track physical packages through warehouse operations
3. **Shipment Orchestration**: Group packages into efficient international shipments
4. **Status Communication**: Keep all stakeholders informed of progress
5. **Customer Pickup Coordination**: Notify customers when packages arrive at local warehouse for pickup
6. **Exception Handling**: Manage delays, issues, and special requirements

### Critical Success Factors

- **Data Integrity**: Every request must become a trackable package
- **Status Accuracy**: Real-time status updates across all systems
- **Communication**: Proactive client and staff notifications
- **Efficiency**: Optimal resource utilization and cost management
- **Scalability**: System must handle growing package volumes

### Database Architecture & Data Flow - Pure International Logistics

**Why Normalized Data Matters:**
The warehouse system uses a fully normalized database design to eliminate redundancy and ensure data integrity. This means the client app sends only essential, unique data, while the warehouse system manages all relationships and derived information.

**Client App Responsibility (International Requests Only):**
```
Client Sends:
- User ID (references existing user record)
- Origin country (MUST be different from client's country)
- Origin city (text string)
- Package type (DOCUMENT | NON_DOCUMENT enum)
- Delivery type (AIR primary, others for future)
- Package category and description (text)
- Special requirements (optional text)
```

**System Validation Rules:**
```
Request Validation:
- Client country ≠ Origin country (enforced at API level)
- Origin country must be in approved countries list
- Client country determines available origin options
- UI prevents selection of client's own country
```

**Warehouse System Adds:**
```
Warehouse Creates:
- Package ID (new UUID)
- Tracking number (generated: TT + 12 digits)
- Physical measurements (when package arrives)
- Warehouse location tracking
- Status history (complete audit trail)
- Processing notes and staff assignments
- Images and documentation
- International shipment coordination data
- Customs documentation
```

**Database Relationship Model (International Focus):**
```
Users (shared table - includes country field)
├── Package_Requests (from client app - origin_country ≠ user.country)
│   └── Packages (created by origin warehouse) [1:1 relationship]
│       ├── Status_History [1:many]
│       ├── Package_Images [1:many]
│       ├── International_Shipping [1:1]
│       └── Customs_Documentation [1:1]
│           └── Shipments (international groups) [many:1]
│               ├── Shipment_Status_History [1:many]
│               └── International_Logistics [1:1]
```

**Benefits of This Approach:**
1. **No Data Duplication**: User info stored once, referenced everywhere
2. **Consistency**: Changes to user data automatically reflect across all packages
3. **Efficiency**: JOINs in warehouse system provide complete data views
4. **Scalability**: Minimal data transfer between client and warehouse
5. **Integrity**: Foreign key constraints prevent orphaned or invalid data
6. **International Validation**: Enforces cross-border business rules at database level

### Phase 1: Request Reception (International Validation)
```
Client submits international request → Warehouse receives notification → Staff reviews request
```

**What Warehouse Receives from Client App:**
- Request ID and request number
- Client information (via user ID reference)
- Origin details (country, city) - MUST be different from client's country
- Package type (Document/Non-Document)
- Delivery type (Air primary, others for future expansion)
- Package category and description

**International Request Validation:**
1. **Country Validation**: Verify origin country ≠ client country
2. **Service Availability**: Confirm international shipping available to client's country
3. **Route Validation**: Ensure origin → destination route is supported
4. **Customs Compliance**: Verify package type allowed for international shipping

**Warehouse Actions:**
1. **Request Validation**: Verify all required information is present and valid
2. **International Route Check**: Confirm service availability for origin/destination pair
3. **Cost Estimation**: Calculate international shipping costs and delivery timeframes
4. **Request Approval**: Approve or request additional information

### Phase 2: Package Creation (International Package Setup)
```
Approved international request → Create package record → Generate tracking number → Notify client
```

**International Package Creation Process:**
1. **Package Record Creation**: Create warehouse package from approved international request
2. **International Tracking Number**: Assign unique tracking number (format: TT + 12 digits)
3. **International Barcode**: Create scannable barcode for cross-border tracking
4. **Initial Status Setting**: Set package status to "AWAITING_PICKUP"
5. **International Route Setup**: Configure origin → destination routing information
6. **Client Notification**: Inform client of package creation and international tracking details

### Phase 3: Physical Reception (Origin Country Processing)
```
Client delivers package to origin warehouse → International inspection → Package acceptance → Status update
```

**International Reception Workflow:**
1. **Package Arrival**: Client brings physical package to origin country warehouse
2. **International Verification**: Match physical package with international shipping record
3. **Export Inspection**: Check package condition, weight, dimensions for international shipping
4. **Documentation**: Take photos, record any discrepancies, prepare export documentation
5. **International Acceptance**: Accept package into origin warehouse for international processing
6. **Status Update**: Change status to "RECEIVED"

### Phase 4: International Processing (Origin Country Preparation)
```
Package in origin warehouse → International processing queue → Export preparation → Ready for international shipment
```

**International Processing Steps:**
1. **Export Queue Management**: Prioritize packages based on international shipping schedules
2. **International Processing**: Inspect, weigh, measure, label for international shipping
3. **Export Documentation**: Prepare customs forms, shipping manifests, export declarations
4. **International Quality Control**: Verify all international shipping requirements are met
5. **Status Update**: Change status to "PROCESSED"

## Package Management System

### Package Lifecycle States

```
AWAITING_PICKUP → RECEIVED → PROCESSING → PROCESSED → GROUPED → SHIPPED → DELIVERED
       │             │           │           │           │          │         │
       │             │           │           │           │          │         │
   Created but    Physical    Being      Ready for   Added to   Left      Reached
   not yet        package     processed  shipment    shipment   warehouse destination
   received       arrived     by staff   creation    group      facility  
```

### Package Data Structure

**Core Package Information:**
- Package ID (internal warehouse identifier)
- Request ID (links back to client request)
- Tracking Number (client-facing identifier)
- Client ID (links to client who submitted request)
- Package type (Document/Non-Document)
- Origin details (country, city from request)
- Package details (category, description from request)

**Warehouse-Specific Data:**
- Physical dimensions (length, width, height)
- Weight (actual measured weight)
- Condition notes (damage, special handling requirements)
- Location in warehouse (shelf, zone, area)
- Processing notes (staff observations, special instructions)
- Images (receipt, processing, damage documentation)

**Status and Tracking:**
- Current status
- Status history (complete audit trail)
- Assigned staff member
- Processing priority level
- Estimated processing completion time
- Target shipment date

### Package Processing Operations

**Standard Processing Workflow:**
1. **Intake Inspection**: Verify package matches digital record
2. **Dimension/Weight Recording**: Measure and record physical characteristics
3. **Condition Assessment**: Document any damage or special conditions
4. **Labeling**: Apply warehouse labels and tracking barcodes
5. **Storage Assignment**: Assign location in warehouse
6. **Processing Completion**: Mark as ready for shipment

**Special Handling Procedures:**
- **Document Packages**: Enhanced security, special storage area
- **Fragile Items**: Special packaging, careful handling protocols
- **High-Value Items**: Additional security measures, insurance documentation
- **International Packages**: Customs documentation, compliance checks

## Shipment Creation & Management

### Shipment Grouping Logic

**Automatic Grouping Criteria:**
1. **Destination-Based**: Group packages going to same region/country
2. **Service Type**: Group by delivery type (Ground/Air/Sea/Express)
3. **Size/Weight Optimization**: Maximize vehicle/container utilization
4. **Delivery Timeline**: Group packages with similar deadlines
5. **Special Requirements**: Group packages with similar handling needs

### Shipment Creation Process

**Phase 1: Package Selection**
```
Processed packages → Grouping algorithm → Create shipment groups → Assign resources
```

**Selection Criteria:**
- All packages must have status "PROCESSED"
- Compatible destinations and service types
- Optimal size/weight combinations
- Similar delivery timeframes

**Phase 2: Shipment Assembly**
```
Selected packages → Physical consolidation → Shipment documentation → Departure preparation
```

**Assembly Steps:**
1. **Package Consolidation**: Physically group packages for shipment
2. **Shipment Documentation**: Create manifests, shipping labels, customs forms
3. **Final Inspection**: Verify all packages are included and properly documented
4. **Resource Assignment**: Assign vehicle, driver, route
5. **Departure Scheduling**: Set departure time and estimated arrival

### Shipment Types

**Ground Shipments:**
- Regional delivery within same country
- Standard delivery timeframes
- Cost-effective for bulk packages
- Regular departure schedules

**Air Shipments:**
- International and expedited delivery
- Premium pricing for speed
- Weight and size restrictions
- Coordination with airline schedules

**Sea Shipments:**
- International bulk delivery
- Longest transit times but most economical
- Container-based shipping
- Port coordination requirements

**Express Shipments:**
- Highest priority packages
- Guaranteed delivery timeframes
- Premium pricing structure
- Dedicated transportation resources

## Status Management & Tracking

### Unified Status System

**Client App Status (Client View):**
- SUBMITTED: Request submitted and received
- UNDER_REVIEW: Warehouse reviewing request  
- PROCESSING: Package being processed in warehouse
- READY_FOR_PICKUP: Package ready for collection/shipment
- COMPLETED: Package delivered to destination

**Warehouse Status (Internal Operations):**
- AWAITING_PICKUP: Package created, waiting for physical delivery
- RECEIVED: Physical package received at warehouse
- PROCESSING: Package being processed by warehouse staff
- PROCESSED: Package ready for shipment assignment
- GROUPED: Package assigned to shipment group
- SHIPPED: Package left warehouse in shipment
- IN_TRANSIT: Package en route to destination
- DELIVERED: Package delivered to final recipient
- EXCEPTION: Issue requiring special attention

### Status Synchronization

**Client App Status Mapping:**
```
Warehouse Status    →    Client App Status
AWAITING_PICKUP     →    UNDER_REVIEW
RECEIVED            →    PROCESSING  
PROCESSING          →    PROCESSING
PROCESSED           →    PROCESSING
GROUPED             →    READY_FOR_PICKUP
SHIPPED             →    READY_FOR_PICKUP
IN_TRANSIT          →    READY_FOR_PICKUP
DELIVERED           →    COMPLETED
EXCEPTION           →    PROCESSING (with notes)
```

### Tracking Number System

**Format**: TT + 12 digits (e.g., TT123456789012)
- **TT**: Ttarius Logistics identifier
- **12 digits**: Unique sequential number with check digits

**Tracking Capabilities:**
- Real-time status updates
- Location tracking
- Estimated delivery times
- Exception notifications
- Delivery confirmation

## Inventory & Warehouse Operations

### Physical Warehouse Layout

**Zone Organization:**
1. **Receiving Zone**: Incoming package inspection and acceptance
2. **Processing Zone**: Package processing and preparation
3. **Storage Zones**: Organized by package type and delivery schedule
4. **Staging Zone**: Packages ready for shipment assignment
5. **Shipping Zone**: Shipment consolidation and departure
6. **Special Handling Zone**: High-value, fragile, or document packages

### Inventory Management

**Package Location Tracking:**
- Zone assignment (which area of warehouse)
- Shelf/bay location (specific storage location)
- Movement history (when moved and by whom)
- Storage duration (time in each location)

**Inventory Operations:**
1. **Receiving**: Log package arrival and assign initial location
2. **Movement**: Track all package movements within warehouse
3. **Processing**: Update location during processing activities
4. **Staging**: Move processed packages to shipment staging area
5. **Shipping**: Log package departure from warehouse

### Warehouse Staff Operations

**Staff Roles and Responsibilities:**

**Warehouse Workers:**
- Package receiving and inspection
- Physical package processing
- Package movement and organization
- Barcode scanning and status updates

**Warehouse Managers:**
- Shipment planning and creation
- Staff supervision and task assignment
- Exception handling and problem resolution
- Quality control and process oversight

**HR Staff:**
- Staff scheduling and management
- Training and compliance
- Performance monitoring
- Client communication when needed

**Warehouse Admin:**
- Overall operations management
- System configuration and optimization
- Reporting and analytics
- Integration with other systems

## Client Communication System

### Communication Channels

**Automated Notifications:**
- Status change notifications (SMS, email, WhatsApp)
- Delivery confirmations
- Exception alerts
- Delivery scheduling

**On-Demand Communication:**

- Package status inquiries
- Special handling requests
- Pickup coordination and scheduling
- Issue resolution

### Notification Triggers

**Automatic Triggers:**

1. **Package Created**: When request becomes package
2. **Package Received**: When physical package arrives at origin warehouse
3. **Processing Complete**: When package ready for international shipment
4. **Shipped**: When package leaves origin warehouse for international transit
5. **Arrived at Local Warehouse**: When package reaches destination warehouse and is ready for pickup
6. **Package Collected**: When customer picks up package from local warehouse
7. **Exception**: When issues arise requiring attention

### WhatsApp Integration

**Use Cases:**

- Quick status updates with package photos
- Pickup coordination and scheduling with customers
- Exception handling and problem resolution
- Pickup confirmation with photos and ID verification

**Message Templates:**

- Status update messages
- Pickup scheduling messages (with warehouse address and hours)
- Exception notification messages
- Pickup confirmation messages

## Staff Management & Roles

### Role-Based Access Control

**Warehouse Workers:**
- View assigned packages and tasks
- Update package status and location
- Scan barcodes and record activities
- Access basic package information

**Warehouse Managers:**
- View all packages and shipments
- Create and modify shipments
- Assign tasks to workers
- Handle exceptions and issues
- Access reporting and analytics

**HR Staff:**
- Manage staff schedules and assignments
- Access client communication tools
- View package information for client support
- Manage staff training and compliance

**Warehouse Admin:**
- Full system access and control
- System configuration and optimization
- User management within warehouse
- Integration with other platform components

### Task Management

**Daily Operations:**
- Package receiving and processing tasks
- Shipment creation and management tasks
- Inventory organization and maintenance
- Client communication and support

**Task Assignment:**
- Automatic task assignment based on workload
- Manual task assignment for special requirements
- Priority-based task ordering
- Real-time task status tracking

## Integration with Client System

### Data Synchronization

**Real-Time Integration:**
- Package status updates sync immediately to client app
- Request changes from client app sync to warehouse
- Client profile updates available in warehouse system
- Real-time inventory and capacity information

**Shared Database Architecture:**
```
PostgreSQL Database
├── Users (shared across platforms)
├── Package_Requests (created by client app)
├── Packages (created by warehouse from requests)
├── Shipments (created by warehouse)
├── Status_History (tracking complete lifecycle)
└── Notifications (cross-platform communications)
```

### Integration Points

**Client App → Warehouse:**
- New request notifications
- Client profile updates  
- Special handling requests
- Delivery preferences

**Warehouse → Client App:**
- Package status updates
- Tracking information updates
- Delivery confirmations
- Exception notifications

## Data Models & Database Design

### Core Entities

**Package (Warehouse Core Entity):**
```
Package {
  id: UUID (primary key)
  requestId: UUID (foreign key to package_requests)
  trackingNumber: string (unique, format: TTxxxxxxxxxxxx)
  userId: UUID (foreign key to users - client)
  
  // From original request
  originCountry: string
  originCity: string
  packageType: DOCUMENT | NON_DOCUMENT
  deliveryType: GROUND | AIR | SEA | EXPRESS
  packageCategory: string
  packageDescription: string
  
  // Warehouse-specific data
  physicalDimensions: {
    length: number
    width: number  
    height: number
    weight: number
  }
  
  warehouseLocation: {
    zone: string
    shelf: string
    position: string
  }
  
  condition: {
    status: string
    notes: string
    images: string[]
  }
  
  processingInfo: {
    assignedStaff: UUID
    priority: HIGH | MEDIUM | LOW
    processingNotes: string
    estimatedCompletion: timestamp
  }
  
  status: WarehousePackageStatus
  statusHistory: StatusHistoryEntry[]
  
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: UUID
  lastModifiedBy: UUID
}
```

**Shipment (Grouping Entity):**
```
Shipment {
  id: UUID (primary key)
  shipmentNumber: string (unique, format: SHPxxxxxxxxxxxx)
  packageIds: UUID[] (foreign keys to packages)
  
  shipmentType: GROUND | AIR | SEA | EXPRESS
  destinationRegion: string
  
  logistics: {
    vehicleId: UUID
    driverId: UUID
    route: RoutePoint[]
    departureTime: timestamp
    estimatedArrival: timestamp
    actualArrival: timestamp
  }
  
  consolidation: {
    totalPackages: number
    totalWeight: number
    totalVolume: number
    containerInfo: string
  }
  
  status: ShipmentStatus
  statusHistory: StatusHistoryEntry[]
  
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: UUID
}
```

**Status History (Audit Trail):**
```
StatusHistory {
  id: UUID (primary key)
  entityId: UUID (package or shipment ID)
  entityType: PACKAGE | SHIPMENT
  
  previousStatus: string
  newStatus: string
  statusTimestamp: timestamp
  
  location: LocationPoint
  updatedBy: UUID (staff member)
  updateReason: string
  notes: string
  
  automaticUpdate: boolean
  systemSource: string
  
  createdAt: timestamp
}
```

### Database Relationships

**Core Relationships:**
- Users (1) → Package_Requests (Many)
- Package_Requests (1) → Packages (1) 
- Packages (Many) → Shipments (Many) - Many-to-Many through junction table
- Users (1) → Status_History (Many) - for staff updates
- Packages (1) → Status_History (Many)
- Shipments (1) → Status_History (Many)

**Referential Integrity:**
- All foreign keys enforced with proper constraints
- Cascade deletion rules for related entities
- Audit trails preserved even after entity deletion

## API Endpoints

### Request Processing API Endpoints (International Focus)
```
GET  /api/warehouse/requests/pending           # Get new international requests awaiting processing
POST /api/warehouse/requests/{id}/approve      # Approve international request and create package
POST /api/warehouse/requests/{id}/reject       # Reject international request with reason
GET  /api/warehouse/requests/{id}/details      # Get complete international request details with client info
GET  /api/warehouse/requests/international     # Get cross-border requests for current warehouse
PUT  /api/warehouse/requests/{id}/export       # Mark request ready for international export
```

### International Package Management
```
GET  /api/warehouse/packages                   # Get all international packages with filters
GET  /api/warehouse/packages/{id}              # Get specific international package details
PUT  /api/warehouse/packages/{id}/status       # Update international package status
POST /api/warehouse/packages/{id}/receive      # Mark international package as physically received
PUT  /api/warehouse/packages/{id}/process      # Update international processing information
PUT  /api/warehouse/packages/{id}/export-prep  # Prepare package for international export
POST /api/warehouse/packages/{id}/images       # Upload international package images
GET  /api/warehouse/packages/export-ready      # Get packages ready for international shipment
```

### Cross-Border Coordination
```
POST /api/warehouse/international/handoff      # Send package data to destination country
GET  /api/warehouse/international/arrivals     # Get international packages arriving from other countries
PUT  /api/warehouse/international/{id}/customs # Update customs clearance status
POST /api/warehouse/international/{id}/ready-for-pickup # Mark international package ready for customer pickup
```

### Origin Country Validation Endpoints
```
GET  /api/client/countries/available/{clientCountry}  # Get available origin countries for client
POST /api/client/requests/validate                   # Validate international request before submission
GET  /api/client/routes/supported                     # Get supported international shipping routes
```

### Shipment Operations
```
GET  /api/warehouse/packages/ready-for-shipment # Get processed packages ready for grouping
POST /api/warehouse/shipments                   # Create new shipment from packages
GET  /api/warehouse/shipments                   # Get all shipments with filters
GET  /api/warehouse/shipments/{id}              # Get specific shipment details
PUT  /api/warehouse/shipments/{id}/status       # Update shipment status
POST /api/warehouse/shipments/{id}/dispatch     # Mark shipment as dispatched
PUT  /api/warehouse/shipments/{id}/logistics    # Update vehicle/driver assignment
```

### Tracking & Status
```
GET  /api/warehouse/tracking/{trackingNumber}   # Get tracking information
POST /api/warehouse/tracking/update             # Create new tracking point
GET  /api/warehouse/packages/{id}/timeline      # Get complete package timeline
GET  /api/warehouse/shipments/{id}/timeline     # Get shipment timeline
PUT  /api/warehouse/status/sync                 # Sync status updates to client app
```

### Staff Operations
```
GET  /api/warehouse/staff/tasks                 # Get assigned tasks for current user
PUT  /api/warehouse/staff/tasks/{id}/complete   # Mark task as completed
GET  /api/warehouse/dashboard                   # Get warehouse dashboard data
POST /api/warehouse/exceptions                  # Report exception requiring attention
GET  /api/warehouse/workload                    # Get current workload statistics
```

### Client Communication
```
POST /api/warehouse/notifications/send          # Send notification to client
GET  /api/warehouse/notifications/templates     # Get notification templates
POST /api/warehouse/whatsapp/send              # Send WhatsApp message
GET  /api/warehouse/clients/{id}/packages       # Get all packages for specific client
POST /api/warehouse/clients/{id}/notify         # Send custom notification to client
```

### Reporting & Analytics
```
GET  /api/warehouse/reports/daily               # Daily operations report
GET  /api/warehouse/reports/packages            # Package statistics
GET  /api/warehouse/reports/shipments           # Shipment performance
GET  /api/warehouse/analytics/efficiency        # Warehouse efficiency metrics
GET  /api/warehouse/analytics/trends            # Operational trends
```

## Security & Access Control

### Authentication & Authorization
- JWT-based authentication shared with client app
- Role-based access control (RBAC) for warehouse functions
- Session management and token refresh
- API rate limiting and security headers

### Data Protection
- Encryption for sensitive package information
- Secure image storage and access controls
- Audit logging for all critical operations
- Backup and disaster recovery procedures

### Access Levels
- **Public**: Tracking information for package owners
- **Staff**: Operational access based on role
- **Management**: Supervisory and reporting access  
- **Admin**: Full system configuration and control

---

## Backend Implementation Roadmap

### Phase 1: Core Infrastructure (Foundation)
**Database Setup:**
- Implement all entity models exactly as specified in Data Models section
- Set up foreign key relationships and constraints
- Create database indexes for tracking numbers, status fields, and foreign keys
- Implement audit logging triggers for all status changes

**Authentication & Authorization:**
- Implement JWT-based authentication system
- Create role-based access control (RBAC) middleware
- Set up session management and token refresh mechanisms
- Implement API rate limiting and security headers

**Basic API Framework:**
- Set up Spring Boot application structure
- Implement base controller classes with common functionality
- Create exception handling and error response standardization
- Set up request/response logging and monitoring

### Phase 2: Request Processing System
**Request Reception:**
- Implement webhook endpoints to receive client app notifications
- Create request validation and feasibility checking logic
- Build request approval/rejection workflow
- Set up automated client notifications for request status changes

**Package Creation:**
- Implement package creation from approved requests
- Build tracking number generation system (TT + 12 digits with check digit)
- Create barcode generation and management
- Set up initial status assignment and notification triggers

### Phase 3: Package Management Core
**Package Lifecycle:**
- Implement all package status transitions and validation
- Create package receiving and inspection workflows
- Build package processing and preparation systems
- Set up package location tracking and inventory management

**Status Management:**
- Implement unified status system with client app synchronization
- Create status history tracking and audit trails
- Build real-time status update mechanisms
- Set up exception handling and alert systems

### Phase 4: Shipment Orchestration
**Shipment Creation:**
- Implement intelligent package grouping algorithms
- Create shipment assembly and documentation systems
- Build resource assignment (vehicle, driver, route) management
- Set up shipment departure and tracking coordination

**Logistics Coordination:**
- Implement delivery type specific workflows (Ground/Air/Sea/Express)
- Create shipment tracking and location updates
- Build delivery confirmation and completion workflows
- Set up client notification and communication systems

### Phase 5: Advanced Features
**Communication Systems:**
- Implement WhatsApp integration for client communication
- Create automated notification templates and triggers
- Build custom communication workflows for exceptions
- Set up multi-channel notification management

**Reporting & Analytics:**
- Implement operational reporting dashboards
- Create performance metrics and KPI tracking
- Build trend analysis and predictive analytics
- Set up automated report generation and distribution

### Implementation Priorities

**Week 1-2: Foundation**
- Database schema and models
- Basic authentication and authorization
- Core API framework setup

**Week 3-4: Request Processing**
- Request reception and validation
- Package creation workflows
- Basic status management

**Week 5-6: Package Management**
- Package lifecycle implementation
- Status synchronization with client app
- Inventory and location tracking

**Week 7-8: Shipment System**
- Shipment creation and grouping
- Basic logistics coordination
- Delivery workflows

**Week 9-10: Integration & Testing**
- Client app integration testing
- End-to-end workflow validation
- Performance optimization

**Week 11-12: Advanced Features**
- Communication systems
- Reporting and analytics
- System monitoring and alerting

### Critical Success Metrics

**Functional Requirements:**
- 100% request-to-package conversion rate
- Real-time status synchronization with client app
- Zero package loss or misplacement
- Complete audit trail for all operations

**Performance Requirements:**
- < 2 second response time for all API calls
- Handle 10,000+ packages per day
- 99.9% system uptime
- Automatic failover and recovery

**Integration Requirements:**
- Seamless client app integration
- Real-time database synchronization
- Automated notification delivery
- Cross-platform data consistency

---

## Summary: The Complete Operational Blueprint

### What This Document Provides

**For Backend Developers:**
- Complete implementation roadmap with phased approach
- Detailed API specifications for all warehouse operations
- Database schema with relationships and constraints
- Business logic rules and validation requirements
- Integration points with client app and external systems

**For System Architects:**
- End-to-end workflow definitions
- Data flow architecture with normalized database design
- Status synchronization mechanisms across platforms
- Scalability and performance requirements
- Security and access control specifications

**For Business Stakeholders:**
- Complete operational workflow from request to delivery
- Business rules and exception handling procedures
- Staff roles and responsibility definitions
- Client communication and notification systems
- Performance metrics and success criteria

### Platform Integration Truth

**The warehouse system IS the platform:**
- Client app: User interface for request submission and tracking
- Warehouse system: Complete operational backbone managing all logistics
- Admin system: Management interface for system configuration and oversight

**Data flow reality:**
1. Client submits minimal data (user ID, package details, delivery preferences)
2. Warehouse creates complete operational records (packages, tracking, processing)
3. All status updates, notifications, and business logic flow through warehouse
4. Client app displays warehouse-generated data via real-time synchronization

### Critical Implementation Notes

**Package Types - Absolute Truth:**
- Only DOCUMENT and NON_DOCUMENT types exist
- This is definitive and unchangeable
- Any other references are errors

**Status Flows - Immutable Sequence:**
- Client app status maps to warehouse status
- Packages progress forward only through defined states
- Status history provides complete audit trail

**Database Architecture - Normalized Design:**
- No data duplication across systems
- Foreign key relationships ensure data integrity
- JOINs provide complete data views when needed
- Efficient data transfer between systems

### Next Steps for Implementation

1. **Start with database schema** - This is the foundation everything builds on
2. **Implement core request processing** - This is where client requests become warehouse operations
3. **Build package lifecycle management** - This is the heart of the logistics operation
4. **Add shipment orchestration** - This is how packages get delivered
5. **Integrate communication systems** - This is how everyone stays informed
6. **Implement reporting and analytics** - This is how operations are optimized

**This document contains everything needed to build and operate the complete Ttarius Logistics warehouse system. Every business rule, workflow, data model, and integration point has been defined to serve as the definitive implementation guide.**

---

*Last Updated: January 2025*  
*Document Version: 2.0 - Complete Operational Blueprint*  
*Status: Ready for Backend Implementation*
