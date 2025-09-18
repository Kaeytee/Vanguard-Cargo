// Quick test to verify AccountSettings Supabase integration
import { authService } from '../services/authService';

// Test function to verify the authService.updateProfile method
async function testAccountSettingsUpdate() {
  console.log('Testing AccountSettings Supabase integration...');
  
  // Mock user data for testing
  const testUserId = 'test-user-id';
  const updateData = {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    address: '123 Main St',
    city: 'New York',
    country: 'USA',
    zip: '10001'
  };

  try {
    // This should work with the new enhanced updateProfile method
    const result = await authService.updateProfile(testUserId, updateData);
    console.log('✅ AccountSettings updateProfile method signature is correct:', result);
    return true;
  } catch (error) {
    console.log('❌ Error testing updateProfile:', error);
    return false;
  }
}

// Export for potential use
export { testAccountSettingsUpdate };
