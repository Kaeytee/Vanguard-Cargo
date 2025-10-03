import { supabase, type Tables } from '../lib/supabase';
import { SupabaseErrorHandler } from '../utils/supabaseErrorHandler';
import { DatabaseDebugger } from '../utils/databaseDebugger';

// Extend the base address type to include optional joined warehouse data
export type AddressWithWarehouse = Tables<'addresses'> & {
  warehouses?: Tables<'warehouses'> | null;
};

// For clarity in other parts of the app, we can alias this
export type USShippingAddress = AddressWithWarehouse;

class AddressService {
  // Get user's US shipping address with enhanced error handling
  async getUserAddress(userId: string): Promise<{ data: USShippingAddress | null; error: Error | null }> {
    try {
      // Step 1: Fetch the address with proper error handling
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .in('type', ['shipping', 'both'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle() to handle no results gracefully

      // Handle address fetch error using our error handler
      if (addressError) {
        const errorResponse = SupabaseErrorHandler.handlePostgrestError(addressError, 'Fetch user address');
        if (!errorResponse.success) {
          console.error('Get user address error:', errorResponse.error);
          return { data: null, error: errorResponse.error };
        }
      }

      // If no address found, return null without error
      if (!addressData) {
        return { data: null, error: null };
      }

      // Type assertion for addressData to ensure proper typing
      const typedAddressData = addressData as Tables<'addresses'>;
      let warehouseData: Tables<'warehouses'> | null = null;

      // Step 2: If a warehouse_id exists, fetch the warehouse details
      if (typedAddressData.warehouse_id) {
        const { data: whData, error: whError } = await supabase
          .from('warehouses')
          .select('*')
          .eq('id', typedAddressData.warehouse_id)
          .maybeSingle();
        
        if (whError) {
          const warehouseErrorResponse = SupabaseErrorHandler.handlePostgrestError(whError, 'Fetch warehouse details');
          console.warn('Could not fetch warehouse details:', warehouseErrorResponse.error);
        } else if (whData) {
          warehouseData = whData as Tables<'warehouses'>;
        }
      }

      // Step 3: Combine the address and warehouse data
      const fullAddress: USShippingAddress = {
        ...typedAddressData,
        warehouses: warehouseData,
      };

      return { data: fullAddress, error: null };
    } catch (err) {
      const errorResponse = SupabaseErrorHandler.handleGenericError(err, 'Get user address');
      return { data: null, error: errorResponse.error };
    }
  }

  // Check if user has an assigned address
  async hasAssignedAddress(userId: string): Promise<{ data: boolean; error: Error | null }> {
    try {
      // Use count query with proper error handling
      const { count, error } = await supabase
        .from('addresses')
        .select('id', { count: 'exact', head: true }) // Only select id for count, more efficient
        .eq('user_id', userId)
        .eq('is_default', true)
        .in('type', ['shipping', 'both']); // Filter for shipping or both types

      if (error) {
        console.error('Check assigned address error:', error);
        return { data: false, error };
      }

      return { data: (count || 0) > 0, error: null };
    } catch (err) {
      console.error('Check assigned address error:', err);
      return { data: false, error: err as Error };
    }
  }

  // Request address assignment (customer action)
  async requestAddressAssignment(userId: string): Promise<{ error: Error | null }> {
    try {
      // Create a notification for admin to assign address
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId, // This will be changed to admin users by RLS
          title: 'Address Assignment Request',
          message: `User ${userId} has requested a US shipping address assignment.`,
          type: 'in_app',
          category: 'address_assignment',
          priority: 'medium',
        });

      return { error };
    } catch (err) {
      console.error('Request address assignment error:', err);
      return { error: err as Error };
    }
  }

  // Format address for display
  // Format address for display
  formatAddress(address: USShippingAddress, suiteNumber?: string): string {
    if (!address) return '';
    
    // suite_number is now passed separately as it belongs to the user
    return [
      suiteNumber,
      address.line1, // Changed from street_address
      `${address.city}, ${address.state_province} ${address.postal_code}`,
      address.country,
    ]
      .filter(Boolean)
      .join('\n');
  }

  // Format address for single line
  // Format address for single line
  formatAddressOneLine(address: USShippingAddress, suiteNumber?: string): string {
    if (!address) return '';
    
    return [
      suiteNumber,
      address.line1, // Changed from street_address
      `${address.city}, ${address.state_province} ${address.postal_code}`,
      address.country,
    ]
      .filter(Boolean)
      .join(', ');
  }

  // Get address instructions for customers
  getAddressInstructions(address: USShippingAddress | null, suiteNumber?: string): string {
    if (!address || !suiteNumber) {
      return 'You do not have a US shipping address assigned yet. Please request one from our support team.';
    }

    return `
Use this address when shopping online:

${this.formatAddress(address, suiteNumber)}

Important Notes:
• Always include your suite number: ${suiteNumber}
• Use this exact address format
• Notify us when packages are shipped to this address
• Free storage for 30 days from arrival
    `.trim();
  }

  // Validate address completeness
  // Validate address completeness
  isAddressComplete(address: USShippingAddress | null): boolean {
    if (!address) return false;
    
    // suite_number is removed from this check as it's part of the user profile
    return !!(
      address.line1 && // Changed from street_address
      address.city &&
      address.state_province && // Changed from state
      address.postal_code &&
      address.country
    );
  }

  // Get available warehouses for address assignment (admin only)
  async getAvailableWarehouses(): Promise<{
    data: Array<{
      id: string;
      name: string;
      code: string;
      city: string;
      available_suites: number;
      next_available_suite: string;
    }>;
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_available_us_addresses');

      if (error) {
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Get available warehouses error:', err);
      return { data: [], error: err as Error };
    }
  }

  // Update a user's address
  async updateUserAddress(addressId: string, updates: Partial<Tables<'addresses'>>): Promise<{ data: Tables<'addresses'> | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', addressId)
        .select()
        .single();

      if (error) {
        console.error('Update user address error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Update user address error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Debug method to test warehouse data retrieval and schema
  async debugWarehouseData(userId: string): Promise<{ 
    report: string; 
    data: any; 
    error: Error | null; 
  }> {
    try {
      console.log('🔍 Starting warehouse data debug for user:', userId);
      
      // Use the comprehensive debugger
      const debugResult = await DatabaseDebugger.runComprehensiveDebug(userId);
      
      return debugResult;
    } catch (err) {
      const errorMessage = `Debug failed: ${err}`;
      console.error('💥 Debug warehouse data error:', err);
      return { 
        report: errorMessage, 
        data: null, 
        error: err as Error 
      };
    }
  }

  // Create a default address for testing purposes
  async createTestAddress(userId: string, warehouseId: string): Promise<{ 
    data: Tables<'addresses'> | null; 
    error: Error | null; 
  }> {
    try {
      console.log('🏗️ Creating test address for user:', userId);
      
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: userId,
          type: 'shipping',
          line1: '123 Warehouse Street',
          line2: null,
          city: 'Atlanta',
          state_province: 'GA',
          postal_code: '30309',
          country: 'USA',
          is_default: true,
          warehouse_id: warehouseId
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating test address:', error);
        return { data: null, error };
      }

      console.log('✅ Test address created successfully:', data);
      return { data, error: null };
    } catch (err) {
      console.error('💥 Exception creating test address:', err);
      return { data: null, error: err as Error };
    }
  }
}

export const addressService = new AddressService();
export default addressService;
