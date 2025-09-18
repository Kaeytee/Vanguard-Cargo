import { supabase, type Tables, type Inserts } from '../lib/supabase';

export type Package = Tables<'packages'>;
export type NewPackage = Inserts<'packages'>;

export interface PackageWithDetails extends Package {
  warehouse_name?: string;
  days_in_storage?: number;
  is_overdue?: boolean;
}

export interface PackageFilters {
  status?: string;
  warehouse_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

class PackageService {
  // Get all packages for a user
  async getPackages(
    userId: string,
    filters?: PackageFilters,
    limit = 50,
    offset = 0
  ): Promise<{ data: PackageWithDetails[]; error: Error | null; count?: number }> {
    try {
      let query = supabase
        .from('packages')
        .select(`
          *,
          warehouses:warehouse_id (
            name,
            city,
            code
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.warehouse_id) {
        query = query.eq('warehouse_id', filters.warehouse_id);
      }

      if (filters?.search) {
        query = query.or(`tracking_number.ilike.%${filters.search}%,sender_name.ilike.%${filters.search}%`);
      }

      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return { data: [], error };
      }

      // Transform data to include calculated fields
      const packagesWithDetails: PackageWithDetails[] = (data || []).map(pkg => ({
        ...pkg,
        warehouse_name: pkg.warehouses?.name || 'Unknown',
        days_in_storage: this.calculateDaysInStorage(pkg.created_at),
        is_overdue: this.isOverdue(pkg.free_storage_until),
      }));

      return { data: packagesWithDetails, error: null, count: count || 0 };
    } catch (err) {
      console.error('Get packages error:', err);
      return { data: [], error: err as Error };
    }
  }

  // Get single package by ID
  async getPackage(packageId: string): Promise<{ data: PackageWithDetails | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          warehouses:warehouse_id (
            name,
            city,
            code,
            address
          ),
          package_status_history (
            from_status,
            to_status,
            changed_at,
            notes
          )
        `)
        .eq('id', packageId)
        .single();

      if (error) {
        return { data: null, error };
      }

      const packageWithDetails: PackageWithDetails = {
        ...data,
        warehouse_name: data.warehouses?.name || 'Unknown',
        days_in_storage: this.calculateDaysInStorage(data.created_at),
        is_overdue: this.isOverdue(data.free_storage_until),
      };

      return { data: packageWithDetails, error: null };
    } catch (err) {
      console.error('Get package error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Get package by tracking number
  async getPackageByTracking(trackingNumber: string): Promise<{ data: PackageWithDetails | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          warehouses:warehouse_id (
            name,
            city,
            code
          ),
          tracking_events (
            event_type,
            event_description,
            created_at,
            location
          )
        `)
        .eq('tracking_number', trackingNumber)
        .single();

      if (error) {
        return { data: null, error };
      }

      const packageWithDetails: PackageWithDetails = {
        ...data,
        warehouse_name: data.warehouses?.name || 'Unknown',
        days_in_storage: this.calculateDaysInStorage(data.created_at),
        is_overdue: this.isOverdue(data.free_storage_until),
      };

      return { data: packageWithDetails, error: null };
    } catch (err) {
      console.error('Get package by tracking error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Create new package (admin/staff only)
  async createPackage(packageData: NewPackage): Promise<{ data: Package | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('packages')
        .insert(packageData)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Create package error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Update package (admin/staff only)
  async updatePackage(
    packageId: string, 
    updates: Partial<Package>
  ): Promise<{ data: Package | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('packages')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', packageId)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Update package error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Update package status (admin/staff only)
  async updatePackageStatus(
    packageId: string,
    status: string,
    // notes?: string // Commented out - not currently used
  ): Promise<{ data: Package | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('packages')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', packageId)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Update package status error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Get package status options
  getPackageStatuses(): Array<{ value: string; label: string; color: string }> {
    return [
      { value: 'pending_arrival', label: 'Pending Arrival', color: 'gray' },
      { value: 'arrived', label: 'Arrived', color: 'blue' },
      { value: 'inspected', label: 'Inspected', color: 'yellow' },
      { value: 'ready_for_shipment', label: 'Ready for Shipment', color: 'green' },
      { value: 'consolidated', label: 'Consolidated', color: 'purple' },
      { value: 'shipped', label: 'Shipped', color: 'indigo' },
      { value: 'in_transit', label: 'In Transit', color: 'blue' },
      { value: 'customs_clearance', label: 'Customs Clearance', color: 'orange' },
      { value: 'delivered', label: 'Delivered', color: 'green' },
      { value: 'returned', label: 'Returned', color: 'red' },
      { value: 'lost', label: 'Lost', color: 'red' },
    ];
  }

  // Get packages summary for dashboard
  async getPackagesSummary(userId: string): Promise<{
    data: {
      total: number;
      pending: number;
      in_transit: number;
      delivered: number;
      overdue: number;
    };
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('status, free_storage_until')
        .eq('user_id', userId);

      if (error) {
        return {
          data: { total: 0, pending: 0, in_transit: 0, delivered: 0, overdue: 0 },
          error,
        };
      }

      const summary = {
        total: data.length,
        pending: data.filter(p => ['pending_arrival', 'arrived', 'inspected'].includes(p.status)).length,
        in_transit: data.filter(p => ['shipped', 'in_transit', 'customs_clearance'].includes(p.status)).length,
        delivered: data.filter(p => p.status === 'delivered').length,
        overdue: data.filter(p => this.isOverdue(p.free_storage_until)).length,
      };

      return { data: summary, error: null };
    } catch (err) {
      console.error('Get packages summary error:', err);
      return {
        data: { total: 0, pending: 0, in_transit: 0, delivered: 0, overdue: 0 },
        error: err as Error,
      };
    }
  }

  // Helper functions
  private calculateDaysInStorage(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Get incoming packages for review (arrived, pending_arrival, inspected)
  async getIncomingPackages(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<{ data: PackageWithDetails[]; error: Error | null; count?: number }> {
    try {
      const { data, error, count } = await supabase
        .from('packages')
        .select(`
          *,
          warehouses:warehouse_id (
            name,
            city,
            code
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .in('status', ['pending_arrival', 'arrived', 'inspected'])
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { data: [], error };
      }

      // Transform data to match expected interface
      const packagesWithDetails: PackageWithDetails[] = (data || []).map(pkg => ({
        ...pkg,
        warehouse_name: pkg.warehouses?.name || 'Unknown Warehouse',
        days_in_storage: pkg.free_storage_until 
          ? Math.ceil((new Date().getTime() - new Date(pkg.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0,
        is_overdue: this.isOverdue(pkg.free_storage_until)
      }));

      return { data: packagesWithDetails, error: null, count: count || 0 };
    } catch (err) {
      console.error('Get incoming packages error:', err);
      return { data: [], error: err as Error };
    }
  }

  private isOverdue(freeStorageUntil: string | null): boolean {
    if (!freeStorageUntil) return false;
    const freeUntil = new Date(freeStorageUntil);
    const now = new Date();
    return now > freeUntil;
  }
}

export const packageService = new PackageService();
export default packageService;
