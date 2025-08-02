import React, { useState, useEffect } from 'react';
import { apiService, type UserProfileData } from '../services/api';

const MockDataDebug: React.FC = () => {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testMockData = async () => {
      try {
        console.log('Testing mock data...');
        console.log('shouldUseMockData:', apiService.isUsingMockData());
        console.log('Config:', apiService.getConfigInfo());
        
        const response = await apiService.getUserProfile();
        console.log('getUserProfile response:', response);
        
        if (response.success) {
          setProfileData(response.data);
        } else {
          setError(response.message || 'Failed to load profile');
        }
      } catch (err) {
        console.error('Error testing mock data:', err);
        setError('Error loading mock data');
      } finally {
        setLoading(false);
      }
    };

    testMockData();
  }, []);

  if (loading) {
    return <div className="p-4 bg-blue-100 rounded">Loading mock data...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="text-lg font-bold mb-4">Mock Data Debug</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">Configuration:</h4>
        <pre className="bg-white p-2 rounded text-sm">
          {JSON.stringify(apiService.getConfigInfo(), null, 2)}
        </pre>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {profileData && (
        <div className="mb-4">
          <h4 className="font-semibold">Profile Data:</h4>
          <pre className="bg-white p-2 rounded text-sm">
            {JSON.stringify(profileData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MockDataDebug;
