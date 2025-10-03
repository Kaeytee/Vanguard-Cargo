import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, MapPin, Package } from 'lucide-react';
import type { IncomingPackage } from '../app/packageIntake/packageIntake';
import { useAuth } from '../hooks/useAuth';

interface PackageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: IncomingPackage | null;
  onSave: (updatedPackage: IncomingPackage) => void;
}

interface EditFormData {
  notes: string;
  priority: 'standard' | 'express' | 'urgent';
}

export const PackageEditModal: React.FC<PackageEditModalProps> = ({
  isOpen,
  onClose,
  package: pkg,
  onSave
}) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState<EditFormData>({
    notes: '',
    priority: 'standard'
  });

  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data when package changes
  useEffect(() => {
    if (pkg) {
      setFormData({
        notes: pkg.notes || '',
        priority: pkg.priority || 'standard'
      });
    }
  }, [pkg]);

  const handleSave = async () => {
    if (!pkg) return;

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedPackage: IncomingPackage = {
        ...pkg,
        notes: formData.notes,
        priority: formData.priority
      };

      onSave(updatedPackage);
      onClose();
    } catch (error) {
      console.error('Error saving package details:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof EditFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen || !pkg) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Package Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                {pkg.storeName} • {pkg.tracking_number}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-6">
              {/* Package Information - Readonly except notes and priority */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Package Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <div className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600">
                      {pkg?.description || 'No description'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Declared Value (USD)
                    </label>
                    <div className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600">
                      ${pkg?.declared_value?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Store/Vendor
                    </label>
                    <div className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600">
                      {pkg?.store_name || pkg?.vendor_name || 'Unknown'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Weight
                    </label>
                    <div className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600">
                      {pkg?.weight_lbs?.toFixed(2) || '0.00'} lbs
                    </div>
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="standard">Standard</option>
                      <option value="express">Express</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Additional notes about this package..."
                  />
                </div>
              </div>

              {/* Destination Address - Readonly from user profile */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Destination Address
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Recipient Name
                    </label>
                    <div className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600">
                      {profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : 'User Name'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600">
                      {profile?.phone || 'Not provided'}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <div className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600">
                      {profile?.streetAddress || 'Address not provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <div className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600">
                      {profile?.city || 'City not provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <div className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600">
                      {profile?.country || 'Country not provided'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
