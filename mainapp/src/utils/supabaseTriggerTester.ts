/**
 * Supabase Trigger Testing Utility
 * Provides methods to test and verify database triggers from the application
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

import { supabase } from '../lib/supabase';

/**
 * Interface for trigger test results
 */
interface TriggerTestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Interface for address assignment result
 */
interface AddressAssignmentResult {
  success: boolean;
  message?: string;
  user_id?: string;
  address_id?: string;
  warehouse_id?: string;
  error?: string;
  user_role?: string;
}

/**
 * Supabase Trigger Testing Service
 * Provides comprehensive testing utilities for database triggers
 */
export class SupabaseTriggerTester {
  
  /**
   * Test if the address assignment trigger function exists
   */
  static async testTriggerFunctionExists(): Promise<TriggerTestResult> {
    try {
      const { data, error } = await supabase.rpc('pg_get_function_result', {
        function_name: 'assign_default_address_to_user'
      });

      if (error) {
        return {
          success: false,
          message: 'Trigger function does not exist',
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Trigger function exists and is accessible',
        data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error checking trigger function',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test manual address assignment for a specific user
   */
  static async testManualAddressAssignment(userId: string): Promise<TriggerTestResult> {
    try {
      const { data, error } = await supabase.rpc('manually_assign_address_to_user', {
        target_user_id: userId
      });

      if (error) {
        return {
          success: false,
          message: 'Failed to execute manual address assignment',
          error: error.message
        };
      }

      const result = data as AddressAssignmentResult;
      
      return {
        success: result.success,
        message: result.success ? 
          `Address assigned successfully: ${result.message}` : 
          `Assignment failed: ${result.error}`,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error executing manual address assignment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check users without addresses
   */
  static async getUsersWithoutAddresses(): Promise<TriggerTestResult> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          created_at,
          addresses!left (
            id,
            type,
            is_default
          )
        `)
        .eq('role', 'customer')
        .is('addresses.id', null);

      if (error) {
        return {
          success: false,
          message: 'Failed to query users without addresses',
          error: error.message
        };
      }

      return {
        success: true,
        message: `Found ${data.length} customers without addresses`,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error querying users without addresses',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check warehouse availability and occupancy
   */
  static async checkWarehouseAvailability(): Promise<TriggerTestResult> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('status', 'active')
        .order('current_occupancy', { ascending: true });

      if (error) {
        return {
          success: false,
          message: 'Failed to query warehouse availability',
          error: error.message
        };
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          message: 'No active warehouses available for assignment',
          data: []
        };
      }

      return {
        success: true,
        message: `Found ${data.length} active warehouses`,
        data: data.map(w => ({
          id: w.id,
          address: w.address,
          city: w.city,
          country: w.country,
          capacity: w.capacity,
          current_occupancy: w.current_occupancy,
          occupancy_percentage: Math.round((w.current_occupancy / w.capacity) * 100)
        }))
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error checking warehouse availability',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Run comprehensive trigger system test
   */
  static async runComprehensiveTest(): Promise<{
    overall_success: boolean;
    tests: Record<string, TriggerTestResult>;
    summary: string;
  }> {
    const tests: Record<string, TriggerTestResult> = {};
    
    // Test 1: Check trigger function exists
    tests.trigger_function = await this.testTriggerFunctionExists();
    
    // Test 2: Check warehouse availability
    tests.warehouse_availability = await this.checkWarehouseAvailability();
    
    // Test 3: Check users without addresses
    tests.users_without_addresses = await this.getUsersWithoutAddresses();
    
    // Calculate overall success
    const overall_success = Object.values(tests).every(test => test.success);
    
    // Generate summary
    let summary = '=== TRIGGER SYSTEM TEST RESULTS ===\n';
    summary += `Overall Status: ${overall_success ? 'PASSED' : 'FAILED'}\n\n`;
    
    Object.entries(tests).forEach(([testName, result]) => {
      summary += `${testName.toUpperCase()}: ${result.success ? 'PASSED' : 'FAILED'}\n`;
      summary += `  Message: ${result.message}\n`;
      if (result.error) {
        summary += `  Error: ${result.error}\n`;
      }
      summary += '\n';
    });
    
    return {
      overall_success,
      tests,
      summary
    };
  }

  /**
   * Fix all users without addresses
   */
  static async fixAllUsersWithoutAddresses(): Promise<TriggerTestResult> {
    try {
      // First, get users without addresses
      const usersResult = await this.getUsersWithoutAddresses();
      
      if (!usersResult.success || !usersResult.data) {
        return {
          success: false,
          message: 'Failed to get users without addresses',
          error: usersResult.error
        };
      }

      const usersToFix = usersResult.data;
      const results = [];
      let successCount = 0;
      let failureCount = 0;

      // Process each user
      for (const user of usersToFix) {
        const assignmentResult = await this.testManualAddressAssignment(user.id);
        results.push({
          user: `${user.first_name} ${user.last_name} (${user.email})`,
          result: assignmentResult
        });

        if (assignmentResult.success) {
          successCount++;
        } else {
          failureCount++;
        }
      }

      return {
        success: successCount > 0,
        message: `Processed ${usersToFix.length} users: ${successCount} successful, ${failureCount} failed`,
        data: {
          total_processed: usersToFix.length,
          successful: successCount,
          failed: failureCount,
          details: results
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error during bulk address assignment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * Export default instance for easy usage
 */
export const triggerTester = SupabaseTriggerTester;
