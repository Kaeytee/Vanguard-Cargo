
import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { apiService, type UserProfile } from '../../services/api';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserProfile();
      
      if (response.success) {
        // Convert UserProfileData to UserProfile
        const userProfile: UserProfile = {
          id: `profile-${Date.now()}`, // Generate a mock ID
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phone: response.data.phone,
          country: response.data.country,
          address: response.data.address,
          city: response.data.city,
          zip: response.data.zip,
          profileImage: response.data.profileImage,
          emailVerified: false, // Default value
          accountStatus: 'ACTIVE', // Default value
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProfile(userProfile);
      } else {
        setError(response.error || 'Failed to load profile');
      }
    } catch {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-gray-500">No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
        <p className="text-gray-600">View your account information</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.firstName + ' ' + profile.lastName)}&background=ef4444&color=ffffff&size=96`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaUser className="text-gray-400 text-3xl" />
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <FaEnvelope className="text-gray-500 text-sm" />
                <span className="text-gray-700">{profile.email}</span>
              </div>
              
              {profile.phone && (
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <FaPhone className="text-gray-500 text-sm" />
                  <span className="text-gray-700">{profile.phone}</span>
                </div>
              )}
              
              {profile.address && (
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <FaMapMarkerAlt className="text-gray-500 text-sm" />
                  <span className="text-gray-700">
                    {profile.address}
                    {profile.city && `, ${profile.city}`}
                    {profile.state && `, ${profile.state}`}
                    {profile.zip && ` ${profile.zip}`}
                    {profile.country && `, ${profile.country}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Member Since</label>
              <p className="mt-1 text-gray-900">
                {new Date(profile.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="mt-1 text-gray-900">
                {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.href = '/app/settings'}
            className="w-full sm:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Edit Profile
          </button>
          <button
            onClick={loadProfile}
            className="w-full sm:w-auto px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
