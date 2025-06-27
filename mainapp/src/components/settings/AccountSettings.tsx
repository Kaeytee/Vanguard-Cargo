import React, { useState } from "react";
import { FaUser } from "react-icons/fa6";
import { FaCloudUploadAlt } from "react-icons/fa";
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { parsePhoneNumber } from 'libphonenumber-js';
import { initialUserData } from "../../lib/constants";
import { useAuth } from '../../context/AuthProvider';

export default function AccountSettings() {
  const [formData, setFormData] = useState(initialUserData);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState('');

  const { user } = useAuth();

    const userData = user || {
    id: '',
    name: 'Guest User',
    email: 'guest@example.com',
    image: ''
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle phone number change with country auto-detection
  const handlePhoneChange = (value?: string) => {
    setFormData((prev) => ({ ...prev, senderPhone: value || '' }));
    
    // Validate the phone number
    if (value && !isValidPhoneNumber(value)) {
      setPhoneError('Please enter a valid phone number');
      return; // Exit early if invalid
    }
    
    // Clear any phone error
    setPhoneError('');
    
    // Auto-set country based on phone number using libphonenumber-js
    if (value) {
      try {
        // Parse the phone number to get country information
        const phoneNumberData = parsePhoneNumber(value);
        
        if (phoneNumberData && phoneNumberData.country) {
          // Get the country name from the country code
          const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(phoneNumberData.country);
          
          if (countryName) {
            console.log('Setting country to:', countryName); // Debug log
            
            // Update the country field with the detected country name
            setFormData((prev) => ({ ...prev, senderCountry: countryName }));
          }
        }
      } catch (error) {
        // If there's an error parsing the phone number, don't update the country
        console.log('Error detecting country from phone number:', error);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setProfileImage(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
  };
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="flex items-center text-xl sm:text-2xl font-semibold mb-2">
          Account Settings
        </h2>
        <p className="text-gray-500 text-sm sm:text-base">
          Manage your account details and preferences
        </p>
      </div>

      {/* Profile Picture Section */}
      <div className="bg-white rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">          {/* Profile Picture */}
          <div className="relative flex-shrink-0">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg hover:shadow-xl transition-shadow">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : userData.image ? (
                  <img
                    src={userData.image}
                    alt="User"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=ef4444&color=ffffff&size=64`;
                    }}
                  />
                ) : (
                  <FaUser className="text-gray-400 text-4xl" />
                )}
              </div>
              {/* Small upload indicator */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-primary border-white hover:bg-primary/90 transition-colors">
                <FaCloudUploadAlt className="text-white text-xs" />
              </div>
            </label>
          </div>

          {/* User Info and Buttons */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-gray-900">
              {formData.senderName || 'Austin Bediako'}
            </h3>
            <p className="text-gray-500 text-sm">
              {formData.senderEmail || 'test@example.com'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <span className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                  Upload New Photo
                </span>
              </label>
              
              <button
                type="button"
                onClick={handleDeleteImage}
                disabled={!profileImage}
                className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="senderName" className="block text-sm font-semibold text-gray-700">
              Full Name <span className="text-primary text-lg">*</span>
            </label>
            <input
              type="text"
              id="senderName"
              name="senderName"
              required
              value={formData.senderName}
              onChange={onInputChange}
              placeholder="Enter your full name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 bg-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-gray-400 text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="senderEmail" className="block text-sm font-semibold text-gray-700">
              Email <span className="text-primary text-lg">*</span>
            </label>
            <input
              type="email"
              id="senderEmail"
              name="senderEmail"
              required
              value={formData.senderEmail}
              onChange={onInputChange}
              placeholder="your.email@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 bg-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-gray-400 text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="senderPhone" className="block text-sm font-semibold text-gray-700">
              Phone Number <span className="text-primary text-lg">*</span>
            </label>
            <div className="phone-input-container">
              <PhoneInput
                id="senderPhone"
                name="senderPhone"
                international
                countryCallingCodeEditable={true}
                defaultCountry="GH"
                value={formData.senderPhone}
                onChange={handlePhoneChange}
                placeholder="Enter phone number"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 bg-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-gray-400 text-sm sm:text-base"
                error={phoneError ? phoneError : undefined}
              />
              {phoneError && (
                <p className="mt-1 text-sm text-red-600">{phoneError}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="senderAddress" className="block text-sm font-semibold text-gray-700">
              Address <span className="text-primary text-lg">*</span>
            </label>
            <input
              type="text"
              id="senderAddress"
              name="senderAddress"
              required
              value={formData.senderAddress}
              onChange={onInputChange}
              placeholder="Enter your street address"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 bg-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-gray-400 text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="senderCountry" className="block text-sm font-semibold text-gray-700">
                Country <span className="text-primary text-lg">*</span>
              </label>
              <input
                type="text"
                id="senderCountry"
                name="senderCountry"
                required
                value={formData.senderCountry}
                onChange={onInputChange}
                placeholder="Enter your country"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 bg-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-gray-400 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="senderCity" className="block text-sm font-semibold text-gray-700">
                City <span className="text-primary text-lg">*</span>
              </label>
              <input
                type="text"
                id="senderCity"
                name="senderCity"
                required
                value={formData.senderCity}
                onChange={onInputChange}
                placeholder="Enter your city"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 bg-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-gray-400 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="senderZip" className="block text-sm font-semibold text-gray-700">
              Zip Code <span className="text-primary text-lg">*</span>
            </label>
            <input
              type="text"
              id="senderZip"
              name="senderZip"
              required
              value={formData.senderZip}
              onChange={onInputChange}
              placeholder="Enter your ZIP/postal code"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 bg-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-gray-400 text-sm sm:text-base"
            />
          </div>

        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-red-600/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          >
            Save Account Settings
          </button>
          
          <button
            type="button"
            className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 text-sm sm:text-base font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}