import { supabase, type Tables } from '../lib/supabase';

// Extend the base address type to include optional joined warehouse data
export type AddressWithWarehouse = Tables<'addresses'> & {
  warehouses?: Tables<'warehouses'> | null;
};

// For clarity in other parts of the app, we can alias this
export type USShippingAddress = AddressWithWarehouse;

class AddressService {
  // Get user's US shipping address
  async getUserAddress(userId: string): Promise<{ data: USShippingAddress | null; error: Error | null }> {
    try {
      // Step 1: Fetch the address without the warehouse join
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .in('type', ['shipping', 'both'])
        .limit(1)
        .single();

      if (addressError) {
        // If no address found, it's not a critical error, just return null.
        if (addressError.code === 'PGRST116') {
          return { data: null, error: null };
        }
        console.error('Get user address error:', addressError);
        return { data: null, error: addressError };
      }

      if (!addressData) {
        return { data: null, error: null };
      }

      let warehouseData = null;
      // Step 2: If a warehouse_id exists, fetch the warehouse details
      if (addressData.warehouse_id) {
        const { data: whData, error: whError } = await supabase
          .from('warehouses')
          .select('*')
          .eq('id', addressData.warehouse_id)
          .single();
        
        if (whError) {
          console.warn('Could not fetch warehouse details:', whError);
        } else {
          warehouseData = whData;
        }
      }

      // Step 3: Combine the address and warehouse data
      const fullAddress: USShippingAddress = {
        ...addressData,
        warehouses: warehouseData,
      };

      return { data: fullAddress, error: null };
    } catch (err) {
      console.error('Get user address error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Check if user has an assigned address
  async hasAssignedAddress(userId: string): Promise<{ data: boolean; error: Error | null }> {
    try {
      const { count, error } = await supabase
        .from('addresses') // Changed from 'us_shipping_addresses'
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_default', true)
        .in('type', ['shipping', 'both']); // Filter for shipping or both types

      if (error) {
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
}

export const addressService = new AddressService();
export default addressService;
