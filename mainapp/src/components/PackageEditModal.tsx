import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, MapPin, Package, DollarSign, FileText } from 'lucide-react';
import type { IncomingPackage } from '../app/packageIntake/packageIntake';

interface PackageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: IncomingPackage | null;
  onSave: (updatedPackage: IncomingPackage) => void;
}

interface EditFormData {
  description: string;
  value: number;
  notes: string;
  priority: 'standard' | 'express' | 'urgent';
  fragile: boolean;
  requiresInspection: boolean;
  destinationAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    region: string;
    country: string;
  };
  specialInstructions: string;
}

export const PackageEditModal: React.FC<PackageEditModalProps> = ({
  isOpen,
  onClose,
  package: pkg,
  onSave
}) => {
  const [formData, setFormData] = useState<EditFormData>({
    description: '',
    value: 0,
    notes: '',
    priority: 'standard',
    fragile: false,
    requiresInspection: false,
    destinationAddress: {
      name: '',
      phone: '',
      address: '',
      city: '',
      region: '',
      country: 'Ghana'
    },
    specialInstructions: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when package changes
  useEffect(() => {
    if (pkg) {
      setFormData({
        description: pkg.description || '',
        value: pkg.value || 0,
        notes: pkg.notes || '',
        priority: pkg.priority || 'standard',
        fragile: pkg.fragile || false,
        requiresInspection: pkg.requiresInspection || false,
        destinationAddress: {
          name: 'John Doe', // This would come from user profile
          phone: '+233 20 123 4567',
          address: '123 Example Street',
          city: 'Accra',
          region: 'Greater Accra',
          country: 'Ghana'
        },
        specialInstructions: ''
      });
    }
  }, [pkg]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Package description is required';
    }

    if (formData.value < 0) {
      newErrors.value = 'Package value cannot be negative';
    }

    if (!formData.destinationAddress.name.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }

    if (!formData.destinationAddress.phone.trim()) {
      newErrors.recipientPhone = 'Recipient phone is required';
    }

    if (!formData.destinationAddress.address.trim()) {
      newErrors.recipientAddress = 'Recipient address is required';
    }

    if (!formData.destinationAddress.city.trim()) {
      newErrors.recipientCity = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!pkg || !validateForm()) return;

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedPackage: IncomingPackage = {
        ...pkg,
        description: formData.description,
        value: formData.value,
        notes: formData.notes,
        priority: formData.priority,
        fragile: formData.fragile,
        requiresInspection: formData.requiresInspection
      };

      onSave(updatedPackage);
      onClose();
    } catch (error) {
      console.error('Error saving package details:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      destinationAddress: {
        ...prev.destinationAddress,
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    const errorKey = `recipient${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
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
              {/* Package Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Package Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter package description"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                      Declared Value (USD)
                    </label>
                    <div className="mt-1 relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        id="value"
                        min="0"
                        step="0.01"
                        value={formData.value}
                        onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                        className={`block w-full pl-10 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                          errors.value ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.value && (
                      <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                    )}
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

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.fragile}
                        onChange={(e) => handleInputChange('fragile', e.target.checked)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Fragile</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.requiresInspection}
                        onChange={(e) => handleInputChange('requiresInspection', e.target.checked)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Requires Inspection</span>
                    </label>
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

              {/* Destination Address */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Destination Address
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      id="recipientName"
                      value={formData.destinationAddress.name}
                      onChange={(e) => handleAddressChange('name', e.target.value)}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        errors.recipientName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Full name"
                    />
                    {errors.recipientName && (
                      <p className="mt-1 text-sm text-red-600">{errors.recipientName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="recipientPhone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="recipientPhone"
                      value={formData.destinationAddress.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        errors.recipientPhone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="+233 20 123 4567"
                    />
                    {errors.recipientPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.recipientPhone}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="recipientAddress" className="block text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="recipientAddress"
                      value={formData.destinationAddress.address}
                      onChange={(e) => handleAddressChange('address', e.target.value)}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        errors.recipientAddress ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Street address"
                    />
                    {errors.recipientAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.recipientAddress}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="recipientCity" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      id="recipientCity"
                      value={formData.destinationAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        errors.recipientCity ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="City"
                    />
                    {errors.recipientCity && (
                      <p className="mt-1 text-sm text-red-600">{errors.recipientCity}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="recipientRegion" className="block text-sm font-medium text-gray-700">
                      Region
                    </label>
                    <select
                      id="recipientRegion"
                      value={formData.destinationAddress.region}
                      onChange={(e) => handleAddressChange('region', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select Region</option>
                      <option value="Greater Accra">Greater Accra</option>
                      <option value="Ashanti">Ashanti</option>
                      <option value="Western">Western</option>
                      <option value="Central">Central</option>
                      <option value="Volta">Volta</option>
                      <option value="Eastern">Eastern</option>
                      <option value="Northern">Northern</option>
                      <option value="Upper East">Upper East</option>
                      <option value="Upper West">Upper West</option>
                      <option value="Brong Ahafo">Brong Ahafo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Special Instructions
                </h3>
                
                <textarea
                  rows={3}
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Any special handling instructions for delivery..."
                />
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
