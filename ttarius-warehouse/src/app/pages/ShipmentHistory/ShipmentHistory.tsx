import React, { useState, useEffect } from 'react';
import { FiPackage, FiCalendar, FiSearch, FiFilter, FiDownload, FiEye } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

/**
 * ShipmentHistory Component
 * 
 * This component displays the history of all shipments with filtering, sorting, and search capabilities.
 * It allows users to view detailed information about past shipments and export data.
 * 
 * @returns {React.ReactElement} The ShipmentHistory component
 */
const ShipmentHistory: React.FC = () => {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: '',
    end: ''
  });
  // Get location object to read query params
  const location = useLocation();

  useEffect(() => {
    // Parse query params from URL
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter');
    const range = params.get('range');
    // If filter param is set, update filterStatus
    if (filter) {
      setFilterStatus(filter);
    }
    // If range param is set, update dateRange to this week
    if (range === 'this-week') {
      // Calculate start and end of current week
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + (6 - now.getDay())); // Saturday
      setDateRange({
        start: startOfWeek.toISOString().split('T')[0],
        end: endOfWeek.toISOString().split('T')[0]
      });
    }
  }, [location.search]);
  
  /**
   * Mock data for shipment history
   * In a real application, this would come from an API
   */
  const shipments = [
    {
      id: 'SHP-5001',
      client: 'Acme Corporation',
      origin: 'New York, NY',
      destination: 'Los Angeles, CA',
      date: '2025-05-15',
      deliveryDate: '2025-05-18',
      status: 'delivered',
      type: 'Standard'
    },
    {
      id: 'SHP-5002',
      client: 'Global Shipping Inc.',
      origin: 'Chicago, IL',
      destination: 'Miami, FL',
      date: '2025-05-20',
      deliveryDate: '2025-05-22',
      status: 'in-transit',
      type: 'Express'
    },
    {
      id: 'SHP-5003',
      client: 'Tech Solutions Ltd.',
      origin: 'Seattle, WA',
      destination: 'Boston, MA',
      date: '2025-05-25',
      deliveryDate: '2025-05-30',
      status: 'in-transit',
      type: 'Economy'
    },
    {
      id: 'SHP-5004',
      client: 'Retail Partners Co.',
      origin: 'Dallas, TX',
      destination: 'Phoenix, AZ',
      date: '2025-06-01',
      deliveryDate: '2025-06-03',
      status: 'delivered',
      type: 'Priority'
    },
    {
      id: 'SHP-5005',
      client: 'Manufacturing Experts',
      origin: 'Denver, CO',
      destination: 'Atlanta, GA',
      date: '2025-06-05',
      deliveryDate: '2025-06-10',
      status: 'processing',
      type: 'Standard'
    },
    {
      id: 'SHP-5006',
      client: 'Logistics Partners LLC',
      origin: 'San Francisco, CA',
      destination: 'Portland, OR',
      date: '2025-06-08',
      deliveryDate: '2025-06-12',
      status: 'processing',
      type: 'Express'
    }
  ];
  
  /**
   * Filter shipments based on search query, status, and date range
   * 
   * @returns {Array} Filtered shipments
   */
  const filteredShipments = () => {
    return shipments.filter(shipment => {
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.client.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by status
      const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus;
      
      // Filter by date range
      const shipmentDate = new Date(shipment.date);
      const matchesDateRange = 
        (dateRange.start === '' || new Date(dateRange.start) <= shipmentDate) &&
        (dateRange.end === '' || new Date(dateRange.end) >= shipmentDate);
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
  };
  
  /**
   * Handle search input change
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  /**
   * Handle date range change
   * 
   * @param {string} field - Field name (start or end)
   * @param {string} value - New date value
   */
  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  /**
   * Get status badge style based on status
   * 
   * @param {string} status - Shipment status
   * @returns {string} CSS class string
   */
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  /**
   * Handle export data
   */
  const handleExport = () => {
    console.log('Exporting shipment data');
    // Implement export functionality here
  };
  
  /**
   * Handle view shipment details
   * 
   * @param {string} id - Shipment ID
   */
  const handleViewDetails = (id: string) => {
    console.log(`Viewing details for shipment: ${id}`);
    // Implement view details functionality here
  };

  return (
    <div className="py-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Shipment History</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and search through all past and current shipments
        </p>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="w-full md:w-1/3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search by ID or client"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Status filter */}
            <div className="flex items-center">
              <FiFilter className="text-gray-500 mr-2" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
                <option value="arrived">Arrived</option>
                <option value="received">Received</option>
                <option value="in-transit">In Transit</option> // Updated as per workflow: these are the only valid shipment statuses
              </select>
            </div>
            
            {/* Date range filter */}
            <div className="flex items-center space-x-2">
              <FiCalendar className="text-gray-500" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              />
            </div>
          </div>
          
          {/* Export button */}
          <div>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiDownload className="mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>
      
      {/* Shipments table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shipment ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
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
            {filteredShipments().map((shipment) => (
              <tr key={shipment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FiPackage className="text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{shipment.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{shipment.client}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{shipment.origin}</div>
                  <div className="text-sm text-gray-500">to {shipment.destination}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Shipped: {shipment.date}</div>
                  <div className="text-sm text-gray-500">Delivery: {shipment.deliveryDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{shipment.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(shipment.status)}`}>
                    {shipment.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleViewDetails(shipment.id)}
                    className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                  >
                    <FiEye className="mr-1" />
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShipmentHistory;
