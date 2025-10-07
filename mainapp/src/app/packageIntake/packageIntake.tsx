import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Package,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit3,
  DollarSign,
  X,
  Eye,
  Copy,
  Lock,
  PackageCheck
} from "lucide-react";
import { motion } from "framer-motion";
import SEO from "../../components/SEO";
import { PackageEditModal } from "../../components/PackageEditModal";
import { packageService, type PackageWithDetails } from "../../services/packageService";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { formatDate, formatTime } from "../../utils/dateUtils";
import { usePackageRealtime } from "../../hooks/useRealtime";
import { notificationService } from "../../services/notificationService";
import { deliveryCodeService, type DeliveryCode } from "../../services/deliveryCodeService";

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
  value?: number;
  status: 'pending' | 'received' | 'processing' | 'shipped' | 'in_transit' | 'arrived' | 'delivered' | 'ready_for_review' | 'pending_action' | 'approved' | 'consolidated' | 'on_hold';
  priority: 'standard' | 'express' | 'urgent';
  fragile?: boolean;
  requiresInspection?: boolean;
  originAddress?: string;
}

// Removed ConsolidationGroup interface - no longer needed

// Mock data for development


export default function PackageIntake() {
  const { user } = useAuth();
  // const { t } = useTranslation(); // Commented out - not currently used
  
  // State management
  const [packages, setPackages] = useState<IncomingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Removed selection and consolidation functionality
  // Removed filtering and sorting - package intake now shows all packages
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<IncomingPackage | null>(null);
  
  // Delivery codes state
  const [deliveryCodes, setDeliveryCodes] = useState<DeliveryCode[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Transform database package to UI package format
  const transformPackageData = useCallback((pkg: any): IncomingPackage => ({
    // Copy all base package fields
    ...pkg,
    // Map database status to component status
    status: (pkg.status as IncomingPackage['status']) || 'received',
    // Add UI-specific fields with proper date handling
    arrivalTime: formatTime(pkg.intake_date || pkg.created_at),
    estimatedWeight: pkg.weight_lbs ? `${pkg.weight_lbs.toFixed(2)} lbs` : 'Unknown',
    storeName: pkg.store_name || pkg.sender_name || 'Unknown Store',
    dimensions: pkg.length_in && pkg.width_in && pkg.height_in ? {
      length: pkg.length_in,
      width: pkg.width_in,
      height: pkg.height_in
    } : undefined,
    value: pkg.declared_value || 0,
    priority: 'standard' as const,
    fragile: false, // Default value
    originAddress: 'Unknown', // Default value
    packagePhotos: [], // Default value
    storeLogoUrl: undefined,
  }), []);

  // Load packages and delivery codes on component mount
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
          const transformedPackages: IncomingPackage[] = response.data.map(transformPackageData);
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
  }, [user?.id, transformPackageData]);

  // Load delivery codes for packages ready for pickup
  useEffect(() => {
    const loadDeliveryCodes = async () => {
      if (!user?.id) return;

      try {
        setLoadingCodes(true);
        const response = await deliveryCodeService.getCustomerDeliveryCodes(user.id);
        
        if (response.success && response.data) {
          setDeliveryCodes(response.data);
          console.log('📦 Loaded delivery codes:', response.data.length);
        } else {
          console.error('Failed to load delivery codes:', response.error);
        }
      } catch (err) {
        console.error('Error loading delivery codes:', err);
      } finally {
        setLoadingCodes(false);
      }
    };

    loadDeliveryCodes();
  }, [user?.id]);

  // Real-time subscription for package updates using the custom hook
  const { isConnected } = usePackageRealtime({
    onInsert: useCallback((newPackageData: any) => {
      const newPackage = transformPackageData(newPackageData);
      setPackages(prev => [newPackage, ...prev]);
      console.log('New package added via real-time:', newPackage.package_id);
    }, [transformPackageData]),
    
    onUpdate: useCallback((updatedPackageData: any) => {
      const updatedPackage = transformPackageData(updatedPackageData);
      setPackages(prev => 
        prev.map(pkg => 
          pkg.id === updatedPackage.id ? updatedPackage : pkg
        )
      );
      console.log('Package updated via real-time:', updatedPackage.package_id);
    }, [transformPackageData]),
    
    onDelete: useCallback((deletedPackageData: any) => {
      setPackages(prev => 
        prev.filter(pkg => pkg.id !== deletedPackageData.id)
      );
      console.log('Package deleted via real-time:', deletedPackageData.package_id);
    }, [])
  });

  // Show all packages without filtering - sorted by arrival date (newest first)
  const displayedPackages = useMemo(() => {
    return packages.sort((a, b) => {
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
  }, [packages]);

  // Package count for display
  const packageCount = packages.length;

  // Removed package selection functionality - simplified interface

  // Package actions - Process package (change status from pending to received)
  const approveShipment = useCallback(async (packageId: string) => {
    setActionInProgress(packageId);
    try {
      // Get current package details before updating for notification
      const { data: currentPackage, error: fetchError } = await supabase
        .from('packages')
        .select('user_id, status, store_name, tracking_number, package_id, description')
        .eq('id', packageId)
        .single();

      if (fetchError || !currentPackage) {
        console.error("Error fetching package details:", fetchError);
        setError("Failed to fetch package details. Please try again.");
        return;
      }

      const oldStatus = currentPackage.status;
      const newStatus = 'received';

      // Direct database update without complex validation
      // Change status from 'pending' to 'received' when package is physically scanned
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('packages')
        .update({
          status: newStatus,
          intake_date: now,
          updated_at: now,
        })
        .eq('id', packageId)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating package status:", error);
        setError("Failed to process package. Please try again.");
        return;
      }

      // Send notification to user about status change
      try {
        await notificationService.createPackageStatusNotification(
          currentPackage.user_id,
          currentPackage.package_id || packageId,
          {
            storeName: currentPackage.store_name,
            trackingNumber: currentPackage.tracking_number,
            description: currentPackage.description
          },
          oldStatus,
          newStatus
        );
        console.log(`📧 Notification sent to user ${currentPackage.user_id} for package status change: ${oldStatus} → ${newStatus}`);
      } catch (notificationError) {
        console.error("Error sending notification:", notificationError);
        // Don't fail the entire operation if notification fails
      }
      
      // Real-time subscription will automatically update the UI
      // No need to manually update local state - real-time will handle it
      console.log(`Package ${packageId} status updated to ${newStatus} - real-time will sync UI`);
    } catch (err) {
      console.error("Error processing package:", err);
      setError("Failed to process package. Please try again.");
    } finally {
      setActionInProgress(null);
    }
  }, []);


  // Removed consolidation functionality

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

  // Copy delivery code to clipboard
  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }).catch((err) => {
      console.error('Failed to copy code:', err);
    });
  }, []);

  // Get status badge styling
  const getStatusBadge = (status: IncomingPackage['status']) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'received':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'processing':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'shipped':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'delivered':
        return `${baseClasses} bg-green-100 text-green-800`;
      // Legacy statuses for compatibility
      case 'arrived':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'ready_for_review':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'pending_action':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'consolidated':
        return `${baseClasses} bg-purple-100 text-purple-800`;
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

  // Date formatting is now handled by imported utility functions

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your packages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
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
    <div className="min-h-screen bg-transparent">
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
              
              {/* Package Count and Real-time Status */}
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{packageCount}</div>
                  <div className="text-xs text-gray-500">Total Packages</div>
                </div>
                
                {/* Real-time Connection Status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-500">
                    {isConnected ? 'Live Updates' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Simplified header - no filters */}
          </div>
        </div>
      </div>
      {/* Removed controls bar - no filtering or sorting needed */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Delivery Codes Section - Ready for Pickup */}
        {loadingCodes ? (
          /* Loading State for Delivery Codes */
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Checking for packages ready for pickup...</p>
                </div>
              </div>
            </div>
          </div>
        ) : deliveryCodes.length > 0 ? (
          /* Delivery Codes Display */
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <PackageCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">📦 Packages Ready for Pickup</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {deliveryCodes.length} {deliveryCodes.length === 1 ? 'package' : 'packages'} waiting for you at the warehouse
                    </p>
                  </div>
                </div>
                <div className="hidden md:block bg-green-600 text-white px-4 py-2 rounded-lg text-center">
                  <div className="text-2xl font-bold">{deliveryCodes.length}</div>
                  <div className="text-xs">Ready</div>
                </div>
              </div>

              {/* Delivery Codes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deliveryCodes.map((deliveryCode) => (
                  <DeliveryCodeCard
                    key={deliveryCode.package_id}
                    deliveryCode={deliveryCode}
                    onCopyCode={handleCopyCode}
                    isCopied={copiedCode === deliveryCode.delivery_code}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Regular Packages Section */}
        {displayedPackages.length === 0 ? (
          /* Empty State */
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-lg py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No packages found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No packages have arrived at our warehouse yet.
            </p>
          </div>
        ) : (
          /* Package Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                isSelected={false}
                onToggleSelection={() => {}}
                onApproveShipment={() => approveShipment(pkg.id)}
                onEditDetails={() => handleEditPackage(pkg)}
                isActionInProgress={actionInProgress === pkg.id}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
              />
            ))}
          </div>
        )}
      </div>

      {/* Removed consolidation modal */}

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
  onEditDetails: () => void;
  isActionInProgress: boolean;
  getStatusBadge: (status: IncomingPackage['status']) => string;
  getPriorityBadge: (priority: IncomingPackage['priority']) => string;
}

const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  isSelected,
  onToggleSelection,
  onApproveShipment,
  onEditDetails,
  isActionInProgress,
  getStatusBadge,
  getPriorityBadge
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
                <p className="text-xs text-gray-500">Package ID: {pkg.package_id}</p>
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
                {formatDate(pkg.intake_date || pkg.created_at)}
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
        <button
          onClick={onApproveShipment}
          disabled={isActionInProgress || pkg.status !== 'pending'}
          className="w-full flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isActionInProgress ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              {pkg.status === 'pending' ? 'Scan & Receive' : 
               pkg.status === 'received' ? 'Received' :
               pkg.status === 'processing' ? 'Processing' : 
               pkg.status === 'shipped' ? 'Shipped' : 
               pkg.status === 'in_transit' ? 'In Transit' :
               pkg.status === 'arrived' ? 'Arrived' : 
               pkg.status === 'delivered' ? 'Delivered' : 
               pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)}
            </>
          )}
        </button>
        
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
        packageId={pkg.package_id}
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
          <h3 className="text-lg font-medium text-gray-900">Package Photos - Package ID: {packageId}</h3>
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

// Removed ConsolidationModal component - simplified interface

// Delivery Code Card Component
interface DeliveryCodeCardProps {
  deliveryCode: DeliveryCode;
  onCopyCode: (code: string) => void;
  isCopied: boolean;
}

const DeliveryCodeCard: React.FC<DeliveryCodeCardProps> = ({
  deliveryCode,
  onCopyCode,
  isCopied
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-md border-2 border-green-200 p-5 hover:shadow-lg transition-all"
    >
      {/* Package Information */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {deliveryCode.package_id}
            </h3>
            <p className="text-xs text-gray-500">
              Tracking: {deliveryCode.tracking_number}
            </p>
          </div>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {deliveryCode.status}
          </span>
        </div>
        
        {deliveryCode.description && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
            {deliveryCode.description}
          </p>
        )}
        
        {deliveryCode.shipment_tracking && (
          <p className="text-xs text-gray-500 mt-2">
            Shipment: {deliveryCode.shipment_tracking}
          </p>
        )}
      </div>

      {/* Delivery Code Display */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Lock className="h-4 w-4 text-green-600" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Your Delivery Code
          </span>
        </div>
        
        <div className="relative">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white tracking-wider font-mono">
              {deliveryCode.delivery_code}
            </div>
          </div>
          
          {/* Copy Button */}
          <button
            onClick={() => onCopyCode(deliveryCode.delivery_code)}
            className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 text-white p-2 rounded transition-colors"
            title="Copy code"
          >
            <Copy className="h-4 w-4" />
          </button>
          
          {/* Copied Indicator */}
          {isCopied && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded shadow-lg">
              Copied!
            </div>
          )}
        </div>
      </div>

      {/* Warning Message */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800">
            <span className="font-semibold">Important:</span> Show this code to warehouse staff for package pickup
          </p>
        </div>
      </div>

      {/* Generated Date */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Generated:</span>
          </div>
          <span>{formatDate(deliveryCode.generated_at)} at {formatTime(deliveryCode.generated_at)}</span>
        </div>
        
        {deliveryCode.expires_at && (
          <div className="flex items-center justify-between text-xs text-red-600 mt-1">
            <span>Expires:</span>
            <span>{formatDate(deliveryCode.expires_at)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

