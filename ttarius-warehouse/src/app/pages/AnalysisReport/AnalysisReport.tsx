import React, { useState } from 'react';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiCalendar, FiDownload, FiFilter } from 'react-icons/fi';

/**
 * AnalysisReport Component
 * 
 * This component provides data analysis and reporting features for the logistics system.
 * It displays various charts, metrics, and allows filtering and exporting of data.
 * 
 * @returns {React.ReactElement} The AnalysisReport component
 */
const AnalysisReport: React.FC = () => {
  // State for report filters
  const [timeRange, setTimeRange] = useState<string>('month');
  const [reportType, setReportType] = useState<string>('shipments');
  
  /**
   * Mock data for shipment metrics
   * In a real application, this would come from an API
   */
  const shipmentMetrics = {
    totalShipments: 1245,
    completedShipments: 987,
    inTransitShipments: 198,
    processingShipments: 60,
    averageDeliveryTime: '3.2 days',
    onTimeDeliveryRate: '94.5%'
  };
  
  /**
   * Mock data for inventory metrics
   * In a real application, this would come from an API
   */
  const inventoryMetrics = {
    totalItems: 8750,
    lowStockItems: 42,
    outOfStockItems: 15,
    inventoryValue: '$1,245,780',
    inventoryTurnover: '4.2x',
    averageStorageTime: '18.5 days'
  };
  
  /**
   * Get current metrics based on selected report type
   * 
   * @returns {Object} Current metrics object
   */
  const getCurrentMetrics = () => {
    return reportType === 'shipments' ? shipmentMetrics : inventoryMetrics;
  };
  
  /**
   * Handle time range change
   * 
   * @param {string} range - New time range
   */
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    // In a real app, this would trigger data reload
  };
  
  /**
   * Handle report type change
   * 
   * @param {string} type - New report type
   */
  const handleReportTypeChange = (type: string) => {
    setReportType(type);
    // In a real app, this would trigger data reload
  };
  
  /**
   * Handle report export
   */
  const handleExport = () => {
    console.log(`Exporting ${reportType} report for ${timeRange} range`);
    // Implement export functionality here
  };
  
  /**
   * Metric card component
   * 
   * @param {Object} props - Component props
   * @param {string} props.title - Metric title
   * @param {string} props.value - Metric value
   * @param {React.ReactNode} props.icon - Icon component
   * @param {string} props.color - Icon color class
   * @returns {React.ReactElement} Metric card component
   */
  const MetricCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} text-white mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Analysis Report</h1>
        <p className="mt-1 text-sm text-gray-500">
          View detailed analytics and performance metrics
        </p>
      </div>
      
      {/* Report controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Report type selector */}
          <div className="flex items-center">
            <FiFilter className="text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700 mr-2">Report Type:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleReportTypeChange('shipments')}
                className={`px-3 py-1 text-sm rounded-md ${
                  reportType === 'shipments' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Shipments
              </button>
              <button
                onClick={() => handleReportTypeChange('inventory')}
                className={`px-3 py-1 text-sm rounded-md ${
                  reportType === 'inventory' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inventory
              </button>
            </div>
          </div>
          
          {/* Time range selector */}
          <div className="flex items-center">
            <FiCalendar className="text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700 mr-2">Time Range:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleTimeRangeChange('week')}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === 'week' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => handleTimeRangeChange('month')}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === 'month' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => handleTimeRangeChange('quarter')}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === 'quarter' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Quarter
              </button>
              <button
                onClick={() => handleTimeRangeChange('year')}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === 'year' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Year
              </button>
            </div>
          </div>
          
          {/* Export button */}
          <div>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiDownload className="mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>
      
      {/* Key metrics */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reportType === 'shipments' ? (
            <>
              <MetricCard
                title="Total Shipments"
                value={shipmentMetrics.totalShipments.toString()}
                icon={<FiBarChart2 size={24} />}
                color="bg-blue-500"
              />
              <MetricCard
                title="On-Time Delivery Rate"
                value={shipmentMetrics.onTimeDeliveryRate}
                icon={<FiTrendingUp size={24} />}
                color="bg-green-500"
              />
              <MetricCard
                title="Average Delivery Time"
                value={shipmentMetrics.averageDeliveryTime}
                icon={<FiCalendar size={24} />}
                color="bg-purple-500"
              />
            </>
          ) : (
            <>
              <MetricCard
                title="Total Inventory Items"
                value={inventoryMetrics.totalItems.toString()}
                icon={<FiBarChart2 size={24} />}
                color="bg-blue-500"
              />
              <MetricCard
                title="Inventory Value"
                value={inventoryMetrics.inventoryValue}
                icon={<FiTrendingUp size={24} />}
                color="bg-green-500"
              />
              <MetricCard
                title="Inventory Turnover"
                value={inventoryMetrics.inventoryTurnover}
                icon={<FiPieChart size={24} />}
                color="bg-purple-500"
              />
            </>
          )}
        </div>
      </div>
      
      {/* Charts section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {reportType === 'shipments' ? 'Shipment Status Distribution' : 'Inventory Category Distribution'}
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
              <div className="text-center">
                <FiPieChart className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Pie chart will be displayed here
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart 2 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {reportType === 'shipments' ? 'Shipment Volume Over Time' : 'Inventory Levels Over Time'}
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
              <div className="text-center">
                <FiBarChart2 className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Bar chart will be displayed here
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart 3 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {reportType === 'shipments' ? 'Delivery Performance Trend' : 'Stock Movement Trend'}
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
              <div className="text-center">
                <FiTrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Line chart will be displayed here
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart 4 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {reportType === 'shipments' ? 'Top Shipping Routes' : 'Top Moving Items'}
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
              <div className="text-center">
                <FiBarChart2 className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Horizontal bar chart will be displayed here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed metrics table */}
      <div className="mt-8 bg-white shadow overflow-hidden rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Detailed Metrics</h3>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(getCurrentMetrics()).map(([key, value]) => (
              <div key={key} className="border-b border-gray-200 pb-4">
                <dt className="text-sm font-medium text-gray-500">
                  {key.replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .replace(/([a-z])([A-Z])/g, '$1 $2')}
                </dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">{value}</dd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReport;
