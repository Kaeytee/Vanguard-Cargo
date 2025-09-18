import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Archive,
  Edit3,
  Pause,
  DollarSign,
  X,
  Plus,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "../../components/SEO";
import { PackageEditModal } from "../../components/PackageEditModal";
import { packageService, type PackageWithDetails } from "../../services/packageService";
import { useAuth } from "../../hooks/useAuth";

/**
 * Package Intake - Professional package management interface
 * 
 * This component provides a streamlined workflow for managing incoming packages
 * at the warehouse, allowing users to quickly review, approve, consolidate, or
 * take custom actions on their packages.
 * 
 * Features:
 * - Real-time package status updates
 * - Quick action buttons for common workflows
 * - Bulk selection and consolidation
 * - Professional card-based layout
 * - Mobile-optimized interface
 * - Accessibility support
 */

// Types for package data - extending the database type
export interface IncomingPackage extends PackageWithDetails {
  storeName?: string;
  storeLogoUrl?: string;
  packagePhotos?: string[];
  barcode?: string;
  arrivalTime?: string;
  estimatedWeight?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  description: string;
  value?: number;
  status: 'arrived' | 'ready_for_review' | 'pending_action' | 'approved' | 'consolidated' | 'on_hold';
  priority: 'standard' | 'express' | 'urgent';
  fragile?: boolean;
  requiresInspection?: boolean;
  notes?: string;
  originAddress?: string;
}

interface ConsolidationGroup {
  id: string;
  packages: IncomingPackage[];
  estimatedSavings: number;
  totalWeight: string;
  shippingCost: number;
}

// Mock data for development


export default function PackageIntake() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // const { t } = useTranslation(); // Commented out - not currently used
  
  // State management
  const [packages, setPackages] = useState<IncomingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  const [showConsolidationModal, setShowConsolidationModal] = useState(false);
  const [consolidationGroups, setConsolidationGroups] = useState<ConsolidationGroup[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'arrival_date' | 'priority' | 'store'>('arrival_date');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<IncomingPackage | null>(null);

  // Load packages on component mount
  useEffect(() => {
    const loadPackages = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await packageService.getIncomingPackages(user.id);
        
        if (response.error) {
          setError("Failed to load packages. Please try again.");
          console.error("Error loading packages:", response.error);
        } else {
          // Transform Supabase data to match component interface
          const transformedPackages: IncomingPackage[] = response.data.map(pkg => ({
            id: pkg.id,
            user_id: pkg.user_id,
            tracking_number: pkg.tracking_number,
            trackingNumber: pkg.tracking_number, // Legacy field
            sender_name: pkg.sender_name,
            sender_email: pkg.sender_email,
            sender_phone: pkg.sender_phone,
            declared_value: pkg.declared_value,
            weight_lbs: pkg.weight_lbs,
            length_in: pkg.length_in,
            width_in: pkg.width_in,
            height_in: pkg.height_in,
            billable_weight_lbs: pkg.billable_weight_lbs,
            status: (pkg.status as "arrived" | "ready_for_review" | "pending_action" | "approved" | "consolidated" | "on_hold") || "arrived",
            warehouse_id: pkg.warehouse_id,
            storage_fee_accumulated: pkg.storage_fee_accumulated,
            created_at: pkg.created_at,
            updated_at: pkg.updated_at,
            arrivalDate: pkg.created_at ? new Date(pkg.created_at).toISOString().split('T')[0] : '',
            arrivalTime: pkg.created_at ? new Date(pkg.created_at).toLocaleTimeString() : '',
            estimatedWeight: pkg.weight_lbs ? `${pkg.weight_lbs} lbs` : 'Unknown',
            storeName: pkg.sender_name || 'Unknown Store',
            dimensions: pkg.length_in && pkg.width_in && pkg.height_in ? {
              length: pkg.length_in,
              width: pkg.width_in,
              height: pkg.height_in
            } : undefined,
            value: pkg.declared_value || 0,
            priority: 'standard' as const,
            fragile: false, // Default value
            originAddress: 'Unknown', // Default value
            notes: '', // Default value
            description: 'Package', // Default value
            packagePhotos: [], // Default value
            storeLogoUrl: undefined
          }));
          
          setPackages(transformedPackages);
          setError(null);
        }
      } catch (err) {
        setError("Failed to load packages. Please try again.");
        console.error("Error loading packages:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, [user?.id]);

  // Filter and sort packages
  const filteredAndSortedPackages = useMemo(() => {
    let filtered = packages;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = packages.filter(pkg => pkg.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'arrival_date':
          return new Date(b.arrivalTime || '').getTime() - new Date(a.arrivalTime || '').getTime();
        case 'priority': {
          const priorityOrder = { urgent: 3, express: 2, standard: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case 'store':
          return (a.storeName || '').localeCompare(b.storeName || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [packages, filterStatus, sortBy]);

  // Status counts for filter tabs
  const statusCounts = useMemo(() => {
    return {
      all: packages.length,
      arrived: packages.filter(p => p.status === 'arrived').length,
      ready_for_review: packages.filter(p => p.status === 'ready_for_review').length,
      pending_action: packages.filter(p => p.status === 'pending_action').length,
      approved: packages.filter(p => p.status === 'approved').length,
      on_hold: packages.filter(p => p.status === 'on_hold').length
    };
  }, [packages]);

  // Handle package selection
  const togglePackageSelection = useCallback((packageId: string) => {
    setSelectedPackages(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(packageId)) {
        newSelection.delete(packageId);
      } else {
        newSelection.add(packageId);
      }
      setShowBulkActions(newSelection.size > 0);
      return newSelection;
    });
  }, []);

  // Select all packages
  const selectAllPackages = useCallback(() => {
    const allIds = new Set(filteredAndSortedPackages.map(p => p.id));
    setSelectedPackages(allIds);
    setShowBulkActions(allIds.size > 0);
  }, [filteredAndSortedPackages]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedPackages(new Set());
    setShowBulkActions(false);
  }, []);

  // Package actions
  const approveShipment = useCallback(async (packageId: string) => {
    setActionInProgress(packageId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPackages(prev => prev.map(pkg => 
        pkg.id === packageId 
          ? { ...pkg, status: 'approved' as const }
          : pkg
      ));
      
      // Show success notification (you can integrate with your notification system)
      console.log(`Package ${packageId} approved for shipment`);
    } catch (err) {
      console.error("Error approving shipment:", err);
    } finally {
      setActionInProgress(null);
    }
  }, []);

  const holdAtWarehouse = useCallback(async (packageId: string) => {
    setActionInProgress(packageId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPackages(prev => prev.map(pkg => 
        pkg.id === packageId 
          ? { ...pkg, status: 'on_hold' as const }
          : pkg
      ));
      
      console.log(`Package ${packageId} placed on hold`);
    } catch (err) {
      console.error("Error holding package:", err);
    } finally {
      setActionInProgress(null);
    }
  }, []);

  const startConsolidation = useCallback(() => {
    if (selectedPackages.size < 2) {
      alert("Please select at least 2 packages to consolidate");
      return;
    }
    
    const selectedPkgs = packages.filter(p => selectedPackages.has(p.id));
    const consolidationGroup: ConsolidationGroup = {
      id: `CONSOL_${Date.now()}`,
      packages: selectedPkgs,
      estimatedSavings: 15.50, // Mock calculation
      totalWeight: "4.5 lbs", // Mock calculation
      shippingCost: 45.99 // Mock calculation
    };
    
    setConsolidationGroups([consolidationGroup]);
    setShowConsolidationModal(true);
  }, [selectedPackages, packages]);

  const handleEditPackage = useCallback((pkg: IncomingPackage) => {
    setEditingPackage(pkg);
    setShowEditModal(true);
  }, []);

  const handleSavePackage = useCallback((updatedPackage: IncomingPackage) => {
    setPackages(prev => prev.map(pkg => 
      pkg.id === updatedPackage.id ? updatedPackage : pkg
    ));
    setShowEditModal(false);
    setEditingPackage(null);
  }, []);

  // Get status badge styling
  const getStatusBadge = (status: IncomingPackage['status']) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'arrived':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'ready_for_review':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'pending_action':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'on_hold':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get priority badge styling
  const getPriorityBadge = (priority: IncomingPackage['priority']) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded text-xs font-medium";
    
    switch (priority) {
      case 'urgent':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'express':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'standard':
        return `${baseClasses} bg-gray-100 text-gray-600`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your packages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load packages</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Package Intake - Vanguard Cargo"
        description="Review and manage your incoming packages at our warehouse. Quick actions for shipment approval, consolidation, and more."
      />

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Package Intake</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Review and manage packages that have arrived at our warehouse
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{statusCounts.all}</div>
                  <div className="text-xs text-gray-500">Total Packages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{statusCounts.pending_action}</div>
                  <div className="text-xs text-gray-500">Need Action</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{statusCounts.approved}</div>
                  <div className="text-xs text-gray-500">Approved</div>
                </div>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="mt-6">
              <nav className="flex space-x-8 overflow-x-auto">
                {[
                  { key: 'all', label: 'All Packages', count: statusCounts.all },
                  { key: 'arrived', label: 'Just Arrived', count: statusCounts.arrived },
                  { key: 'ready_for_review', label: 'Ready for Review', count: statusCounts.ready_for_review },
                  { key: 'pending_action', label: 'Pending Action', count: statusCounts.pending_action },
                  { key: 'approved', label: 'Approved', count: statusCounts.approved },
                  { key: 'on_hold', label: 'On Hold', count: statusCounts.on_hold }
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilterStatus(key)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      filterStatus === key
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {label}
                    {count > 0 && (
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        filterStatus === key
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="arrival_date">Sort by Arrival Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="store">Sort by Store</option>
              </select>

              {/* Selection controls */}
              {filteredAndSortedPackages.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={selectAllPackages}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Select All
                  </button>
                  {selectedPackages.size > 0 && (
                    <button
                      onClick={clearSelection}
                      className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bulk actions */}
            <AnimatePresence>
              {showBulkActions && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center space-x-2"
                >
                  <span className="text-sm text-gray-600">
                    {selectedPackages.size} selected
                  </span>
                  <button
                    onClick={startConsolidation}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Archive className="w-4 h-4 mr-1" />
                    Consolidate
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredAndSortedPackages.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No packages found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterStatus === 'all' 
                ? "You don't have any packages at the warehouse right now."
                : `No packages with status "${filterStatus.replace('_', ' ')}" found.`
              }
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/app/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit New Request
              </button>
            </div>
          </div>
        ) : (
          /* Package Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                isSelected={selectedPackages.has(pkg.id)}
                onToggleSelection={() => togglePackageSelection(pkg.id)}
                onApproveShipment={() => approveShipment(pkg.id)}
                onHoldAtWarehouse={() => holdAtWarehouse(pkg.id)}
                onEditDetails={() => handleEditPackage(pkg)}
                isActionInProgress={actionInProgress === pkg.id}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Consolidation Modal */}
      <ConsolidationModal
        isOpen={showConsolidationModal}
        onClose={() => setShowConsolidationModal(false)}
        consolidationGroups={consolidationGroups}
        onConfirmConsolidation={() => {
          // Handle consolidation confirmation
          setShowConsolidationModal(false);
          clearSelection();
        }}
      />

      {/* Package Edit Modal */}
      <PackageEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPackage(null);
        }}
        package={editingPackage}
        onSave={handleSavePackage}
      />
    </div>
  );
}

// Package Card Component
interface PackageCardProps {
  package: IncomingPackage;
  isSelected: boolean;
  onToggleSelection: () => void;
  onApproveShipment: () => void;
  onHoldAtWarehouse: () => void;
  onEditDetails: () => void;
  isActionInProgress: boolean;
  getStatusBadge: (status: IncomingPackage['status']) => string;
  getPriorityBadge: (priority: IncomingPackage['priority']) => string;
  formatDate: (date: string) => string;
}

const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  isSelected,
  onToggleSelection,
  onApproveShipment,
  onHoldAtWarehouse,
  onEditDetails,
  isActionInProgress,
  getStatusBadge,
  getPriorityBadge,
  formatDate
}) => {
  const [showPhotos, setShowPhotos] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 ${
        isSelected 
          ? 'border-red-500 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Package Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Selection checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelection}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            
            {/* Store info */}
            <div className="flex items-center space-x-2">
              {pkg.storeLogoUrl && (
                <img
                  src={pkg.storeLogoUrl}
                  alt={pkg.storeName}
                  className="w-8 h-8 rounded object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/store-placeholder.png';
                  }}
                />
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-900">{pkg.storeName}</h3>
                <p className="text-xs text-gray-500">{pkg.tracking_number}</p>
              </div>
            </div>
          </div>

          {/* Status and priority badges */}
          <div className="flex flex-col items-end space-y-1">
            <span className={getStatusBadge(pkg.status)}>
              {pkg.status.replace('_', ' ')}
            </span>
            <span className={getPriorityBadge(pkg.priority)}>
              {pkg.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Package Details */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Package photo */}
          {pkg.packagePhotos && pkg.packagePhotos.length > 0 && (
            <div className="relative">
              <img
                src={pkg.packagePhotos?.[0] || ''}
                alt="Package"
                className="w-full h-32 object-cover rounded-md cursor-pointer"
                onClick={() => setShowPhotos(true)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/package-placeholder.png';
                }}
              />
              {pkg.packagePhotos && pkg.packagePhotos.length > 1 && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  +{(pkg.packagePhotos?.length || 1) - 1} more
                </div>
              )}
              <button
                onClick={() => setShowPhotos(true)}
                className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-md flex items-center justify-center"
              >
                <Eye className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
              </button>
            </div>
          )}

          {/* Package info */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">{pkg.description}</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(pkg.arrivalTime || pkg.created_at)}
              </div>
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {pkg.arrivalTime}
              </div>
              <div className="flex items-center">
                <Package className="w-3 h-3 mr-1" />
                {pkg.estimatedWeight}
              </div>
              {pkg.value && (
                <div className="flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  ${pkg.value}
                </div>
              )}
            </div>
          </div>

          {/* Special indicators */}
          {(pkg.fragile || pkg.requiresInspection) && (
            <div className="flex space-x-2">
              {pkg.fragile && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Fragile
                </span>
              )}
              {pkg.requiresInspection && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Inspection Required
                </span>
              )}
            </div>
          )}

          {/* Notes */}
          {pkg.notes && (
            <div className="bg-gray-50 rounded-md p-2">
              <p className="text-xs text-gray-600">{pkg.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onApproveShipment}
            disabled={isActionInProgress || pkg.status === 'approved'}
            className="flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isActionInProgress ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                {pkg.status === 'approved' ? 'Approved' : 'Approve'}
              </>
            )}
          </button>
          
          <button
            onClick={onHoldAtWarehouse}
            disabled={isActionInProgress || pkg.status === 'on_hold'}
            className="flex items-center justify-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pkg.status === 'on_hold' ? (
              <>
                <Pause className="w-3 h-3 mr-1" />
                On Hold
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 mr-1" />
                Hold
              </>
            )}
          </button>
        </div>
        
        <button
          onClick={onEditDetails}
          className="w-full mt-2 flex items-center justify-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <Edit3 className="w-3 h-3 mr-1" />
          Edit Details
        </button>
      </div>

      {/* Photo Modal */}
      <PhotoModal
        isOpen={showPhotos}
        onClose={() => setShowPhotos(false)}
        photos={pkg.packagePhotos || []}
        packageId={pkg.id}
      />
    </motion.div>
  );
};

// Photo Modal Component
interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: string[];
  packageId: string;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ isOpen, onClose, photos, packageId }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentPhotoIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Package Photos - {packageId}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="relative">
          <img
            src={photos[currentPhotoIndex]}
            alt={`Package photo ${currentPhotoIndex + 1}`}
            className="w-full h-96 object-contain bg-gray-50"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/package-placeholder.png';
            }}
          />
          
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setCurrentPhotoIndex(prev => prev > 0 ? prev - 1 : photos.length - 1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-2 transition-all"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentPhotoIndex(prev => prev < photos.length - 1 ? prev + 1 : 0)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-2 transition-all"
              >
                →
              </button>
            </>
          )}
        </div>
        
        {photos.length > 1 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2 overflow-x-auto">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 transition-all ${
                    index === currentPhotoIndex 
                      ? 'border-red-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/package-placeholder.png';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Consolidation Modal Component
interface ConsolidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  consolidationGroups: ConsolidationGroup[];
  onConfirmConsolidation: () => void;
}

const ConsolidationModal: React.FC<ConsolidationModalProps> = ({ 
  isOpen, 
  onClose, 
  consolidationGroups, 
  onConfirmConsolidation 
}) => {
  if (!isOpen || consolidationGroups.length === 0) return null;

  const group = consolidationGroups[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Consolidate Packages</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Consolidation Summary */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                Estimated Savings: ${group.estimatedSavings}
              </span>
            </div>
            <div className="mt-2 text-sm text-green-700">
              By consolidating {group.packages.length} packages, you'll save on shipping costs!
            </div>
          </div>

          {/* Package List */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Packages to Consolidate</h4>
            <div className="space-y-2">
              {group.packages.map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <Package className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pkg.storeName}</div>
                      <div className="text-xs text-gray-500">{pkg.description}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{pkg.estimatedWeight}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Weight
              </label>
              <div className="text-lg font-medium text-gray-900">{group.totalWeight}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Cost
              </label>
              <div className="text-lg font-medium text-gray-900">${group.shippingCost}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmConsolidation}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors"
          >
            Confirm Consolidation
          </button>
        </div>
      </div>
    </div>
  );
};

