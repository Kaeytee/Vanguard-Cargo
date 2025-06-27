# Ttarius Logistics - Warehouse System Documentation

## Overview

This document outlines the warehouse management system for Ttarius Logistics, focusing on how client details from the client application are utilized within the warehouse operations. The warehouse system is responsible for processing packages, creating shipments, managing inventory, tracking packages, and communicating with clients.

## Table of Contents

1. [Client Data Integration](#client-data-integration)
2. [Shipment Creation Process](#shipment-creation-process)
3. [Barcode Generation & Tracking](#barcode-generation--tracking)
4. [Image Handling & Documentation](#image-handling--documentation)
5. [WhatsApp Integration](#whatsapp-integration)
6. [Status Updates & Notifications](#status-updates--notifications)
7. [Real-Time Tracking](#real-time-tracking)
8. [AI-Powered Grouping](#ai-powered-grouping)
9. [API Endpoints](#api-endpoints)
10. [Data Models](#data-models)
11. [Integration with Client App](#integration-with-client-app)

## Client Data Integration

The warehouse system utilizes client data from the client application to process packages and create shipments. The following client details are essential for warehouse operations:

### Client Information Used

```typescript
// Client information used from client app
interface ClientDataForWarehouse {
  userId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientCity: string;
  clientState: string;
  clientZip: string;
  clientCountry: string;
}
```

### Package Information Used

```typescript
// Package information used from client app
interface PackageDataForWarehouse {
  id: string;
  shipmentId: string;
  clientId: string;
  
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
  
  // Package details
  freightType: string;
  packageType: string;
  packageCategory: string;
  packageDescription: string;
  packageNote: string;
  packageValue: string;
  packageWeight: string;
  
  // Tracking information
  trackingNumber: string;
  status: PackageStatus;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

enum PackageStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
  PROCESSED = 'processed',
  READY_FOR_SHIPMENT = 'ready_for_shipment',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  RETURNED = 'returned'
}
```

## Shipment Creation Process

The core duty of the warehouse system is to create shipments by grouping processed packages from clients. The process follows these steps:

1. **Package Reception**: Packages are received from clients and marked as "RECEIVED" in the system.
2. **Package Processing**: Warehouse staff processes packages (inspection, verification, labeling) and updates status to "PROCESSED".
3. **Shipment Group Creation**: The system selects all packages with "PROCESSED" status and groups them based on:
   - Destination region/country
   - Delivery type (ground, air, sea, express)
   - Priority level
   - Size and weight constraints
4. **Shipment Creation**: A shipment is created containing multiple processed packages, and package statuses are updated to "READY_FOR_SHIPMENT".
5. **Shipment Dispatch**: When the shipment leaves the warehouse, the status is updated to "SHIPPED".

```typescript
// Shipment grouping model
interface Shipment {
  id: string;
  shipmentCode: string;
  packages: string[]; // Array of package IDs
  destinationRegion: string;
  deliveryType: string;
  totalWeight: number;
  totalPackages: number;
  status: ShipmentStatus;
  departureDate: Date | null;
  estimatedArrival: Date | null;
  carrierInformation: CarrierInformation;
  createdAt: Date;
  updatedAt: Date;
}

enum ShipmentStatus {
  PREPARING = 'preparing',
  READY = 'ready',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  ISSUE = 'issue'
}

interface CarrierInformation {
  name: string;
  trackingCode: string;
  contactInfo: string;
}
```

## Barcode Generation & Tracking

The warehouse system includes robust barcode generation and tracking capabilities for efficient package management:

### Barcode Generation

```typescript
// Package barcode generation utilities
class PackageUtils {
  /**
   * Generates a unique package ID with prefix PKG-
   */
  static generatePackageId(): string;
  
  /**
   * Generates a unique tracking number with format TT + 12 digits
   */
  static generateTrackingNumber(): string;
  
  /**
   * Calculates package volume based on dimensions
   */
  static calculateVolume(dimensions: PackageDimensions): number;
}
```

### Tracking Number System

Each package is assigned a unique tracking number with the format `TT` followed by 12 digits (e.g., TT001234567890). This tracking number is used throughout the logistics process for:

1. **Package Identification**: Uniquely identifies each package in the system
2. **Status Tracking**: Links to all status updates and tracking points
3. **Client Access**: Allows clients to track their packages using the client app
4. **Barcode Scanning**: Enables warehouse staff to quickly scan and update package status

### Barcode Scanning Process

1. Warehouse staff scan package barcodes using mobile devices or dedicated scanners
2. The system automatically identifies the package and displays relevant information
3. Staff can update package status, add notes, or report exceptions
4. All scan events are recorded as tracking points with timestamp and location data

### Tracking Point Generation

```typescript
// Tracking point generation for package status updates
interface TrackingPoint {
  id: string;
  packageId: string;
  groupId?: string;
  location: LocationPoint;
  status: PackageStatus | GroupStatus;
  timestamp: string;
  isEstimated: boolean;
  isVisible: boolean;
  isActive: boolean;
  isMilestone: boolean;
  sequence: number;
  description: string;
  facilityType: FacilityType;
  scanType?: ScanType;
  scannedBy?: string;
  deviceId?: string;
  temperature?: number;
  humidity?: number;
  notes?: string;
  internalNotes?: string;
  exceptionType?: ExceptionType;
  exceptionDetails?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
  source: TrackingSource;
  confidence: number;
  metadata?: Record<string, unknown>;
}
```

## Image Handling & Documentation

The warehouse system includes comprehensive image handling capabilities for package documentation and client communication:

### Image Upload Service

```typescript
/**
 * Service for handling image uploads
 */
export class ImageUploadService {
  /**
   * Uploads an image blob to the server
   * @param imageBlob - The image blob to upload
   * @param filename - Optional filename for the image
   * @returns Promise resolving to the public URL of the uploaded image
   */
  async uploadImage(imageBlob: Blob, filename: string = 'image.jpg'): Promise<string>;

  /**
   * Converts a data URL to a Blob
   * @param dataURL - The data URL to convert
   * @returns Blob object
   */
  dataURLtoBlob(dataURL: string): Blob;
}
```

### Package Documentation Process

1. **Image Capture**: Warehouse staff capture images of packages at various stages:
   - Upon receipt (condition documentation)
   - After processing (labeling verification)
   - Before shipment (final condition verification)
   - For any exceptions or damage

2. **Image Processing**:
   - Images are converted from data URLs to blobs for efficient storage
   - Metadata is added (timestamp, package ID, status, user)
   - Images are uploaded to secure storage

3. **Image Association**:
   - Images are linked to specific packages in the database
   - Multiple images can be associated with a single package
   - Images are categorized by type (receipt, processing, exception, etc.)

4. **Image Retrieval**:
   - Images can be retrieved for internal review
   - Select images can be shared with clients via WhatsApp or email
   - Images serve as documentation for claims or disputes

### Image Integration with Client Communication

Package images are integrated with client communication channels:

1. **WhatsApp Image Sharing**: Package images can be included in WhatsApp messages to clients
2. **Email Attachments**: Images can be attached to email notifications
3. **Client Portal**: Select images are available in the client portal for package verification

## WhatsApp Integration

The warehouse system features direct WhatsApp integration for efficient client communication:

### WhatsApp Service

```typescript
/**
 * Service for handling WhatsApp interactions
 */
export class WhatsAppService {
  /**
   * Generates a WhatsApp deep link with a pre-filled message
   * @param phoneNumber - The phone number in international format (e.g., +1234567890)
   * @param message - The message to pre-fill
   * @returns WhatsApp deep link URL
   */
  generateWhatsAppLink(phoneNumber: string, message: string): string;
  
  /**
   * Generates a WhatsApp message with package details and image
   * @param packageId - The package ID
   * @param clientName - The client name
   * @param imageUrl - The URL of the uploaded image
   * @returns Formatted message string
   */
  generatePackageMessage(packageId: string, clientName: string, imageUrl: string): string;
  
  /**
   * Opens WhatsApp with the generated link
   * @param phoneNumber - The phone number to send to
   * @param message - The message content
   */
  openWhatsApp(phoneNumber: string, message: string): void;
  
  /**
   * Validates if a phone number is in a valid international format
   * @param phoneNumber - The phone number to validate
   * @returns boolean indicating if the number is valid
   */
  validatePhoneNumber(phoneNumber: string): boolean;
}
```

### WhatsApp Communication Process

1. **Trigger Events**: WhatsApp messages are triggered by specific events:
   - Package receipt confirmation
   - Status changes (processing, ready for shipment, shipped)
   - Delivery confirmation
   - Exception handling (delays, issues)

2. **Message Generation**:
   - System generates personalized messages with client and package details
   - Images can be included for visual confirmation
   - Deep links can be added for tracking access

3. **Sending Process**:
   - WhatsApp deep links are generated with pre-filled messages
   - Staff can review messages before sending
   - Messages are sent directly from the warehouse system

4. **Delivery Confirmation**:
   - System records when messages are sent
   - Delivery status is tracked when possible

### Client Phone Number Validation

The system includes phone number validation to ensure messages reach clients:

1. **Format Validation**: Ensures phone numbers follow international format standards
2. **Country Code Detection**: Automatically detects and formats country codes
3. **Error Prevention**: Prevents messages from being sent to invalid numbers

## Status Updates & Notifications

The warehouse system includes a comprehensive status update and notification system:

### Status Update Service

```typescript
/**
 * Service for handling status updates across the system
 */
export class StatusUpdateService {
  /**
   * Updates the status of a package and triggers appropriate notifications
   * @param packageId - The package ID
   * @param newStatus - The new status to set
   * @param notes - Optional notes about the status change
   * @returns Status update result with success/failure and notifications sent
   */
  updatePackageStatus(packageId: string, newStatus: PackageStatus, notes?: string): Promise<StatusUpdateResult>;
  
  /**
   * Updates the status of multiple packages in a batch operation
   * @param packageIds - Array of package IDs
   * @param newStatus - The new status to set for all packages
   * @param notes - Optional notes about the status change
   * @returns Batch status update result
   */
  batchUpdatePackageStatus(packageIds: string[], newStatus: PackageStatus, notes?: string): Promise<BatchStatusUpdateResult>;
  
  /**
   * Updates the status of a shipment group and optionally cascades to contained packages
   * @param groupId - The shipment group ID
   * @param newStatus - The new status to set
   * @param cascadeToPackages - Whether to update all packages in the group
   * @returns Group status update result
   */
  updateGroupStatus(groupId: string, newStatus: GroupStatus, cascadeToPackages: boolean): Promise<GroupStatusUpdateResult>;
  
  /**
   * Triggers notifications based on a status change
   * @param entityId - The entity ID (package or group)
   * @param entityType - The type of entity (package or group)
   * @param status - The new status
   * @param notificationTypes - Types of notifications to send (email, SMS, WhatsApp)
   */
  triggerStatusNotifications(entityId: string, entityType: EntityType, status: any, notificationTypes: NotificationType[]): Promise<NotificationResult>;
}
```

### Status Update Process

1. **Status Change Triggers**:
   - Manual updates by warehouse staff
   - Barcode scanning events
   - Automated system events (e.g., shipment departure)
   - Carrier API integrations

2. **Status Validation**:
   - System validates that the status change follows the allowed workflow
   - Prevents invalid status transitions
   - Ensures required data is present for the new status

3. **Cascading Updates**:
   - Updates to group status can cascade to all contained packages
   - Updates to carrier status can cascade to related shipments
   - System maintains consistency across related entities

4. **Notification Triggering**:
   - Status changes trigger appropriate notifications
   - Different notification types based on status and recipient preferences
   - Notifications include relevant details and next steps

### Notification Types

The system supports multiple notification channels:

1. **Email Notifications**:
   - HTML-formatted emails with package details
   - Tracking links and status information
   - Delivery instructions and estimated times

2. **SMS Notifications**:
   - Concise text messages for critical updates
   - Tracking links and status codes
   - Opt-in/opt-out management

3. **WhatsApp Notifications**:
   - Rich messages with images and formatting
   - Interactive elements when supported
   - Delivery confirmation

4. **Internal Notifications**:
   - System alerts for warehouse staff
   - Exception handling notifications
   - SLA breach warnings

## Real-Time Tracking

The warehouse system provides comprehensive real-time tracking capabilities:

### Tracking Service

```typescript
/**
 * Service for handling package and shipment tracking
 */
export class TrackingService {
  /**
   * Creates a new tracking point for a package
   * @param packageId - The package ID
   * @param location - Location information
   * @param status - The status at this tracking point
   * @returns The created tracking point
   */
  createTrackingPoint(packageId: string, location: LocationPoint, status: PackageStatus): Promise<TrackingPoint>;
  
  /**
   * Gets the complete tracking timeline for a package
   * @param packageId - The package ID
   * @returns Array of tracking points in chronological order
   */
  getPackageTimeline(packageId: string): Promise<TrackingPoint[]>;
  
  /**
   * Gets the current location of a package or shipment
   * @param id - The package or shipment ID
   * @param type - The entity type (package or shipment)
   * @returns Current location information
   */
  getCurrentLocation(id: string, type: EntityType): Promise<LocationPoint>;
  
  /**
   * Broadcasts a real-time tracking update to subscribed clients
   * @param trackingPoint - The tracking point to broadcast
   * @returns Broadcast result with success/failure and recipient count
   */
  broadcastTrackingUpdate(trackingPoint: TrackingPoint): Promise<BroadcastResult>;
  
  /**
   * Generates a tracking notification for a significant event
   * @param trackingPoint - The tracking point that triggered the notification
   * @param notificationType - The type of notification to generate
   * @returns The generated notification
   */
  generateTrackingNotification(trackingPoint: TrackingPoint, notificationType: TrackingNotificationType): Promise<TrackingNotification>;
}
```

### Real-Time Tracking Features

1. **Location Tracking**:
   - GPS coordinates for each tracking point
   - Facility identification and mapping
   - Route visualization and mapping integration
   - Estimated time of arrival calculations

2. **Status Timeline**:
   - Chronological history of all package status changes
   - Milestone highlighting for key events
   - Exception flagging and resolution tracking
   - Estimated vs. actual timing comparisons

3. **Real-Time Updates**:
   - WebSocket-based real-time updates
   - Push notifications for status changes
   - Live map tracking for in-transit packages
   - Delivery window notifications

4. **Tracking Analytics**:
   - Transit time analysis
   - Delay pattern identification
   - Performance metrics by route, carrier, and package type
   - Exception rate monitoring

### OpenStreetMap Integration

The tracking system integrates with OpenStreetMap for location visualization:

1. **Map Rendering**: Displays package locations on interactive maps
2. **Route Visualization**: Shows the planned and actual routes
3. **Geofencing**: Triggers events when packages enter or leave defined areas
4. **Clustering**: Groups multiple packages for efficient visualization

## AI-Powered Grouping

The warehouse system leverages artificial intelligence for optimal package grouping and shipment planning:

### Group Management Service

```typescript
/**
 * Service for managing package groups and shipments
 */
export class GroupManagementService {
  /**
   * Creates a new shipment group from selected packages
   * @param packageIds - Array of package IDs to include in the group
   * @param groupType - The type of group to create
   * @returns The created shipment group
   */
  createShipmentGroup(packageIds: string[], groupType: GroupType): Promise<ShipmentGroup>;
  
  /**
   * Gets AI-powered recommendations for optimal package grouping
   * @param packageIds - Array of package IDs to consider for grouping
   * @param optimizationCriteria - Criteria to optimize for (cost, speed, efficiency)
   * @returns Recommended package groupings
   */
  getGroupingRecommendations(packageIds: string[], optimizationCriteria: OptimizationCriteria): Promise<GroupingRecommendation[]>;
  
  /**
   * Assigns a vehicle and driver to a shipment group
   * @param groupId - The shipment group ID
   * @param vehicleId - The vehicle ID
   * @param driverId - The driver ID
   * @returns Updated shipment group with assignment details
   */
  assignVehicleAndDriver(groupId: string, vehicleId: string, driverId: string): Promise<ShipmentGroup>;
  
  /**
   * Updates a shipment group's status and records history
   * @param groupId - The shipment group ID
   * @param newStatus - The new status to set
   * @param notes - Optional notes about the status change
   * @returns Updated shipment group
   */
  updateGroupStatus(groupId: string, newStatus: GroupStatus, notes?: string): Promise<ShipmentGroup>;
}
```

### AI Grouping Features

1. **Intelligent Package Grouping**:
   - Analyzes package characteristics (size, weight, destination)
   - Considers delivery priorities and deadlines
   - Optimizes for vehicle capacity utilization
   - Balances cost efficiency with delivery speed

2. **Route Optimization**:
   - Calculates optimal delivery routes
   - Minimizes travel distance and time
   - Accounts for traffic patterns and restrictions
   - Adapts to real-time conditions

3. **Resource Allocation**:
   - Matches appropriate vehicles to shipment requirements
   - Assigns drivers based on route knowledge and expertise
   - Balances workload across available resources
   - Schedules departures for optimal efficiency

4. **Predictive Analytics**:
   - Forecasts delivery times based on historical data
   - Identifies potential delays or issues
   - Suggests preemptive actions to maintain schedules
   - Continuously improves through machine learning

### Optimization Criteria

The AI grouping system can optimize for different criteria based on business needs:

1. **Cost Efficiency**: Minimizes transportation and handling costs
2. **Delivery Speed**: Prioritizes fastest possible delivery times
3. **Vehicle Utilization**: Maximizes the use of available vehicle capacity
4. **Environmental Impact**: Reduces carbon footprint through efficient routing
5. **Balanced Approach**: Combines multiple criteria with customizable weightings

## API Endpoints

### Package Management

- `GET /api/warehouse/packages` - Get all packages in the warehouse
- `GET /api/warehouse/packages/pending` - Get all pending packages
- `GET /api/warehouse/packages/processed` - Get all processed packages ready for shipment
- `GET /api/warehouse/packages/:id` - Get details of a specific package
- `PUT /api/warehouse/packages/:id/status` - Update package status
- `GET /api/warehouse/packages/client/:clientId` - Get all packages for a specific client
- `POST /api/warehouse/packages` - Create a new package
- `PUT /api/warehouse/packages/:id` - Update package details
- `DELETE /api/warehouse/packages/:id` - Delete a package (soft delete)
- `POST /api/warehouse/packages/batch-status` - Update status of multiple packages

### Barcode & Tracking

- `GET /api/warehouse/packages/:id/barcode` - Get barcode image for a package
- `POST /api/warehouse/packages/generate-tracking` - Generate a new tracking number
- `GET /api/warehouse/tracking/:trackingNumber` - Get tracking information by tracking number
- `POST /api/warehouse/tracking/points` - Create a new tracking point
- `GET /api/warehouse/tracking/package/:packageId` - Get all tracking points for a package
- `GET /api/warehouse/tracking/timeline/:packageId` - Get chronological timeline for a package
- `GET /api/warehouse/tracking/current-location/:id` - Get current location of package or shipment

### Shipment Management

- `POST /api/warehouse/shipments` - Create a new shipment group
- `GET /api/warehouse/shipments` - Get all shipments
- `GET /api/warehouse/shipments/:id` - Get details of a specific shipment
- `PUT /api/warehouse/shipments/:id/status` - Update shipment status
- `GET /api/warehouse/shipments/pending` - Get all pending shipments
- `GET /api/warehouse/shipments/in-transit` - Get all in-transit shipments
- `POST /api/warehouse/shipments/auto-create` - Automatically create optimal shipment groups from processed packages
- `POST /api/warehouse/shipments/:id/assign` - Assign vehicle and driver to shipment

### AI Grouping

- `POST /api/warehouse/ai/grouping-recommendations` - Get AI recommendations for package grouping
- `GET /api/warehouse/ai/optimization-options` - Get available optimization criteria
- `POST /api/warehouse/ai/route-optimization` - Get optimized routes for shipments
- `GET /api/warehouse/ai/resource-allocation` - Get recommended resource allocation

### Image Handling

- `POST /api/warehouse/images/upload` - Upload a new image
- `GET /api/warehouse/images/:id` - Get an image by ID
- `GET /api/warehouse/images/package/:packageId` - Get all images for a package
- `POST /api/warehouse/images/package/:packageId` - Associate an image with a package
- `DELETE /api/warehouse/images/:id` - Delete an image

### WhatsApp Integration

- `POST /api/warehouse/whatsapp/send` - Send a WhatsApp message
- `POST /api/warehouse/whatsapp/send-with-image` - Send a WhatsApp message with an image
- `GET /api/warehouse/whatsapp/validate-phone/:phoneNumber` - Validate a phone number
- `POST /api/warehouse/whatsapp/generate-link` - Generate a WhatsApp deep link

### Notifications

- `POST /api/warehouse/notifications/send` - Send a notification (email, SMS, WhatsApp)
- `POST /api/warehouse/notifications/batch` - Send batch notifications
- `GET /api/warehouse/notifications/history/:entityId` - Get notification history
- `POST /api/warehouse/notifications/templates` - Create or update notification templates

### Client Integration

- `GET /api/warehouse/clients/:id/packages` - Get all packages for a specific client
- `GET /api/warehouse/clients/:id/shipments` - Get all shipments containing packages from a specific client
- `POST /api/warehouse/clients/:id/notification` - Send notification to client about package/shipment status
- `GET /api/warehouse/clients/:id/tracking-history` - Get tracking history for client's packages
- `POST /api/warehouse/clients/:id/preferences` - Update client notification preferences

## Data Models

### Core Models

1. **Package** - Individual package information with client details
2. **Shipment** - Group of packages being shipped together
3. **Inventory** - Warehouse inventory management
4. **Carrier** - Shipping carrier information
5. **WarehouseLocation** - Physical location information for packages in the warehouse

### Extended Models

#### Tracking Models

```typescript
interface TrackingPoint {
  id: string;
  packageId: string;
  groupId?: string;
  location: LocationPoint;
  status: PackageStatus | GroupStatus;
  timestamp: string;
  isEstimated: boolean;
  isVisible: boolean;
  isActive: boolean;
  isMilestone: boolean;
  sequence: number;
  description: string;
  facilityType: FacilityType;
  scanType?: ScanType;
  scannedBy?: string;
  deviceId?: string;
  createdAt: string;
  updatedAt: string;
  source: TrackingSource;
}

interface LocationPoint {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  facilityId?: string;
  facilityName?: string;
  accuracy?: number;
}

enum FacilityType {
  WAREHOUSE = 'warehouse',
  DISTRIBUTION_CENTER = 'distribution_center',
  TRANSIT_POINT = 'transit_point',
  DELIVERY_POINT = 'delivery_point',
  CUSTOMS = 'customs',
  OTHER = 'other'
}

enum ScanType {
  ARRIVAL = 'arrival',
  DEPARTURE = 'departure',
  PROCESSING = 'processing',
  EXCEPTION = 'exception',
  DELIVERY_ATTEMPT = 'delivery_attempt',
  DELIVERY = 'delivery'
}

enum TrackingSource {
  SYSTEM = 'system',
  MANUAL = 'manual',
  CARRIER_API = 'carrier_api',
  SCANNER = 'scanner',
  GPS = 'gps'
}
```

#### Image Models

```typescript
interface PackageImage {
  id: string;
  packageId: string;
  imageUrl: string;
  thumbnailUrl: string;
  imageType: ImageType;
  capturedAt: string;
  capturedBy: string;
  notes?: string;
  isPublic: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

enum ImageType {
  RECEIPT = 'receipt',
  PROCESSING = 'processing',
  LABELING = 'labeling',
  PACKAGING = 'packaging',
  DAMAGE = 'damage',
  EXCEPTION = 'exception',
  DELIVERY = 'delivery',
  OTHER = 'other'
}
```

#### Notification Models

```typescript
interface Notification {
  id: string;
  entityId: string;
  entityType: EntityType;
  notificationType: NotificationType;
  recipient: string;
  recipientType: RecipientType;
  content: string;
  subject?: string;
  status: NotificationStatus;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  errorDetails?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
  SYSTEM = 'system'
}

enum EntityType {
  PACKAGE = 'package',
  SHIPMENT = 'shipment',
  GROUP = 'group',
  CLIENT = 'client'
}

enum RecipientType {
  CLIENT = 'client',
  SENDER = 'sender',
  RECIPIENT = 'recipient',
  STAFF = 'staff',
  SYSTEM = 'system'
}

enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}
```

#### AI Grouping Models

```typescript
interface GroupingRecommendation {
  id: string;
  groups: RecommendedGroup[];
  optimizationCriteria: OptimizationCriteria;
  score: number;
  estimatedCost: number;
  estimatedDeliveryTime: string;
  vehicleUtilization: number;
  environmentalImpact: number;
  createdAt: string;
}

interface RecommendedGroup {
  packageIds: string[];
  totalWeight: number;
  totalVolume: number;
  recommendedVehicleType: string;
  recommendedRoute: RoutePoint[];
  estimatedDepartureTime: string;
  estimatedArrivalTime: string;
}

enum OptimizationCriteria {
  COST = 'cost',
  SPEED = 'speed',
  VEHICLE_UTILIZATION = 'vehicle_utilization',
  ENVIRONMENTAL = 'environmental',
  BALANCED = 'balanced'
}
```

#### Shipment Group Models

```typescript
interface ShipmentGroup {
  id: string;
  name: string;
  groupType: GroupType;
  packageIds: string[];
  status: GroupStatus;
  vehicleId?: string;
  driverId?: string;
  departureTime?: string;
  estimatedArrivalTime?: string;
  actualArrivalTime?: string;
  route?: RoutePoint[];
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

enum GroupType {
  GROUND = 'ground',
  AIR = 'air',
  SEA = 'sea',
  EXPRESS = 'express',
  ECONOMY = 'economy'
}

enum GroupStatus {
  PLANNING = 'planning',
  READY = 'ready',
  LOADING = 'loading',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  EXCEPTION = 'exception',
  COMPLETED = 'completed'
}

interface StatusHistoryEntry {
  status: GroupStatus | PackageStatus;
  timestamp: string;
  notes?: string;
  updatedBy: string;
}
```

## Integration with Client App

The warehouse system integrates with the client application through the following mechanisms:

1. **Status Updates**: When a package status changes in the warehouse system, the client app is notified through webhooks or API calls.
2. **Tracking Information**: The warehouse system provides detailed tracking information that is accessible through the client app.
3. **Notification System**: Clients receive notifications about their packages as they move through the warehouse system.

### Integration Endpoints

- `POST /api/integration/status-update` - Receive status updates from the warehouse system
- `GET /api/integration/tracking/:trackingNumber` - Get tracking information for a specific package
- `POST /api/integration/notifications` - Send notifications to clients

---

**DISCLAIMER**: Additional sections including detailed implementation guidelines, security protocols, performance optimization, and operational workflows will be added in future updates to this documentation.

Last Updated: June 25, 2025
