import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Settings } from 'lucide-react';
// import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import WhatsAppVerificationModal from './WhatsAppVerificationModal';

/**
 * WhatsApp Status Widget Component
 * Displays WhatsApp verification status and provides verification interface
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

interface WhatsAppStatus {
  whatsapp_number: string | null;
  verified: boolean;
  has_number: boolean;
}

/**
 * WhatsApp Status Widget
 * Shows verification status and allows users to verify their WhatsApp number
 */
const WhatsAppStatusWidget: React.FC = () => {
  // Hooks and state management
  const { user } = useAuth();
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /**
   * Fetches WhatsApp verification status from database
   */
  const fetchWhatsAppStatus = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Call RPC function to get WhatsApp status
      const { data, error: rpcError } = await supabase.rpc('get_whatsapp_status', {
        p_user_id: user.id
      });

      if (rpcError) {
        setError(`Failed to load WhatsApp status: ${rpcError.message}`);
        return;
      }

      // Set the status data
      setWhatsappStatus(data);
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles WhatsApp number verification
   * @param whatsappNumber - The WhatsApp number to verify
   */
  const handleVerification = async (whatsappNumber: string): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Call RPC function to verify WhatsApp number
      const { data, error: rpcError } = await supabase.rpc('verify_whatsapp_number', {
        p_user_id: user.id,
        p_whatsapp_number: whatsappNumber
      });

      if (rpcError) {
        console.error('WhatsApp verification error:', rpcError);
        return { success: false, error: rpcError.message };
      }

      if (data?.success) {
        // Refresh status after successful verification
        await fetchWhatsAppStatus();
        return { success: true };
      } else {
        return { success: false, error: data?.error || 'Verification failed' };
      }
    } catch (err) {
      console.error('WhatsApp verification error:', err);
      return { success: false, error: 'Network error occurred' };
    }
  };

  /**
   * Opens the verification modal
   */
  const handleOpenModal = () => {
    setShowModal(true);
  };

  /**
   * Closes the verification modal
   */
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Fetch status on component mount and user change
  useEffect(() => {
    fetchWhatsAppStatus();
  }, [user?.id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">WhatsApp Status</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchWhatsAppStatus}
          className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Determine status display
  const isVerified = whatsappStatus?.verified || false;
  const hasNumber = whatsappStatus?.has_number || false;
  const whatsappNumber = whatsappStatus?.whatsapp_number;

  
  // If there's an error, show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-red-800 font-semibold">WhatsApp Widget Error</h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${
              isVerified 
                ? 'bg-green-100' 
                : hasNumber 
                  ? 'bg-yellow-100' 
                  : 'bg-gray-100'
            }`}>
              {isVerified ? (
                <div className="relative">
                  <img 
                    src="https://i.pinimg.com/originals/93/b2/65/93b265c795140247db600ac92e58746a.jpg" 
                    alt="WhatsApp Logo"
                    className="w-10 h-10 object-contain"
                  />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
              ) : (
                <img 
                  src="https://i.pinimg.com/originals/93/b2/65/93b265c795140247db600ac92e58746a.jpg" 
                  alt="WhatsApp Logo"
                  className={`w-10 h-10 object-contain ${
                    hasNumber ? 'opacity-75' : 'opacity-50'
                  }`}
                />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">WhatsApp Notifications</h3>
              <p className={`text-sm ${
                isVerified 
                  ? 'text-green-600' 
                  : hasNumber 
                    ? 'text-yellow-600' 
                    : 'text-gray-500'
              }`}>
                {isVerified 
                  ? 'Verified & Active' 
                  : hasNumber 
                    ? 'Number Added - Not Verified' 
                    : 'Not Set Up'
                }
              </p>
            </div>
          </div>
          
          {/* Settings Icon */}
          <button
            onClick={handleOpenModal}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Manage WhatsApp Settings"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Status Content */}
        <div className="space-y-3">
          {/* Verified State */}
          {isVerified && whatsappNumber && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Verified Number
                </span>
              </div>
              <p className="text-sm text-green-700 font-mono">
                {whatsappNumber}
              </p>
              <p className="text-xs text-green-600 mt-1">
                You'll receive package notifications on WhatsApp
              </p>
            </div>
          )}

          {/* Unverified but has number */}
          {!isVerified && hasNumber && whatsappNumber && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Verification Required
                </span>
              </div>
              <p className="text-sm text-yellow-700 font-mono mb-2">
                {whatsappNumber}
              </p>
              <p className="text-xs text-yellow-600">
                Click "Verify Now" to start receiving notifications
              </p>
            </div>
          )}

          {/* No number set */}
          {!hasNumber && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src="https://i.pinimg.com/originals/93/b2/65/93b265c795140247db600ac92e58746a.jpg" 
                  alt="WhatsApp Logo"
                  className="w-5 h-5 object-contain opacity-60"
                />
                <span className="text-sm font-medium text-gray-700">
                  WhatsApp Not Set Up
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Add your WhatsApp number to receive instant package notifications
              </p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleOpenModal}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              isVerified
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isVerified ? 'Manage Settings' : hasNumber ? 'Verify Now' : 'Set Up WhatsApp'}
          </button>
        </div>
      </div>
    

      {/* Verification Modal */}
      <WhatsAppVerificationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onVerify={handleVerification}
        isVerified={isVerified}
        currentNumber={whatsappNumber || undefined}
      />
    </>
  );
};

export default WhatsAppStatusWidget;
