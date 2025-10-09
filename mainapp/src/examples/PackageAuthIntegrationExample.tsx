/**
 * Package Authentication Integration Example
 * 
 * This file demonstrates how to integrate the new authentication code
 * and receipt system into your existing package views.
 * 
 * Copy and adapt these examples to your actual components.
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { packageService, type Package } from '../services/packageService';
import { receiptService } from '../services/receiptService';
import AuthCodeDisplay from '../components/AuthCodeDisplay';
import QRCodeDisplay from '../components/QRCodeDisplay';
import ReceiptViewer from '../components/ReceiptViewer';
import ArrivedPackageBanner from '../components/ArrivedPackageBanner';
import PackageCollectionView from '../components/PackageCollectionView';

/**
 * EXAMPLE 1: Package List with Ready-for-Pickup Banners
 * 
 * Shows how to display arrived packages prominently
 */
export const PackageListExample = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [showPickupView, setShowPickupView] = useState<Package | null>(null);

  // Load packages
  useEffect(() => {
    const loadPackages = async () => {
      if (!user?.id) return;
      const { data } = await packageService.getPackages(user.id);
      if (data) setPackages(data);
    };
    loadPackages();
  }, [user?.id]);

  // Separate ready packages from others
  const readyPackages = packages.filter(
    pkg => pkg.status === 'ready_for_pickup' || pkg.ready_for_pickup || pkg.delivery_auth_code
  );
  const otherPackages = packages.filter(
    pkg => !(pkg.status === 'ready_for_pickup' || pkg.ready_for_pickup || pkg.delivery_auth_code)
  );

  return (
    <div className="package-list">
      {/* Show ready packages first with prominent banners */}
      {readyPackages.map(pkg => (
        <ArrivedPackageBanner
          key={pkg.id}
          package={pkg}
          onViewDetails={() => setShowPickupView(pkg)}
          className="mb-4"
        />
      ))}

      {/* Show other packages normally */}
      {otherPackages.map(pkg => (
        <div key={pkg.id} className="package-card">
          {/* Your existing package card UI */}
          <h3>{pkg.tracking_number}</h3>
          <p>Status: {pkg.status}</p>
        </div>
      ))}

      {/* Full pickup view modal */}
      {showPickupView && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Package Pickup Details</h2>
              <button
                onClick={() => setShowPickupView(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
            <div className="p-6">
              <PackageCollectionView package={showPickupView} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * EXAMPLE 2: Package Details Page with Auth Code
 * 
 * Shows how to display auth code in package details
 */
export const PackageDetailsExample = ({ packageId }: { packageId: string }) => {
  const [pkg, setPackage] = useState<Package | null>(null);

  useEffect(() => {
    const loadPackage = async () => {
      const { data } = await packageService.getPackage(packageId);
      if (data) setPackage(data);
    };
    loadPackage();
  }, [packageId]);

  if (!pkg) return <div>Loading...</div>;

  return (
    <div className="package-details">
      <h1>Package: {pkg.tracking_number}</h1>

      {/* Show auth code if available */}
      {pkg.delivery_auth_code && (
        <div className="my-6">
          <AuthCodeDisplay
            authCode={pkg.delivery_auth_code}
            trackingNumber={pkg.tracking_number}
            size="large"
            showWarnings={true}
          />
        </div>
      )}

      {/* Show QR code if available */}
      {pkg.qr_code_data && (
        <div className="my-6 flex justify-center">
          <QRCodeDisplay
            data={pkg.qr_code_data}
            size={300}
            label="Show this QR code at warehouse"
            showDownload={true}
            downloadFilename={`package-${pkg.tracking_number}`}
          />
        </div>
      )}

      {/* Package details */}
      <div className="mt-6">
        <h2>Details</h2>
        <p>Status: {pkg.status}</p>
        <p>Description: {pkg.description}</p>
        {/* More details... */}
      </div>
    </div>
  );
};

/**
 * EXAMPLE 3: Real-time Auth Code Notifications
 * 
 * Shows how to listen for auth code generation
 */
export const RealtimeAuthCodeExample = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to package updates
    const subscription = supabase
      .channel('package-auth-codes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'packages',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newPackage = payload.new;
          const oldPackage = payload.old;

          // Auth code just generated
          if (newPackage.delivery_auth_code && !oldPackage.delivery_auth_code) {
            // Show notification
            showNotification({
              title: '🔐 Package Ready for Pickup!',
              body: `Code: ${newPackage.delivery_auth_code}`,
              onClick: () => {
                window.location.href = `/packages/${newPackage.id}`;
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  return null; // This is a background listener
};

/**
 * EXAMPLE 4: Receipt Viewing Integration
 * 
 * Shows how to view package receipts
 */
export const ReceiptViewExample = ({ packageId }: { packageId: string }) => {
  const [receipt, setReceipt] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleViewReceipt = async () => {
    setLoading(true);
    const { data } = await receiptService.getPackageReceipt(packageId);
    
    if (data) {
      setReceipt(data);
      setShowReceipt(true);
    } else {
      alert('Receipt not found or error loading');
    }
    
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={handleViewReceipt}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        {loading ? 'Loading...' : 'View Receipt'}
      </button>

      <ReceiptViewer
        receipt={receipt}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
      />
    </>
  );
};

/**
 * EXAMPLE 5: Dashboard Integration
 * 
 * Shows how to integrate into dashboard
 */
export const DashboardIntegrationExample = () => {
  const { user } = useAuth();
  const [readyPackages, setReadyPackages] = useState<Package[]>([]);

  useEffect(() => {
    const loadReadyPackages = async () => {
      if (!user?.id) return;
      
      const { data } = await packageService.getPackages(user.id, {
        status: 'ready_for_pickup'
      });
      
      if (data) setReadyPackages(data);
    };
    
    loadReadyPackages();
  }, [user?.id]);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* Alert section for ready packages */}
      {readyPackages.length > 0 && (
        <div className="alerts-section mb-8">
          <h2 className="text-2xl font-bold mb-4">
            📦 {readyPackages.length} Package{readyPackages.length !== 1 ? 's' : ''} Ready for Pickup!
          </h2>
          {readyPackages.map(pkg => (
            <ArrivedPackageBanner
              key={pkg.id}
              package={pkg}
              onViewDetails={() => {
                window.location.href = `/packages/${pkg.id}`;
              }}
              className="mb-4"
            />
          ))}
        </div>
      )}

      {/* Rest of dashboard... */}
    </div>
  );
};

/**
 * EXAMPLE 6: Notification Bell Integration
 * 
 * Shows badge count for ready packages
 */
export const NotificationBellExample = () => {
  const { user } = useAuth();
  const [readyCount, setReadyCount] = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      if (!user?.id) return;
      
      const { data } = await packageService.getPackages(user.id);
      if (data) {
        const ready = data.filter(
          pkg => pkg.status === 'ready_for_pickup' || pkg.ready_for_pickup
        );
        setReadyCount(ready.length);
      }
    };
    
    loadCount();

    // Poll every 30 seconds or use real-time subscription
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  return (
    <button className="relative">
      🔔
      {readyCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {readyCount}
        </span>
      )}
    </button>
  );
};

// Helper function for browser notifications
function showNotification({ title, body, onClick }: any) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, { body });
    if (onClick) {
      notification.onclick = onClick;
    }
  }
}

// Supabase client import (add to your actual implementation)
import { supabase } from '../lib/supabase';
