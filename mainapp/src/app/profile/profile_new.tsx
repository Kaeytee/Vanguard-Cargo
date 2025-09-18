import { useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

export default function Profile() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();

  useEffect(() => {
    if (user && !profile) {
      refreshProfile();
    }
  }, [user, profile, refreshProfile]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              <div className="w-full h-full flex items-center justify-center">
                <FaUser className="text-gray-400 text-3xl" />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <FaUser className="text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-lg font-medium text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="text-lg font-medium text-gray-900">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaPhone className="text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-lg font-medium text-gray-900">
                    {profile.phone || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-lg font-medium text-gray-900 capitalize">
                    {profile.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={profile.firstName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profile.lastName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Status</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Email Verification</p>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    profile.isEmailVerified ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm">
                    {profile.isEmailVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Type</p>
                <p className="text-sm font-medium mt-1 capitalize">{profile.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${
                  profile.accountStatus === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile.accountStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
