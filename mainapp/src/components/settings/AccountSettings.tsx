import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Trash2 } from 'lucide-react';
import { useTranslation } from '../../lib/translations';

// Mock API service and interfaces
interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  zip: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ApiService {
  getUserProfile: () => Promise<ApiResponse<UserProfileData>>;
  updateUserProfile: (data: Partial<UserProfileData>) => Promise<ApiResponse<null>>;
}

const apiService: ApiService = {
  getUserProfile: async (): Promise<ApiResponse<UserProfileData>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main Street',
        city: 'New York',
        country: 'United States',
        zip: '10001'
      }
    };
  },
  updateUserProfile: async (data: Partial<UserProfileData>): Promise<ApiResponse<null>> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Updated profile data:', data);
    return { success: true };
  }
};

// WhatsApp number validation utility
const validateWhatsAppNumber = async (phoneNumber: string): Promise<boolean> => {
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid international format (7-15 digits)
  if (cleanNumber.length < 7 || cleanNumber.length > 15) {
    return false;
  }
  
  // For demo purposes, we'll simulate validation
  // In a real app, you'd use WhatsApp Business API or a service like Twilio
  return new Promise(resolve => {
    setTimeout(() => {
      // Simulate that numbers starting with certain codes are valid WhatsApp numbers
      const validPrefixes = ['1', '44', '49', '33', '39', '34', '91', '86', '81', '55', '52', '54', '234', '233'];
      const isValid = validPrefixes.some(prefix => cleanNumber.startsWith(prefix));
      resolve(isValid);
    }, 500);
  });
};

export default function AccountSettings() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validatingPhone, setValidatingPhone] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  type AccountFormError = Partial<Record<keyof AccountFormData, string>> & { general?: string };
  const [formErrors, setFormErrors] = useState<AccountFormError>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    zip: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setFormErrors({});
      const response = await apiService.getUserProfile();
      
      if (response.success && response.data) {
        setFormData({
          fullName: `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim() || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          city: response.data.city || '',
          country: response.data.country || '',
          zip: response.data.zip || ''
        });
      } else {
        setFormErrors({ general: response.message || t('error') });
      }
    } catch (err) {
      setFormErrors({ general: t('error') });
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  interface AccountFormData {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    zip: string;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: AccountFormData) => ({
      ...prev,
      [name]: value
    }));
    setFormErrors((prev) => ({
      ...prev,
      [name]: undefined,
      general: undefined
    }));
  };

  const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    handleInputChange(e);
    
    // Validate WhatsApp number if phone number is provided
    if (value.trim()) {
      setValidatingPhone(true);
      const isValid = await validateWhatsAppNumber(value);
      if (!isValid) {
        setFormErrors(prev => ({
          ...prev,
          phone: 'Please enter a valid WhatsApp number'
        }));
      } else {
        setFormErrors(prev => ({
          ...prev,
          phone: undefined
        }));
      }
      setValidatingPhone(false);
    }
  };

  // Handle file selection for photo upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setProfileImage(result);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select a valid image file');
      }
    }
  };

  // Handle camera button click
  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  // Handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle delete photo
  const handleDeletePhoto = () => {
    if (window.confirm('Are you sure you want to delete your profile photo?')) {
      setProfileImage(null);
    }
  };

  interface UpdateUserProfilePayload {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
    country: string;
  }

  const validateForm = async (): Promise<Partial<Record<keyof AccountFormData, string>>> => {
    const errors: Partial<Record<keyof AccountFormData, string>> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = t('requiredField');
    } else if (formData.fullName.trim().split(' ').length < 2) {
      errors.fullName = t('fullName');
    }

    if (!formData.email.trim()) {
      errors.email = t('requiredField');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('invalidEmail');
    }

    // Enhanced phone validation for WhatsApp
    if (formData.phone) {
      const isValidWhatsApp = await validateWhatsAppNumber(formData.phone);
      if (!isValidWhatsApp) {
        errors.phone = 'Please enter a valid WhatsApp number';
      }
    }

    if (!formData.address.trim()) {
      errors.address = t('requiredField');
    }

    if (formData.city && !/^[a-zA-Z\s-]{2,}$/.test(formData.city)) {
      errors.city = t('city');
    }

    if (formData.country && !/^[a-zA-Z\s-]{2,}$/.test(formData.country)) {
      errors.country = t('country');
    }

    if (!formData.zip.trim()) {
      errors.zip = t('requiredField');
    } else if (!/^[0-9A-Za-z\s-]{3,10}$/.test(formData.zip)) {
      errors.zip = t('invalidZip');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSaving(false);
      return;
    }

    const payload: UpdateUserProfilePayload = {
      firstName: formData.fullName.split(' ')[0] || '',
      lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      zip: formData.zip,
      country: formData.country
    };

    try {
      const response: ApiResponse<null> = await apiService.updateUserProfile(payload);

      if (response.success) {
        setSuccessMessage(t('success'));
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setFormErrors({ general: response.message || t('error') });
      }
    } catch (err) {
      setFormErrors({ general: t('error') });
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {formErrors.general && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 text-sm font-medium">{formErrors.general}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-800 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Photo Section */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img 
              src={profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&size=80&background=e5e7eb&color=374151`}
              alt={t('profilePhoto')}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <button
              type="button"
              onClick={handleCameraClick}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{formData.fullName || t('profile')}</h3>
            <p className="text-gray-600 mb-4">{formData.email}</p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleUploadClick}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('uploadNewPhoto')}
              </button>
              <button
                type="button"
                onClick={handleDeletePhoto}
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('deletePhoto')}
              </button>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('fullName')} *
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                  formErrors.fullName ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                }`}
                placeholder={t('fullName')}
                required
              />
              {formErrors.fullName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('emailAddress')} *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                  formErrors.email ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                }`}
                placeholder={t('emailAddress')}
                required
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              {t('phoneNumber')} (WhatsApp)
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                formErrors.phone ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              }`}
              placeholder="Enter WhatsApp number (e.g., +1234567890)"
            />
            {validatingPhone && (
              <p className="mt-1 text-sm text-blue-600">Validating WhatsApp number...</p>
            )}
            {formErrors.phone && (
              <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('country')}
              </label>
              <input
                type="text"
                name="country"
                id="country"
                value={formData.country}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                  formErrors.country ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                }`}
                placeholder={t('country')}
              />
              {formErrors.country && (
                <p className="mt-1 text-sm text-red-600">{formErrors.country}</p>
              )}
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('city')}
              </label>
              <input
                type="text"
                name="city"
                id="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                  formErrors.city ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                }`}
                placeholder={t('city')}
              />
              {formErrors.city && (
                <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('address')} *
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                  formErrors.address ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                }`}
                placeholder={t('address')}
                required
              />
              {formErrors.address && (
                <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
              )}
            </div>
            <div>
              <label htmlFor="zip" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('zipCode')} *
              </label>
              <input
                type="text"
                name="zip"
                id="zip"
                value={formData.zip}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                  formErrors.zip ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                }`}
                placeholder={t('zipCode')}
                required
              />
              {formErrors.zip && (
                <p className="mt-1 text-sm text-red-600">{formErrors.zip}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={loadUserProfile}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            disabled={loading || saving}
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={saving || validatingPhone}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? t('saving') : t('saveChanges')}
          </button>
        </div>
      </form>
    </div>
  );
}