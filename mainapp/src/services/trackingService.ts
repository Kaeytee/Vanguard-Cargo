import { supabase } from '../lib/supabase';

/**
 * Professional Tracking Service
 * 
 * Provides comprehensive tracking functionality with professional status descriptions
 * and detailed tracking events for both packages and shipments.
 * 
 * Weight Display: Database stores weights in kilograms and displays them as "kg"
 * Estimated Delivery: Fetched from shipments table via package_shipments junction table
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 * @created 2025-10-03
 */

// Professional status definitions with codes and descriptions
export interface TrackingStatus {
  code: string;
  name: string;
  description: string;
  customerMessage: string;
  icon: string;
  color: string;
  category: 'pending' | 'processing' | 'transit' | 'delivered' | 'exception';
}

// Comprehensive tracking statuses
export const TRACKING_STATUSES: Record<string, TrackingStatus> = {
  // Package statuses (7-step workflow: pending → received → processing → shipped → in_transit → arrived → delivered)
  'pending': {
    code: 'PKG-001',
    name: 'Package Pending',
    description: 'Package information received, awaiting physical arrival at warehouse',
    customerMessage: 'Your package information has been received. We are awaiting the physical package at our Miami facility.',
    icon: 'Clock',
    color: 'bg-gray-100 text-gray-800',
    category: 'pending'
  },
  'received': {
    code: 'PKG-002', 
    name: 'Package Received',
    description: 'Package physically received and scanned at Vanguard Cargo warehouse',
    customerMessage: 'Your package has been received and scanned at our Vanguard Cargo facility in Miami. It is now ready for processing.',
    icon: 'Package',
    color: 'bg-blue-100 text-blue-800',
    category: 'processing'
  },
  'processing': {
    code: 'PKG-003',
    name: 'Processing for Shipment',
    description: 'Package marked as ready and being prepared for shipment consolidation',
    customerMessage: 'Your package is ready for shipment and being prepared for consolidation with other packages. Processing typically takes 3-5 business days.',
    icon: 'Settings',
    color: 'bg-orange-100 text-orange-800',
    category: 'processing'
  },
  'shipped': {
    code: 'PKG-004',
    name: 'Package Shipped',
    description: 'Package included in shipment and dispatched from Miami warehouse',
    customerMessage: 'Your package has been included in a shipment and dispatched from our Miami facility. It is now being prepared for international transit.',
    icon: 'Truck',
    color: 'bg-purple-100 text-purple-800',
    category: 'transit'
  },
  'in_transit': {
    code: 'PKG-005',
    name: 'Package In Transit',
    description: 'Package is traveling from Miami to Ghana via international shipping',
    customerMessage: 'Your package is now in transit from Miami to Ghana. Transit time is typically 3-7 days.',
    icon: 'Plane',
    color: 'bg-indigo-100 text-indigo-800',
    category: 'transit'
  },
  'arrived': {
    code: 'PKG-006',
    name: 'Package Arrived',
    description: 'Package has arrived in Ghana and is undergoing customs clearance',
    customerMessage: 'Your package has arrived in Ghana and is being processed through customs clearance. This typically takes 1-3 business days.',
    icon: 'MapPin',
    color: 'bg-teal-100 text-teal-800',
    category: 'transit'
  },
  'delivered': {
    code: 'PKG-007',
    name: 'Package Delivered',
    description: 'Package has been successfully delivered to the recipient',
    customerMessage: 'Your package has been successfully delivered to the recipient address. Thank you for choosing Vanguard Cargo!',
    icon: 'CheckCircle',
    color: 'bg-green-100 text-green-800',
    category: 'delivered'
  },
  
  // Shipment statuses (from shipments table)
  'awaiting_quote': {
    code: 'SHP-001',
    name: 'Awaiting Quote',
    description: 'Shipment created, awaiting cost calculation and quote approval',
    customerMessage: 'Your shipment has been created and we are calculating shipping costs. You will receive a quote shortly.',
    icon: 'Calculator',
    color: 'bg-gray-100 text-gray-800',
    category: 'pending'
  },
  'quote_ready': {
    code: 'SHP-002',
    name: 'Quote Ready',
    description: 'Shipping quote has been calculated and is ready for customer approval',
    customerMessage: 'Your shipping quote is ready for review. Please approve to proceed with shipment.',
    icon: 'FileText',
    color: 'bg-blue-100 text-blue-800',
    category: 'pending'
  },
  'payment_pending': {
    code: 'SHP-003',
    name: 'Payment Pending',
    description: 'Quote approved, awaiting payment confirmation',
    customerMessage: 'Thank you for approving the quote. Please complete payment to proceed with shipment.',
    icon: 'CreditCard',
    color: 'bg-yellow-100 text-yellow-800',
    category: 'pending'
  },
  'processing_shipment': {
    code: 'SHP-004',
    name: 'Processing Shipment',
    description: 'Payment received, shipment is being prepared for dispatch',
    customerMessage: 'Payment confirmed! Your shipment is being prepared for dispatch.',
    icon: 'Package',
    color: 'bg-orange-100 text-orange-800',
    category: 'processing'
  },
  'ready_for_pickup': {
    code: 'SHP-005',
    name: 'Ready for Pickup',
    description: 'Shipment is ready for carrier pickup',
    customerMessage: 'Your shipment is ready and waiting for carrier pickup.',
    icon: 'Truck',
    color: 'bg-indigo-100 text-indigo-800',
    category: 'processing'
  },
  'in_transit': {
    code: 'SHP-006',
    name: 'In Transit',
    description: 'Shipment is in transit to destination country',
    customerMessage: 'Your shipment is in transit and on its way to the destination country.',
    icon: 'Plane',
    color: 'bg-blue-100 text-blue-800',
    category: 'transit'
  },
  'customs_clearance': {
    code: 'SHP-007',
    name: 'Customs Clearance',
    description: 'Shipment is undergoing customs clearance at destination',
    customerMessage: 'Your shipment has arrived at the destination country and is undergoing customs clearance.',
    icon: 'Shield',
    color: 'bg-purple-100 text-purple-800',
    category: 'transit'
  },
  'out_for_delivery': {
    code: 'SHP-008',
    name: 'Out for Delivery',
    description: 'Shipment is out for final delivery to recipient',
    customerMessage: 'Your shipment is out for delivery and will be delivered today.',
    icon: 'Truck',
    color: 'bg-green-100 text-green-800',
    category: 'transit'
  },
  'delivered': {
    code: 'SHP-009',
    name: 'Delivered',
    description: 'Shipment has been successfully delivered to recipient',
    customerMessage: 'Your shipment has been successfully delivered. Thank you for choosing our service!',
    icon: 'CheckCircle',
    color: 'bg-green-100 text-green-800',
    category: 'delivered'
  },
  'delivery_attempted': {
    code: 'SHP-010',
    name: 'Delivery Attempted',
    description: 'Delivery was attempted but recipient was not available',
    customerMessage: 'Delivery was attempted but no one was available. The carrier will attempt delivery again.',
    icon: 'AlertCircle',
    color: 'bg-yellow-100 text-yellow-800',
    category: 'exception'
  },
  'exception': {
    code: 'SHP-011',
    name: 'Exception',
    description: 'An exception occurred during shipment processing or delivery',
    customerMessage: 'There is an issue with your shipment. Our team is working to resolve it and will contact you shortly.',
    icon: 'AlertTriangle',
    color: 'bg-red-100 text-red-800',
    category: 'exception'
  },
  'returned': {
    code: 'SHP-012',
    name: 'Returned',
    description: 'Shipment has been returned to sender',
    customerMessage: 'Your shipment has been returned to our facility. Please contact us for more information.',
    icon: 'RotateCcw',
    color: 'bg-red-100 text-red-800',
    category: 'exception'
  }
};

// Tracking event interface
export interface TrackingEvent {
  id: string;
  timestamp: string;
  location: string;
  status: TrackingStatus;
  description: string;
  details?: string;
  completed: boolean;
  estimatedDate?: string;
}

// Comprehensive tracking data
export interface TrackingData {
  trackingNumber: string;
  type: 'package' | 'shipment';
  currentStatus: TrackingStatus;
  origin: string;
  destination: string;
  recipient: {
    name: string;
    address: string;
    phone?: string;
  };
  service: {
    type: string;
    estimatedDelivery: string;
  };
  package: {
    description: string;
    weight: string;
    value: string;
    dimensions?: string;
  };
  events: TrackingEvent[];
  progress: {
    currentStep: number;
    totalSteps: number;
    percentage: number;
  };
  lastUpdated: string;
}

export class TrackingService {
  /**
   * Get tracking status information by status code
   */
  static getStatusInfo(status: string): TrackingStatus {
    return TRACKING_STATUSES[status.toLowerCase()] || TRACKING_STATUSES['exception'];
  }

  /**
   * Track a package or shipment by tracking number
   * Handles the workflow where admin creates shipments containing multiple user packages
   */
  static async trackByNumber(trackingNumber: string, userId?: string): Promise<{
    data: TrackingData | null;
    error: string | null;
  }> {
    try {
      // First, try to find the shipment by tracking number
      const shipmentResult = await this.trackShipment(trackingNumber);
      if (shipmentResult.data) {
        return shipmentResult;
      }

      // If not found as shipment, try to find as individual package
      const packageResult = await this.trackPackage(trackingNumber);
      if (packageResult.data) {
        return packageResult;
      }

      // If not found anywhere, try to find user's package within a shipment
      const packageInShipmentResult = await this.trackPackageInShipment(trackingNumber, userId);
      if (packageInShipmentResult.data) {
        return packageInShipmentResult;
      }

      return {
        data: null,
        error: `Tracking number "${trackingNumber}" not found. Please check the number and try again.`
      };
    } catch (error) {
      console.error('Tracking error:', error);
      return {
        data: null,
        error: 'Unable to retrieve tracking information at this time. Please try again later.'
      };
    }
  }

  /**
   * Track a package from packages table
   */
  private static async trackPackage(trackingNumber: string): Promise<{
    data: TrackingData | null;
    error: string | null;
  }> {
    try {
      const { data: packageData, error } = await supabase
        .from('packages')
        .select(`
          *,
          users!packages_user_id_fkey(
            first_name,
            last_name,
            street_address,
            city,
            country,
            phone_number
          ),
          package_shipments(
            shipments(
              estimated_delivery,
              tracking_number,
              status
            )
          )
        `)
        .or(`package_id.eq.${trackingNumber},tracking_number.eq.${trackingNumber}`);

      if (error) {
        console.error('Package query error:', error);
        return { data: null, error: null }; // Not found, try shipments
      }

      if (!packageData || packageData.length === 0) {
        return { data: null, error: null }; // Not found
      }

      // Take the first result if multiple found
      const pkg = packageData[0];

      const user = Array.isArray(pkg.users) ? pkg.users[0] : pkg.users;
      const currentStatus = this.getStatusInfo(pkg.status);

      // Extract shipment data for estimated delivery
      const shipmentData = pkg.package_shipments?.[0]?.shipments;
      const estimatedDelivery = shipmentData?.estimated_delivery;

      // Generate tracking events for package
      const events = this.generatePackageEvents(pkg);
      
      // Calculate progress
      const progress = this.calculateProgress(pkg.status, 'package');

      const trackingData: TrackingData = {
        trackingNumber: pkg.package_id || pkg.tracking_number || pkg.id,
        type: 'package',
        currentStatus,
        origin: 'Vanguard Cargo Facility, Miami, FL, USA',
        destination: `${user?.city || 'Unknown'}, ${user?.country || 'Unknown'}`,
        recipient: {
          name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Unknown',
          address: `${user?.street_address || ''}, ${user?.city || ''}, ${user?.country || ''}`.trim(),
          phone: user?.phone_number
        },
        service: {
          type: 'Package Forwarding',
          estimatedDelivery: estimatedDelivery || this.calculateEstimatedDelivery(pkg.status, pkg.processed_at || pkg.created_at)
        },
        package: {
          description: pkg.description || 'Package',
          weight: pkg.weight ? `${pkg.weight} kg` : 'Unknown', // Weight is already in kilograms
          value: pkg.declared_value ? `$${pkg.declared_value.toFixed(2)}` : 'Unknown',
          dimensions: undefined // Dimensions not tracked in current schema
        },
        events,
        progress,
        lastUpdated: pkg.updated_at || pkg.created_at
      };

      return { data: trackingData, error: null };
    } catch (error) {
      console.error('Package tracking error:', error);
      return { data: null, error: 'Error retrieving package information' };
    }
  }

  /**
   * Track user's package within a shipment by shipment tracking number
   * Uses junction table (package_shipments) to find packages in shipment
   * Shows only the current user's package within the shipment
   */
  private static async trackPackageInShipment(shipmentTrackingNumber: string, userId?: string): Promise<{
    data: TrackingData | null;
    error: string | null;
  }> {
    try {
      // First, find the shipment by tracking number
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_number', shipmentTrackingNumber);

      if (shipmentError || !shipmentData || shipmentData.length === 0) {
        return { data: null, error: null }; // Shipment not found
      }

      const shipment = shipmentData[0];

      // Find packages in this shipment using junction table
      // Join: package_shipments -> packages -> users
      const { data: packageShipmentData, error: packageShipmentError } = await supabase
        .from('package_shipments')
        .select(`
          package_id,
          packages!inner(
            *,
            users!packages_user_id_fkey(
              id,
              first_name,
              last_name,
              street_address,
              city,
              country,
              phone_number
            )
          )
        `)
        .eq('shipment_id', shipment.id);

      if (packageShipmentError || !packageShipmentData || packageShipmentData.length === 0) {
        return { data: null, error: null }; // No packages found in this shipment
      }

      // Extract packages from junction table result
      const packagesInShipment = packageShipmentData.map(item => item.packages);

      if (!packagesInShipment || packagesInShipment.length === 0) {
        return { data: null, error: null }; // No packages found
      }

      // Filter by current authenticated user if userId is provided
      let userPackages = packagesInShipment;
      if (userId) {
        userPackages = packagesInShipment.filter(pkg => pkg.user_id === userId);
        if (userPackages.length === 0) {
          return { data: null, error: null }; // No packages found for this user in the shipment
        }
      }

      const pkg = userPackages[0];
      const user = Array.isArray(pkg.users) ? pkg.users[0] : pkg.users;

      const trackingData: TrackingData = {
        trackingNumber: pkg.package_id || pkg.tracking_number || pkg.id, // Show PACKAGE tracking number, not shipment
        type: 'package', // User's individual package
        currentStatus: this.getStatusInfo(pkg.status), // Use PACKAGE status, not shipment status
        origin: 'Vanguard Cargo Facility, Miami, FL, USA',
        destination: `${user?.city || 'Unknown'}, ${user?.country || 'Unknown'}`,
        recipient: {
          name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Unknown',
          address: `${user?.street_address || ''}, ${user?.city || ''}, ${user?.country || ''}`.trim(),
          phone: user?.phone_number
        },
        service: {
          type: 'Package Forwarding', // Individual package service
          estimatedDelivery: shipment.estimated_delivery || this.calculateEstimatedDelivery(pkg.status, pkg.processed_at || pkg.created_at)
        },
        package: {
          description: `${pkg.description || 'Package'} (Found via shipment ${shipmentTrackingNumber})`,
          weight: pkg.weight ? `${pkg.weight} kg` : 'Unknown', // Weight is already in kilograms
          value: pkg.declared_value ? `$${pkg.declared_value.toFixed(2)}` : 'Unknown',
          dimensions: undefined // Dimensions not tracked in current schema
        },
        events: this.generatePackageEvents(pkg), // Generate events for the PACKAGE, not shipment
        progress: this.calculateProgress(pkg.status, 'package'), // Package progress, not shipment
        lastUpdated: pkg.updated_at || pkg.created_at
      };

      return { data: trackingData, error: null };
    } catch (error) {
      console.error('Package in shipment tracking error:', error);
      return { data: null, error: 'Error retrieving package information from shipment' };
    }
  }

  /**
   * Track a shipment from shipments table
   */
  private static async trackShipment(trackingNumber: string): Promise<{
    data: TrackingData | null;
    error: string | null;
  }> {
    try {
      const { data: shipmentData, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_number', trackingNumber);

      if (error) {
        console.error('Shipment query error:', error);
        return { data: null, error: null }; // Not found, try packages
      }

      if (!shipmentData || shipmentData.length === 0) {
        return { data: null, error: null }; // Not found
      }

      // Take the first result if multiple found
      const shipment = shipmentData[0];

      const currentStatus = this.getStatusInfo(shipment.status);

      // Generate tracking events for shipment
      const events = this.generateShipmentEvents(shipment);
      
      // Calculate progress
      const progress = this.calculateProgress(shipment.status, 'shipment');

      const trackingData: TrackingData = {
        trackingNumber: shipment.tracking_number,
        type: 'shipment',
        currentStatus,
        origin: 'Vanguard Cargo Facility, Miami, FL, USA',
        destination: `${shipment.delivery_city || 'Unknown'}, ${shipment.delivery_country || 'Unknown'}`,
        recipient: {
          name: shipment.recipient_name || 'Unknown',
          address: `${shipment.delivery_address || ''}, ${shipment.delivery_city || ''}, ${shipment.delivery_country || ''}`.trim(),
          phone: shipment.recipient_phone
        },
        service: {
          type: shipment.service_type || 'Standard Shipping',
          estimatedDelivery: shipment.estimated_delivery || this.calculateEstimatedDelivery(shipment.status, shipment.created_at)
        },
        package: {
          description: 'Consolidated Shipment',
          weight: shipment.total_weight ? `${shipment.total_weight} kg` : 'Unknown', // Weight is already in kilograms
          value: shipment.total_value ? `$${shipment.total_value.toFixed(2)}` : 'Unknown'
        },
        events,
        progress,
        lastUpdated: shipment.updated_at || shipment.created_at
      };

      return { data: trackingData, error: null };
    } catch (error) {
      console.error('Shipment tracking error:', error);
      return { data: null, error: 'Error retrieving shipment information' };
    }
  }

  /**
   * Generate complete 7-step tracking timeline for a package
   * Shows all steps professionally with completion status
   * Workflow: pending → received → processing → shipped → in_transit → arrived → delivered
   */
  private static generatePackageEvents(packageData: any): TrackingEvent[] {
    const events: TrackingEvent[] = [];
    const createdDate = new Date(packageData.created_at);
    const currentStatus = packageData.status;
    
    // Define the complete 7-step journey
    const statusProgression = ['pending', 'received', 'processing', 'shipped', 'in_transit', 'arrived', 'delivered'];
    const currentIndex = statusProgression.indexOf(currentStatus);

    // Step 1: Package Pending
    const pendingDate = new Date(packageData.created_at);
    events.push({
      id: `pkg-${packageData.id}-pending`,
      timestamp: pendingDate.toLocaleString(),
      location: 'Package Information Received',
      status: this.getStatusInfo('pending'),
      description: 'Package information received',
      details: `Package information from ${packageData.store_name || packageData.vendor_name || 'retailer'} has been received. Awaiting physical package arrival at our Miami facility.`,
      completed: currentIndex >= 0,
      estimatedDate: currentIndex >= 0 ? undefined : 'Awaiting arrival'
    });

    // Step 2: Package Received
    const receivedDate = packageData.received_at ? 
      new Date(packageData.received_at) : 
      new Date(createdDate.getTime() + 12 * 60 * 60 * 1000); // 12 hours after pending
    events.push({
      id: `pkg-${packageData.id}-received`,
      timestamp: currentIndex >= 1 ? receivedDate.toLocaleString() : 'Estimated: ' + receivedDate.toLocaleDateString(),
      location: 'Vanguard Cargo Facility, Miami, FL',
      status: this.getStatusInfo('received'),
      description: 'Package received and scanned',
      details: currentIndex >= 1 ? 
        'Your package has been physically received and scanned at our Vanguard Cargo facility in Miami. Package inspection and documentation completed.' :
        'Your package will be received and scanned at our Miami facility.',
      completed: currentIndex >= 1,
      estimatedDate: currentIndex >= 1 ? undefined : receivedDate.toLocaleDateString()
    });

    // Step 3: Processing for Shipment
    const processedDate = packageData.processed_at ? 
      new Date(packageData.processed_at) : 
      new Date(receivedDate.getTime() + 24 * 60 * 60 * 1000);
    events.push({
      id: `pkg-${packageData.id}-processing`,
      timestamp: currentIndex >= 2 ? processedDate.toLocaleString() : 'Estimated: ' + processedDate.toLocaleDateString(),
      location: 'Vanguard Cargo Processing Center, Miami, FL',
      status: this.getStatusInfo('processing'),
      description: 'Package ready for shipment',
      details: currentIndex >= 2 ? 
        'Your package has been marked as ready for shipment and is being prepared for consolidation with other packages. Processing typically takes 3-5 business days.' :
        'Your package will be processed and prepared for shipment consolidation.',
      completed: currentIndex >= 2,
      estimatedDate: currentIndex >= 2 ? undefined : processedDate.toLocaleDateString()
    });

    // Step 4: Package Shipped
    const shippedDate = packageData.shipped_at ? 
      new Date(packageData.shipped_at) : 
      new Date(processedDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    events.push({
      id: `pkg-${packageData.id}-shipped`,
      timestamp: currentIndex >= 3 ? shippedDate.toLocaleString() : 'Estimated: ' + shippedDate.toLocaleDateString(),
      location: 'Vanguard Cargo Warehouse, Miami, FL',
      status: this.getStatusInfo('shipped'),
      description: 'Package included in shipment',
      details: currentIndex >= 3 ? 
        'Your package has been included in a shipment and dispatched from our Miami facility. It is now being prepared for international transit.' :
        'Your package will be included in a shipment and dispatched from our Miami facility.',
      completed: currentIndex >= 3,
      estimatedDate: currentIndex >= 3 ? undefined : shippedDate.toLocaleDateString()
    });

    // Step 5: Package In Transit
    const inTransitDate = packageData.in_transit_at ? 
      new Date(packageData.in_transit_at) : 
      new Date(shippedDate.getTime() + 12 * 60 * 60 * 1000); // 12 hours after shipped
    events.push({
      id: `pkg-${packageData.id}-in_transit`,
      timestamp: currentIndex >= 4 ? inTransitDate.toLocaleString() : 'Estimated: ' + inTransitDate.toLocaleDateString(),
      location: 'Miami International Airport, FL',
      status: this.getStatusInfo('in_transit'),
      description: 'Package in transit to Ghana',
      details: currentIndex >= 4 ? 
        'Your package is now in transit from Miami to Ghana. Transit time is typically 3-7 days.' :
        'Your package will be in transit from Miami International Airport to Ghana.',
      completed: currentIndex >= 4,
      estimatedDate: currentIndex >= 4 ? undefined : inTransitDate.toLocaleDateString()
    });

    // Step 6: Arrived in Ghana
    const arrivedDate = packageData.arrived_at ? 
      new Date(packageData.arrived_at) : 
      new Date(inTransitDate.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days transit
    events.push({
      id: `pkg-${packageData.id}-arrived`,
      timestamp: currentIndex >= 5 ? arrivedDate.toLocaleString() : 'Estimated: ' + arrivedDate.toLocaleDateString(),
      location: 'Ghana Customs Authority, Accra',
      status: this.getStatusInfo('arrived'),
      description: 'Package arrived in Ghana',
      details: currentIndex >= 5 ? 
        'Your package has arrived in Ghana and is being processed through customs clearance. This typically takes 1-3 business days.' :
        'Your package will arrive in Ghana and undergo customs clearance.',
      completed: currentIndex >= 5,
      estimatedDate: currentIndex >= 5 ? undefined : arrivedDate.toLocaleDateString()
    });

    // Step 7: Delivered
    const deliveredDate = packageData.delivered_at ? 
      new Date(packageData.delivered_at) : 
      new Date(arrivedDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    events.push({
      id: `pkg-${packageData.id}-delivered`,
      timestamp: currentIndex >= 6 ? deliveredDate.toLocaleString() : 'Estimated: ' + deliveredDate.toLocaleDateString(),
      location: 'Ghana Local Delivery Network',
      status: this.getStatusInfo('delivered'),
      description: 'Package delivered to recipient',
      details: currentIndex >= 6 ? 
        'Your package has been successfully delivered to the recipient address. Thank you for choosing Vanguard Cargo!' :
        'Your package will be delivered to your specified address in Ghana.',
      completed: currentIndex >= 6,
      estimatedDate: currentIndex >= 6 ? undefined : deliveredDate.toLocaleDateString()
    });

    return events;
  }

  /**
   * Generate tracking events for consolidated shipment (package within shipment)
   * Combines package and shipment information for comprehensive tracking
   */
  private static generateConsolidatedShipmentEvents(packageData: any, shipmentData: any): TrackingEvent[] {
    const events: TrackingEvent[] = [];
    const packageCreatedDate = new Date(packageData.created_at);
    const shipmentCreatedDate = new Date(shipmentData.created_at);

    // 1. Package received at facility
    events.push({
      id: '1',
      timestamp: packageCreatedDate.toLocaleString(),
      location: 'Vanguard Cargo Facility, Miami, FL',
      status: this.getStatusInfo('received'),
      description: 'Package received at Vanguard Cargo facility',
      details: `Your package (${packageData.package_id || packageData.tracking_number}) from ${packageData.store_name || packageData.vendor_name || 'retailer'} has been received and logged into our secure warehouse system.`,
      completed: true
    });

    // 2. Package processed for consolidation
    events.push({
      id: '2',
      timestamp: shipmentCreatedDate.toLocaleString(),
      location: 'Vanguard Cargo Processing Center, Miami, FL',
      status: this.getStatusInfo('processing_shipment'),
      description: 'Package consolidated for international shipment',
      details: `Your package has been consolidated with other packages into shipment ${shipmentData.tracking_number} for efficient international shipping to Ghana.`,
      completed: true
    });

    // Add subsequent events based on shipment status
    const statusProgression = [
      'ready_for_pickup', 'in_transit', 'customs_clearance', 'out_for_delivery', 'delivered'
    ];

    const currentIndex = statusProgression.indexOf(shipmentData.status);
    
    statusProgression.forEach((status, index) => {
      if (index <= currentIndex) {
        const eventDate = new Date(shipmentCreatedDate.getTime() + (index + 1) * 24 * 60 * 60 * 1000);
        const statusInfo = this.getStatusInfo(status);
        
        events.push({
          id: (index + 3).toString(), // Start from 3 since we have 2 package events
          timestamp: eventDate.toLocaleString(),
          location: this.getLocationForStatus(status),
          status: statusInfo,
          description: statusInfo.description,
          details: statusInfo.customerMessage,
          completed: index < currentIndex,
          estimatedDate: index === currentIndex ? undefined : eventDate.toLocaleDateString()
        });
      }
    });

    return events;
  }

  /**
   * Generate tracking events for a shipment
   */
  private static generateShipmentEvents(shipmentData: any): TrackingEvent[] {
    const events: TrackingEvent[] = [];
    const createdDate = new Date(shipmentData.created_at);

    // Add events based on shipment status progression
    const statusProgression = [
      'awaiting_quote', 'quote_ready', 'payment_pending', 'processing_shipment',
      'ready_for_pickup', 'in_transit', 'customs_clearance', 'out_for_delivery', 'delivered'
    ];

    const currentIndex = statusProgression.indexOf(shipmentData.status);
    
    statusProgression.forEach((status, index) => {
      if (index <= currentIndex) {
        const eventDate = new Date(createdDate.getTime() + index * 24 * 60 * 60 * 1000);
        const statusInfo = this.getStatusInfo(status);
        
        events.push({
          id: (index + 1).toString(),
          timestamp: eventDate.toLocaleString(),
          location: this.getLocationForStatus(status),
          status: statusInfo,
          description: statusInfo.description,
          details: statusInfo.customerMessage,
          completed: index < currentIndex,
          estimatedDate: index === currentIndex ? undefined : eventDate.toLocaleDateString()
        });
      }
    });

    return events;
  }

  /**
   * Calculate progress based on status and type
   * Packages: 7-step journey (pending → received → processing → shipped → in_transit → arrived → delivered)
   * Shipments: 5-step journey (processing → shipped → in_transit → arrived → delivered)
   */
  private static calculateProgress(status: string, type: 'package' | 'shipment'): {
    currentStep: number;
    totalSteps: number;
    percentage: number;
  } {
    if (type === 'package') {
      // Complete 7-step package journey
      const steps = ['pending', 'received', 'processing', 'shipped', 'in_transit', 'arrived', 'delivered'];
      const currentStep = Math.max(1, steps.indexOf(status) + 1);
      const totalSteps = steps.length;
      return {
        currentStep,
        totalSteps,
        percentage: Math.round((currentStep / totalSteps) * 100)
      };
    } else {
      const steps = [
        'awaiting_quote', 'quote_ready', 'payment_pending', 'processing_shipment',
        'ready_for_pickup', 'in_transit', 'customs_clearance', 'out_for_delivery', 'delivered'
      ];
      const currentStep = Math.max(1, steps.indexOf(status) + 1);
      const totalSteps = steps.length;
      return {
        currentStep,
        totalSteps,
        percentage: Math.round((currentStep / totalSteps) * 100)
      };
    }
  }

  /**
   * Calculate estimated delivery date
   */
  private static calculateEstimatedDelivery(status: string, startDate: string): string {
    const start = new Date(startDate);
    let daysToAdd = 7; // Default 7 days

    switch (status) {
      case 'received':
        daysToAdd = 10;
        break;
      case 'processing':
        daysToAdd = 7;
        break;
      case 'shipped':
        daysToAdd = 5;
        break;
      case 'in_transit':
        daysToAdd = 3;
        break;
      case 'delivered':
        return 'Delivered';
      default:
        daysToAdd = 10;
    }

    const estimatedDate = new Date(start.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    return estimatedDate.toLocaleDateString();
  }

  /**
   * Get location for shipment status
   */
  private static getLocationForStatus(status: string): string {
    switch (status) {
      case 'awaiting_quote':
      case 'quote_ready':
      case 'payment_pending':
      case 'processing_shipment':
        return 'Vanguard Cargo Processing Center, Miami, FL';
      case 'ready_for_pickup':
        return 'Miami International Airport, FL';
      case 'in_transit':
        return 'International Transit to Ghana';
      case 'customs_clearance':
        return 'Ghana Customs Authority, Accra';
      case 'out_for_delivery':
      case 'delivered':
        return 'Ghana Local Delivery Network';
      default:
        return 'Vanguard Cargo Facility, Miami, FL';
    }
  }
}

export default TrackingService;
