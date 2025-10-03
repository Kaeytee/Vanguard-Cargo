import { supabase } from '../lib/supabase';

/**
 * Package Auto-Move Service
 * 
 * Handles automatic movement of packages from 'processing' status to 'shipped' status
 * after they have been in processing for 112 hours.
 * 
 * This service should be called periodically (e.g., via cron job or scheduled task)
 * to check for packages that need to be moved to shipment history.
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 * @created 2025-10-03
 */

export interface PackageAutoMoveResult {
  success: boolean;
  movedPackages: number;
  errors: string[];
}

export class PackageAutoMoveService {
  // 112 hours in milliseconds
  private static readonly PROCESSING_TIMEOUT_MS = 112 * 60 * 60 * 1000;

  /**
   * Check for packages that have been in 'processing' status for more than 112 hours
   * and automatically move them to 'shipped' status
   */
  static async moveExpiredPackages(): Promise<PackageAutoMoveResult> {
    const result: PackageAutoMoveResult = {
      success: true,
      movedPackages: 0,
      errors: []
    };

    try {
      // Calculate the cutoff time (112 hours ago)
      const cutoffTime = new Date(Date.now() - this.PROCESSING_TIMEOUT_MS);
      
      console.log(`[PackageAutoMove] Checking for packages processed before: ${cutoffTime.toISOString()}`);

      // Find packages that have been in processing for more than 112 hours
      const { data: expiredPackages, error: fetchError } = await supabase
        .from('packages')
        .select('id, package_id, tracking_number, processed_at, user_id')
        .eq('status', 'processing')
        .not('processed_at', 'is', null)
        .lt('processed_at', cutoffTime.toISOString());

      if (fetchError) {
        console.error('[PackageAutoMove] Error fetching expired packages:', fetchError);
        result.success = false;
        result.errors.push(`Failed to fetch expired packages: ${fetchError.message}`);
        return result;
      }

      if (!expiredPackages || expiredPackages.length === 0) {
        console.log('[PackageAutoMove] No expired packages found');
        return result;
      }

      console.log(`[PackageAutoMove] Found ${expiredPackages.length} packages to move`);

      // Move each expired package to 'shipped' status
      for (const pkg of expiredPackages) {
        try {
          const { error: updateError } = await supabase
            .from('packages')
            .update({
              status: 'shipped',
              shipped_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', pkg.id);

          if (updateError) {
            console.error(`[PackageAutoMove] Error updating package ${pkg.package_id}:`, updateError);
            result.errors.push(`Failed to update package ${pkg.package_id}: ${updateError.message}`);
            result.success = false;
          } else {
            console.log(`[PackageAutoMove] Successfully moved package ${pkg.package_id} to shipped status`);
            result.movedPackages++;
          }
        } catch (error) {
          console.error(`[PackageAutoMove] Unexpected error updating package ${pkg.package_id}:`, error);
          result.errors.push(`Unexpected error updating package ${pkg.package_id}: ${error}`);
          result.success = false;
        }
      }

      console.log(`[PackageAutoMove] Completed. Moved ${result.movedPackages} packages, ${result.errors.length} errors`);
      
    } catch (error) {
      console.error('[PackageAutoMove] Unexpected error in moveExpiredPackages:', error);
      result.success = false;
      result.errors.push(`Unexpected error: ${error}`);
    }

    return result;
  }

  /**
   * Get packages that are currently in processing and their remaining time
   * Useful for monitoring and debugging
   */
  static async getProcessingPackagesStatus(): Promise<{
    packages: Array<{
      id: string;
      package_id: string;
      processed_at: string;
      hoursInProcessing: number;
      hoursRemaining: number;
      willExpireAt: string;
    }>;
    error?: string;
  }> {
    try {
      const { data: processingPackages, error } = await supabase
        .from('packages')
        .select('id, package_id, processed_at')
        .eq('status', 'processing')
        .not('processed_at', 'is', null);

      if (error) {
        return { packages: [], error: error.message };
      }

      const now = Date.now();
      const packages = processingPackages.map(pkg => {
        const processedAt = new Date(pkg.processed_at).getTime();
        const hoursInProcessing = (now - processedAt) / (1000 * 60 * 60);
        const hoursRemaining = 112 - hoursInProcessing;
        const willExpireAt = new Date(processedAt + this.PROCESSING_TIMEOUT_MS);

        return {
          id: pkg.id,
          package_id: pkg.package_id,
          processed_at: pkg.processed_at,
          hoursInProcessing: Math.round(hoursInProcessing * 100) / 100,
          hoursRemaining: Math.round(hoursRemaining * 100) / 100,
          willExpireAt: willExpireAt.toISOString()
        };
      });

      return { packages };
    } catch (error) {
      return { packages: [], error: `Unexpected error: ${error}` };
    }
  }

  /**
   * Manually move a specific package from processing to shipped
   * Useful for testing or manual intervention
   */
  static async movePackageToShipped(packageId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('packages')
        .update({
          status: 'shipped',
          shipped_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', packageId)
        .eq('status', 'processing'); // Only move if currently processing

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: `Unexpected error: ${error}` };
    }
  }
}

export default PackageAutoMoveService;
