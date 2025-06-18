import React, { useState } from 'react';
import { FiPackage, FiFilter, FiSearch, FiChevronDown } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ProcessIncomingRequestModal from './ProcessIncomingRequestModal';
import PackageSuccessModal from './PackageSuccessModal';
import RequestDetailsModal from './RequestDetailsModal';

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
  // State for search query
  const [searchQuery, setSearchQuery] = useState<string>('');
  // State for status dropdown
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  // State for date filters
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  // State for process modal
  const [processModalOpen, setProcessModalOpen] = useState<boolean>(false);
  // State for success modal
  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
  // State for request details modal
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  // Currently selected request for modal
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  // State for package info for success modal
  const [packageInfo, setPackageInfo] = useState<any>(null);

  
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
      status: 'pending', // All incoming requests must start as 'pending'
      priority: 'medium'
    }
  ];
  
  /**
   * Filter requests based on selected status
   * 
   * @returns {Array} Filtered requests
   */
  /**
   * Filter requests based on search, status, and date range
   *
   * @returns {Array} Filtered requests
   */
  const filteredRequests = () => {
    let filtered = incomingRequests;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === filterStatus);
    }
    if (searchQuery) {
      filtered = filtered.filter(request =>
        request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (startDate) {
      filtered = filtered.filter(request => 
        new Date(request.requestDate) >= startDate
      );
    }
    if (endDate) {
      filtered = filtered.filter(request => 
        new Date(request.requestDate) <= endDate
      );
    }
    return filtered;
  };

  return (
    <div className="py-6">
      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-blue-900 mb-1">Incoming requests</h1>
        <p className="text-gray-400 text-sm">Review and process client shipment requests</p>
      </div>

      {/* Search and controls row */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        {/* Search bar */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Requests"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-900 placeholder-gray-400 text-sm shadow-sm"
          />
        </div>
        {/* Status filter dropdown */}
        <div className="relative">
          <button
            className="flex items-center px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm font-medium shadow-sm hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
            onClick={() => setFilterOpen(f => !f)}
            type="button"
          >
            <FiFilter className="mr-2 text-gray-500" />
            {filterStatus === 'all' ? 'All Status' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            <FiChevronDown className="ml-2 text-gray-400" />
          </button>
          {/* Dropdown menu */}
          {filterOpen && (
            <div className="absolute z-10 mt-2 left-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg">
              <button
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${filterStatus==='all'?'text-blue-700 font-semibold':'text-gray-700'}`}
                onClick={() => { setFilterStatus('all'); setFilterOpen(false); }}
              >All Status</button>
              <button
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${filterStatus==='pending'?'text-blue-700 font-semibold':'text-gray-700'}`}
                onClick={() => { setFilterStatus('pending'); setFilterOpen(false); }}
              >Pending</button>
              <button
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${filterStatus==='processing'?'text-blue-700 font-semibold':'text-gray-700'}`}
                onClick={() => { setFilterStatus('processing'); setFilterOpen(false); }}
              >Processing</button>
            </div>
          )}
        </div>
        {/* Date picker */}
        <div className="flex items-center gap-2">
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="From"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            placeholderText="To"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Requests table */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Destination</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests().map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  {/* Request ID */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiPackage className="text-gray-500 mr-2" />
                      <span className="text-sm font-semibold text-gray-900">{request.id}</span>
                    </div>
                  </td>
                  {/* Client */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{request.client}</span>
                  </td>
                  {/* Destination (static for now, Los Angeles) */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiPackage className="text-blue-400 mr-2" />
                      <span className="text-sm text-gray-900">Los Angeles</span>
                    </div>
                  </td>
                  {/* Type */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{request.type}</span>
                  </td>
                  {/* Status Pill */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-200 ${
                      request.status === 'pending'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  {/* Action: Eye and Process button */}
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2">
                      {/* View details icon button */}
                      <button
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                        title="View"
                        aria-label="View"
                        onClick={() => {
                          setSelectedRequest(request);
                          setDetailsModalOpen(true);
                        }}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      {/* Process button */}
                      <button
                        className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-1.5 rounded-md font-semibold text-sm shadow-sm transition-all duration-150 active:scale-95 focus:outline-none"
                        onClick={() => {
                          setSelectedRequest(request);
                          setProcessModalOpen(true);
                        }}
                      >
                        Process
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Process Incoming Request Modal */}
      <ProcessIncomingRequestModal
        open={processModalOpen}
        onClose={() => setProcessModalOpen(false)}
        onMarkReceived={() => {
          // Simulate package creation and show success modal
          setProcessModalOpen(false);
          setTimeout(() => {
            setPackageInfo({
              requestId: selectedRequest?.id,
              weight: selectedRequest?.weight || '2.5',
              type: 'parcel',
              value: '1,500.00',
              dimensions: '30x22x2cm',
              client: 'Carol Johnson',
              submitted: '2024-06-02',
              destination: 'Los Angeles',
              time: '9:00 AM GMT',
              description: 'Power Bank',
              packageId: 'PKG1686412308',
              barcode: 'BAR87654329',
              barcodeImage: 'https://barcode.tec-it.com/barcode.ashx?data=BAR87654329&code=Code128&translate-esc=true',
            });
            setSuccessModalOpen(true);
          }, 500);
        }}
        request={selectedRequest}
      />
      {/* Package Success Modal */}
      <PackageSuccessModal
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        packageInfo={packageInfo}
      />
      {/* Request Details Modal */}
      <RequestDetailsModal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        request={selectedRequest && {
          id: selectedRequest.id,
          client: 'Carol Johnson',
          date: '2024-06-02',
          address: 'Los Angeles, CA 90210',
          time: '17:00 PM GMT',
          type: 'parcel',
          description: 'Power Bank',
        }}
      />
    </div>
  );
};

export default IncomingRequest;
