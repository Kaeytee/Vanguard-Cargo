/**
 * Inventory Page
 *
 * This page displays and manages inventory items in the warehouse.
 * Follows clean code, OOP, and best practices.
 */
/**
 * Inventory component for TTarius Logistics application.
 * @returns {React.ReactElement} Inventory page
*/
import React, { useState } from 'react';
import { FiPackage, FiCheckCircle, FiFilter, FiSearch, FiEye, FiCalendar } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * Inventory component for TTarius Logistics application.
 * Implements summary cards, search/filter, and inventory table UI as per design.
 * @returns {React.ReactElement} Inventory page
 */
const Inventory: React.FC = () => {
  // State for date filter
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Mock summary data
  const summary = {
    totalPackages: 156,
    received: 80,
    shipped: 76,
    totalWeight: '15.6kg',
  };

  // Mock inventory data
  const inventoryData = [
    {
      packageId: 'PKG97654329',
      barcode: 'BAR87654329',
      client: 'Carol Johnson',
      type: 'parcel',
      weight: '2.5kg',
      requestId: 'REQ102',
      status: 'Received',
    },
    {
      packageId: 'PKG97654329',
      barcode: 'BAR87654329',
      client: 'Carol Johnson',
      type: 'Box',
      weight: '2.5kg',
      requestId: 'REQ102',
      status: 'Received',
    },
    {
      packageId: 'PKG97654329',
      barcode: 'BAR87654329',
      client: 'Carol Johnson',
      type: 'parcel',
      weight: '2.5kg',
      requestId: 'REQ102',
      status: 'Received',
    },
    {
      packageId: 'PKG97654329',
      barcode: 'BAR87654329',
      client: 'Carol Johnson',
      type: 'Box',
      weight: '2.5kg',
      requestId: 'REQ102',
      status: 'In Transit',
    },
    {
      packageId: 'PKG97654329',
      barcode: 'BAR87654329',
      client: 'Carol Johnson',
      type: 'parcel',
      weight: '2.5kg',
      requestId: 'REQ102',
      status: 'In Transit',
    },
    {
      packageId: 'PKG97654329',
      barcode: 'BAR87654329',
      client: 'Carol Johnson',
      type: 'Box',
      weight: '2.5kg',
      requestId: 'REQ102',
      status: 'In Transit',
    },
    {
      packageId: 'PKG97654329',
      barcode: 'BAR87654329',
      client: 'Carol Johnson',
      type: 'parcel',
      weight: '2.5kg',
      requestId: 'REQ102',
      status: 'In Transit',
    },
  ];

  // State for search and filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filtered data
  const filteredData = inventoryData.filter(item => {
    const matchesSearch =
      item.packageId.toLowerCase().includes(search.toLowerCase()) ||
      item.barcode.toLowerCase().includes(search.toLowerCase()) ||
      item.client.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || item.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Status options for filter
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'received', label: 'Received' },
    { value: 'in transit', label: 'In Transit' },
  ];

  return (
    <div className="py-10 px-6 w-full">
      {/* Page header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 mb-1">Inventory</h1>
          <p className="text-gray-400 text-sm">Complete package inventory and tracking</p>
        </div>
      </div>
          

      {/* Summary cards - matches design exactly */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Total Packages Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col relative min-h-[140px]">
          {/* Icon in top-right */}
          <span className="absolute top-4 right-4 text-green-500 text-2xl">
            <FiPackage />
          </span>
          <span className="text-gray-500 text-base mb-2">Total Packages</span>
          <span className="text-2xl font-bold text-[#0D1637]">{summary.totalPackages}</span>
          <span className="text-gray-300 text-xs mt-2">+18 this week</span>
        </div>
        {/* Received Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col relative min-h-[140px]">
          <span className="absolute top-4 right-4 text-green-500 text-2xl">
            <FiCheckCircle />
          </span>
          <span className="text-gray-500 text-base mb-2">Received</span>
          <span className="text-2xl font-bold text-[#0D1637]">{summary.received}</span>
          <span className="text-gray-300 text-xs mt-2">currently in Store</span>
        </div>
        {/* Shipped Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col relative min-h-[140px]">
          <span className="absolute top-4 right-4 text-green-500 text-2xl">
            <FiCheckCircle />
          </span>
          <span className="text-gray-500 text-base mb-2">Shipped</span>
          <span className="text-2xl font-bold text-[#0D1637]">{summary.shipped}</span>
          <span className="text-gray-300 text-xs mt-2">currently in inventory</span>
        </div>
        {/* Total Weight Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col relative min-h-[140px]">
          <span className="absolute top-4 right-4 text-green-500 text-2xl">
            <FiCheckCircle />
          </span>
          <span className="text-gray-500 text-base mb-2">Total Weight</span>
          <span className="text-2xl font-bold text-[#0D1637]">{summary.totalWeight}</span>
          <span className="text-gray-300 text-xs mt-2">currently in inventory</span>
        </div>
      </div>

      {/* Search and filter row */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        {/* Search bar */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Requests"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-900 placeholder-gray-400 text-sm shadow-sm"
          />
        </div>
        {/* Status filter */}
        <div className="relative">
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-900 text-sm shadow-sm"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {/* Date picker button (placeholder) */}
        <button
          className="flex items-center px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm font-medium shadow-sm hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
          type="button"
        >
          <FiCalendar className="mr-2 text-gray-500" />
        </button>
      </div>

      {/* Inventory table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Package ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Barcode</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Weight</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Request ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((item, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{item.packageId}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700">{item.barcode}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.client}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.weight}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">{item.requestId}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-4 py-1 rounded-full border text-xs font-semibold ${item.status === 'Received' ? 'border-blue-400 text-blue-600 bg-blue-50' : 'border-indigo-400 text-indigo-600 bg-indigo-50'}`}>{item.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors" title="View">
                    <FiEye size={18} />
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

export default Inventory;