/**
 * Utility to clear mock/development data from browser storage
 * Call this when a real user logs in to ensure clean production experience
 */

export function clearMockData() {
  try {
    // Clear notification mock data
    localStorage.removeItem('package_notifications');
    
    // Clear any other mock data keys that might exist
    const keysToCheck = [
      'vanguard_mock_packages',
      'vanguard_mock_shipments', 
      'vanguard_demo_data',
      'package_notifications',
      'mock_user_data'
    ];
    
    keysToCheck.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`Cleared mock data: ${key}`);
      }
    });
    
    // Clear session storage as well
    keysToCheck.forEach(key => {
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        console.log(`Cleared session mock data: ${key}`);
      }
    });
    
    console.log('Mock data cleanup completed');
    
  } catch (error) {
    console.error('Error clearing mock data:', error);
  }
}

/**
 * Check if user is using real authentication (not demo/mock user)
 */
interface User {
  email?: string;
}

export function isRealUser(user: User): boolean {
  if (!user) return false;
  
  // Check for demo/mock user indicators
  const mockIndicators = [
    'demo',
    'test',
    'mock', 
    'dummy',
    'example.com',
    'test.com'
  ];
  
  const email = user.email?.toLowerCase() || '';
  return !mockIndicators.some(indicator => email.includes(indicator));
}
