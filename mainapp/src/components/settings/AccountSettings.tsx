import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Camera, Upload, Trash2 } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { apiService, type UserProfile, type UserProfileData } from '../../services/api';
import { useUser } from '../../context/useUser';
import ErrorBoundary from '../ErrorBoundary';

const validateWhatsAppNumber = async (phoneNumber: string): Promise<boolean> => {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  if (cleanNumber.length < 7 || cleanNumber.length > 15) return false;
  return new Promise((resolve) =>
    setTimeout(() => {
      const validPrefixes = ['1', '44', '49', '33', '39', '34', '91', '86', '81', '55', '52', '54', '234', '233'];
      resolve(validPrefixes.some((prefix) => cleanNumber.startsWith(prefix)));
    }, 500)
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse" role="alert" aria-busy="true">
    <div className="flex items-center space-x-4 mb-8">
      <div className="w-20 h-20 bg-gray-200 rounded-full" />
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="h-4 bg-gray-200 rounded w-64" />
      </div>
    </div>
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
      <div className="h-10 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

import type { TranslationKey } from '../../lib/translations';

const AccountSettingsContent = ({ t }: { t: (key: TranslationKey) => string }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validatingPhone, setValidatingPhone] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserProfile, string>> & { general?: string; fullName?: string }>({});
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { user, setUser } = useUser();

  const loadUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setFormErrors({});
      const response = await apiService.getUserProfile();
      if (response.success && response.data) {
        const newFormData: UserProfile = {
          id: `mock-user-id-${Date.now()}`,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phone: response.data.phone,
          address: response.data.address,
          city: response.data.city ?? '',
          country: response.data.country,
          zip: response.data.zip ?? '',
          profileImage: response.data.profileImage ?? '',
          emailVerified: false,
          accountStatus: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setFormData(newFormData);
        setUser(newFormData);
      } else {
        setFormErrors({ general: response.message || t('errorLoadingProfile') });
      }
    } catch (err) {
      setFormErrors({ general: t('errorLoadingProfile') });
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }, [t, setUser]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    if (user && !formData) {
      setFormData(user);
    }
  }, [user, formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev));
    setFormErrors((prev) => ({
      ...prev,
      [name]: undefined,
      general: undefined,
      fullName: undefined,
    }));
  };

  const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    handleInputChange(e);
    if (value.trim()) {
      setValidatingPhone(true);
      const isValid = await validateWhatsAppNumber(value);
      setFormErrors((prev) => ({
        ...prev,
        phone: isValid ? undefined : t('invalidPhone'),
      }));
      setValidatingPhone(false);
    }
  };

  const handleCameraClick = () => cameraInputRef.current?.click();
  const handleUploadClick = () => cameraInputRef.current?.click();
  const handleDeletePhoto = () => {
    if (window.confirm(t('confirmDeletePhoto'))) {
      setFormData((prev) => (prev ? { ...prev, profileImage: '' } : prev));
    }
  };

  const validateForm = async (): Promise<Partial<Record<keyof UserProfile, string>> & { fullName?: string }> => {
    const errors: Partial<Record<keyof UserProfile, string>> & { fullName?: string } = {};
    if (!formData?.firstName?.trim()) errors.firstName = t('requiredField');
    else if (`${formData.firstName} ${formData.lastName ?? ''}`.trim().split(' ').length < 2)
      errors.fullName = t('invalidFullName');
    if (!formData?.email?.trim()) errors.email = t('requiredField');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = t('invalidEmail');
    if (formData?.phone && !(await validateWhatsAppNumber(formData.phone))) errors.phone = t('invalidPhone');
    if (!formData?.address?.trim()) errors.address = t('requiredField');
    if (formData?.city && !/^[a-zA-Z\s-]{2,}$/.test(formData.city)) errors.city = t('invalidCity');
    if (formData?.country && !/^[a-zA-Z\s-]{2,}$/.test(formData.country)) errors.country = t('invalidCountry');
    if (!formData?.zip?.trim()) errors.zip = t('requiredField');
    else if (!/^[0-9A-Za-z\s-]{3,10}$/.test(formData.zip)) errors.zip = t('invalidZip');
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    const validationErrors = await validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setSaving(false);
      return;
    }

    if (!formData) {
      setFormErrors({ general: t('error') });
      setSaving(false);
      return;
    }

    try {
      const updateData: Partial<UserProfileData> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        zip: formData.zip,
        profileImage: formData.profileImage,
      };
      const response = await apiService.updateUserProfile(updateData);
      if (response.success) {
        setUser(formData);
        alert(t('profileUpdated'));
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
    return <LoadingSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <div className="flex items-center space-x-6">
        <div className="relative">
          <img
            src={formData?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent((formData?.firstName ?? '') + ' ' + (formData?.lastName ?? ''))}&size=80&background=e5e7eb&color=374151`}
            alt={t('profilePhoto')}
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <button
            type="button"
            onClick={handleCameraClick}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label={t('uploadPhoto')}
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-1" id="profile-name">
            {(formData?.firstName ?? '') + ' ' + (formData?.lastName ?? '') || t('profile')}
          </h3>
          <p className="text-gray-600 mb-4" id="profile-email">
            {formData?.email}
          </p>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleUploadClick}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label={t('uploadNewPhoto')}
            >
              <Upload className="w-4 h-4 mr-2" />
              {t('uploadNewPhoto')}
            </button>
            <button
              type="button"
              onClick={handleDeletePhoto}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label={t('deletePhoto')}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('deletePhoto')}
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
              {t('fullName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              value={(formData?.firstName ?? '') + ' ' + (formData?.lastName ?? '')}
              onChange={(e) => {
                const [firstName, ...lastName] = e.target.value.split(' ');
                setFormData((prev) =>
                  prev
                    ? {
                        ...prev,
                        firstName,
                        lastName: lastName.join(' '),
                        email: prev.email,
                        phone: prev.phone,
                        address: prev.address,
                        city: prev.city,
                        country: prev.country,
                        zip: prev.zip,
                        id: prev.id,
                        emailVerified: prev.emailVerified,
                        accountStatus: prev.accountStatus,
                        createdAt: prev.createdAt,
                        updatedAt: prev.updatedAt,
                      }
                    : prev
                );
                setFormErrors((prev) => ({
                  ...prev,
                  firstName: undefined,
                  fullName: undefined,
                  general: undefined,
                }));
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                formErrors.firstName || formErrors.fullName ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              }`}
              placeholder={t('fullName')}
              required
              aria-required="true"
              aria-describedby="fullName-error"
            />
            {(formErrors.firstName || formErrors.fullName) && (
              <p id="fullName-error" className="mt-1 text-sm text-red-600">
                {formErrors.firstName || formErrors.fullName}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              {t('emailAddress')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData?.email ?? ''}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                formErrors.email ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              }`}
              placeholder={t('emailAddress')}
              required
              aria-required="true"
              aria-describedby="email-error"
            />
            {formErrors.email && <p id="email-error" className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
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
            value={formData?.phone ?? ''}
            onChange={handlePhoneChange}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
              formErrors.phone ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
            }`}
            placeholder={t('phonePlaceholder')}
            aria-describedby="phone-error"
          />
          {validatingPhone && <p className="mt-1 text-sm text-blue-600">{t('validatingPhone')}</p>}
          {formErrors.phone && <p id="phone-error" className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">{t('country')}</label>
            <input
              type="text"
              name="country"
              id="country"
              value={formData?.country ?? ''}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                formErrors.country ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              }`}
              placeholder={t('country')}
              aria-describedby="country-error"
            />
            {formErrors.country && <p id="country-error" className="mt-1 text-sm text-red-600">{formErrors.country}</p>}
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">{t('city')}</label>
            <input
              type="text"
              name="city"
              id="city"
              value={formData?.city ?? ''}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                formErrors.city ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              }`}
              placeholder={t('city')}
              aria-describedby="city-error"
            />
            {formErrors.city && <p id="city-error" className="mt-1 text-sm text-red-600">{formErrors.city}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
              {t('address')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              id="address"
              value={formData?.address ?? ''}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                formErrors.address ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              }`}
              placeholder={t('address')}
              required
              aria-required="true"
              aria-describedby="address-error"
            />
            {formErrors.address && <p id="address-error" className="mt-1 text-sm text-red-600">{formErrors.address}</p>}
          </div>
          <div>
            <label htmlFor="zip" className="block text-sm font-semibold text-gray-700 mb-2">
              {t('zipCode')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="zip"
              id="zip"
              value={formData?.zip ?? ''}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all ${
                formErrors.zip ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              }`}
              placeholder={t('zipCode')}
              required
              aria-required="true"
              aria-describedby="zip-error"
            />
            {formErrors.zip && <p id="zip-error" className="mt-1 text-sm text-red-600">{formErrors.zip}</p>}
          </div>
        </div>
      </div>
      {formErrors.general && <p className="text-sm text-red-600">{formErrors.general}</p>}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={loadUserProfile}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          disabled={loading || saving}
          aria-label={t('cancel')}
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={saving || validatingPhone}
          className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t('saveChanges')}
        >
          {saving ? t('saving') : t('saveChanges')}
        </button>
      </div>
    </form>
  );
};

const AccountSettings = () => {
  const { t } = useTranslation();
  return (
    <ErrorBoundary fallback={<div className="text-red-600">{t('errorBoundary')}</div>}>
      <Suspense fallback={<LoadingSkeleton />}>
        <AccountSettingsContent t={t} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default AccountSettings;