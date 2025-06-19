/**
 * ShipmentHistory.tsx
 * 
 * Professional shipment history management page for Ttarius Logistics
 * Displays comprehensive list of all shipments with modern Tailwind design
 * Features status cards, advanced filtering, search, and detailed popup views
 * 
 * @author Senior Software Engineer
 * @version 3.0.0 - Professional redesign with Tailwind CSS
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FaEye, FaDownload } from 'react-icons/fa';
import { Search, Calendar } from 'lucide-react';
import type { Package } from '../../core/models/Package';
import { PackageType, PackagePriority } from '../../core/models/Package';
import { PackageStatus, StatusUtils } from '../../core/status/StatusDefinitions';
import { FacilityTypeValues } from '../../core/status/StatusLocationMapping';
import ShipmentHistoryPopup from './ShipmentHistoryPopup';

/**
 * ShipmentHistory component
 * Main component for displaying and managing shipment history
 * Provides filtering, searching, and detailed view capabilities with professional design
 */
const ShipmentHistory: React.FC = () => {
  // STATE MANAGEMENT
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // SEARCH AND FILTER STATE
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<PackageStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<PackagePriority | 'all'>('all');
  
  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  
  // DATE FILTER STATE
  const [dateFilterOpen, setDateFilterOpen] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateFilterActive, setDateFilterActive] = useState<boolean>(false);
  
  // POPUP STATE
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  
  // EXPORT STATE
  const [isExporting, setIsExporting] = useState<boolean>(false);
  
  // REFS FOR DATE FILTER DROPDOWN
  const dateFilterButtonRef = useRef<HTMLButtonElement>(null);
  const dateFilterDropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Load packages from service on component mount
   * TODO: Replace with actual API call when backend is ready
   */
  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // TODO: Replace with actual PackageService.getPackages() call
        const mockPackages = generateMockPackages();
        setPackages(mockPackages);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading packages:', err);
        setError('Failed to load shipment history. Please try again.');
        setLoading(false);
      }
    };

    loadPackages();
  }, []);

  // Add CSS animations for the date filter dropdown
  useEffect(() => {
    if (!document.getElementById('date-filter-animations')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'date-filter-animations';
      styleSheet.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);
  
  // Handle positioning and outside clicks for the date filter dropdown
  useEffect(() => {
    function positionDropdown() {
      if (dateFilterOpen && dateFilterButtonRef.current && dateFilterDropdownRef.current) {
        const buttonRect = dateFilterButtonRef.current.getBoundingClientRect();
        const dropdownElem = dateFilterDropdownRef.current;
        const isMobile = window.innerWidth < 640;
        
        if (isMobile) {
          const viewportWidth = window.innerWidth;
          const dropdownWidth = Math.min(viewportWidth * 0.9, 360);
          
          dropdownElem.style.position = 'fixed';
          dropdownElem.style.top = '50%';
          dropdownElem.style.left = '50%';
          dropdownElem.style.transform = 'translate(-50%, -50%)';
          dropdownElem.style.maxHeight = '80vh';
          dropdownElem.style.overflowY = 'auto';
          dropdownElem.style.width = `${dropdownWidth}px`;
          dropdownElem.style.zIndex = '9999';
        } else {
          dropdownElem.style.position = 'absolute';
          dropdownElem.style.top = `${buttonRect.height + 8}px`;
          dropdownElem.style.right = '0';
          dropdownElem.style.transform = 'none';
          dropdownElem.style.zIndex = '9999';
        }
      }
    }
    
    function handleClickOutside(event: MouseEvent) {
      if (dateFilterOpen && 
          dateFilterButtonRef.current && 
          dateFilterDropdownRef.current && 
          !dateFilterButtonRef.current.contains(event.target as Node) && 
          !dateFilterDropdownRef.current.contains(event.target as Node)) {
        setDateFilterOpen(false);
      }
    }
    
    positionDropdown();
    window.addEventListener('resize', positionDropdown);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', positionDropdown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dateFilterOpen]);
  
  // Handle Escape key to close the dropdown
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && dateFilterOpen) {
        setDateFilterOpen(false);
      }
    }
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [dateFilterOpen]);

  /**
   * Maps package status from the Package type to standard status values
   */
  const mapPackageStatusToShipmentStatus = (packageStatus: string): 'pending' | 'processing' | 'shipped' | 'delivered' => {
    const status = packageStatus.toLowerCase();
    
    if (status.includes('pending') || status.includes('waiting')) {
      return 'pending';
    } else if (status.includes('process') || status.includes('preparing')) {
      return 'processing';
    } else if (status.includes('ship') || status.includes('transit') || status.includes('route')) {
      return 'shipped';
    } else if (status.includes('deliver') || status.includes('complete') || status.includes('arrived')) {
      return 'delivered';
    }
    
    return 'processing';
  };

  // Define all possible shipment statuses
  const statuses = {
    all: "All Shipments",
    pending: "Pending",
    processing: "Processing", 
    delivered: "Delivered",
    shipped: "Shipped",
    in_transit: "In Transit"
  };

  /**
   * Calculate counts for each status based on the current packages data
   */
  const counts = useMemo(() => {
    if (loading || error || packages.length === 0) {
      return {
        all: 0,
        pending: 0,
        processing: 0,
        delivered: 0,
        shipped: 0,
        in_transit: 0
      };
    }
    
    return {
      all: packages.length,
      pending: packages.filter(p => p.status === PackageStatus.PENDING).length,
      processing: packages.filter(p => p.status === PackageStatus.PROCESSING).length,
      delivered: packages.filter(p => p.status === PackageStatus.DELIVERED).length,
      shipped: packages.filter(p => p.status === PackageStatus.SHIPPED).length,
      in_transit: packages.filter(p => p.status === PackageStatus.IN_TRANSIT).length,
    };
  }, [packages, loading, error]);

  /**
   * Helper function to parse dates and handle potential invalid formats
   */
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  /**
   * Filter and search packages based on current criteria with advanced date filtering
   */
  const filteredAndSearchedPackages = useMemo(() => {
    let result = packages;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(pkg => 
        pkg.trackingNumber.toLowerCase().includes(searchLower) ||
        pkg.clientName.toLowerCase().includes(searchLower) ||
        pkg.description.toLowerCase().includes(searchLower) ||
        pkg.id.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(pkg => pkg.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(pkg => pkg.priority === priorityFilter);
    }

    // Apply simple date filter (legacy)
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      result = result.filter(pkg => {
        const packageDate = new Date(pkg.createdAt);
        return packageDate.toDateString() === filterDate.toDateString();
      });
    }

    // Apply advanced date range filter
    if (dateFilterActive && startDate && endDate) {
      const parsedStartDate = parseDate(startDate);
      const parsedEndDate = parseDate(endDate);
      
      if (parsedStartDate && parsedEndDate) {
        parsedEndDate.setHours(23, 59, 59, 999);
        
        result = result.filter(pkg => {
          const packageDate = new Date(pkg.createdAt);
          return packageDate >= parsedStartDate && packageDate <= parsedEndDate;
        });
      }
    }

    return result;
  }, [packages, searchTerm, statusFilter, priorityFilter, dateFilter, dateFilterActive, startDate, endDate]);

  /**
   * Calculate pagination values based on filtered packages and current page
   */
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredAndSearchedPackages.length / itemsPerPage);
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
    
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }
    
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredAndSearchedPackages.length);
    const currentItems = filteredAndSearchedPackages.slice(startIndex, endIndex);
    
    const pageNumbers: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= validCurrentPage - 2 && i <= validCurrentPage + 2)
      ) {
        pageNumbers.push(i);
      }
    }
    
    return {
      totalItems: filteredAndSearchedPackages.length,
      totalPages,
      currentPage: validCurrentPage,
      pageNumbers,
      currentItems,
      startIndex,
      endIndex,
      hasPreviousPage: validCurrentPage > 1,
      hasNextPage: validCurrentPage < totalPages
    };
  }, [filteredAndSearchedPackages, currentPage, itemsPerPage]);
  
  /**
   * Handle page change when user clicks pagination controls
   */
  const handlePageChange = (pageNumber: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(pageNumber);
  };

  /**
   * Handle package selection for popup display
   */
  const handleViewPackage = (pkg: Package): void => {
    setSelectedPackage(pkg);
    setShowPopup(true);
  };

  /**
   * Close the package details popup
   */
  const handleClosePopup = (): void => {
    setShowPopup(false);
    setSelectedPackage(null);
  };

  /**
   * Export filtered packages to CSV with professional business formatting
   */
  const handleExportCSV = async (): Promise<void> => {
    try {
      setIsExporting(true);
      
      // Add small delay for better UX (shows loading state)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Prepare CSV headers with professional business structure
      const headers = [
        'Tracking Number',
        'Package ID',
        'Client Name',
        'Client Email',
        'Client Phone',
        'Description',
        'Package Type',
        'Weight (kg)',
        'Dimensions (L×W×H cm)',
        'Value',
        'Currency',
        'Origin',
        'Destination', 
        'Current Location',
        'Status',
        'Priority',
        'Created Date',
        'Last Updated',
        'Estimated Delivery',
        'Actual Delivery',
        'Shipping Cost',
        'Insurance Value',
        'Payment Status',
        'Payment Method',
        'Special Handling',
        'Fragile',
        'Temperature Sensitive',
        'Hazardous',
        'Notes',
        'Customer Notes',
        'Delivery Instructions',
        'Signature Required',
        'Created By',
        'Last Modified By'
      ];

      // Convert filtered packages to CSV rows with comprehensive data
      const csvRows = filteredAndSearchedPackages.map(pkg => [
        pkg.trackingNumber,
        pkg.id,
        pkg.clientName,
        pkg.clientEmail,
        pkg.clientPhone,
        `"${pkg.description}"`, // Wrap in quotes to handle commas
        pkg.packageType,
        pkg.weight.toString(),
        `${pkg.dimensions.length}×${pkg.dimensions.width}×${pkg.dimensions.height}`,
        pkg.value.toString(),
        pkg.currency,
        `"${pkg.origin.address || `${pkg.origin.city}, ${pkg.origin.country}`}"`,
        `"${pkg.destination.address || `${pkg.destination.city}, ${pkg.destination.country}`}"`,
        `"${pkg.currentLocation?.address || `${pkg.currentLocation?.city}, ${pkg.currentLocation?.country}`}"`,
        StatusUtils.formatStatus(pkg.status),
        pkg.priority.toUpperCase(),
        formatDate(pkg.createdAt),
        formatDate(pkg.updatedAt),
        formatDate(pkg.estimatedDelivery),
        pkg.actualDelivery ? formatDate(pkg.actualDelivery) : 'Not Delivered',
        `${pkg.shippingCost.toFixed(2)}`,
        pkg.insuranceValue ? pkg.insuranceValue.toFixed(2) : 'N/A',
        pkg.paymentStatus,
        pkg.paymentMethod,
        pkg.specialHandling.join('; '),
        pkg.fragile ? 'Yes' : 'No',
        pkg.temperatureSensitive ? 'Yes' : 'No',
        pkg.hazardous ? 'Yes' : 'No',
        `"${pkg.notes || 'N/A'}"`,
        `"${pkg.customerNotes || 'N/A'}"`,
        `"${pkg.deliveryInstructions || 'N/A'}"`,
        pkg.signatureRequired ? 'Yes' : 'No',
        pkg.createdBy,
        pkg.lastModifiedBy
      ]);

      // Create CSV content with professional business header
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      // Create professional business CSV with metadata header
      const csvContent = [
        '# TTARIUS LOGISTICS - SHIPMENT HISTORY EXPORT',
        `# Export Date: ${currentDate}`,
        `# Export Time: ${currentTime}`,
        `# Total Records: ${filteredAndSearchedPackages.length}`,
        `# Filter Applied: ${statusFilter !== 'all' ? `Status: ${statusFilter}` : 'All Statuses'}${priorityFilter !== 'all' ? `, Priority: ${priorityFilter}` : ''}${dateFilterActive ? `, Date Range: ${startDate} to ${endDate}` : ''}${searchTerm ? `, Search: "${searchTerm}"` : ''}`,
        '# Generated by: Ttarius Warehouse Management System',
        '# Contact: support@ttarius.com',
        '',
        '# SHIPMENT DATA',
        headers.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        
        // Generate professional filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        const filterSuffix = statusFilter !== 'all' ? `_${statusFilter}` : '';
        const filename = `Ttarius_Shipment_History${filterSuffix}_${timestamp}.csv`;
        
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success notification
        console.log(`✅ Successfully exported ${filteredAndSearchedPackages.length} shipment records to ${filename}`);
        
        // You could also show a toast notification here if you have a notification system
        // showNotification('success', `Exported ${filteredAndSearchedPackages.length} records successfully`);
      }
    } catch (error) {
      console.error('❌ Error exporting CSV:', error);
      // You could also show an error notification here
      // showNotification('error', 'Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Reset all filters to default values
   */
  const handleResetFilters = (): void => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setDateFilter('');
    setStartDate('');
    setEndDate('');
    setDateFilterActive(false);
    setCurrentPage(1);
  };

  /**
   * Returns the appropriate CSS classes for a status badge
   */
  const getStatusBadge = (status: PackageStatus): string => {
    const baseStyles = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case PackageStatus.PENDING:
        return `${baseStyles} bg-yellow-100 text-yellow-800`;
      case PackageStatus.DELIVERED:
        return `${baseStyles} bg-green-100 text-green-800`;
      case PackageStatus.IN_TRANSIT:
        return `${baseStyles} bg-blue-100 text-blue-800`;
      case PackageStatus.PROCESSING:
        return `${baseStyles} bg-blue-100 text-blue-800`;
      case PackageStatus.SHIPPED:
        return `${baseStyles} bg-blue-100 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-800`;
    }
  };

  /**
   * Render status badge with appropriate styling (legacy support)
   */
  const renderStatusBadge = (status: PackageStatus): React.ReactElement => {
    return (
      <span className={getStatusBadge(status)}>
        {StatusUtils.formatStatus(status)}
      </span>
    );
  };

  /**
   * Render priority badge with appropriate styling
   */
  const renderPriorityBadge = (priority: PackagePriority): React.ReactElement => {
    const baseStyles = "px-2 py-1 rounded-full text-xs font-medium";
    let priorityStyles = "";
    
    switch (priority) {
      case PackagePriority.HIGH:
        priorityStyles = "bg-red-100 text-red-800";
        break;
      case PackagePriority.MEDIUM:
        priorityStyles = "bg-yellow-100 text-yellow-800";
        break;
      case PackagePriority.LOW:
        priorityStyles = "bg-green-100 text-green-800";
        break;
      default:
        priorityStyles = "bg-gray-100 text-gray-800";
    }
    
    return (
      <span className={`${baseStyles} ${priorityStyles}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // RENDER LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen py-6 bg-gray-100">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-gray-600 font-medium">Loading shipment history...</p>
        </div>
      </div>
    );
  }

  // RENDER ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen py-6 bg-gray-100">
        <div className="px-4 sm:px-10">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Error Loading Shipments</h3>
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 bg-gray-100 transition-colors duration-300">
      {/* Page Header */}
      <div className="mb-4 px-4 sm:px-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shipment History</h1>
            <p className="text-sm text-gray-500">Complete history of all shipments</p>
          </div>
          <button 
            onClick={handleExportCSV}
            disabled={isExporting || filteredAndSearchedPackages.length === 0}
            className={`mt-4 sm:mt-0 inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md transition-colors ${
              isExporting || filteredAndSearchedPackages.length === 0
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <FaDownload className="mr-2" />
                Export to CSV ({filteredAndSearchedPackages.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Cards - Responsive Grid Layout */}
      <div className="relative mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 px-4 sm:px-6 md:px-8 lg:px-10 pb-2">
          {Object.entries(statuses).map(([key, label]) => (
            <div 
              key={key} 
              className={`bg-white shadow rounded-lg overflow-hidden cursor-pointer transition-all duration-200 h-full ${statusFilter === key ? 'ring-2 ring-offset-1 ring-blue-500' : 'hover:bg-gray-50'}`}
              onClick={() => {
                setStatusFilter(key as PackageStatus | 'all');
                setCurrentPage(1);
              }}
            >
              <div className="p-3 sm:p-4 flex flex-col justify-between h-full">
                <div className="mb-2">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">{label}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 26 26" fill="none" className="flex-shrink-0 sm:w-5 sm:h-5 md:w-6 md:h-6">
                    <path d="M22.9125 6.36187L13.975 1.46961C13.6763 1.30522 13.3409 1.21902 13 1.21902C12.6591 1.21902 12.3237 1.30522 12.025 1.46961L3.0875 6.36187C2.7677 6.53686 2.50088 6.79468 2.31503 7.10829C2.12919 7.4219 2.03117 7.77975 2.03125 8.1443V17.8557C2.03117 18.2202 2.12919 18.5781 2.31503 18.8917C2.50088 19.2053 2.7677 19.4631 3.0875 19.6381L12.025 24.5304C12.3236 24.695 12.659 24.7813 13 24.7813C13.341 24.7813 13.6764 24.695 13.975 24.5304L22.9125 19.6381C23.2323 19.4631 23.4991 19.2053 23.685 18.8917C23.8708 18.5781 23.9688 18.2202 23.9688 17.8557V8.1443C23.9688 7.77975 23.8708 7.4219 23.685 7.10829C23.4991 6.79468 23.2323 6.53686 22.9125 6.36187ZM13 3.71414L20.3125 7.71875L18.136 8.91008L10.8235 4.90648L13 3.71414ZM13 11.7203L5.6875 7.71875L8.28344 6.29687L15.5959 10.2995L13 11.7203ZM4.46875 9.83023L11.7812 13.8318V21.6186L4.46875 17.615V9.83023ZM14.2188 21.6186V13.8318L16.6562 12.4983V15.4375C16.6562 15.7607 16.7847 16.0707 17.0132 16.2993C17.2418 16.5278 17.5518 16.6562 17.875 16.6562C18.1982 16.6562 18.5082 16.5278 18.7368 16.2993C18.9653 16.0707 19.0938 15.7607 19.0938 15.4375V11.1637L21.5312 9.83023V17.615L14.2188 21.6186Z" 
                      fill={key === "processing" || key === "shipped" || key === "in_transit" ? "#3B82F6" : "#FACC15"} 
                    />
                  </svg>
                  <span className="text-lg sm:text-xl md:text-2xl font-bold ml-2">{counts[key as keyof typeof counts]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area - Search and Table */}
      <div className="px-4 sm:px-10">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Search and Filter Section */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-grow max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by tracking number, client name, or description"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Priority Filter */}
            <div className="flex items-center space-x-4">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as PackagePriority | 'all')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                {Object.values(PackagePriority).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.toUpperCase()}
                  </option>
                ))}
              </select>

              {/* Date Filter with Dropdown */}
              <div className="relative flex items-center w-full sm:w-auto">
                <button 
                  ref={dateFilterButtonRef}
                  className={`flex items-center justify-center space-x-1 px-3 py-2 border ${dateFilterActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'} rounded-md hover:bg-gray-50 w-full sm:w-auto`}
                  onClick={() => setDateFilterOpen(!dateFilterOpen)}
                >
                  <Calendar size={16} className={dateFilterActive ? "text-blue-500" : "text-gray-500"} />
                  <span className="text-sm ml-1 hidden sm:inline">
                    {dateFilterActive 
                      ? `${startDate} - ${endDate}` 
                      : "Filter by date"}
                  </span>
                  <span className="text-sm ml-1 inline sm:hidden">
                    {dateFilterActive 
                      ? "Date Range" 
                      : "Date"}
                  </span>
                  <span className="ml-1">{dateFilterOpen ? "▲" : "▼"}</span>
                </button>
                
                {/* Date Filter Backdrop */}
                {dateFilterOpen && (
                  <div 
                    className="fixed inset-0 bg-black bg-opacity-20 z-40 transition-opacity duration-200 ease-in-out"
                    style={{ animation: 'fadeIn 150ms ease-in-out' }}
                    onClick={() => setDateFilterOpen(false)}
                  />
                )}
                
                {/* Date Picker Dropdown */}
                {dateFilterOpen && (
                  <div 
                    ref={dateFilterDropdownRef}
                    className="fixed sm:absolute w-[90vw] sm:w-72 max-w-[360px] bg-white border border-gray-300 rounded-md shadow-xl p-4 transition-all duration-200 ease-in-out z-50"
                    style={{ animation: 'slideIn 200ms ease-out' }}
                  >
                    <div className="flex flex-col space-y-4">
                      <h3 className="text-sm font-medium text-gray-700">Filter shipments by date range</h3>
                      
                      <div className="flex flex-col space-y-1">
                        <label htmlFor="start-date" className="text-xs sm:text-sm font-medium text-gray-700">Start Date</label>
                        <input 
                          id="start-date"
                          type="date" 
                          className="border border-gray-300 rounded-md p-3 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex flex-col space-y-1">
                        <label htmlFor="end-date" className="text-xs sm:text-sm font-medium text-gray-700">End Date</label>
                        <input 
                          id="end-date"
                          type="date" 
                          className="border border-gray-300 rounded-md p-3 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex justify-between pt-4 gap-3">
                        <button 
                          className="flex-1 border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            setStartDate("");
                            setEndDate("");
                            setDateFilterActive(false);
                            setDateFilterOpen(false);
                          }}
                        >
                          Clear
                        </button>
                        <button 
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => {
                            if (startDate && endDate) {
                              setDateFilterActive(true);
                              setDateFilterOpen(false);
                              setCurrentPage(1);
                            }
                          }}
                          disabled={!startDate || !endDate}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reset Filters Button */}
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Shipment Table with Loading, Error, and Empty States */}
          <div className="overflow-x-auto">
            {/* Empty State - No Shipments */}
            {filteredAndSearchedPackages.length === 0 && (
              <div className="text-center py-10">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No shipments found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {statusFilter !== "all" ? "Try switching to a different status filter" : "No shipments match your search criteria"}
                </p>
                {searchTerm && (
                  <div className="mt-6">
                    <button
                      onClick={() => setSearchTerm("")}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Table - Only show when we have data */}
            {paginationData.totalItems > 0 && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tracking Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginationData.currentItems.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{pkg.trackingNumber}</div>
                        <div className="text-sm text-gray-500">{pkg.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pkg.clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 25" fill="none" className="inline-block">
                              <path d="M5.252 10.4487L16.912 4.89671C18.612 4.08671 20.386 5.86171 19.577 7.56271L14.025 19.2217C13.266 20.8147 10.966 20.7167 10.346 19.0637L9.32 16.3247C9.21975 16.0575 9.06347 15.8148 8.86167 15.613C8.65986 15.4112 8.41721 15.255 8.15 15.1547L5.41 14.1277C3.758 13.5077 3.659 11.2077 5.252 10.4487Z" stroke="#A3A3A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          {pkg.destination.city}, {pkg.destination.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pkg.description}</div>
                        <div className="text-sm text-gray-500">{pkg.packageType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(pkg.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderPriorityBadge(pkg.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(pkg.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          onClick={() => handleViewPackage(pkg)}
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {/* Pagination Controls */}
            {paginationData.totalItems > 0 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{paginationData.startIndex + 1}</span> to <span className="font-medium">{paginationData.endIndex}</span> of{" "}
                      <span className="font-medium">{paginationData.totalItems}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(paginationData.currentPage - 1)}
                        disabled={!paginationData.hasPreviousPage}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${paginationData.hasPreviousPage ? 'text-gray-500 hover:bg-gray-50 cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
                      >
                        <span className="sr-only">Previous</span>
                        &larr;
                      </button>
                      
                      {paginationData.pageNumbers.map((pageNum, idx) => {
                        const previousPage = paginationData.pageNumbers[idx - 1];
                        if (previousPage && pageNum - previousPage > 1) {
                          return (
                            <span key={`ellipsis-${pageNum}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              &hellip;
                            </span>
                          );
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border ${pageNum === paginationData.currentPage ? 'bg-blue-50 border-blue-500 text-blue-600 z-10' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} text-sm font-medium`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(paginationData.currentPage + 1)}
                        disabled={!paginationData.hasNextPage}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${paginationData.hasNextPage ? 'text-gray-500 hover:bg-gray-50 cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
                      >
                        <span className="sr-only">Next</span>
                        &rarr;
                      </button>
                    </nav>
                  </div>
                </div>
                
                {/* Mobile Pagination */}
                <div className="flex items-center justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(paginationData.currentPage - 1)}
                    disabled={!paginationData.hasPreviousPage}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${paginationData.hasPreviousPage ? 'bg-white text-gray-700 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    Previous
                  </button>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{paginationData.currentPage}</span> of <span className="font-medium">{paginationData.totalPages}</span>
                  </div>
                  <button
                    onClick={() => handlePageChange(paginationData.currentPage + 1)}
                    disabled={!paginationData.hasNextPage}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${paginationData.hasNextPage ? 'bg-white text-gray-700 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PACKAGE DETAILS POPUP */}
      {showPopup && selectedPackage && (
        <ShipmentHistoryPopup
          shipment={{
            id: selectedPackage.id,
            clientName: selectedPackage.clientName,
            destination: selectedPackage.destination.address || `${selectedPackage.destination.city}, ${selectedPackage.destination.country}`,
            status: mapPackageStatusToShipmentStatus(selectedPackage.status),
            date: new Date(selectedPackage.statusHistory[0]?.timestamp || Date.now()).toLocaleDateString(),
            weight: `${selectedPackage.weight} kg`,
            packageType: selectedPackage.packageType,
            value: `${selectedPackage.value} ${selectedPackage.currency}`,
            dimensions: `${selectedPackage.dimensions.length}x${selectedPackage.dimensions.width}x${selectedPackage.dimensions.height} cm`,
            description: selectedPackage.description,
            submittedTime: new Date(selectedPackage.statusHistory[0]?.timestamp || Date.now()).toLocaleTimeString(),
            requestId: selectedPackage.requestId
          }}
          isOpen={showPopup}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

/**
 * Generate mock packages for development and testing
 * TODO: Remove when actual API integration is complete
 * @returns Array of mock Package objects
 */
const generateMockPackages = (): Package[] => {
  const mockPackages: Package[] = [
    {
      // IDENTIFICATION
      id: 'PKG-001234',
      requestId: 'REQ-001234',
      trackingNumber: 'TT2024001234',
      barcode: undefined,
      
      // BASIC INFORMATION
      clientName: 'John Doe',
      clientId: 'CLI-001',
      clientEmail: 'john.doe@email.com',
      clientPhone: '+233-24-123-4567',
      
      // PACKAGE DETAILS
      description: 'Electronics - Laptop Computer',
      packageType: PackageType.ELECTRONICS,
      weight: 2.5,
      dimensions: { length: 40, width: 30, height: 5, volume: 6000 },
      value: 1200.00,
      currency: 'USD',
      
      // LOCATION INFORMATION
      origin: {
        latitude: 5.6037,
        longitude: -0.1870,
        address: 'Accra, Ghana',
        city: 'Accra',
        country: 'Ghana',
        region: 'Greater Accra',
        facilityType: FacilityTypeValues.WAREHOUSE,
        facilityName: '',
        state: undefined
      },
      destination: {
        latitude: 6.6885,
        longitude: -1.6244,
        address: 'Kumasi, Ghana',
        city: 'Kumasi',
        country: 'Ghana',
        region: 'Ashanti',
        facilityType: FacilityTypeValues.DELIVERY_HUB,
        facilityName: '',
        state: undefined
      },
      currentLocation: {
        latitude: 5.6037,
        longitude: -0.1870,
        address: 'Accra Sorting Facility',
        city: 'Accra',
        country: 'Ghana',
        region: 'Greater Accra',
        facilityType: FacilityTypeValues.SORTING_CENTER,
        facilityName: '',
        state: undefined
      },
      
      // STATUS AND TRACKING
      status: PackageStatus.PROCESSING,
      statusHistory: [],
      trackingPoints: [],
      
      // GROUP MANAGEMENT
      groupId: undefined,
      groupPosition: undefined,
      
      // TIMESTAMPS
      createdAt: '2024-01-15T08:30:00Z',
      updatedAt: '2024-01-15T10:15:00Z',
      estimatedDelivery: '2024-01-18T16:00:00Z',
      actualDelivery: undefined,
      
      // SPECIAL HANDLING
      priority: PackagePriority.HIGH,
      specialHandling: ['fragile'],
      fragile: true,
      temperatureSensitive: false,
      hazardous: false,
      
      // FINANCIAL
      shippingCost: 45.00,
      insuranceValue: 1200.00,
      paymentStatus: 'paid',
      paymentMethod: 'credit_card',
      
      // ADDITIONAL INFORMATION
      notes: 'Handle with care - expensive electronics',
      customerNotes: 'Please call before delivery',
      deliveryInstructions: 'Leave with security if not available',
      signatureRequired: true,
      
      // METADATA
      createdBy: 'admin@ttarius.com',
      lastModifiedBy: 'admin@ttarius.com',
      version: 1
    },
    {
      // IDENTIFICATION
      id: 'PKG-001235',
      requestId: 'REQ-001235',
      trackingNumber: 'TT2024001235',
      barcode: undefined,
      
      // BASIC INFORMATION
      clientName: 'Jane Smith',
      clientId: 'CLI-002',
      clientEmail: 'jane.smith@email.com',
      clientPhone: '+233-20-987-6543',
      
      // PACKAGE DETAILS
      description: 'Documents - Legal Papers',
      packageType: PackageType.DOCUMENT,
      weight: 0.5,
      dimensions: { length: 30, width: 21, height: 2, volume: 1260 },
      value: 50.00,
      currency: 'GHS',
      
      // LOCATION INFORMATION
      origin: {
        latitude: 6.6885,
        longitude: -1.6244,
        address: 'Kumasi, Ghana',
        city: 'Kumasi',
        country: 'Ghana',
        region: 'Ashanti',
        facilityType: FacilityTypeValues.CUSTOMER_LOCATION,
        facilityName: '',
        state: undefined
      },
      destination: {
        latitude: 5.6037,
        longitude: -0.1870,
        address: 'Accra, Ghana',
        city: 'Accra',
        country: 'Ghana',
        region: 'Greater Accra',
        facilityType: FacilityTypeValues.DELIVERY_HUB,
        facilityName: '',
        state: undefined
      },
      currentLocation: {
        latitude: 6.2084,
        longitude: -1.1575,
        address: 'Konongo Transit Hub',
        city: 'Konongo',
        country: 'Ghana',
        region: 'Ashanti',
        facilityType: FacilityTypeValues.TRANSIT_POINT,
        facilityName: '',
        state: undefined
      },
      
      // STATUS AND TRACKING
      status: PackageStatus.IN_TRANSIT,
      statusHistory: [],
      trackingPoints: [],
      
      // GROUP MANAGEMENT
      groupId: 'GRP-001',
      groupPosition: 1,
      
      // TIMESTAMPS
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-15T09:45:00Z',
      estimatedDelivery: '2024-01-16T12:00:00Z',
      actualDelivery: undefined,
      
      // SPECIAL HANDLING
      priority: PackagePriority.MEDIUM,
      specialHandling: [],
      fragile: false,
      temperatureSensitive: false,
      hazardous: false,
      
      // FINANCIAL
      shippingCost: 15.00,
      insuranceValue: undefined,
      paymentStatus: 'paid',
      paymentMethod: 'mobile_money',
      
      // ADDITIONAL INFORMATION
      notes: 'Express delivery requested',
      customerNotes: 'Urgent legal documents',
      deliveryInstructions: 'Office hours only',
      signatureRequired: true,
      
      // METADATA
      createdBy: 'staff@ttarius.com',
      lastModifiedBy: 'staff@ttarius.com',
      version: 2
    },
    {
      // IDENTIFICATION
      id: 'PKG-001236',
      requestId: 'REQ-001236',
      trackingNumber: 'TT2024001236',
      barcode: undefined,
      
      // BASIC INFORMATION
      clientName: 'Michael Johnson',
      clientId: 'CLI-003',
      clientEmail: 'michael.j@email.com',
      clientPhone: '+233-26-555-0123',
      
      // PACKAGE DETAILS
      description: 'Clothing - Fashion Items',
      packageType: PackageType.CLOTHING,
      weight: 1.2,
      dimensions: { length: 35, width: 25, height: 10, volume: 8750 },
      value: 200.00,
      currency: 'USD',
      
      // LOCATION INFORMATION
      origin: {
        latitude: 5.6037,
        longitude: -0.1870,
        address: 'Accra, Ghana',
        city: 'Accra',
        country: 'Ghana',
        region: 'Greater Accra',
        facilityType: FacilityTypeValues.WAREHOUSE,
        facilityName: '',
        state: undefined
      },
      destination: {
        latitude: 9.4034,
        longitude: -0.8424,
        address: 'Tamale, Ghana',
        city: 'Tamale',
        country: 'Ghana',
        region: 'Northern',
        facilityType: FacilityTypeValues.DELIVERY_HUB,
        facilityName: '',
        state: undefined
      },
      currentLocation: {
        latitude: 9.4034,
        longitude: -0.8424,
        address: 'Tamale Delivery Center',
        city: 'Tamale',
        country: 'Ghana',
        region: 'Northern',
        facilityType: FacilityTypeValues.DELIVERY_HUB,
        facilityName: '',
        state: undefined
      },
      
      // STATUS AND TRACKING
      status: PackageStatus.DELIVERED,
      statusHistory: [],
      trackingPoints: [],
      
      // GROUP MANAGEMENT
      groupId: 'GRP-002',
      groupPosition: 3,
      
      // TIMESTAMPS
      createdAt: '2024-01-10T11:15:00Z',
      updatedAt: '2024-01-13T15:30:00Z',
      estimatedDelivery: '2024-01-13T14:00:00Z',
      actualDelivery: '2024-01-13T15:30:00Z',
      
      // SPECIAL HANDLING
      priority: PackagePriority.LOW,
      specialHandling: [],
      fragile: false,
      temperatureSensitive: false,
      hazardous: false,
      
      // FINANCIAL
      shippingCost: 35.00,
      insuranceValue: 200.00,
      paymentStatus: 'paid',
      paymentMethod: 'bank_transfer',
      
      // ADDITIONAL INFORMATION
      notes: 'Delivered successfully',
      customerNotes: 'Birthday gift - please handle carefully',
      deliveryInstructions: 'Ring doorbell twice',
      signatureRequired: false,
      
      // METADATA
      createdBy: 'admin@ttarius.com',
      lastModifiedBy: 'delivery@ttarius.com',
      version: 4
    }
  ];

  return mockPackages;
};

export default ShipmentHistory;
