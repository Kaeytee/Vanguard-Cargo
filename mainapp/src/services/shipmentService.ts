import { supabase } from '../lib/supabase';
import { ShipmentStatus, ShipmentStatusUtils, type ShipmentStatusInfo } from '../types';

// Define a local interface to match the new 'shipments' table schema
export interface DbShipment {
  id: string;
  user_id: string;
  tracking_number: string;
  service_type: string | null;
  status: string;
  recipient_name: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_country: string | null;
  recipient_phone: string | null;
  total_weight: number | null;
  total_value: number | null;
  shipping_cost: number | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string | null;
}

// This is the shape the UI expects, with fields from the old schema
export interface Shipment extends Omit<DbShipment, 'recipient_address'> {
  delivery_address: string | null;
  // Fields missing from new schema, set to default values
  total_cost: number | null;
  estimated_cost: number | null;
  cost_status: string | null;
  recipient_phone: string | null;
  total_weight_lbs: number | null;
  total_packages: number | null;
}

export type NewShipment = Partial<Omit<Shipment, 'id' | 'created_at' | 'updated_at'>>;

export interface ShipmentWithDetails extends Shipment {
  packages?: Array<{
    id: string;
    tracking_number: string;
    weight_lbs: number;
    declared_value: number;
  }>;
}

export interface CreateShipmentRequest {
  packageIds: string[];
  recipientInfo: {
    name: string;
    phone?: string;
    email?: string;
    address: string;
    city: string;
    region?: string;
    country: string;
    isExpress?: boolean;
    isInsured?: boolean;
  };
  serviceType?: string;
}

export interface ShipmentFilters {
  status?: string;
  serviceType?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

class ShipmentService {
  // Get all shipments for a user
  async getShipments(
    userId: string,
    filters?: ShipmentFilters,
    limit = 50,
    offset = 0
  ): Promise<{ data: ShipmentWithDetails[]; error: Error | null; count?: number }> {
    try {
      // Simplified query without package joins to avoid RLS infinite recursion
      let query = supabase
        .from('shipments')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.serviceType) {
        query = query.eq('service_type', filters.serviceType);
      }

      if (filters?.search) {
        query = query.or(`tracking_number.ilike.%${filters.search}%,recipient_name.ilike.%${filters.search}%`);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return { data: [], error };
      }

      // Transform DB data to the shape the UI expects
      const shipmentsWithDetails: ShipmentWithDetails[] = (data || []).map(dbShipment => 
        this.mapDbShipmentToUiShipment(dbShipment as DbShipment)
      );

      return { data: shipmentsWithDetails, error: null, count: count || 0 };
    } catch (err) {
      console.error('Get shipments error:', err);
      return { data: [], error: err as Error };
    }
  }

  // Get single shipment by ID
  async getShipment(shipmentId: string): Promise<{ data: ShipmentWithDetails | null; error: Error | null }> {
    try {
      // Simplified query to avoid RLS infinite recursion
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', shipmentId)
        .limit(1);

      if (error) {
        return { data: null, error };
      }

      // Check if we got any results
      if (!data || data.length === 0) {
        return { data: null, error: new Error('Shipment not found') };
      }

      // Transform DB data to the shape the UI expects
      const shipmentWithDetails: ShipmentWithDetails = this.mapDbShipmentToUiShipment(data[0] as DbShipment);

      return { data: shipmentWithDetails, error: null };
    } catch (err) {
      console.error('Get shipment error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Get shipment by shipment number
  async getShipmentByNumber(shipmentNumber: string): Promise<{ data: ShipmentWithDetails | null; error: Error | null }> {
    try {
      // Simplified query to avoid RLS infinite recursion
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_number', shipmentNumber)
        .limit(1);

      if (error) {
        return { data: null, error };
      }

      // Check if we got any results
      if (!data || data.length === 0) {
        return { data: null, error: new Error('Shipment not found') };
      }

      // Transform DB data to the shape the UI expects
      const shipmentWithDetails: ShipmentWithDetails = this.mapDbShipmentToUiShipment(data[0] as DbShipment);

      return { data: shipmentWithDetails, error: null };
    } catch (err) {
      console.error('Get shipment by number error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Create new shipment from packages
  async createShipment(
    _userId: string,
    request: CreateShipmentRequest
  ): Promise<{ data: { shipmentId: string } | null; error: Error | null }> {
    try {
      // Call the Supabase function to create shipment
      const { data, error } = await supabase.rpc('create_shipment_from_packages', {
        package_ids: request.packageIds,
        recipient_info: {
          recipient_name: request.recipientInfo.name,
          recipient_phone: request.recipientInfo.phone,
          recipient_email: request.recipientInfo.email,
          delivery_address: request.recipientInfo.address,
          delivery_city: request.recipientInfo.city,
          delivery_region: request.recipientInfo.region,
          delivery_country: request.recipientInfo.country,
          is_express: request.recipientInfo.isExpress || false,
          is_insured: request.recipientInfo.isInsured || false,
        },
        service_type: request.serviceType || 'standard',
      });

      if (error) {
        return { data: null, error };
      }

      return { data: { shipmentId: data }, error: null };
    } catch (err) {
      console.error('Create shipment error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Get estimated shipping cost
  async getEstimatedCost(
    totalWeight: number,
    serviceType = 'standard',
    destinationCountry = 'Ghana',
    isExpress = false,
    insuranceValue = 0
  ): Promise<{
    data: {
      estimatedBaseRate: number;
      estimatedWeightCharge: number;
      estimatedInsuranceFee: number;
      estimatedHandlingFee: number;
      estimatedTotal: number;
      note: string;
    } | null;
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase.rpc('calculate_estimated_shipment_cost', {
        total_weight: totalWeight,
        service_type: serviceType,
        destination_country: destinationCountry,
        is_express: isExpress,
        insurance_value: insuranceValue,
      });

      if (error) {
        return { data: null, error };
      }

      if (!data || data.length === 0) {
        return { data: null, error: new Error('No cost estimate returned') };
      }

      const costData = data[0];
      return {
        data: {
          estimatedBaseRate: costData.estimated_base_rate,
          estimatedWeightCharge: costData.estimated_weight_charge,
          estimatedInsuranceFee: costData.estimated_insurance_fee,
          estimatedHandlingFee: costData.estimated_handling_fee,
          estimatedTotal: costData.estimated_total,
          note: costData.note,
        },
        error: null,
      };
    } catch (err) {
      console.error('Get estimated cost error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Update shipment status with comprehensive validation
  async updateShipmentStatus(
    shipmentId: string,
    newStatus: string,
    notes?: string,
    userId?: string // For audit trail
  ): Promise<{ data: ShipmentWithDetails | null; error: Error | null }> {
    try {
      // First, get the current shipment to validate the transition
      const { data: currentShipment, error: fetchError } = await supabase
        .from('shipments')
        .select('status, user_id')
        .eq('id', shipmentId)
        .single();

      if (fetchError) {
        return { data: null, error: fetchError };
      }

      if (!currentShipment) {
        return { data: null, error: new Error('Shipment not found') };
      }

      // Validate the status transition using our business rules
      const isValidTransition = ShipmentStatusUtils.isValidTransition(
        currentShipment.status as any,
        newStatus as any
      );

      if (!isValidTransition) {
        const rule = ShipmentStatusUtils.getTransitionRule(
          currentShipment.status as any,
          newStatus as any
        );
        const validNextStatuses = ShipmentStatusUtils.getValidNextStatuses(currentShipment.status as any);
        
        return {
          data: null,
          error: new Error(
            `Invalid status transition from '${currentShipment.status}' to '${newStatus}'. ` +
            `Valid next statuses are: ${validNextStatuses.join(', ')}. ` +
            `${rule ? `Rule: ${rule}` : ''}`
          )
        };
      }

      // Get the business rule for this transition for logging
      const transitionRule = ShipmentStatusUtils.getTransitionRule(
        currentShipment.status as any,
        newStatus as any
      );

      // Update the shipment status
      const { data, error } = await supabase
        .from('shipments')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shipmentId)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      // Log the status change for audit trail
      if (userId && transitionRule) {
        console.log(`Shipment ${shipmentId} status changed from ${currentShipment.status} to ${newStatus} by user ${userId}. Rule: ${transitionRule}`);
        // TODO: Implement audit logging to database
      }

      // Send notification if status change affects customer
      if (ShipmentStatusUtils.requiresCustomerAction(newStatus as any)) {
        // TODO: Trigger customer notification
        console.log(`Customer notification required for shipment ${shipmentId} - status: ${newStatus}`);
      }

      // Transform and return the updated shipment
      const shipmentWithDetails = this.mapDbShipmentToUiShipment(data as DbShipment);
      return { data: shipmentWithDetails, error: null };
    } catch (err) {
      console.error('Update shipment status error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Validate shipment status transition (utility method)
  validateStatusTransition(
    currentStatus: string,
    newStatus: string
  ): { isValid: boolean; error?: string; rule?: string } {
    const isValid = ShipmentStatusUtils.isValidTransition(currentStatus as any, newStatus as any);
    
    if (!isValid) {
      const validNextStatuses = ShipmentStatusUtils.getValidNextStatuses(currentStatus as any);
      return {
        isValid: false,
        error: `Invalid transition from '${currentStatus}' to '${newStatus}'. Valid options: ${validNextStatuses.join(', ')}`
      };
    }

    const rule = ShipmentStatusUtils.getTransitionRule(currentStatus as any, newStatus as any);
    return {
      isValid: true,
      rule: rule || undefined
    };
  }

  // Get shipments requiring warehouse action
  async getShipmentsRequiringWarehouseAction(
    limit = 50,
    offset = 0
  ): Promise<{ data: ShipmentWithDetails[]; error: Error | null; count?: number }> {
    try {
      // Get all statuses that require warehouse action
      const warehouseStatuses = ShipmentStatusUtils.getAllStatuses()
        .filter(status => ShipmentStatusUtils.requiresWarehouseAction(status.value))
        .map(status => status.value);

      const { data, error, count } = await supabase
        .from('shipments')
        .select('*', { count: 'exact' })
        .in('status', warehouseStatuses)
        .order('created_at', { ascending: true }) // Oldest first for FIFO processing
        .range(offset, offset + limit - 1);

      if (error) {
        return { data: [], error };
      }

      const shipmentsWithDetails: ShipmentWithDetails[] = (data || []).map(dbShipment => 
        this.mapDbShipmentToUiShipment(dbShipment as DbShipment)
      );

      return { data: shipmentsWithDetails, error: null, count: count || 0 };
    } catch (err) {
      console.error('Get shipments requiring warehouse action error:', err);
      return { data: [], error: err as Error };
    }
  }

  // Get shipments requiring customer action
  async getShipmentsRequiringCustomerAction(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<{ data: ShipmentWithDetails[]; error: Error | null; count?: number }> {
    try {
      // Get all statuses that require customer action
      const customerStatuses = ShipmentStatusUtils.getAllStatuses()
        .filter(status => ShipmentStatusUtils.requiresCustomerAction(status.value))
        .map(status => status.value);

      const { data, error, count } = await supabase
        .from('shipments')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .in('status', customerStatuses)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        return { data: [], error };
      }

      const shipmentsWithDetails: ShipmentWithDetails[] = (data || []).map(dbShipment => 
        this.mapDbShipmentToUiShipment(dbShipment as DbShipment)
      );

      return { data: shipmentsWithDetails, error: null, count: count || 0 };
    } catch (err) {
      console.error('Get shipments requiring customer action error:', err);
      return { data: [], error: err as Error };
    }
  }

  // Get trackable shipments for customer
  async getTrackableShipments(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<{ data: ShipmentWithDetails[]; error: Error | null; count?: number }> {
    try {
      // Get all statuses that are trackable by customer
      const trackableStatuses = ShipmentStatusUtils.getAllStatuses()
        .filter(status => ShipmentStatusUtils.isTrackableByCustomer(status.value))
        .map(status => status.value);

      const { data, error, count } = await supabase
        .from('shipments')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .in('status', trackableStatuses)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { data: [], error };
      }

      const shipmentsWithDetails: ShipmentWithDetails[] = (data || []).map(dbShipment => 
        this.mapDbShipmentToUiShipment(dbShipment as DbShipment)
      );

      return { data: shipmentsWithDetails, error: null, count: count || 0 };
    } catch (err) {
      console.error('Get trackable shipments error:', err);
      return { data: [], error: err as Error };
    }
  }

  // Get shipment status options using centralized types
  getShipmentStatuses(): ShipmentStatusInfo[] {
    return ShipmentStatusUtils.getAllStatuses();
  }

  // Get shipments summary for dashboard
  async getShipmentsSummary(userId: string): Promise<{
    data: {
      total: number;
      awaiting_quote: number;
      in_transit: number;
      delivered: number;
      total_cost: number;
    };
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('status, total_cost')
        .eq('user_id', userId);

      if (error) {
        return {
          data: { total: 0, awaiting_quote: 0, in_transit: 0, delivered: 0, total_cost: 0 },
          error,
        };
      }

      const summary = {
        total: data.length,
        awaiting_quote: data.filter(s => [ShipmentStatus.AWAITING_QUOTE, ShipmentStatus.QUOTE_READY, ShipmentStatus.PAYMENT_PENDING].includes(s.status as any)).length,
        in_transit: data.filter(s => [ShipmentStatus.PROCESSING, ShipmentStatus.SHIPPED, ShipmentStatus.IN_TRANSIT, ShipmentStatus.CUSTOMS_CLEARANCE, ShipmentStatus.OUT_FOR_DELIVERY].includes(s.status as any)).length,
        delivered: data.filter(s => s.status === ShipmentStatus.DELIVERED).length,
        total_cost: data.reduce((sum, s) => sum + (s.total_cost || 0), 0),
      };

      return { data: summary, error: null };
    } catch (err) {
      console.error('Get shipments summary error:', err);
      return {
        data: { total: 0, awaiting_quote: 0, in_transit: 0, delivered: 0, total_cost: 0 },
        error: err as Error,
      };
    }
  }

  // Helper method for shipment history component - direct query to avoid RLS recursion
  async getUserShipments(
    userId: string,
    page = 1,
    limit = 50,
    status?: string,
    search?: string
  ): Promise<{ 
    success: boolean; 
    data: { 
      items: Array<{
        id: string;
        date: string;
        destination: string;
        recipient: string;
        type: string;
        status: string;
      }>; 
      total: number;
      page: number;
      limit: number;
    }; 
    error?: string 
  }> {
    try {
      const offset = (page - 1) * limit;
      
      // Direct query to shipments table to avoid RLS infinite recursion
      let query = supabase
        .from('shipments')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`tracking_number.ilike.%${search}%,recipient_name.ilike.%${search}%`);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Shipment query error:', error);
        return {
          success: false,
          data: { items: [], total: 0, page, limit },
          error: error.message
        };
      }

      // Transform data to match component interface
      const items = (data || []).map(dbShipment => {
        const shipment = this.mapDbShipmentToUiShipment(dbShipment as DbShipment);
        return {
        id: shipment.tracking_number || shipment.id || 'N/A', // Prioritize tracking_number for tracking functionality
        date: shipment.created_at ? new Date(shipment.created_at).toLocaleDateString() : 'N/A',
        destination: `${shipment.delivery_city || 'Unknown'}, ${shipment.delivery_country || 'Unknown'}`,
        recipient: shipment.recipient_name || 'Unknown',
        type: shipment.service_type || 'Standard',
        status: shipment.status || 'pending'
        };
      });

      return {
        success: true,
        data: {
          items,
          total: count || 0,
          page,
          limit
        }
      };
    } catch (error) {
      console.error('Get user shipments error:', error);
      return {
        success: false,
        data: { items: [], total: 0, page, limit },
        error: 'Failed to fetch shipments'
      };
    }
  }

  // --- Data Transformation ---

  private mapDbShipmentToUiShipment(dbShipment: DbShipment): ShipmentWithDetails {
    const uiShipment: Shipment = {
      ...dbShipment,
      // delivery_address is already in the correct format
      // Set default values for fields missing from the new schema
      total_cost: dbShipment.shipping_cost,
      estimated_cost: dbShipment.shipping_cost,
      cost_status: dbShipment.shipping_cost ? 'calculated' : 'pending',
      total_weight_lbs: dbShipment.total_weight, // Convert from kg to lbs if needed
      total_packages: null, // This would require joining/calculating from package_shipments
    };

    return {
      ...uiShipment,
      packages: [], // Packages are fetched separately to avoid RLS issues
    };
  }
}

export const shipmentService = new ShipmentService();
export default shipmentService;
