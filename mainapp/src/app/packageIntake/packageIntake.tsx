import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Package,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit3,
  X,
  Eye,
  Copy,
  Lock,
  PackageCheck,
  Box,
  CircleDot
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

  // Pagination state for performance optimization
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 15; // Load 15 packages at a time (lightweight - ~1-2MB)

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

  // Load initial packages with pagination (optimized for fast loading)
  useEffect(() => {
    let isMounted = true;
    
    const loadPackages = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          if (isMounted) {
            setLoading(false);
            setError("Loading is taking longer than expected. Please refresh the page.");
          }
        }, 10000); // 10 second timeout

        // Load ONLY first page (15 packages) for fast initial load
        const offset = 0;
        const response = await packageService.getIncomingPackages(user.id, PAGE_SIZE, offset);
        
        clearTimeout(timeoutId);
        
        if (!isMounted) return;
        
        if (response.error) {
          setError("Failed to load packages. Please try again.");
        } else {
          // Transform Supabase data to match component interface
          const transformedPackages: IncomingPackage[] = response.data.map(transformPackageData);
          setPackages(transformedPackages);
          setTotalCount(response.count || 0);
          setHasMore(transformedPackages.length >= PAGE_SIZE);
          setError(null);
          
          console.log(`✅ Loaded ${transformedPackages.length} packages (Page 1 of ${Math.ceil((response.count || 0) / PAGE_SIZE)})`);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load packages. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPackages();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id, transformPackageData, PAGE_SIZE]);

  // Load more packages (lazy loading)
  const loadMorePackages = useCallback(async () => {
    if (!user?.id || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const offset = currentPage * PAGE_SIZE;

      console.log(`📦 Loading more packages (Page ${nextPage})...`);

      const response = await packageService.getIncomingPackages(user.id, PAGE_SIZE, offset);

      if (response.error) {
        console.error('Error loading more packages:', response.error);
        return;
      }

      const transformedPackages: IncomingPackage[] = response.data.map(transformPackageData);
      
      if (transformedPackages.length > 0) {
        setPackages(prev => [...prev, ...transformedPackages]);
        setCurrentPage(nextPage);
        setHasMore(transformedPackages.length >= PAGE_SIZE);
        console.log(`✅ Loaded ${transformedPackages.length} more packages (Total: ${packages.length + transformedPackages.length})`);
      } else {
        setHasMore(false);
        console.log('📭 No more packages to load');
      }
    } catch (err) {
      console.error('Failed to load more packages:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [user?.id, currentPage, PAGE_SIZE, hasMore, loadingMore, transformPackageData, packages.length]);

  // Load delivery codes for packages ready for pickup
  useEffect(() => {
    const loadDeliveryCodes = async () => {
      if (!user?.id) {
        return;
      }

      try {
        setLoadingCodes(true);
        const response = await deliveryCodeService.getCustomerDeliveryCodes(user.id);
        
        if (response.success && response.data) {
          setDeliveryCodes(response.data);
        }
      } catch (err) {
        // Error handled silently
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
    }, [transformPackageData]),
    
    onUpdate: useCallback((updatedPackageData: any) => {
      const updatedPackage = transformPackageData(updatedPackageData);
      setPackages(prev => 
        prev.map(pkg => 
          pkg.id === updatedPackage.id ? updatedPackage : pkg
        )
      );
    }, [transformPackageData]),
    
    onDelete: useCallback((deletedPackageData: any) => {
      setPackages(prev => 
        prev.filter(pkg => pkg.id !== deletedPackageData.id)
      );
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
      } catch (notificationError) {
        // Don't fail the entire operation if notification fails
      }
      
      // Real-time subscription will automatically update the UI
      // No need to manually update local state - real-time will handle it
    } catch (err) {
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
    }).catch(() => {
      // Failed to copy
    });
  }, []);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-red-600 mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
        >
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load packages</h3>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Package Intake - Vanguard Cargo"
        description="Review and manage your incoming packages at our warehouse. Quick actions for shipment approval, consolidation, and more."
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Apple-Style Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 mb-4 tracking-tight">
            Package Intake
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
            Review and manage packages that have arrived at our warehouse
          </p>
        </motion.div>

        {/* Stats Section */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* Package Count */}
          <div className="text-center px-5 py-3 bg-gradient-to-br from-red-50/80 to-rose-50/80 backdrop-blur-sm rounded-2xl border border-red-200/50 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{packageCount}</div>
            <div className="text-xs text-gray-600 font-semibold">Packages</div>
          </div>
          
          {/* Real-time Status */}
          <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm rounded-2xl border border-red-200/50 shadow-sm">
            <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-xs font-semibold text-gray-700">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
        {/* Delivery Codes Section - Ready for Pickup */}
        {loadingCodes ? (
          /* Loading State for Delivery Codes */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-green-600 mx-auto mb-3"></div>
                  <p className="text-sm font-medium text-gray-600">Checking for ready packages...</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : deliveryCodes.length > 0 ? (
          /* Delivery Codes Display */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-green-50 border-b border-green-100 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-sm">
                      <PackageCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Ready for Pickup</h2>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {deliveryCodes.length} {deliveryCodes.length === 1 ? 'package' : 'packages'} at warehouse
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-16 h-16 bg-green-600 rounded-xl shadow-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{deliveryCodes.length}</div>
                      <div className="text-xs text-green-100 font-medium">Ready</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Codes Grid */}
              <div className="p-6">
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
          </motion.div>
        ) : null}

        {/* Regular Packages Section */}
        {displayedPackages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white rounded-2xl shadow-sm border border-gray-200 py-16 px-6"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              No packages have arrived at our warehouse yet. Check back soon or contact support for assistance.
            </p>
          </motion.div>
        ) : (
          /* Package Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PackageCard
                  package={pkg}
                  isSelected={false}
                  onToggleSelection={() => {}}
                  onApproveShipment={() => approveShipment(pkg.id)}
                  onEditDetails={() => handleEditPackage(pkg)}
                  isActionInProgress={actionInProgress === pkg.id}
                  getPriorityBadge={getPriorityBadge}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More Button & Pagination Info */}
        {packages.length > 0 && (
          <div className="mt-8 space-y-4">
            {/* Stats Info */}
            <div className="text-center text-sm text-gray-600">
              <p>
                Showing <span className="font-semibold text-gray-900">{packages.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{totalCount}</span> packages
                {totalCount > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({Math.ceil((packages.length / totalCount) * 100)}% loaded)
                  </span>
                )}
              </p>
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={loadMorePackages}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Loading more packages...</span>
                    </>
                  ) : (
                    <>
                      <Package className="w-5 h-5" />
                      <span>Load More Packages ({totalCount - packages.length} remaining)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* All Loaded Message */}
            {!hasMore && packages.length < totalCount && (
              <div className="text-center text-sm text-gray-500">
                <p>✅ All packages loaded</p>
              </div>
            )}
          </div>
        )}

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
  getPriorityBadge: (priority: IncomingPackage['priority']) => string;
}

const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  isSelected,
  onToggleSelection: _onToggleSelection,
  onApproveShipment,
  onEditDetails,
  isActionInProgress,
  getPriorityBadge: _getPriorityBadge
}) => {
  const [showPhotos, setShowPhotos] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border shadow-2xl shadow-red-100/30 transition-all duration-300 hover:shadow-3xl hover:shadow-red-200/40 ${
        isSelected 
          ? 'border-red-500 ring-2 ring-red-100' 
          : 'border-red-200/50 hover:border-red-300/60'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/20 via-transparent to-rose-50/20"></div>
      
      {/* Package Header - Tracking Style */}
      <div className="relative p-5 border-b border-red-100/50 bg-gradient-to-br from-red-50/40 to-white/40">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            {/* Store info */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-white rounded-2xl border border-red-200/50 flex items-center justify-center flex-shrink-0 shadow-sm">
                {pkg.storeLogoUrl ? (
                  <img
                    src={pkg.storeLogoUrl}
                    alt={pkg.storeName}
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Box className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{pkg.storeName}</h3>
                <p className="text-xs text-gray-600 font-mono font-medium">{pkg.package_id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status badge - Tracking Style */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold shadow-md bg-gradient-to-r from-red-500 to-rose-600 text-white">
            {pkg.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Package Details */}
      <div className="relative p-5">
        <div className="space-y-4">
          {/* Package photo */}
          {pkg.packagePhotos && pkg.packagePhotos.length > 0 && (
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50/80 to-white/80 border border-red-200/50">
              <img
                src={pkg.packagePhotos?.[0] || ''}
                alt="Package"
                className="w-full h-40 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                onClick={() => setShowPhotos(true)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/package-placeholder.png';
                }}
              />
              {pkg.packagePhotos && pkg.packagePhotos.length > 1 && (
                <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg font-semibold shadow-lg">
                  +{(pkg.packagePhotos?.length || 1) - 1}
                </div>
              )}
              <button
                onClick={() => setShowPhotos(true)}
                className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200 flex items-center justify-center group"
              >
                <Eye className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
              </button>
            </div>
          )}

          {/* Package info boxes - Tracking Style */}
          <div className="p-4 bg-gradient-to-br from-red-50/60 to-rose-50/60 backdrop-blur-sm rounded-2xl border border-red-200/50 shadow-sm">
            <p className="text-xs font-medium text-gray-500 mb-3">Package Description</p>
            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">{pkg.description || 'No description'}</h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm rounded-2xl border border-red-200/50">
              <p className="text-xs font-medium text-gray-500 mb-1">Arrival Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                <span className="text-xs font-semibold text-gray-900">{formatDate(pkg.intake_date || pkg.created_at)}</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm rounded-2xl border border-red-200/50">
              <p className="text-xs font-medium text-gray-500 mb-1">Time</p>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" />
                <span className="text-xs font-semibold text-gray-900">{pkg.arrivalTime}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm rounded-2xl border border-red-200/50">
            <p className="text-xs font-medium text-gray-500 mb-1">Weight</p>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-red-600" />
              <span className="text-xs font-semibold text-gray-900">{pkg.estimatedWeight}</span>
            </div>
          </div>

          {/* Special indicators */}
          {(pkg.fragile || pkg.requiresInspection) && (
            <div className="flex gap-2">
              {pkg.fragile && (
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                  Fragile
                </span>
              )}
              {pkg.requiresInspection && (
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                  Inspection Required
                </span>
              )}
            </div>
          )}

          {/* Notes */}
          {pkg.notes && (
            <div className="p-3 bg-gradient-to-br from-red-50/40 to-rose-50/40 backdrop-blur-sm rounded-2xl border border-red-200/50">
              <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
              <p className="text-xs text-gray-700 leading-relaxed">{pkg.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Tracking Style */}
      <div className="relative p-5 pt-0 space-y-3">
        <button
          onClick={onApproveShipment}
          disabled={isActionInProgress || pkg.status !== 'pending'}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold rounded-2xl text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300 disabled:hover:shadow-lg"
        >
          {isActionInProgress ? (
            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
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
          className="w-full flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold rounded-2xl text-gray-700 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm hover:from-gray-100/80 hover:to-gray-50/80 border border-red-200/50 transition-all duration-200 shadow-sm"
        >
          <Edit3 className="w-4 h-4" />
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
    </div>
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
    <div className="group bg-white rounded-2xl shadow-sm border border-green-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-green-300">
      {/* Package Information */}
      <div className="bg-green-50 px-5 py-4 border-b border-green-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
              {deliveryCode.package_id}
            </h3>
            <p className="text-xs text-gray-600 font-medium truncate">
              {deliveryCode.tracking_number}
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-600 text-white shadow-sm ml-2">
            {deliveryCode.status}
          </span>
        </div>
        
        {deliveryCode.description && (
          <p className="text-xs text-gray-700 mt-2 line-clamp-2">
            {deliveryCode.description}
          </p>
        )}
      </div>

      {/* Delivery Code Display */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Lock className="h-4 w-4 text-green-600" />
          </div>
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Delivery Code
          </span>
        </div>
        
        <div className="relative">
          <div className="bg-red-600 rounded-xl p-5 text-center shadow-sm">
            <div className="text-4xl font-bold text-white tracking-widest font-mono">
              {deliveryCode.delivery_code}
            </div>
          </div>
          
          {/* Copy Button */}
          <button
            onClick={() => onCopyCode(deliveryCode.delivery_code)}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-red-600 p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            title={isCopied ? "Copied!" : "Copy code"}
          >
            {isCopied ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Warning Message */}
      <div className="px-5 pb-5">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              <span className="font-semibold">Important:</span> Present this code at the warehouse for pickup
            </p>
          </div>
        </div>
      </div>

      {/* Store Info if available */}
      {deliveryCode.store_name && (
        <div className="px-5 pb-5">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CircleDot className="h-3 w-3 text-gray-400" />
            <span className="font-medium">{deliveryCode.store_name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

