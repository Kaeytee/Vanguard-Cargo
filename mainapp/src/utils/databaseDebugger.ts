/**
 * Database Schema Debugger Utility
 * 
 * This utility provides debugging functions to inspect database schemas
 * and verify data integrity for troubleshooting missing fields.
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

import { supabase } from '../lib/supabase';

/**
 * Interface for database column information
 */
interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

/**
 * Interface for table schema information
 */
interface TableSchema {
  tableName: string;
  columns: ColumnInfo[];
}

/**
 * Class for debugging database schemas and data
 */
export class DatabaseDebugger {
  /**
   * Get schema information for a specific table
   * @param tableName - Name of the table to inspect
   * @returns Promise with table schema information
   */
  static async getTableSchema(tableName: string): Promise<{
    data: TableSchema | null;
    error: Error | null;
  }> {
    try {
      // Query information_schema to get column details
      const { data, error } = await supabase
        .rpc('get_table_schema', { table_name: tableName });

      if (error) {
        console.error(`Error fetching schema for table ${tableName}:`, error);
        return { data: null, error };
      }

      return {
        data: {
          tableName,
          columns: data || []
        },
        error: null
      };
    } catch (err) {
      console.error(`Exception while fetching schema for ${tableName}:`, err);
      return { data: null, error: err as Error };
    }
  }

  /**
   * Debug warehouse data retrieval
   * @param warehouseId - ID of the warehouse to debug
   * @returns Promise with detailed warehouse information
   */
  static async debugWarehouseData(warehouseId: string): Promise<{
    data: any;
    schema: ColumnInfo[] | null;
    error: Error | null;
  }> {
    try {
      console.log(`🔍 Debugging warehouse data for ID: ${warehouseId}`);

      // Step 1: Get the actual data from the warehouse
      const { data: warehouseData, error: warehouseError } = await supabase
        .from('warehouses')
        .select('*')
        .eq('id', warehouseId)
        .single();

      if (warehouseError) {
        console.error('❌ Error fetching warehouse data:', warehouseError);
        return { data: null, schema: null, error: warehouseError };
      }

      console.log('✅ Warehouse data retrieved:', warehouseData);

      // Step 2: Check which fields are present
      const presentFields = Object.keys(warehouseData || {});
      console.log('📋 Present fields:', presentFields);

      // Step 3: Check for missing expected fields
      const expectedFields = [
        'id', 'name', 'code', 'street_address', 'city', 
        'state', 'postal_code', 'country', 'phone', 
        'created_at', 'updated_at'
      ];
      
      const missingFields = expectedFields.filter(field => !presentFields.includes(field));
      if (missingFields.length > 0) {
        console.warn('⚠️ Missing expected fields:', missingFields);
      } else {
        console.log('✅ All expected fields are present');
      }

      // Step 4: Check for null values in critical fields
      const criticalFields = ['country', 'city', 'state'];
      const nullFields = criticalFields.filter(field => 
        warehouseData && warehouseData[field] === null
      );
      
      if (nullFields.length > 0) {
        console.warn('⚠️ Critical fields with null values:', nullFields);
      }

      return {
        data: warehouseData,
        schema: null, // Will be populated if we can get schema info
        error: null
      };
    } catch (err) {
      console.error('💥 Exception in debugWarehouseData:', err);
      return { data: null, schema: null, error: err as Error };
    }
  }

  /**
   * Debug address data retrieval for a user
   * @param userId - ID of the user to debug
   * @returns Promise with detailed address and warehouse information
   */
  static async debugUserAddressData(userId: string): Promise<{
    addressData: any;
    warehouseData: any;
    combinedData: any;
    error: Error | null;
  }> {
    try {
      console.log(`🔍 Debugging address data for user: ${userId}`);

      // Step 1: Get address data
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .in('type', ['shipping', 'both'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (addressError) {
        console.error('❌ Error fetching address:', addressError);
        return {
          addressData: null,
          warehouseData: null,
          combinedData: null,
          error: addressError
        };
      }

      console.log('✅ Address data:', addressData);

      let warehouseData = null;
      let combinedData = null;

      // Step 2: If address has warehouse_id, get warehouse data
      if (addressData?.warehouse_id) {
        console.log(`🏢 Fetching warehouse data for ID: ${addressData.warehouse_id}`);
        
        const warehouseDebugResult = await this.debugWarehouseData(addressData.warehouse_id);
        warehouseData = warehouseDebugResult.data;

        if (warehouseData) {
          // Step 3: Combine data as done in addressService
          combinedData = {
            ...addressData,
            warehouses: warehouseData
          };
          
          console.log('🔗 Combined address + warehouse data:', combinedData);
          
          // Step 4: Specifically check for country field
          if (warehouseData.country) {
            console.log('✅ Warehouse country field found:', warehouseData.country);
          } else {
            console.warn('⚠️ Warehouse country field is missing or null');
          }
        }
      } else {
        console.log('ℹ️ No warehouse_id found in address data');
      }

      return {
        addressData,
        warehouseData,
        combinedData,
        error: null
      };
    } catch (err) {
      console.error('💥 Exception in debugUserAddressData:', err);
      return {
        addressData: null,
        warehouseData: null,
        combinedData: null,
        error: err as Error
      };
    }
  }

  /**
   * Verify warehouse table structure by querying a sample record
   * @returns Promise with warehouse table analysis
   */
  static async verifyWarehouseTableStructure(): Promise<{
    sampleData: any;
    fieldAnalysis: Record<string, any>;
    error: Error | null;
  }> {
    try {
      console.log('🔍 Verifying warehouse table structure...');

      // Get a sample warehouse record
      const { data: sampleWarehouse, error } = await supabase
        .from('warehouses')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('❌ Error fetching sample warehouse:', error);
        return { sampleData: null, fieldAnalysis: {}, error };
      }

      console.log('✅ Sample warehouse record:', sampleWarehouse);

      // Analyze each field
      const fieldAnalysis: Record<string, any> = {};
      
      if (sampleWarehouse) {
        Object.entries(sampleWarehouse).forEach(([key, value]) => {
          fieldAnalysis[key] = {
            type: typeof value,
            value: value,
            isNull: value === null,
            isEmpty: value === '' || value === undefined
          };
        });
      }

      console.log('📊 Field analysis:', fieldAnalysis);

      return {
        sampleData: sampleWarehouse,
        fieldAnalysis,
        error: null
      };
    } catch (err) {
      console.error('💥 Exception in verifyWarehouseTableStructure:', err);
      return { sampleData: null, fieldAnalysis: {}, error: err as Error };
    }
  }

  /**
   * Run comprehensive database debugging for address/warehouse issues
   * @param userId - User ID to debug
   * @returns Promise with complete debugging report
   */
  static async runComprehensiveDebug(userId: string): Promise<{
    report: string;
    data: any;
    error: Error | null;
  }> {
    try {
      console.log('🚀 Starting comprehensive database debug...');
      
      const report: string[] = [];
      const debugData: any = {};

      // Step 1: Verify warehouse table structure
      report.push('=== WAREHOUSE TABLE STRUCTURE ===');
      const tableStructure = await this.verifyWarehouseTableStructure();
      debugData.tableStructure = tableStructure;
      
      if (tableStructure.error) {
        report.push(`❌ Error verifying table structure: ${tableStructure.error.message}`);
      } else {
        report.push('✅ Warehouse table structure verified');
        report.push(`📊 Sample fields: ${Object.keys(tableStructure.fieldAnalysis).join(', ')}`);
      }

      // Step 2: Debug user address data
      report.push('\n=== USER ADDRESS DATA ===');
      const userAddressDebug = await this.debugUserAddressData(userId);
      debugData.userAddressDebug = userAddressDebug;

      if (userAddressDebug.error) {
        report.push(`❌ Error debugging user address: ${userAddressDebug.error.message}`);
      } else {
        report.push('✅ User address data retrieved');
        
        if (userAddressDebug.warehouseData) {
          const hasCountry = userAddressDebug.warehouseData.country !== null && 
                           userAddressDebug.warehouseData.country !== undefined;
          report.push(`🏢 Warehouse country field: ${hasCountry ? '✅ Present' : '❌ Missing'}`);
          
          if (hasCountry) {
            report.push(`🌍 Country value: ${userAddressDebug.warehouseData.country}`);
          }
        } else {
          report.push('ℹ️ No warehouse data found for user');
        }
      }

      const fullReport = report.join('\n');
      console.log('📋 Debug Report:\n', fullReport);

      return {
        report: fullReport,
        data: debugData,
        error: null
      };
    } catch (err) {
      console.error('💥 Exception in runComprehensiveDebug:', err);
      return {
        report: `Error running debug: ${err}`,
        data: null,
        error: err as Error
      };
    }
  }
}

export default DatabaseDebugger;
