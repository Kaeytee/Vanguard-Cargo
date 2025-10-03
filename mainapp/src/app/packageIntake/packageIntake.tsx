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
  Eye
} from "lucide-react";
import { motion } from "framer-motion";
import SEO from "../../components/SEO";
import { PackageEditModal } from "../../components/PackageEditModal";
import { packageService, type PackageWithDetails } from "../../services/packageService";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

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
            // Copy all base package fields
            ...pkg,
            // Map database status to component status
            status: (pkg.status as IncomingPackage['status']) || 'received',
            // Add UI-specific fields
            arrivalTime: pkg.created_at ? new Date(pkg.created_at).toLocaleTimeString() : '',
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
      // Direct database update without complex validation
      // Change status from 'pending' to 'received' when package is physically scanned
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('packages')
        .update({
          status: 'received',
          received_at: now,
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
      
      // Update local state with the new status
      setPackages(prev => prev.map(pkg => 
        pkg.id === packageId 
          ? { ...pkg, status: 'received' as const }
          : pkg
      ));
      
      console.log(`Package ${packageId} status updated to received`);
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
              
              {/* Package Count */}
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{packageCount}</div>
                  <div className="text-xs text-gray-500">Total Packages</div>
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
                formatDate={formatDate}
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
  formatDate: (date: string) => string;
}

const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  isSelected,
  onToggleSelection,
  onApproveShipment,
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

// Removed ConsolidationModal component - simplified interface

