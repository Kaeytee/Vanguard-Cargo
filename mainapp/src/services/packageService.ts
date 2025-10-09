import { supabase } from '../lib/supabase';
import { PackageStatus, PackageStatusUtils, type PackageStatusInfo } from '../types';
import { emailNotificationService } from './emailNotificationService';

// Define interface to match the actual 'packages' table schema
export interface DbPackage {
  id: string;
  package_id: string;
  tracking_number: string;
  user_id: string;
  status: string;
  description: string | null;
  weight: number | null; // DECIMAL field in database
  declared_value: number | null;
  store_name: string | null;
  vendor_name: string | null;
  notes: string | null;
  scanned_by: string | null;
  intake_date: string | null;
  created_at: string;
  updated_at: string | null;
  // New fields for authentication and tracking
  delivery_auth_code: string | null; // 6-digit pickup authentication code
  qr_code_data: string | null; // QR code data for warehouse scanning
  barcode_data: string | null; // Barcode data for tracking
  ready_for_pickup: boolean | null; // Flag for pickup readiness
  // No warehouse join needed - hardcoded in frontend
}

// This is the shape the UI expects, matching the actual database schema
export interface Package extends DbPackage {
  // Additional computed fields for UI
  sender_name?: string | null; // Map from store_name for compatibility
  sender_email?: string | null; // Not in database
  sender_phone?: string | null; // Not in database
  weight_lbs: number | null; // Converted from weight
  length_in: number | null; // Not in database
  width_in: number | null; // Not in database
  height_in: number | null; // Not in database
  billable_weight_lbs: number | null; // Not in database
  storage_fee_accumulated: number | null; // Not in database
  free_storage_until: string | null; // Not in database
  warehouse_id?: string | null; // Not in database - hardcoded
}

export type NewPackage = Partial<Omit<Package, 'id' | 'created_at' | 'updated_at'>>;

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

      // Transform DB data to the shape the UI expects
      const packagesWithDetails: PackageWithDetails[] = (data || []).map(dbPkg => 
        this.mapDbPackageToUiPackage(dbPkg as DbPackage)
      );

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

      const packageWithDetails: PackageWithDetails = this.mapDbPackageToUiPackage(data as DbPackage);

      return { data: packageWithDetails, error: null };
    } catch (err) {
      console.error('Get package by tracking error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Create new package (admin/staff only)
  async createPackage(packageData: NewPackage): Promise<{ data: PackageWithDetails | null; error: Error | null }> {
    try {
      const dbPayload = this.mapUiPackageToDbPackage(packageData);
      const { data, error } = await supabase
        .from('packages')
        .insert(dbPayload)
        .select('*, warehouses:warehouse_id(name, city, code)')
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: this.mapDbPackageToUiPackage(data as DbPackage), error: null };
    } catch (err) {
      console.error('Create package error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Update package (admin/staff only)
  async updatePackage(
    packageId: string, 
    updates: Partial<Package>
  ): Promise<{ data: PackageWithDetails | null; error: Error | null }> {
    try {
      const dbPayload = this.mapUiPackageToDbPackage(updates, true);
      const { data, error } = await supabase
        .from('packages')
        .update(dbPayload)
        .eq('id', packageId)
        .select('*, warehouses:warehouse_id(name, city, code)')
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: this.mapDbPackageToUiPackage(data as DbPackage), error: null };
    } catch (err) {
      console.error('Update package error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Update package status (admin/staff only) with comprehensive validation
  async updatePackageStatus(
    packageId: string,
    newStatus: string,
    _notes?: string, // Prefixed with underscore to indicate intentionally unused
    userId?: string // For audit trail
  ): Promise<{ data: Package | null; error: Error | null }> {
    try {
      // First, get the current package to validate the transition
      const { data: currentPackage, error: fetchError } = await supabase
        .from('packages')
        .select('status, user_id')
        .eq('id', packageId)
        .single();

      if (fetchError) {
        return { data: null, error: fetchError };
      }

      if (!currentPackage) {
        return { data: null, error: new Error('Package not found') };
      }

      // Validate the status transition using our business rules
      const isValidTransition = PackageStatusUtils.isValidTransition(
        currentPackage.status as any,
        newStatus as any
      );

      if (!isValidTransition) {
        const rule = PackageStatusUtils.getTransitionRule(
          currentPackage.status as any,
          newStatus as any
        );
        const validNextStatuses = PackageStatusUtils.getValidNextStatuses(currentPackage.status as any);
        
        return {
          data: null,
          error: new Error(
            `Invalid status transition from '${currentPackage.status}' to '${newStatus}'. ` +
            `Valid next statuses are: ${validNextStatuses.join(', ')}. ` +
            `${rule ? `Rule: ${rule}` : ''}`
          )
        };
      }

      // Get the business rule for this transition for logging
      const transitionRule = PackageStatusUtils.getTransitionRule(
        currentPackage.status as any,
        newStatus as any
      );

      // Update the package status
      const { data, error } = await supabase
        .from('packages')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', packageId)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      // Log the status change for audit trail (optional - could be implemented later)
      if (userId && transitionRule) {
        console.log(`Package ${packageId} status changed from ${currentPackage.status} to ${newStatus} by user ${userId}. Rule: ${transitionRule}`);
        // TODO: Implement audit logging to database
      }

      // Send email notification for status change
      try {
        const emailResult = await emailNotificationService.sendPackageStatusEmail({
          packageId: packageId,
          trackingNumber: data.tracking_number,
          storeName: data.store_name || data.vendor_name || 'Unknown Store',
          oldStatus: currentPackage.status,
          newStatus: newStatus,
          description: data.description || undefined,
          userId: currentPackage.user_id
        });

        if (!emailResult.success) {
          console.error(`Failed to send email notification for package ${packageId}:`, emailResult.error);
          // Don't fail the status update if email fails
        } else {
          console.log(`Email notification sent successfully for package ${packageId}, messageId: ${emailResult.messageId}`);
        }
      } catch (emailError) {
        console.error(`Error sending email notification for package ${packageId}:`, emailError);
        // Don't fail the status update if email fails
      }

      // Send in-app notification if status change affects customer
      if (PackageStatusUtils.requiresCustomerAction(newStatus as any)) {
        console.log(`Customer notification required for package ${packageId} - status: ${newStatus}`);
      }

      return { data, error: null };
    } catch (err) {
      console.error('Update package status error:', err);
      return { data: null, error: err as Error };
    }
  }

  // Validate package status transition (utility method)
  validateStatusTransition(
    currentStatus: string,
    newStatus: string
  ): { isValid: boolean; error?: string; rule?: string } {
    const isValid = PackageStatusUtils.isValidTransition(currentStatus as any, newStatus as any);
    
    if (!isValid) {
      const validNextStatuses = PackageStatusUtils.getValidNextStatuses(currentStatus as any);
      return {
        isValid: false,
        error: `Invalid transition from '${currentStatus}' to '${newStatus}'. Valid options: ${validNextStatuses.join(', ')}`
      };
    }

    const rule = PackageStatusUtils.getTransitionRule(currentStatus as any, newStatus as any);
    return {
      isValid: true,
      rule: rule || undefined
    };
  }

  // Get packages requiring warehouse action
  async getPackagesRequiringWarehouseAction(
    limit = 50,
    offset = 0
  ): Promise<{ data: PackageWithDetails[]; error: Error | null; count?: number }> {
    try {
      // Get all statuses that require warehouse action
      const warehouseStatuses = PackageStatusUtils.getAllStatuses()
        .filter(status => PackageStatusUtils.requiresWarehouseAction(status.value))
        .map(status => status.value);

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
        .in('status', warehouseStatuses)
        .order('created_at', { ascending: true }) // Oldest first for FIFO processing
        .range(offset, offset + limit - 1);

      if (error) {
        return { data: [], error };
      }

      const packagesWithDetails: PackageWithDetails[] = (data || []).map(dbPkg => 
        this.mapDbPackageToUiPackage(dbPkg as DbPackage)
      );

      return { data: packagesWithDetails, error: null, count: count || 0 };
    } catch (err) {
      console.error('Get packages requiring warehouse action error:', err);
      return { data: [], error: err as Error };
    }
  }

  // Get packages requiring customer action
  async getPackagesRequiringCustomerAction(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<{ data: PackageWithDetails[]; error: Error | null; count?: number }> {
    try {
      // Get all statuses that require customer action
      const customerStatuses = PackageStatusUtils.getAllStatuses()
        .filter(status => PackageStatusUtils.requiresCustomerAction(status.value))
        .map(status => status.value);

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
        .in('status', customerStatuses)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        return { data: [], error };
      }

      const packagesWithDetails: PackageWithDetails[] = (data || []).map(dbPkg => 
        this.mapDbPackageToUiPackage(dbPkg as DbPackage)
      );

      return { data: packagesWithDetails, error: null, count: count || 0 };
    } catch (err) {
      console.error('Get packages requiring customer action error:', err);
      return { data: [], error: err as Error };
    }
  }

  // Get package status options using centralized types
  getPackageStatuses(): PackageStatusInfo[] {
    return PackageStatusUtils.getAllStatuses();
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

      const pendingStatuses = [PackageStatus.PENDING_ARRIVAL, PackageStatus.ARRIVED, PackageStatus.INSPECTED];
      const transitStatuses = [PackageStatus.SHIPPED, PackageStatus.IN_TRANSIT, PackageStatus.CUSTOMS_CLEARANCE];
      
      const summary = {
        total: data.length,
        pending: data.filter(p => pendingStatuses.includes(p.status as any)).length,
        in_transit: data.filter(p => transitStatuses.includes(p.status as any)).length,
        delivered: data.filter(p => p.status === PackageStatus.DELIVERED).length,
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

  // --- Data Transformation --- 

  private mapUiPackageToDbPackage(uiPackage: Partial<Package>, isUpdate = false): Record<string, any> {
    const LBS_TO_KG = 0.453592;
    const dbPayload: Record<string, any> = {};

    // Direct mappings
    if (uiPackage.user_id) dbPayload.user_id = uiPackage.user_id;
    if (uiPackage.tracking_number) dbPayload.tracking_number = uiPackage.tracking_number;
    if (uiPackage.sender_name) dbPayload.sender_name = uiPackage.sender_name;
    if (uiPackage.declared_value) dbPayload.declared_value = uiPackage.declared_value;
    if (uiPackage.status) dbPayload.status = uiPackage.status;
    if (uiPackage.warehouse_id) dbPayload.warehouse_id = uiPackage.warehouse_id;

    // Convert weight from lbs to kg
    if (uiPackage.weight_lbs) {
      dbPayload.weight = uiPackage.weight_lbs * LBS_TO_KG;
    }

    // Consolidate dimensions into JSONB object
    if (uiPackage.length_in || uiPackage.width_in || uiPackage.height_in) {
      dbPayload.dimensions = {
        length: uiPackage.length_in,
        width: uiPackage.width_in,
        height: uiPackage.height_in,
      };
    }

    if (isUpdate) {
      dbPayload.updated_at = new Date().toISOString();
    }

    return dbPayload;
  }

  private mapDbPackageToUiPackage(dbPackage: DbPackage): PackageWithDetails {
    const LBS_CONVERSION = 2.20462; // 1 kg = 2.20462 lbs
    const uiPackage: Package = {
      ...dbPackage,
      // Convert weight to lbs (assuming database weight is in kg)
      weight_lbs: dbPackage.weight ? dbPackage.weight * LBS_CONVERSION : null,
      // Map store_name to sender_name for UI compatibility
      sender_name: dbPackage.store_name,
      // Set defaults for fields not in database schema
      sender_email: null,
      sender_phone: null,
      length_in: null,
      width_in: null,
      height_in: null,
      billable_weight_lbs: null, 
      storage_fee_accumulated: null,
      free_storage_until: null,
      warehouse_id: null, // Hardcoded in frontend
    };

    return {
      ...uiPackage,
      warehouse_name: 'ALX-E2 Warehouse', // Hardcoded warehouse name
      days_in_storage: this.calculateDaysInStorage(uiPackage.created_at),
      is_overdue: this.isOverdue(uiPackage.free_storage_until),
    };
  }

  // Helper functions
  private calculateDaysInStorage(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Get incoming packages for review - all packages for the user regardless of status
  async getIncomingPackages(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<{ data: PackageWithDetails[]; error: Error | null; count?: number }> {
    try {
      const { data, error, count } = await supabase
        .from('packages')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { data: [], error };
      }

      // Transform data to match expected interface using the existing mapping function
      const packagesWithDetails: PackageWithDetails[] = (data || []).map(dbPkg => 
        this.mapDbPackageToUiPackage(dbPkg as DbPackage)
      );

      return { data: packagesWithDetails, error: null, count: count || 0 };
    } catch (err) {
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
