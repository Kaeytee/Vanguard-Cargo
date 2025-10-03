import { PackageAutoMoveService } from '../services/packageAutoMoveService';

/**
 * Utility script to run the package auto-move service
 * 
 * This can be called:
 * 1. Manually for testing
 * 2. From a cron job or scheduled task
 * 3. From an API endpoint
 * 4. From a background worker
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 * @created 2025-10-03
 */

/**
 * Run the package auto-move process
 * Moves packages from 'processing' to 'shipped' after 112 hours
 */
export async function runPackageAutoMove(): Promise<void> {
  console.log('[AutoMove] Starting package auto-move process...');
  
  try {
    const result = await PackageAutoMoveService.moveExpiredPackages();
    
    if (result.success) {
      console.log(`[AutoMove] Successfully completed. Moved ${result.movedPackages} packages.`);
      
      if (result.errors.length > 0) {
        console.warn(`[AutoMove] Completed with ${result.errors.length} errors:`);
        result.errors.forEach(error => console.warn(`  - ${error}`));
      }
    } else {
      console.error('[AutoMove] Process failed with errors:');
      result.errors.forEach(error => console.error(`  - ${error}`));
    }
    
    // Log summary
    console.log(`[AutoMove] Summary: ${result.movedPackages} packages moved, ${result.errors.length} errors`);
    
  } catch (error) {
    console.error('[AutoMove] Unexpected error running auto-move process:', error);
    throw error;
  }
}

/**
 * Get status of packages currently in processing
 * Useful for monitoring and debugging
 */
export async function getProcessingStatus(): Promise<void> {
  console.log('[AutoMove] Checking processing packages status...');
  
  try {
    const result = await PackageAutoMoveService.getProcessingPackagesStatus();
    
    if (result.error) {
      console.error('[AutoMove] Error getting processing status:', result.error);
      return;
    }
    
    if (result.packages.length === 0) {
      console.log('[AutoMove] No packages currently in processing');
      return;
    }
    
    console.log(`[AutoMove] Found ${result.packages.length} packages in processing:`);
    result.packages.forEach(pkg => {
      console.log(`  - ${pkg.package_id}: ${pkg.hoursInProcessing}h processed, ${pkg.hoursRemaining}h remaining (expires: ${pkg.willExpireAt})`);
    });
    
  } catch (error) {
    console.error('[AutoMove] Unexpected error getting processing status:', error);
    throw error;
  }
}

/**
 * Main function for running from command line or scheduled task
 */
export async function main(): Promise<void> {
  console.log('[AutoMove] Package Auto-Move Utility Started');
  console.log('[AutoMove] Current time:', new Date().toISOString());
  
  try {
    // First, show current status
    await getProcessingStatus();
    
    // Then run the auto-move process
    await runPackageAutoMove();
    
    console.log('[AutoMove] Package Auto-Move Utility Completed Successfully');
    
  } catch (error) {
    console.error('[AutoMove] Package Auto-Move Utility Failed:', error);
    process.exit(1);
  }
}

// If this file is run directly (not imported), execute the main function
if (require.main === module) {
  main();
}
