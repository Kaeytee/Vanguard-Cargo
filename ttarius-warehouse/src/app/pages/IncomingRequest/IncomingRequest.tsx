import React, { useState } from 'react';
import { FiPackage, FiClock, FiCheck, FiX, FiFilter } from 'react-icons/fi';

/**
 * IncomingRequest Component
 * 
 * This component displays and manages incoming shipment requests that need to be processed.
 * It includes filtering, sorting, and action capabilities for warehouse staff.
 * 
 * @returns {React.ReactElement} The IncomingRequest component
 */
const IncomingRequest: React.FC = () => {
  // State for filter options
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  /**
   * Mock data for incoming requests
   * In a real application, this would come from an API
   */
  const incomingRequests = [
    {
      id: 'REQ-1001',
      client: 'Acme Corporation',
      type: 'Standard',
      items: 3,
      weight: '45.2 kg',
      requestDate: '2025-06-10',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 'REQ-1002',
      client: 'Global Shipping Inc.',
      type: 'Express',
      items: 1,
      weight: '12.8 kg',
      requestDate: '2025-06-11',
      status: 'pending',
      priority: 'medium'
    },
    {
      id: 'REQ-1003',
      client: 'Tech Solutions Ltd.',
      type: 'Economy',
      items: 5,
      weight: '78.5 kg',
      requestDate: '2025-06-09',
      status: 'processing',
      priority: 'low'
    },
    {
      id: 'REQ-1004',
      client: 'Retail Partners Co.',
      type: 'Priority',
      items: 2,
      weight: '23.1 kg',
      requestDate: '2025-06-12',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 'REQ-1005',
      client: 'Manufacturing Experts',
      type: 'Standard',
      items: 8,
      weight: '120.7 kg',
      requestDate: '2025-06-08',
      status: 'processing',
      priority: 'medium'
    }
  ];
  
  /**
   * Filter requests based on selected status
   * 
   * @returns {Array} Filtered requests
   */
  const filteredRequests = () => {
    if (filterStatus === 'all') {
      return incomingRequests;
    }
    return incomingRequests.filter(request => request.status === filterStatus);
  };
  
  /**
   * Handle request approval
   * 
   * @param {string} id - Request ID
   */
  const handleApprove = (id: string) => {
    console.log(`Approved request: ${id}`);
    // Implement approval logic here
  };
  
  /**
   * Handle request rejection
   * 
   * @param {string} id - Request ID
   */
  const handleReject = (id: string) => {
    console.log(`Rejected request: ${id}`);
    // Implement rejection logic here
  };
  
  /**
   * Get priority badge style based on priority level
   * 
   * @param {string} priority - Priority level
   * @returns {string} CSS class string
   */
  const getPriorityBadgeClass = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Incoming Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and process incoming shipment requests
        </p>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center">
          <FiFilter className="text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700 mr-4">Filter by status:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-sm rounded-md ${
                filterStatus === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 text-sm rounded-md ${
                filterStatus === 'pending' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('processing')}
              className={`px-3 py-1 text-sm rounded-md ${
                filterStatus === 'processing' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Processing
            </button>
          </div>
        </div>
      </div>
      
      {/* Requests table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests().map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FiPackage className="text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{request.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{request.client}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{request.type}</div>
                  <div className="text-sm text-gray-500">{request.items} items, {request.weight}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FiClock className="text-gray-400 mr-1" />
                    <span className="text-sm text-gray-500">{request.requestDate}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(request.priority)}`}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
                    >
                      <FiCheck size={18} />
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomingRequest;
