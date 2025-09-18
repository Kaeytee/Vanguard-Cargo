import { supabase, type Tables, type Inserts } from '../lib/supabase';

export type Shipment = Tables<'shipments'>;
export type NewShipment = Inserts<'shipments'>;

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
        query = query.or(`shipment_number.ilike.%${filters.search}%,recipient_name.ilike.%${filters.search}%`);
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

      // Transform data - packages will be fetched separately if needed
      const shipmentsWithDetails: ShipmentWithDetails[] = (data || []).map(shipment => ({
        ...shipment,
        packages: [], // Will be populated by separate query if needed
      }));

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

      // Return shipment without packages for now to avoid RLS issues
      const shipmentWithDetails: ShipmentWithDetails = {
        ...data[0],
        packages: [], // Can be populated separately if needed
      };

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
        .eq('shipment_number', shipmentNumber)
        .limit(1);

      if (error) {
        return { data: null, error };
      }

      // Check if we got any results
      if (!data || data.length === 0) {
        return { data: null, error: new Error('Shipment not found') };
      }

      // Return the first shipment without packages for now to avoid RLS issues
      const shipmentWithDetails: ShipmentWithDetails = {
        ...data[0],
        packages: [], // Can be populated separately if needed
      };

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

  // Get shipment status options
  getShipmentStatuses(): Array<{ value: string; label: string; color: string }> {
    return [
      { value: 'awaiting_quote', label: 'Awaiting Quote', color: 'gray' },
      { value: 'quote_ready', label: 'Quote Ready', color: 'blue' },
      { value: 'payment_pending', label: 'Payment Pending', color: 'yellow' },
      { value: 'processing', label: 'Processing', color: 'blue' },
      { value: 'shipped', label: 'Shipped', color: 'indigo' },
      { value: 'in_transit', label: 'In Transit', color: 'blue' },
      { value: 'customs_clearance', label: 'Customs Clearance', color: 'orange' },
      { value: 'out_for_delivery', label: 'Out for Delivery', color: 'green' },
      { value: 'delivered', label: 'Delivered', color: 'green' },
      { value: 'cancelled', label: 'Cancelled', color: 'red' },
    ];
  }

  // Get service type options
  getServiceTypes(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'economy',
        label: 'Economy',
        description: 'Budget-friendly option with longer delivery time',
      },
      {
        value: 'standard',
        label: 'Standard',
        description: 'Balanced option with reliable delivery',
      },
      {
        value: 'express',
        label: 'Express',
        description: 'Fastest delivery option',
      },
    ];
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
        awaiting_quote: data.filter(s => ['awaiting_quote', 'quote_ready', 'payment_pending'].includes(s.status)).length,
        in_transit: data.filter(s => ['processing', 'shipped', 'in_transit', 'customs_clearance', 'out_for_delivery'].includes(s.status)).length,
        delivered: data.filter(s => s.status === 'delivered').length,
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
        query = query.or(`shipment_number.ilike.%${search}%,recipient_name.ilike.%${search}%`);
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
      const items = (data || []).map(shipment => ({
        id: shipment.id || shipment.shipment_number || 'N/A',
        date: shipment.created_at ? new Date(shipment.created_at).toLocaleDateString() : 'N/A',
        destination: `${shipment.delivery_city || 'Unknown'}, ${shipment.delivery_country || 'Unknown'}`,
        recipient: shipment.recipient_name || 'Unknown',
        type: shipment.service_type || 'Standard',
        status: shipment.status || 'pending'
      }));

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
}

export const shipmentService = new ShipmentService();
export default shipmentService;
