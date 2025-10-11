/**
 * Warehouse Debugger Component
 * 
 * Temporary debugging component to test warehouse data retrieval
 * and identify missing country field issues.
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import { addressService } from '../services/addressService';

/**
 * Interface for debug results
 */
interface DebugResults {
  report: string;
  data: any;
  error: Error | null;
}

/**
 * Warehouse Debugger Component
 * Provides UI to test and debug warehouse data retrieval
 */
const WarehouseDebugger: React.FC = () => {
  // Get current user from auth context
  const { user } = useAuth();
  
  // Component state for debug results and loading
  const [debugResults, setDebugResults] = useState<DebugResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Handle debug button click
   * Runs comprehensive warehouse data debugging
   */
  const handleDebugClick = async () => {
    if (!user?.id) {
      console.error('No user ID available for debugging');
      return;
    }

    setIsLoading(true);
    setDebugResults(null);

    try {
      // Run the debug utility
      const results = await addressService.debugWarehouseData(user.id);
      setDebugResults(results);
      setIsExpanded(true);
    } catch (error) {
      console.error('Debug failed:', error);
      setDebugResults({
        report: `Debug failed: ${error}`,
        data: null,
        error: error as Error
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle test address retrieval
   * Tests the regular getUserAddress method
   */
  const handleTestAddressRetrieval = async () => {
    if (!user?.id) {
      console.error('No user ID available for testing');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🧪 Testing regular address retrieval...');
      
      // Test the regular getUserAddress method
      const result = await addressService.getUserAddress(user.id);
      
      console.log('📋 Address retrieval result:', result);
      
      if (result.data) {
        console.log('✅ Address data retrieved successfully');
        console.log('🏢 Warehouse data:', result.data.warehouses);
        
        if (result.data.warehouses?.country) {
          console.log('🌍 Country field found:', result.data.warehouses.country);
        } else {
          console.warn('⚠️ Country field is missing or null');
        }
      } else {
        console.log('ℹ️ No address data found for user');
      }
      
      if (result.error) {
        console.error('❌ Error in address retrieval:', result.error);
      }
    } catch (error) {
      console.error('💥 Exception in test:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle creating a test address for the user
   * Uses the warehouse ID from the debug data
   */
  const handleCreateTestAddress = async () => {
    if (!user?.id) {
      console.error('No user ID available for creating address');
      return;
    }

    // Get warehouse ID from debug results or use a default
    const warehouseId = debugResults?.data?.tableStructure?.sampleData?.id || 
                       'f534d328-18cc-4546-b769-6459190f6c16'; // Fallback to Accra warehouse

    setIsLoading(true);

    try {
      console.log('🏗️ Creating test address with warehouse ID:', warehouseId);
      
      const result = await addressService.createTestAddress(user.id, warehouseId);
      
      if (result.data) {
        console.log('✅ Test address created successfully:', result.data);
        alert('✅ Test address created! Try refreshing the page to see the updated address.');
      } else if (result.error) {
        console.error('❌ Error creating test address:', result.error);
        alert(`❌ Failed to create test address: ${result.error.message}`);
      }
    } catch (error) {
      console.error('💥 Exception creating test address:', error);
      alert(`💥 Exception: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-yellow-800">
          🔧 Warehouse Data Debugger (Development Only)
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-yellow-600 hover:text-yellow-800 text-sm"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      <p className="text-yellow-700 text-sm mb-4">
        This component helps debug warehouse data retrieval issues, particularly missing country fields.
      </p>

      {isExpanded && (
        <div className="space-y-4">
          {/* Debug Controls */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleDebugClick}
              disabled={isLoading || !user?.id}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {isLoading ? '🔄 Running Debug...' : '🔍 Run Comprehensive Debug'}
            </button>
            
            <button
              onClick={handleTestAddressRetrieval}
              disabled={isLoading || !user?.id}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {isLoading ? '🔄 Testing...' : '🧪 Test Address Retrieval'}
            </button>

            <button
              onClick={handleCreateTestAddress}
              disabled={isLoading || !user?.id}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {isLoading ? '🔄 Creating...' : '🏗️ Create Test Address'}
            </button>
          </div>

          {/* User Info */}
          <div className="bg-white rounded p-3 border">
            <h4 className="font-medium text-gray-900 mb-2">Current User Info:</h4>
            <p className="text-sm text-gray-600">
              <strong>User ID:</strong> {user?.id || 'Not available'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {user?.email || 'Not available'}
            </p>
          </div>

          {/* Debug Results */}
          {debugResults && (
            <div className="bg-white rounded p-3 border">
              <h4 className="font-medium text-gray-900 mb-2">Debug Results:</h4>
              
              {debugResults.error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                  <p className="text-red-800 font-medium">Error:</p>
                  <p className="text-red-700 text-sm">{debugResults.error.message}</p>
                </div>
              )}
              
              <div className="bg-gray-50 rounded p-3">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                  {debugResults.report}
                </pre>
              </div>
              
              {debugResults.data && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    View Raw Debug Data
                  </summary>
                  <div className="mt-2 bg-gray-50 rounded p-3">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(debugResults.data, null, 2)}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click "Run Comprehensive Debug" to analyze warehouse data structure</li>
              <li>• Click "Test Address Retrieval" to test the regular address service method</li>
              <li>• Click "Create Test Address" if no address exists for the user</li>
              <li>• Check the browser console for detailed logging output</li>
              <li>• Look for country field presence in the warehouse data</li>
              <li>• Remove this component once debugging is complete</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseDebugger;
