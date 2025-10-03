/**
 * Centralized Status Type Definitions
 * 
 * This file contains all status-related TypeScript types and enums
 * for packages and shipments in the logistics application.
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 * @created 2025-10-02
 */

// ============================================
// PACKAGE STATUS DEFINITIONS
// ============================================

/**
 * Package status constants for the logistics workflow
 * These statuses match the database CHECK constraints
 */
export const PackageStatus = {
  // Initial states
  PENDING: 'pending' as const,                    // Awaiting arrival at US warehouse
  RECEIVED: 'received' as const,                  // Arrived at US warehouse
  
  // Processing states
  PROCESSING: 'processing' as const,              // Being processed at US warehouse
  SHIPPED: 'shipped' as const,                    // Shipped from US to Ghana
  
  // Final states
  ARRIVED: 'arrived' as const,                    // Arrived in Ghana (NEW STATUS)
  DELIVERED: 'delivered' as const                 // Delivered to customer in Ghana
} as const;

/**
 * Union type for package status values
 * Use this for type checking and validation
 */
export type PackageStatusType = 
  | 'pending'
  | 'received' 
  | 'processing'
  | 'shipped'
  | 'arrived'
  | 'delivered';

/**
 * Package status configuration with display labels and colors
 * Used for UI components like badges and filters
 */
export interface PackageStatusConfig {
  value: PackageStatusType;
  label: string;
  color: 'gray' | 'blue' | 'yellow' | 'green' | 'indigo' | 'red' | 'orange' | 'purple';
  description: string;
}

/**
 * Complete package status configuration array
 * Centralized configuration for all package status displays
 */
export const PACKAGE_STATUS_CONFIG: PackageStatusConfig[] = [
  {
    value: 'pending',
    label: 'Pending Arrival',
    color: 'gray',
    description: 'Awaiting arrival at US warehouse'
  },
  {
    value: 'received',
    label: 'Received',
    color: 'blue',
    description: 'Arrived at US warehouse'
  },
  {
    value: 'processing',
    label: 'Processing',
    color: 'yellow',
    description: 'Being processed at US warehouse'
  },
  {
    value: 'shipped',
    label: 'Shipped',
    color: 'indigo',
    description: 'Shipped from US to Ghana'
  },
  {
    value: 'arrived',
    label: 'Arrived',
    color: 'green',
    description: 'Arrived in Ghana'
  },
  {
    value: 'delivered',
    label: 'Delivered',
    color: 'green',
    description: 'Delivered to customer in Ghana'
  }
];

// ============================================
// SHIPMENT STATUS DEFINITIONS
// ============================================

/**
 * Shipment status constants for the logistics workflow
 * These statuses match the database CHECK constraints
 */
export const ShipmentStatus = {
  // Initial states
  PENDING: 'pending' as const,                    // Being prepared for shipment
  PROCESSING: 'processing' as const,              // In processing at warehouse
  
  // Transit states
  SHIPPED: 'shipped' as const,                    // Shipped from US warehouse
  IN_TRANSIT: 'in_transit' as const,              // In transit to Ghana
  
  // Final states
  ARRIVED: 'arrived' as const,                    // Arrived in Ghana (NEW STATUS)
  DELIVERED: 'delivered' as const                 // Delivered to customer
} as const;

/**
 * Union type for shipment status values
 * Use this for type checking and validation
 */
export type ShipmentStatusType = 
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'in_transit'
  | 'arrived'
  | 'delivered';

/**
 * Shipment status configuration with display labels and colors
 * Used for UI components like badges and filters
 */
export interface ShipmentStatusConfig {
  value: ShipmentStatusType;
  label: string;
  color: 'gray' | 'blue' | 'yellow' | 'green' | 'indigo' | 'red' | 'orange' | 'purple';
  description: string;
}

/**
 * Complete shipment status configuration array
 * Centralized configuration for all shipment status displays
 */
export const SHIPMENT_STATUS_CONFIG: ShipmentStatusConfig[] = [
  {
    value: 'pending',
    label: 'Pending',
    color: 'yellow',
    description: 'Being prepared for shipment'
  },
  {
    value: 'processing',
    label: 'Processing',
    color: 'blue',
    description: 'In processing at warehouse'
  },
  {
    value: 'shipped',
    label: 'Shipped',
    color: 'indigo',
    description: 'Shipped from US warehouse'
  },
  {
    value: 'in_transit',
    label: 'In Transit',
    color: 'blue',
    description: 'In transit to Ghana'
  },
  {
    value: 'arrived',
    label: 'Arrived',
    color: 'green',
    description: 'Arrived in Ghana'
  },
  {
    value: 'delivered',
    label: 'Delivered',
    color: 'green',
    description: 'Delivered to customer'
  }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get package status configuration by value
 * @param status - The package status value
 * @returns Package status configuration object or undefined
 */
export const getPackageStatusConfig = (status: string): PackageStatusConfig | undefined => {
  return PACKAGE_STATUS_CONFIG.find(config => config.value === status);
};

/**
 * Get shipment status configuration by value
 * @param status - The shipment status value
 * @returns Shipment status configuration object or undefined
 */
export const getShipmentStatusConfig = (status: string): ShipmentStatusConfig | undefined => {
  return SHIPMENT_STATUS_CONFIG.find(config => config.value === status);
};

/**
 * Validate if a string is a valid package status
 * @param status - The status string to validate
 * @returns True if valid package status, false otherwise
 */
export const isValidPackageStatus = (status: string): status is PackageStatusType => {
  return Object.values(PackageStatus).includes(status as PackageStatusType);
};

/**
 * Validate if a string is a valid shipment status
 * @param status - The status string to validate
 * @returns True if valid shipment status, false otherwise
 */
export const isValidShipmentStatus = (status: string): status is ShipmentStatusType => {
  return Object.values(ShipmentStatus).includes(status as ShipmentStatusType);
};

/**
 * Get CSS classes for status badges based on color
 * @param color - The status color
 * @returns CSS classes string for the badge
 */
export const getStatusBadgeClasses = (color: string): string => {
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
  
  switch (color) {
    case 'gray':
      return `${baseClasses} bg-gray-100 text-gray-800`;
    case 'blue':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'yellow':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'green':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'indigo':
      return `${baseClasses} bg-indigo-100 text-indigo-800`;
    case 'red':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'orange':
      return `${baseClasses} bg-orange-100 text-orange-800`;
    case 'purple':
      return `${baseClasses} bg-purple-100 text-purple-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

// ============================================
// LEGACY COMPATIBILITY
// ============================================

/**
 * Legacy status mappings for backward compatibility
 * Maps old status values to new standardized ones
 */
export const LEGACY_STATUS_MAPPING = {
  // Package legacy mappings
  'pending_arrival': 'pending',
  'inspected': 'processing',
  'ready_for_shipment': 'processing',
  'consolidated': 'processing',
  'customs_clearance': 'in_transit',
  'returned': 'delivered', // Map to delivered for now
  'lost': 'delivered', // Map to delivered for now
  
  // Shipment legacy mappings
  'awaiting_quote': 'pending',
  'quote_ready': 'pending',
  'payment_pending': 'pending',
  'out_for_delivery': 'in_transit',
  'cancelled': 'pending' // Map to pending for now
};

/**
 * Convert legacy status to standardized status
 * @param legacyStatus - The legacy status value
 * @param type - Whether it's a package or shipment status
 * @returns Standardized status value
 */
export const convertLegacyStatus = (
  legacyStatus: string, 
  type: 'package' | 'shipment'
): PackageStatusType | ShipmentStatusType => {
  // Check if it's already a valid status
  if (type === 'package' && isValidPackageStatus(legacyStatus)) {
    return legacyStatus as PackageStatusType;
  }
  if (type === 'shipment' && isValidShipmentStatus(legacyStatus)) {
    return legacyStatus as ShipmentStatusType;
  }
  
  // Try legacy mapping
  const mappedStatus = LEGACY_STATUS_MAPPING[legacyStatus as keyof typeof LEGACY_STATUS_MAPPING];
  if (mappedStatus) {
    return mappedStatus as PackageStatusType | ShipmentStatusType;
  }
  
  // Default fallback
  return type === 'package' ? 'pending' : 'pending';
};
