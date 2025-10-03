/**
 * Centralized Type Definitions for Vanguard Cargo Logistics Application
 * 
 * This file contains all core type definitions, enums, and interfaces used throughout
 * the application to ensure consistency and type safety across all components.
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2024-10-02
 */

// ============================================================================
// PACKAGE STATUS DEFINITIONS
// ============================================================================

/**
 * Package status constants defining all possible statuses in the logistics workflow
 * These statuses represent the complete lifecycle of a package from arrival to delivery
 */
export const PackageStatus = {
  // Initial arrival and processing statuses
  PENDING_ARRIVAL: 'pending_arrival',      // Package is expected but not yet received
  ARRIVED: 'arrived',                      // Package has arrived at warehouse (NEW STATUS)
  INSPECTED: 'inspected',                  // Package has been inspected and catalogued
  
  // Processing and preparation statuses
  READY_FOR_REVIEW: 'ready_for_review',    // Package is ready for customer review
  PENDING_ACTION: 'pending_action',        // Awaiting customer or staff action
  APPROVED: 'approved',                    // Package approved for shipment
  CONSOLIDATED: 'consolidated',            // Package grouped with others for shipping
  ON_HOLD: 'on_hold',                     // Package temporarily held
  
  // Shipping and transit statuses
  READY_FOR_SHIPMENT: 'ready_for_shipment', // Package prepared for shipping
  SHIPPED: 'shipped',                      // Package has been shipped out
  IN_TRANSIT: 'in_transit',               // Package is in transit to destination
  CUSTOMS_CLEARANCE: 'customs_clearance', // Package undergoing customs processing
  
  // Final delivery statuses
  OUT_FOR_DELIVERY: 'out_for_delivery',   // Package is out for final delivery
  DELIVERED: 'delivered',                 // Package successfully delivered
  
  // Exception statuses
  RETURNED: 'returned',                   // Package returned to sender
  LOST: 'lost',                          // Package is lost in transit
  DAMAGED: 'damaged'                     // Package has been damaged
} as const;

/**
 * Type union for package status values
 * Used for components that need string literal types
 */
export type PackageStatusValue = typeof PackageStatus[keyof typeof PackageStatus];

/**
 * Interface for package status display information
 * Used for UI components that need to display status with colors and labels
 */
export interface PackageStatusInfo {
  value: PackageStatusValue;
  label: string;
  color: string;
  description?: string;
}

// ============================================================================
// SHIPMENT STATUS DEFINITIONS
// ============================================================================

/**
 * Shipment status constants defining all possible statuses in the logistics workflow
 * These statuses represent the complete lifecycle of a consolidated shipment
 */
export const ShipmentStatus = {
  // Pre-shipping statuses
  AWAITING_QUOTE: 'awaiting_quote',       // Shipment awaiting cost calculation
  QUOTE_READY: 'quote_ready',             // Quote prepared and ready for customer
  PAYMENT_PENDING: 'payment_pending',     // Awaiting payment confirmation
  PROCESSING: 'processing',               // Shipment being prepared
  
  // Transit statuses
  SHIPPED: 'shipped',                     // Shipment dispatched
  ARRIVED: 'arrived',                     // Shipment arrived at intermediate location (NEW STATUS)
  IN_TRANSIT: 'in_transit',              // Shipment in transit
  CUSTOMS_CLEARANCE: 'customs_clearance', // Undergoing customs processing
  OUT_FOR_DELIVERY: 'out_for_delivery',  // Out for final delivery
  
  // Final statuses
  DELIVERED: 'delivered',                 // Successfully delivered
  CANCELLED: 'cancelled',                 // Shipment cancelled
  
  // Legacy statuses (for backward compatibility)
  PENDING: 'pending',                     // Generic pending status
  RECEIVED: 'received',                   // Received at destination
  TRANSIT: 'transit'                      // Generic transit status
} as const;

/**
 * Type union for shipment status values
 * Used for components that need string literal types
 */
export type ShipmentStatusValue = typeof ShipmentStatus[keyof typeof ShipmentStatus];

/**
 * Interface for shipment status display information
 * Used for UI components that need to display status with colors and labels
 */
export interface ShipmentStatusInfo {
  value: ShipmentStatusValue;
  label: string;
  color: string;
  description?: string;
}

// ============================================================================
// SERVICE TYPE DEFINITIONS
// ============================================================================

/**
 * Service type constants defining available shipping service types
 * These determine the speed and cost of shipping services
 */
export const ServiceType = {
  ECONOMY: 'economy',     // Budget-friendly option with longer delivery time
  STANDARD: 'standard',   // Balanced option with reliable delivery
  EXPRESS: 'express',     // Fastest delivery option
  OVERNIGHT: 'overnight'  // Next-day delivery (where available)
} as const;

/**
 * Type union for service type values
 */
export type ServiceTypeValue = typeof ServiceType[keyof typeof ServiceType];

// ============================================================================
// USER ROLE DEFINITIONS
// ============================================================================

/**
 * User role constants defining roles in the system hierarchy
 * Roles determine access levels and permissions
 */
export const UserRole = {
  CLIENT: 'client',                    // Regular customers
  WAREHOUSE_ADMIN: 'warehouse_admin',  // Warehouse staff
  ADMIN: 'admin',                      // Regional administrators
  SUPERADMIN: 'superadmin'            // System administrators
} as const;

/**
 * Type union for user role values
 */
export type UserRoleValue = typeof UserRole[keyof typeof UserRole];

// ============================================================================
// USER STATUS DEFINITIONS
// ============================================================================

/**
 * User status constants defining user account statuses
 * These control user access and account state
 */
export const UserStatus = {
  ACTIVE: 'active',         // Normal operation
  INACTIVE: 'inactive',     // Temporarily disabled
  SUSPENDED: 'suspended',   // Admin suspended
  REPORTED: 'reported'      // Under investigation
} as const;

/**
 * Type union for user status values
 */
export type UserStatusValue = typeof UserStatus[keyof typeof UserStatus];

// ============================================================================
// PRIORITY DEFINITIONS
// ============================================================================

/**
 * Priority constants defining priority levels for packages and shipments
 * Used for processing order and handling instructions
 */
export const Priority = {
  STANDARD: 'standard',     // Normal processing priority
  EXPRESS: 'express',       // Expedited processing
  URGENT: 'urgent'          // Highest priority processing
} as const;

/**
 * Type union for priority values
 */
export type PriorityValue = typeof Priority[keyof typeof Priority];

// ============================================================================
// NOTIFICATION TYPE DEFINITIONS
// ============================================================================

/**
 * Notification type constants defining types of notifications in the system
 * Used for categorizing and routing notifications
 */
export const NotificationType = {
  PACKAGE_UPDATE: 'package_update',     // Package status changes
  SHIPMENT_UPDATE: 'shipment_update',   // Shipment status changes
  SYSTEM: 'system',                     // System announcements
  PROMOTION: 'promotion'                // Marketing/promotional
} as const;

/**
 * Type union for notification type values
 */
export type NotificationTypeValue = typeof NotificationType[keyof typeof NotificationType];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Utility class for working with package statuses
 * Provides helper methods for status validation, transitions, and display
 */
export class PackageStatusUtils {
  /**
   * Get all package statuses with display information
   * @returns Array of PackageStatusInfo objects
   */
  static getAllStatuses(): PackageStatusInfo[] {
    return [
      { value: PackageStatus.PENDING_ARRIVAL, label: 'Pending Arrival', color: 'gray', description: 'Package is expected but not yet received' },
      { value: PackageStatus.ARRIVED, label: 'Arrived', color: 'blue', description: 'Package has arrived at warehouse' },
      { value: PackageStatus.INSPECTED, label: 'Inspected', color: 'yellow', description: 'Package has been inspected and catalogued' },
      { value: PackageStatus.READY_FOR_REVIEW, label: 'Ready for Review', color: 'orange', description: 'Package is ready for customer review' },
      { value: PackageStatus.PENDING_ACTION, label: 'Pending Action', color: 'yellow', description: 'Awaiting customer or staff action' },
      { value: PackageStatus.APPROVED, label: 'Approved', color: 'green', description: 'Package approved for shipment' },
      { value: PackageStatus.CONSOLIDATED, label: 'Consolidated', color: 'purple', description: 'Package grouped with others for shipping' },
      { value: PackageStatus.ON_HOLD, label: 'On Hold', color: 'red', description: 'Package temporarily held' },
      { value: PackageStatus.READY_FOR_SHIPMENT, label: 'Ready for Shipment', color: 'green', description: 'Package prepared for shipping' },
      { value: PackageStatus.SHIPPED, label: 'Shipped', color: 'indigo', description: 'Package has been shipped out' },
      { value: PackageStatus.IN_TRANSIT, label: 'In Transit', color: 'blue', description: 'Package is in transit to destination' },
      { value: PackageStatus.CUSTOMS_CLEARANCE, label: 'Customs Clearance', color: 'orange', description: 'Package undergoing customs processing' },
      { value: PackageStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery', color: 'green', description: 'Package is out for final delivery' },
      { value: PackageStatus.DELIVERED, label: 'Delivered', color: 'green', description: 'Package successfully delivered' },
      { value: PackageStatus.RETURNED, label: 'Returned', color: 'red', description: 'Package returned to sender' },
      { value: PackageStatus.LOST, label: 'Lost', color: 'red', description: 'Package is lost in transit' },
      { value: PackageStatus.DAMAGED, label: 'Damaged', color: 'red', description: 'Package has been damaged' }
    ];
  }

  /**
   * Get status information by value
   * @param status - The package status value
   * @returns PackageStatusInfo object or null if not found
   */
  static getStatusInfo(status: PackageStatusValue): PackageStatusInfo | null {
    return this.getAllStatuses().find(s => s.value === status) || null;
  }

  /**
   * Check if a status is a final status (no further transitions expected)
   * @param status - The package status to check
   * @returns Boolean indicating if status is final
   */
  static isFinalStatus(status: PackageStatusValue): boolean {
    const finalStatuses: PackageStatusValue[] = [
      PackageStatus.DELIVERED,
      PackageStatus.RETURNED,
      PackageStatus.LOST,
      PackageStatus.DAMAGED
    ];
    return finalStatuses.includes(status);
  }

  /**
   * Get valid next statuses for a given current status
   * @param currentStatus - The current package status
   * @returns Array of valid next statuses
   */
  static getValidNextStatuses(currentStatus: PackageStatusValue): PackageStatusValue[] {
    const transitions: Record<PackageStatusValue, PackageStatusValue[]> = {
      [PackageStatus.PENDING_ARRIVAL]: [PackageStatus.ARRIVED, PackageStatus.LOST],
      [PackageStatus.ARRIVED]: [PackageStatus.INSPECTED, PackageStatus.ON_HOLD, PackageStatus.DAMAGED],
      [PackageStatus.INSPECTED]: [PackageStatus.READY_FOR_REVIEW, PackageStatus.APPROVED, PackageStatus.ON_HOLD],
      [PackageStatus.READY_FOR_REVIEW]: [PackageStatus.APPROVED, PackageStatus.PENDING_ACTION, PackageStatus.ON_HOLD],
      [PackageStatus.PENDING_ACTION]: [PackageStatus.APPROVED, PackageStatus.ON_HOLD],
      [PackageStatus.APPROVED]: [PackageStatus.CONSOLIDATED, PackageStatus.READY_FOR_SHIPMENT],
      [PackageStatus.CONSOLIDATED]: [PackageStatus.READY_FOR_SHIPMENT],
      [PackageStatus.ON_HOLD]: [PackageStatus.READY_FOR_REVIEW, PackageStatus.APPROVED, PackageStatus.RETURNED],
      [PackageStatus.READY_FOR_SHIPMENT]: [PackageStatus.SHIPPED],
      [PackageStatus.SHIPPED]: [PackageStatus.IN_TRANSIT, PackageStatus.LOST],
      [PackageStatus.IN_TRANSIT]: [PackageStatus.CUSTOMS_CLEARANCE, PackageStatus.OUT_FOR_DELIVERY, PackageStatus.LOST],
      [PackageStatus.CUSTOMS_CLEARANCE]: [PackageStatus.OUT_FOR_DELIVERY, PackageStatus.RETURNED],
      [PackageStatus.OUT_FOR_DELIVERY]: [PackageStatus.DELIVERED, PackageStatus.RETURNED],
      [PackageStatus.DELIVERED]: [],
      [PackageStatus.RETURNED]: [],
      [PackageStatus.LOST]: [],
      [PackageStatus.DAMAGED]: [PackageStatus.RETURNED]
    };

    return transitions[currentStatus] || [];
  }

  /**
   * Validate if a status transition is allowed
   * @param currentStatus - The current package status
   * @param newStatus - The desired new status
   * @returns Boolean indicating if transition is valid
   */
  static isValidTransition(currentStatus: PackageStatusValue, newStatus: PackageStatusValue): boolean {
    const validNextStatuses = this.getValidNextStatuses(currentStatus);
    return validNextStatuses.includes(newStatus);
  }

  /**
   * Get the business rule for a specific status transition
   * @param currentStatus - The current package status
   * @param newStatus - The desired new status
   * @returns Business rule description or null if invalid
   */
  static getTransitionRule(currentStatus: PackageStatusValue, newStatus: PackageStatusValue): string | null {
    const rules: Record<string, string> = {
      [`${PackageStatus.PENDING_ARRIVAL}->${PackageStatus.ARRIVED}`]: 'Package has been physically received at warehouse and scanned in',
      [`${PackageStatus.ARRIVED}->${PackageStatus.INSPECTED}`]: 'Package has been opened, inspected, and catalogued by warehouse staff',
      [`${PackageStatus.INSPECTED}->${PackageStatus.READY_FOR_REVIEW}`]: 'Package inspection complete, awaiting customer review and approval',
      [`${PackageStatus.READY_FOR_REVIEW}->${PackageStatus.APPROVED}`]: 'Customer has reviewed and approved package for shipment',
      [`${PackageStatus.APPROVED}->${PackageStatus.CONSOLIDATED}`]: 'Package has been grouped with other packages for consolidated shipment',
      [`${PackageStatus.CONSOLIDATED}->${PackageStatus.READY_FOR_SHIPMENT}`]: 'Consolidated package group is prepared and ready for shipping',
      [`${PackageStatus.READY_FOR_SHIPMENT}->${PackageStatus.SHIPPED}`]: 'Package has been dispatched from warehouse to carrier',
      [`${PackageStatus.SHIPPED}->${PackageStatus.IN_TRANSIT}`]: 'Package is confirmed in transit with carrier tracking',
      [`${PackageStatus.IN_TRANSIT}->${PackageStatus.CUSTOMS_CLEARANCE}`]: 'Package has reached destination country and is undergoing customs processing',
      [`${PackageStatus.CUSTOMS_CLEARANCE}->${PackageStatus.OUT_FOR_DELIVERY}`]: 'Package cleared customs and is out for final delivery',
      [`${PackageStatus.OUT_FOR_DELIVERY}->${PackageStatus.DELIVERED}`]: 'Package has been successfully delivered to recipient'
    };

    const key = `${currentStatus}->${newStatus}`;
    return rules[key] || null;
  }

  /**
   * Check if a status requires warehouse staff action
   * @param status - The package status to check
   * @returns Boolean indicating if warehouse staff action is required
   */
  static requiresWarehouseAction(status: PackageStatusValue): boolean {
    const warehouseActionStatuses: PackageStatusValue[] = [
      PackageStatus.PENDING_ARRIVAL,
      PackageStatus.ARRIVED,
      PackageStatus.INSPECTED,
      PackageStatus.APPROVED,
      PackageStatus.CONSOLIDATED,
      PackageStatus.READY_FOR_SHIPMENT
    ];
    return warehouseActionStatuses.includes(status);
  }

  /**
   * Check if a status requires customer action
   * @param status - The package status to check
   * @returns Boolean indicating if customer action is required
   */
  static requiresCustomerAction(status: PackageStatusValue): boolean {
    const customerActionStatuses: PackageStatusValue[] = [
      PackageStatus.READY_FOR_REVIEW,
      PackageStatus.PENDING_ACTION
    ];
    return customerActionStatuses.includes(status);
  }

  /**
   * Get the expected duration for a status (in hours)
   * @param status - The package status
   * @returns Expected duration in hours or null if not applicable
   */
  static getExpectedDuration(status: PackageStatusValue): number | null {
    const durations: Record<PackageStatusValue, number | null> = {
      [PackageStatus.PENDING_ARRIVAL]: 72, // 3 days
      [PackageStatus.ARRIVED]: 24, // 1 day
      [PackageStatus.INSPECTED]: 48, // 2 days
      [PackageStatus.READY_FOR_REVIEW]: 120, // 5 days (customer review)
      [PackageStatus.PENDING_ACTION]: 72, // 3 days
      [PackageStatus.APPROVED]: 24, // 1 day
      [PackageStatus.CONSOLIDATED]: 48, // 2 days
      [PackageStatus.READY_FOR_SHIPMENT]: 24, // 1 day
      [PackageStatus.SHIPPED]: 168, // 7 days
      [PackageStatus.IN_TRANSIT]: 240, // 10 days
      [PackageStatus.CUSTOMS_CLEARANCE]: 72, // 3 days
      [PackageStatus.OUT_FOR_DELIVERY]: 24, // 1 day
      [PackageStatus.ON_HOLD]: null, // Indefinite
      [PackageStatus.DELIVERED]: null, // Final
      [PackageStatus.RETURNED]: null, // Final
      [PackageStatus.LOST]: null, // Final
      [PackageStatus.DAMAGED]: null // Final
    };

    return durations[status] || null;
  }
}

/**
 * Utility class for working with shipment statuses
 * Provides helper methods for status validation, transitions, and display
 */
export class ShipmentStatusUtils {
  /**
   * Get all shipment statuses with display information
   * @returns Array of ShipmentStatusInfo objects
   */
  static getAllStatuses(): ShipmentStatusInfo[] {
    return [
      { value: ShipmentStatus.AWAITING_QUOTE, label: 'Awaiting Quote', color: 'gray', description: 'Shipment awaiting cost calculation' },
      { value: ShipmentStatus.QUOTE_READY, label: 'Quote Ready', color: 'blue', description: 'Quote prepared and ready for customer' },
      { value: ShipmentStatus.PAYMENT_PENDING, label: 'Payment Pending', color: 'yellow', description: 'Awaiting payment confirmation' },
      { value: ShipmentStatus.PROCESSING, label: 'Processing', color: 'blue', description: 'Shipment being prepared' },
      { value: ShipmentStatus.SHIPPED, label: 'Shipped', color: 'indigo', description: 'Shipment dispatched' },
      { value: ShipmentStatus.ARRIVED, label: 'Arrived', color: 'green', description: 'Shipment arrived at intermediate location' },
      { value: ShipmentStatus.IN_TRANSIT, label: 'In Transit', color: 'blue', description: 'Shipment in transit' },
      { value: ShipmentStatus.CUSTOMS_CLEARANCE, label: 'Customs Clearance', color: 'orange', description: 'Undergoing customs processing' },
      { value: ShipmentStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery', color: 'green', description: 'Out for final delivery' },
      { value: ShipmentStatus.DELIVERED, label: 'Delivered', color: 'green', description: 'Successfully delivered' },
      { value: ShipmentStatus.CANCELLED, label: 'Cancelled', color: 'red', description: 'Shipment cancelled' },
      // Legacy statuses for backward compatibility
      { value: ShipmentStatus.PENDING, label: 'Pending', color: 'gray', description: 'Generic pending status' },
      { value: ShipmentStatus.RECEIVED, label: 'Received', color: 'blue', description: 'Received at destination' },
      { value: ShipmentStatus.TRANSIT, label: 'Transit', color: 'blue', description: 'Generic transit status' }
    ];
  }

  /**
   * Get status information by value
   * @param status - The shipment status value
   * @returns ShipmentStatusInfo object or null if not found
   */
  static getStatusInfo(status: ShipmentStatusValue): ShipmentStatusInfo | null {
    return this.getAllStatuses().find(s => s.value === status) || null;
  }

  /**
   * Check if a status is a final status (no further transitions expected)
   * @param status - The shipment status to check
   * @returns Boolean indicating if status is final
   */
  static isFinalStatus(status: ShipmentStatusValue): boolean {
    const finalStatuses: ShipmentStatusValue[] = [
      ShipmentStatus.DELIVERED,
      ShipmentStatus.CANCELLED
    ];
    return finalStatuses.includes(status);
  }

  /**
   * Get valid next statuses for a given current status
   * @param currentStatus - The current shipment status
   * @returns Array of valid next statuses
   */
  static getValidNextStatuses(currentStatus: ShipmentStatusValue): ShipmentStatusValue[] {
    const transitions: Record<ShipmentStatusValue, ShipmentStatusValue[]> = {
      [ShipmentStatus.AWAITING_QUOTE]: [ShipmentStatus.QUOTE_READY, ShipmentStatus.CANCELLED],
      [ShipmentStatus.QUOTE_READY]: [ShipmentStatus.PAYMENT_PENDING, ShipmentStatus.CANCELLED],
      [ShipmentStatus.PAYMENT_PENDING]: [ShipmentStatus.PROCESSING, ShipmentStatus.CANCELLED],
      [ShipmentStatus.PROCESSING]: [ShipmentStatus.SHIPPED, ShipmentStatus.CANCELLED],
      [ShipmentStatus.SHIPPED]: [ShipmentStatus.ARRIVED, ShipmentStatus.IN_TRANSIT],
      [ShipmentStatus.ARRIVED]: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.CUSTOMS_CLEARANCE],
      [ShipmentStatus.IN_TRANSIT]: [ShipmentStatus.CUSTOMS_CLEARANCE, ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.ARRIVED],
      [ShipmentStatus.CUSTOMS_CLEARANCE]: [ShipmentStatus.OUT_FOR_DELIVERY],
      [ShipmentStatus.OUT_FOR_DELIVERY]: [ShipmentStatus.DELIVERED],
      [ShipmentStatus.DELIVERED]: [],
      [ShipmentStatus.CANCELLED]: [],
      // Legacy status transitions
      [ShipmentStatus.PENDING]: [ShipmentStatus.PROCESSING, ShipmentStatus.CANCELLED],
      [ShipmentStatus.RECEIVED]: [ShipmentStatus.DELIVERED],
      [ShipmentStatus.TRANSIT]: [ShipmentStatus.DELIVERED, ShipmentStatus.ARRIVED]
    };

    return transitions[currentStatus] || [];
  }

  /**
   * Validate if a status transition is allowed
   * @param currentStatus - The current shipment status
   * @param newStatus - The desired new status
   * @returns Boolean indicating if transition is valid
   */
  static isValidTransition(currentStatus: ShipmentStatusValue, newStatus: ShipmentStatusValue): boolean {
    const validNextStatuses = this.getValidNextStatuses(currentStatus);
    return validNextStatuses.includes(newStatus);
  }

  /**
   * Get the business rule for a specific status transition
   * @param currentStatus - The current shipment status
   * @param newStatus - The desired new status
   * @returns Business rule description or null if invalid
   */
  static getTransitionRule(currentStatus: ShipmentStatusValue, newStatus: ShipmentStatusValue): string | null {
    const rules: Record<string, string> = {
      [`${ShipmentStatus.AWAITING_QUOTE}->${ShipmentStatus.QUOTE_READY}`]: 'Shipping cost has been calculated and quote is ready for customer review',
      [`${ShipmentStatus.QUOTE_READY}->${ShipmentStatus.PAYMENT_PENDING}`]: 'Customer has accepted quote and payment is now pending',
      [`${ShipmentStatus.PAYMENT_PENDING}->${ShipmentStatus.PROCESSING}`]: 'Payment has been confirmed and shipment is being prepared',
      [`${ShipmentStatus.PROCESSING}->${ShipmentStatus.SHIPPED}`]: 'Consolidated shipment has been dispatched from warehouse',
      [`${ShipmentStatus.SHIPPED}->${ShipmentStatus.ARRIVED}`]: 'Shipment has arrived at intermediate hub or destination facility',
      [`${ShipmentStatus.ARRIVED}->${ShipmentStatus.IN_TRANSIT}`]: 'Shipment has departed from hub and is continuing to destination',
      [`${ShipmentStatus.SHIPPED}->${ShipmentStatus.IN_TRANSIT}`]: 'Shipment is confirmed in transit with carrier tracking',
      [`${ShipmentStatus.IN_TRANSIT}->${ShipmentStatus.ARRIVED}`]: 'Shipment has arrived at destination hub or facility',
      [`${ShipmentStatus.IN_TRANSIT}->${ShipmentStatus.CUSTOMS_CLEARANCE}`]: 'Shipment has reached destination country and requires customs processing',
      [`${ShipmentStatus.ARRIVED}->${ShipmentStatus.CUSTOMS_CLEARANCE}`]: 'Shipment at destination facility requires customs clearance',
      [`${ShipmentStatus.CUSTOMS_CLEARANCE}->${ShipmentStatus.OUT_FOR_DELIVERY}`]: 'Shipment cleared customs and is out for final delivery',
      [`${ShipmentStatus.OUT_FOR_DELIVERY}->${ShipmentStatus.DELIVERED}`]: 'Shipment has been successfully delivered to recipient'
    };

    const key = `${currentStatus}->${newStatus}`;
    return rules[key] || null;
  }

  /**
   * Check if a status requires warehouse staff action
   * @param status - The shipment status to check
   * @returns Boolean indicating if warehouse staff action is required
   */
  static requiresWarehouseAction(status: ShipmentStatusValue): boolean {
    const warehouseActionStatuses: ShipmentStatusValue[] = [
      ShipmentStatus.AWAITING_QUOTE,
      ShipmentStatus.QUOTE_READY,
      ShipmentStatus.PROCESSING
    ];
    return warehouseActionStatuses.includes(status);
  }

  /**
   * Check if a status requires customer action
   * @param status - The shipment status to check
   * @returns Boolean indicating if customer action is required
   */
  static requiresCustomerAction(status: ShipmentStatusValue): boolean {
    const customerActionStatuses: ShipmentStatusValue[] = [
      ShipmentStatus.QUOTE_READY,
      ShipmentStatus.PAYMENT_PENDING
    ];
    return customerActionStatuses.includes(status);
  }

  /**
   * Check if a status requires carrier/logistics action
   * @param status - The shipment status to check
   * @returns Boolean indicating if carrier action is required
   */
  static requiresCarrierAction(status: ShipmentStatusValue): boolean {
    const carrierActionStatuses: ShipmentStatusValue[] = [
      ShipmentStatus.SHIPPED,
      ShipmentStatus.ARRIVED,
      ShipmentStatus.IN_TRANSIT,
      ShipmentStatus.CUSTOMS_CLEARANCE,
      ShipmentStatus.OUT_FOR_DELIVERY
    ];
    return carrierActionStatuses.includes(status);
  }

  /**
   * Get the expected duration for a status (in hours)
   * @param status - The shipment status
   * @returns Expected duration in hours or null if not applicable
   */
  static getExpectedDuration(status: ShipmentStatusValue): number | null {
    const durations: Record<ShipmentStatusValue, number | null> = {
      [ShipmentStatus.AWAITING_QUOTE]: 24, // 1 day
      [ShipmentStatus.QUOTE_READY]: 120, // 5 days (customer review)
      [ShipmentStatus.PAYMENT_PENDING]: 72, // 3 days
      [ShipmentStatus.PROCESSING]: 48, // 2 days
      [ShipmentStatus.SHIPPED]: 168, // 7 days
      [ShipmentStatus.ARRIVED]: 24, // 1 day
      [ShipmentStatus.IN_TRANSIT]: 240, // 10 days
      [ShipmentStatus.CUSTOMS_CLEARANCE]: 72, // 3 days
      [ShipmentStatus.OUT_FOR_DELIVERY]: 24, // 1 day
      [ShipmentStatus.DELIVERED]: null, // Final
      [ShipmentStatus.CANCELLED]: null, // Final
      // Legacy statuses
      [ShipmentStatus.PENDING]: 48, // 2 days
      [ShipmentStatus.RECEIVED]: 24, // 1 day
      [ShipmentStatus.TRANSIT]: 168 // 7 days
    };

    return durations[status] || null;
  }

  /**
   * Check if shipment is trackable by customer
   * @param status - The shipment status to check
   * @returns Boolean indicating if customer can track shipment
   */
  static isTrackableByCustomer(status: ShipmentStatusValue): boolean {
    const trackableStatuses: ShipmentStatusValue[] = [
      ShipmentStatus.SHIPPED,
      ShipmentStatus.ARRIVED,
      ShipmentStatus.IN_TRANSIT,
      ShipmentStatus.CUSTOMS_CLEARANCE,
      ShipmentStatus.OUT_FOR_DELIVERY,
      ShipmentStatus.DELIVERED
    ];
    return trackableStatuses.includes(status);
  }
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

// All types are already exported above, no need for duplicate exports
