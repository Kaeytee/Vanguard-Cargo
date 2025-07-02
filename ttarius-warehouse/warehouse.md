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
13. [Frontend Integration Requirements](#frontend-integration-requirements)
14. [Currency Handling & Pricing System](#currency-handling--pricing-system)

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

### Warehouse Staff Hierarchy & Organizational Structure

**Executive Level Management:**
- **Transportation Manager**: Oversees all shipping and logistics operations
  - **Transportation Coordinator**: Reports to Transportation Manager, handles day-to-day shipping coordination
- **Warehouse Manager**: Manages warehouse operations and staff
- **Inventory Analyst**: Tracks and analyzes inventory levels and movements
- **Logistics Analyst**: Analyzes logistics performance and optimization opportunities
- **Customer Service Representative**: Handles customer inquiries and communication
- **Export Documentation Specialist**: Manages all international shipping documentation and customs requirements

**Operational Level Staff:**
- **Order Fulfillment Specialists**: Report to Transportation Coordinator, handle package preparation and fulfillment
- **Warehouse Workers**: Handle physical package operations and movements
- **Quality Control Staff**: Ensure package condition and processing standards
- **Security Personnel**: Maintain warehouse security and access control

**Role-Specific Permissions Matrix:**

| Role | Package View | Status Update | Shipment Creation | Customer Release | System Admin |
|------|-------------|---------------|-------------------|------------------|--------------|
| Transportation Manager | All | Yes | Yes | Yes | Limited |
| Transportation Coordinator | Assigned | Yes | Yes | Yes | No |
| Warehouse Manager | All | Yes | Yes | Yes | Limited |
| Order Fulfillment Specialists | Assigned | Limited | No | No | No |
| Inventory Analyst | All | Limited | No | No | No |
| Logistics Analyst | All | No | No | No | No |
| Customer Service Rep | Customer-specific | Limited | No | Yes | No |
| Export Documentation | International | Limited | No | No | No |
| Warehouse Workers | Assigned | Limited | No | No | No |
| Warehouse Admin | All | Yes | Yes | Yes | Full |

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

## Frontend Integration Requirements: Client App Alignment

### CRITICAL: Frontend Must Enforce All Warehouse Business Rules

**This section defines the EXACT requirements for the client app frontend to ensure complete alignment with the warehouse system. Every rule, validation, UI element, and data structure defined here is NON-NEGOTIABLE and must be implemented exactly as specified.**

### Business Rules Enforcement in Frontend

#### Package Types - Frontend Implementation Requirements
```typescript
// CRITICAL: Only these 2 package types are allowed in the entire system
export const PACKAGE_TYPES = [
  { id: "DOCUMENT", label: "Document", description: "Legal documents, contracts, certificates, official papers" },
  { id: "NON_DOCUMENT", label: "Non-Document", description: "Everything else - goods, products, personal items, equipment" }
];

// Frontend MUST NOT allow any other package types
// UI MUST show descriptions to help users choose correctly
// Validation MUST reject any values not in this exact list
```

#### Delivery Types - Frontend Implementation Requirements
```typescript
// CRITICAL: Air is the only available service, others are future expansion
export const DELIVERY_TYPES = [
  { id: "air", label: "Air Freight (Primary)", primary: true, description: "International air freight - fast, reliable cross-border shipping" },
  { id: "ground", label: "Ground (Future)", disabled: true, description: "Cross-border ground transportation (coming soon)" },
  { id: "sea", label: "Sea Freight (Future)", disabled: true, description: "International sea freight for large shipments (coming soon)" },
  { id: "express", label: "Express (Future)", disabled: true, description: "Premium express international service (coming soon)" }
];

// Frontend MUST:
// 1. Auto-select "air" as default and only available option
// 2. Show disabled options with "(Future)" labels for transparency
// 3. Disable/hide non-air options in UI
// 4. Prevent form submission with disabled delivery types
```

#### International Logistics - Frontend Validation Requirements
```typescript
// CRITICAL: Origin country MUST be different from client country
export const SUPPORTED_COUNTRIES = [
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "US", name: "United States", flag: "🇺🇸" }
];

// Frontend MUST implement this exact validation logic:
export const getAvailableOriginCountries = (clientCountry: string) => {
  return SUPPORTED_COUNTRIES.filter(country => country.code !== clientCountry);
};

export const validateInternationalRequest = (clientCountry: string, originCountry: string) => {
  const errors = [];
  
  if (!clientCountry) {
    errors.push("Client country is required");
  }
  
  if (!originCountry) {
    errors.push("Origin country is required");
  }
  
  if (clientCountry === originCountry) {
    errors.push("Origin country must be different from your country (international logistics only)");
  }
  
  const supportedCountries = SUPPORTED_COUNTRIES.map(c => c.code);
  if (clientCountry && !supportedCountries.includes(clientCountry)) {
    errors.push("Client country not supported");
  }
  
  if (originCountry && !supportedCountries.includes(originCountry)) {
    errors.push("Origin country not supported");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

### Frontend UI Requirements

#### Form Validation - Mandatory Implementation
```typescript
// Frontend MUST validate these fields before submission:
const REQUIRED_FIELDS = {
  client: ["clientName", "clientEmail", "clientPhone", "clientCountry"],
  origin: ["originCountry", "originCity"],
  package: ["packageType", "packageCategory", "packageDescription", "freightType"]
};

// Email validation MUST use this exact pattern:
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// International request validation MUST be enforced at form level:
// - Origin country dropdown MUST exclude client's country
// - Form MUST show error if user somehow selects same country
// - Submit button MUST be disabled until all validations pass
```

#### Status Display - Client View Mapping
```typescript
// Frontend MUST map warehouse statuses to simplified client view:
export const CLIENT_STATUS = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW', 
  PROCESSING: 'PROCESSING',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  COMPLETED: 'COMPLETED'
} as const;

export const STATUS_LABELS = {
  [CLIENT_STATUS.SUBMITTED]: 'Request Submitted',
  [CLIENT_STATUS.UNDER_REVIEW]: 'Under Review',
  [CLIENT_STATUS.PROCESSING]: 'Processing',
  [CLIENT_STATUS.READY_FOR_PICKUP]: 'Ready for Pickup',
  [CLIENT_STATUS.COMPLETED]: 'Completed'
};

// Warehouse Status → Client Status Mapping (MUST be implemented exactly):
// AWAITING_PICKUP → UNDER_REVIEW
// RECEIVED → PROCESSING  
// PROCESSING → PROCESSING
// PROCESSED → PROCESSING
// GROUPED → READY_FOR_PICKUP
// SHIPPED → READY_FOR_PICKUP
// IN_TRANSIT → READY_FOR_PICKUP
// DELIVERED → COMPLETED
// EXCEPTION → PROCESSING (with error notes)
```

#### Tracking Number Format - Frontend Display
```typescript
// Frontend MUST display tracking numbers in this exact format:
export const generateTrackingNumber = () => {
  const randomDigits = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
  return `TT${randomDigits}`;
};

// Format: TT + 12 digits (e.g., TT123456789012)
// Frontend MUST validate this format when accepting tracking input
// Frontend MUST generate mock tracking numbers for demo purposes using this format
```

### Form Component Requirements

#### PackageOriginForm Requirements
```typescript
// MUST implement exactly:
interface PackageOriginFormProps {
  formData: {
    clientCountry: string;
    originCountry: string;
    originCity: string;
    // ...other fields
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

// UI Requirements:
// 1. Origin country dropdown MUST exclude client's own country
// 2. MUST show warning if no countries available
// 3. MUST display international logistics explanation
// 4. City field MUST only appear after country selection
// 5. MUST validate origin ≠ client country before allowing next step
```

#### PackageForm Requirements
```typescript
// MUST implement exactly:
interface PackageFormProps {
  formData: {
    packageType: string;
    packageCategory: string;
    packageDescription: string;
    freightType: string;
    // ...other fields
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

// UI Requirements:
// 1. Delivery type MUST default to "air" and be disabled
// 2. Package type MUST only show DOCUMENT/NON_DOCUMENT options
// 3. MUST show package type descriptions to help users
// 4. Package description MUST be required with minimum length
// 5. MUST validate all required fields before allowing next step
```

#### ConfirmForm Requirements
```typescript
// MUST implement exactly:
interface ConfirmFormProps {
  formData: CompleteFormData;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}

// UI Requirements:
// 1. MUST display all form data for review
// 2. MUST show international logistics confirmation
// 3. MUST display next steps explanation
// 4. Submit button MUST be disabled during submission
// 5. MUST show loading state during form processing
```

### Data Submission Format - API Integration

#### Request Payload Structure
```typescript
// Frontend MUST submit data in this exact format:
interface PackageRequestPayload {
  // Client information (from user profile)
  userId: string;
  clientCountry: string;
  
  // Origin information (user-selected)
  originCountry: string;
  originCity: string;
  
  // Package information (user-provided)
  packageType: "DOCUMENT" | "NON_DOCUMENT";
  deliveryType: "air"; // Only air is available
  packageCategory: string;
  packageDescription: string;
  
  // Optional fields
  specialRequirements?: string;
}

// Frontend MUST validate this structure before API call
// Frontend MUST handle API validation errors gracefully
// Frontend MUST show success/error states appropriately
```

### Error Handling Requirements

#### Validation Error Messages
```typescript
// Frontend MUST use these exact error messages:
const ERROR_MESSAGES = {
  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  INTERNATIONAL_ONLY: "Origin country must be different from your country (international logistics only)",
  COUNTRY_NOT_SUPPORTED: "Selected country is not supported",
  PACKAGE_TYPE_INVALID: "Please select a valid package type (Document or Non-Document)",
  DELIVERY_TYPE_INVALID: "Only Air delivery is currently available",
  DESCRIPTION_TOO_SHORT: "Package description must be at least 10 characters",
  FORM_INCOMPLETE: "Please fill in all required fields marked with *"
};

// Error display requirements:
// 1. Field-level errors MUST appear below each input
// 2. Form-level errors MUST appear at top of form
// 3. Step validation errors MUST prevent step progression
// 4. API errors MUST be displayed clearly with retry option
```

#### Success Handling Requirements
```typescript
// Frontend MUST handle success states:
interface SuccessFlow {
  submission: {
    showLoader: boolean;
    showSuccess: boolean;
    redirectTo: "/app/shipment-history";
    message: "Success! Your package request has been submitted.";
  };
  tracking: {
    generateTrackingNumber: boolean;
    displayFormat: "TT############";
    copyToClipboard: boolean;
  };
}
```

### Multi-Step Form Requirements

#### Step Navigation Logic
```typescript
// Frontend MUST implement exact step progression:
const FORM_STEPS = [
  {
    id: 1,
    name: "Origin & Client",
    component: "PackageOriginForm",
    validation: "validateOriginStep",
    requiredFields: ["originCountry", "originCity", "clientName", "clientEmail", "clientPhone"]
  },
  {
    id: 2,
    name: "Package",
    component: "PackageForm", 
    validation: "validatePackageStep",
    requiredFields: ["packageType", "packageCategory", "packageDescription", "freightType"]
  },
  {
    id: 3,
    name: "Confirm",
    component: "ConfirmForm",
    validation: "validateFinalStep",
    action: "submitForm"
  }
];

// Step indicator MUST show current progress
// Back button MUST be available on steps 2 and 3
// Next button MUST validate current step before proceeding
// Submit MUST only be available on final step
```

### Testing Requirements

#### Frontend Unit Tests
```typescript
// MUST test these scenarios:
describe('Package Type Validation', () => {
  it('should only allow DOCUMENT and NON_DOCUMENT types');
  it('should reject invalid package types');
  it('should show package type descriptions');
});

describe('International Logistics Validation', () => {
  it('should exclude client country from origin options');
  it('should show error for same origin and client country');
  it('should validate supported countries only');
});

describe('Form Submission', () => {
  it('should validate all required fields');
  it('should show loading state during submission');
  it('should handle API errors gracefully');
  it('should redirect on successful submission');
});
```

#### Integration Tests
```typescript
// MUST test complete user flows:
describe('Complete Package Request Flow', () => {
  it('should complete Ghana client requesting from USA');
```
## Currency Handling & Pricing System

### Base Currency Framework
**All prices in the Ttarius Logistics system are stored in Ghana Cedis (GHC) in the database.**

**Currency Conversion Rules:**
- **USD Payments**: Converted to GHC using current exchange rate before database storage
- **Other Currencies**: All converted to GHC as the universal base currency
- **Exchange Rates**: Updated daily via financial API integration
- **Historical Tracking**: Complete audit trail of exchange rates used for each transaction

### In-Person Pricing Determination
**All package pricing is determined in-person by warehouse staff during physical package inspection.**

**Pricing Factors:**
1. **Physical Measurements**: Length × Width × Height (cm), Weight (kg)
2. **Package Type**: Document vs Non-Document pricing tiers
3. **Delivery Service**: Air freight (primary), future expansion services
4. **Origin/Destination**: International route-specific pricing
5. **Special Handling**: Fragile, hazardous, oversized, or valuable items
6. **Insurance Value**: Optional insurance based on declared package value

### Pricing Structure Framework
```
Base Pricing Calculation (in GHC):
Base Rate + Weight Fee + Dimension Fee + Service Fee + Special Handling + Insurance

Base Rates (GHC):
- Document Package (Ghana ↔ USA): 50 GHC base
- Non-Document Package (Ghana ↔ USA): 80 GHC base

Weight Tiers (per kg):
- 0-2kg: 15 GHC per kg
- 2-5kg: 20 GHC per kg  
- 5-10kg: 25 GHC per kg
- 10kg+: 30 GHC per kg

Volume Pricing (if exceeds weight calculation):
- Per cubic meter: 150 GHC

Service Fees:
- Air Freight: Included in base rate
- Express Handling: +50 GHC
- Special Handling: +25-100 GHC (staff determined)

Insurance Options:
- Basic Coverage: Included (up to 500 GHC)
- Extended Coverage: 2% of declared value
```

### Currency Conversion API Integration
```typescript
// Exchange Rate Management
interface ExchangeRate {
  id: UUID;
  fromCurrency: string; // USD, EUR, etc.
  toCurrency: "GHC"; // Always GHC as base
  rate: number;
  dateRecorded: timestamp;
  sourceAPI: string;
  isActive: boolean;
}

// Pricing Calculation API
POST /api/warehouse/pricing/calculate
{
  weight: number; // kg
  dimensions: {
    length: number; // cm
    width: number;  // cm
    height: number; // cm
  };
  packageType: "DOCUMENT" | "NON_DOCUMENT";
  originCountry: string;
  destinationCountry: string;
  declaredValue: number; // in original currency
  originalCurrency: string; // USD, GHC, etc.
  specialHandling: string[]; // fragile, hazardous, etc.
}

Response:
{
  pricing: {
    baseRate: number; // GHC
    weightFee: number; // GHC
    dimensionFee: number; // GHC
    serviceFee: number; // GHC
    specialHandlingFee: number; // GHC
    insuranceFee: number; // GHC
    totalGHC: number; // Final price in GHC
    exchangeRateUsed?: ExchangeRate; // If conversion applied
  };
  breakdown: string[]; // Detailed cost explanation
}
```

### Staff Pricing Workflow
**When Physical Package Arrives:**
1. **Measurement**: Staff measures exact dimensions and weight
2. **Assessment**: Evaluate package condition and special requirements
3. **Calculation**: Use warehouse system to calculate pricing in real-time
4. **Currency Handling**: If customer paid in USD, convert to GHC for storage
5. **Documentation**: Record final GHC price in package record
6. **Receipt**: Generate receipt showing both original currency and GHC equivalent

### Currency Storage & Reporting
```sql
-- All monetary values stored in GHC
CREATE TABLE package_pricing (
  id UUID PRIMARY KEY,
  package_id UUID REFERENCES packages(id),
  total_price_ghc DECIMAL(10,2) NOT NULL, -- Always in GHC
  original_currency VARCHAR(3), -- USD, GHC, etc.
  original_amount DECIMAL(10,2), -- Original payment amount
  exchange_rate_id UUID REFERENCES exchange_rates(id),
  pricing_breakdown JSONB, -- Detailed cost components
  determined_by UUID REFERENCES users(id), -- Staff who set price
  determined_at TIMESTAMP NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'PENDING'
);
```

## Customer Identification & Package Release System

### Customer Lookup & Verification System
**Warehouse staff can identify customers and their packages using multiple methods:**

**Primary Identification Methods:**
1. **Customer ID**: Unique system-generated ID for each customer
2. **Phone Number**: Customer's registered phone number
3. **Email Address**: Customer's registered email address
4. **National ID**: Government-issued identification number
5. **Tracking Number**: Specific package tracking number (TT############)

### Package Lookup Workflow
**Staff Interface for Customer Service:**

```typescript
// Customer Lookup API
GET /api/warehouse/customers/lookup
Query Parameters:
- customerId?: string
- phoneNumber?: string
- emailAddress?: string
- nationalId?: string
- trackingNumber?: string

Response:
{
  customer: {
    id: UUID;
    name: string;
    email: string;
    phone: string;
    country: string;
    registrationDate: timestamp;
  };
  packages: [
    {
      id: UUID;
      trackingNumber: string;
      status: PackageStatus;
      shipmentId?: UUID;
      shipmentNumber?: string;
      estimatedArrival: timestamp;
      currentLocation: string;
      readyForPickup: boolean;
      canBeReleased: boolean;
    }
  ];
  shipments: [
    {
      id: UUID;
      shipmentNumber: string;
      status: ShipmentStatus;
      packageCount: number;
      estimatedDelivery: timestamp;
      actualArrival?: timestamp;
    }
  ];
}
```

### Package Status Verification & Management
**Before Package Release, Staff Must Verify:**

1. **Customer Identity**: Confirm customer matches package owner
2. **Package Status**: Ensure package is "READY_FOR_PICKUP" or "DELIVERED"
3. **Location Verification**: Confirm package is physically in the warehouse
4. **Payment Status**: Verify all fees have been paid
5. **Special Requirements**: Check for any special handling or documentation needs

```typescript
// Package Status Check API
GET /api/warehouse/packages/{packageId}/release-eligibility

Response:
{
  eligible: boolean;
  requirements: {
    statusCheck: boolean; // Is status READY_FOR_PICKUP?
    paymentCheck: boolean; // Are all fees paid?
    identityCheck: boolean; // Customer identity confirmed?
    locationCheck: boolean; // Package physically available?
    documentationCheck: boolean; // All docs complete?
  };
  blockers: string[]; // Reasons if not eligible
  actions: string[]; // Required actions before release
}
```

### Secure Package Release Process
**Multi-Step Verification Workflow:**

**Step 1: Customer Arrival & Initial Verification**
```typescript
// Staff initiates customer check-in
POST /api/warehouse/release/initiate
{
  customerIdentifier: string; // ID, phone, email, etc.
  verificationType: "CUSTOMER_ID" | "PHONE" | "EMAIL" | "NATIONAL_ID" | "TRACKING_NUMBER";
  staffId: UUID; // Staff member handling release
}
```

**Step 2: Identity Confirmation**
```typescript
// Verify customer identity with multiple methods
POST /api/warehouse/release/verify-identity
{
  sessionId: UUID; // From initiation
  primaryId: string; // Main identifier used
  secondaryVerification: {
    method: "PHONE_SMS" | "EMAIL_CODE" | "PHOTO_ID" | "BIOMETRIC";
    value: string; // Code, photo, etc.
  };
  photoIdCapture?: string; // Base64 image of customer ID
}
```

**Step 3: Package Selection & Status Update**
```typescript
// Select specific packages for release
POST /api/warehouse/release/select-packages
{
  sessionId: UUID;
  packageIds: UUID[];
  releaseReason: "NORMAL_PICKUP" | "EARLY_RELEASE" | "SPECIAL_CIRCUMSTANCES";
  managerApproval?: UUID; // Required for non-normal releases
}
```

**Step 4: Final Release & Documentation**
```typescript
// Complete package release with full documentation
POST /api/warehouse/release/complete
{
  sessionId: UUID;
  customerSignature: string; // Base64 image
  staffSignature: string; // Base64 image
  customerPhoto: string; // Base64 image for verification
  packagePhotos: string[]; // Base64 images of packages being released
  releaseNotes?: string; // Any special notes
  witnessStaffId?: UUID; // Second staff member if required
}
```

### Package Release Authorization Matrix

| Package Value (GHC) | Staff Level Required | Manager Approval | Photo Documentation | Witness Required |
|---------------------|---------------------|------------------|-------------------|------------------|
| 0 - 500 | Warehouse Worker | No | Customer ID + Signature | No |
| 501 - 2000 | Warehouse Worker | No | Customer ID + Signature + Package Photos | No |
| 2001 - 5000 | Order Fulfillment Specialist | No | Full Documentation | Yes |
| 5000+ | Warehouse Manager | Yes | Full Documentation | Yes |
| Special Circumstances | Warehouse Manager | Yes | Full Documentation | Yes |

### Shipment Tracking Integration
**When customer has multiple packages in a shipment:**

```typescript
// Get shipment details with all packages
GET /api/warehouse/shipments/{shipmentId}/customer-packages/{customerId}

Response:
{
  shipment: {
    id: UUID;
    number: string;
    status: ShipmentStatus;
    totalPackages: number;
    customerPackages: number;
    estimatedDelivery: timestamp;
    actualArrival?: timestamp;
  };
  customerPackages: [
    {
      id: UUID;
      trackingNumber: string;
      status: PackageStatus;
      canBeReleased: boolean;
      requiresSpecialHandling: boolean;
    }
  ];
  releaseOptions: {
    releaseIndividually: boolean; // Can release packages one by one
    releaseAsGroup: boolean; // Must release all together
    partialReleaseAllowed: boolean; // Some packages ready, others not
  };
}
```

### Release Documentation & Audit Trail
**Every package release generates comprehensive documentation:**

```sql
CREATE TABLE package_releases (
  id UUID PRIMARY KEY,
  package_id UUID REFERENCES packages(id),
  customer_id UUID REFERENCES users(id),
  release_session_id UUID, -- Links all packages released together
  
  -- Staff Information
  releasing_staff_id UUID REFERENCES users(id),
  witness_staff_id UUID REFERENCES users(id),
  manager_approval_id UUID REFERENCES users(id),
  
  -- Verification Details
  identity_verification_method VARCHAR(50),
  identity_verification_value VARCHAR(255), -- Phone, email, etc.
  photo_id_captured BOOLEAN DEFAULT FALSE,
  
  -- Documentation
  customer_signature_image TEXT, -- Base64
  staff_signature_image TEXT, -- Base64
  customer_photo_image TEXT, -- Base64
  package_photos JSONB, -- Array of base64 images
  
  -- Release Details
  release_type VARCHAR(50), -- NORMAL, EARLY, SPECIAL
  release_reason TEXT,
  release_notes TEXT,
  
  -- Timing
  initiated_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Status
  status VARCHAR(20) DEFAULT 'COMPLETED', -- INITIATED, VERIFIED, COMPLETED, CANCELLED
  
  CONSTRAINT valid_release_type CHECK (release_type IN ('NORMAL_PICKUP', 'EARLY_RELEASE', 'SPECIAL_CIRCUMSTANCES'))
);
```

### Error Handling & Special Situations

**Common Scenarios & Solutions:**

1. **Customer Lost ID**: 
   - Use secondary verification (phone SMS + email)
   - Require manager approval
   - Enhanced photo documentation

2. **Package Not Ready**: 
   - Show expected ready date
   - Offer notification signup
   - Explain current status

3. **Payment Pending**: 
   - Block release until payment
   - Direct to payment processing
   - Hold package securely

4. **Damaged Package**: 
   - Document damage thoroughly
   - Get customer acknowledgment
   - Process insurance claim if applicable

5. **Wrong Customer**: 
   - Verify identity more thoroughly
   - Check for similar names/details
   - Require additional documentation

### Customer Communication During Release
```typescript
// Automated notifications during release process
POST /api/warehouse/notifications/release-status
{
  customerId: UUID;
  packageIds: UUID[];
  status: "ARRIVAL_CONFIRMED" | "READY_FOR_PICKUP" | "PICKUP_SCHEDULED" | "RELEASED";
  channel: "SMS" | "EMAIL" | "WHATSAPP" | "ALL";
  customMessage?: string;
}

// WhatsApp integration for real-time updates
POST /api/warehouse/whatsapp/release-notification
{
  customerPhone: string;
  packageTrackingNumbers: string[];
  messageTemplate: "PACKAGE_READY" | "PLEASE_BRING_ID" | "PACKAGE_RELEASED";
  warehouseLocation: {
    address: string;
    hours: string;
    contactNumber: string;
  };
}
```