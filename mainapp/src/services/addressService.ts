import { supabase, type Tables } from '../lib/supabase';

export type USShippingAddress = Tables<'us_shipping_addresses'>;

class AddressService {
  // Get user's US shipping address
  async getUserAddress(userId: string): Promise<{ data: USShippingAddress | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('us_shipping_addresses')
        .select(`
          *,
          warehouses:warehouse_id (
            name,
            code,
            city,
            state,
            phone
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        // If no address found, return null (not an error)
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Get user address error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Check if user has an assigned address
  async hasAssignedAddress(userId: string): Promise<{ data: boolean; error: Error | null }> {
    try {
      const { count, error } = await supabase
        .from('us_shipping_addresses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true);

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
  formatAddress(address: USShippingAddress): string {
    if (!address) return '';
    
    return [
      address.suite_number,
      address.street_address,
      `${address.city}, ${address.state} ${address.postal_code}`,
      address.country,
    ]
      .filter(Boolean)
      .join('\n');
  }

  // Format address for single line
  formatAddressOneLine(address: USShippingAddress): string {
    if (!address) return '';
    
    return [
      address.suite_number,
      address.street_address,
      `${address.city}, ${address.state} ${address.postal_code}`,
      address.country,
    ]
      .filter(Boolean)
      .join(', ');
  }

  // Get address instructions for customers
  getAddressInstructions(address: USShippingAddress | null): string {
    if (!address) {
      return 'You do not have a US shipping address assigned yet. Please request one from our support team.';
    }

    return `
Use this address when shopping online:

${this.formatAddress(address)}

Important Notes:
• Always include your suite number: ${address.suite_number}
• Use this exact address format
• Notify us when packages are shipped to this address
• Free storage for 30 days from arrival
    `.trim();
  }

  // Validate address completeness
  isAddressComplete(address: USShippingAddress | null): boolean {
    if (!address) return false;
    
    return !!(
      address.suite_number &&
      address.street_address &&
      address.city &&
      address.state &&
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
}

export const addressService = new AddressService();
export default addressService;
