/**
 * Trigger Testing Panel Component
 * React component for testing and managing database triggers
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle, Users, Database, Settings } from 'lucide-react';
import { triggerTester } from '../utils/supabaseTriggerTester';

/**
 * Interface for test results display
 */
interface TestResultDisplay {
  name: string;
  status: 'running' | 'success' | 'error' | 'pending';
  message: string;
  data?: any;
  error?: string;
}

/**
 * Trigger Testing Panel Component
 * Provides UI for testing database triggers and fixing user address assignments
 */
const TriggerTestingPanel: React.FC = () => {
  // Component state management
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResultDisplay[]>([]);
  const [comprehensiveResults, setComprehensiveResults] = useState<string>('');
  const [usersWithoutAddresses, setUsersWithoutAddresses] = useState<any[]>([]);
  const [warehouseData, setWarehouseData] = useState<any[]>([]);

  /**
   * Run comprehensive trigger system test
   */
  const runComprehensiveTest = async (): Promise<void> => {
    setIsRunning(true);
    setTestResults([]);
    setComprehensiveResults('');

    try {
      // Initialize test results
      const initialTests: TestResultDisplay[] = [
        { name: 'Trigger Function Check', status: 'running', message: 'Checking if trigger function exists...' },
        { name: 'Warehouse Availability', status: 'pending', message: 'Waiting...' },
        { name: 'Users Without Addresses', status: 'pending', message: 'Waiting...' }
      ];
      setTestResults(initialTests);

      // Run comprehensive test
      const results = await triggerTester.runComprehensiveTest();
      
      // Update test results
      const updatedTests: TestResultDisplay[] = [
        {
          name: 'Trigger Function Check',
          status: results.tests.trigger_function.success ? 'success' : 'error',
          message: results.tests.trigger_function.message,
          error: results.tests.trigger_function.error
        },
        {
          name: 'Warehouse Availability',
          status: results.tests.warehouse_availability.success ? 'success' : 'error',
          message: results.tests.warehouse_availability.message,
          data: results.tests.warehouse_availability.data,
          error: results.tests.warehouse_availability.error
        },
        {
          name: 'Users Without Addresses',
          status: results.tests.users_without_addresses.success ? 'success' : 'error',
          message: results.tests.users_without_addresses.message,
          data: results.tests.users_without_addresses.data,
          error: results.tests.users_without_addresses.error
        }
      ];

      setTestResults(updatedTests);
      setComprehensiveResults(results.summary);
      
      // Store data for display
      if (results.tests.users_without_addresses.data) {
        setUsersWithoutAddresses(results.tests.users_without_addresses.data);
      }
      if (results.tests.warehouse_availability.data) {
        setWarehouseData(results.tests.warehouse_availability.data);
      }

    } catch (error) {
      console.error('Error running comprehensive test:', error);
      setTestResults([{
        name: 'Test Execution',
        status: 'error',
        message: 'Failed to execute comprehensive test',
        error: error instanceof Error ? error.message : 'Unknown error'
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Fix all users without addresses
   */
  const fixAllUsers = async (): Promise<void> => {
    setIsRunning(true);
    
    try {
      const result = await triggerTester.fixAllUsersWithoutAddresses();
      
      // Add fix result to test results
      const fixResult: TestResultDisplay = {
        name: 'Bulk Address Assignment',
        status: result.success ? 'success' : 'error',
        message: result.message,
        data: result.data,
        error: result.error
      };
      
      setTestResults(prev => [...prev, fixResult]);
      
      // Refresh users without addresses
      if (result.success) {
        const usersResult = await triggerTester.getUsersWithoutAddresses();
        if (usersResult.success && usersResult.data) {
          setUsersWithoutAddresses(usersResult.data);
        }
      }
      
    } catch (error) {
      console.error('Error fixing users:', error);
      setTestResults(prev => [...prev, {
        name: 'Bulk Address Assignment',
        status: 'error',
        message: 'Failed to fix users without addresses',
        error: error instanceof Error ? error.message : 'Unknown error'
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Get status icon for test result
   */
  const getStatusIcon = (status: TestResultDisplay['status']) => {
    switch (status) {
      case 'running':
        return <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Database Trigger Testing Panel</h1>
        </div>
        <p className="text-gray-600">
          Test and manage automatic address assignment triggers for user registration.
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={runComprehensiveTest}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Running Tests...' : 'Run Comprehensive Test'}
          </button>
          
          <button
            onClick={fixAllUsers}
            disabled={isRunning || usersWithoutAddresses.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Settings className="w-4 h-4" />
            Fix All Users ({usersWithoutAddresses.length})
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
          <div className="space-y-4">
            {testResults.map((test, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(test.status)}
                  <h3 className="font-medium text-gray-900">{test.name}</h3>
                </div>
                <p className="text-gray-600 mb-2">{test.message}</p>
                {test.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-2">
                    <p className="text-red-700 text-sm">Error: {test.error}</p>
                  </div>
                )}
                {test.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      View Details
                    </summary>
                    <pre className="mt-2 bg-gray-50 p-3 rounded text-xs overflow-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comprehensive Results Summary */}
      {comprehensiveResults && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Summary</h2>
          <pre className="bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap font-mono">
            {comprehensiveResults}
          </pre>
        </div>
      )}

      {/* Users Without Addresses */}
      {usersWithoutAddresses.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Users Without Addresses ({usersWithoutAddresses.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usersWithoutAddresses.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Warehouse Status */}
      {warehouseData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Warehouse Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouseData.map((warehouse) => (
              <div key={warehouse.id} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  {warehouse.city}, {warehouse.country}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{warehouse.address}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {warehouse.current_occupancy} / {warehouse.capacity}
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {warehouse.occupancy_percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${warehouse.occupancy_percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TriggerTestingPanel;
