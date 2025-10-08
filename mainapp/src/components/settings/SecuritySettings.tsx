import { useState } from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

function SecuritySettings() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResetOption, setShowResetOption] = useState(false);

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    strength = Object.values(checks).filter(Boolean).length;
    
    if (strength <= 2) return { level: 'weak', color: 'red', text: 'Weak' };
    if (strength <= 3) return { level: 'medium', color: 'yellow', text: 'Medium' };
    if (strength <= 4) return { level: 'strong', color: 'green', text: 'Strong' };
    return { level: 'very-strong', color: 'green', text: 'Very Strong' };
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
    // Clear messages on input change
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      setError('User not authenticated');
      return;
    }

    // Basic validation (the authService will also validate)
    if (!passwords.currentPassword) {
      setError('Current password is required');
      return;
    }

    if (!passwords.newPassword) {
      setError('New password is required');
      return;
    }

    if (!passwords.confirmPassword) {
      setError('Please confirm your new password');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      
      if (response.success) {
        setSuccessMessage('Password changed successfully!');
        // Clear form
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Auto-clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Failed to change password. Please try again.');
      console.error('Password change error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) {
      setError('User email not found');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { error } = await authService.resetPassword(user.email);
      
      if (error) {
        setError(error.message || 'Failed to send password reset email');
      } else {
        setSuccessMessage('Password reset email sent! Check your inbox.');
        setShowResetOption(false);
      }
    } catch (err) {
      setError('Failed to send password reset email');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center text-xl font-semibold mb-2 text-red-900">
        <FaShieldAlt className="text-2xl mr-3 text-red-600" />
        <h2>Security Settings</h2>
      </div>
      <p className="text-gray-600 mb-6">Manage your account security and password settings</p>
      
      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Success State */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">{successMessage}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="currentPassword" className="block text-md font-semibold mb-2">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handlePasswordChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            placeholder="Enter current password"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-md font-semibold mb-2">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            placeholder="Enter new password"
          />
          {passwords.newPassword && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded">
                  <div 
                    className={`h-full rounded transition-all duration-300 ${
                      getPasswordStrength(passwords.newPassword).color === 'red' ? 'bg-red-500 w-1/4' :
                      getPasswordStrength(passwords.newPassword).color === 'yellow' ? 'bg-yellow-500 w-2/4' :
                      'bg-green-500 w-full'
                    }`}
                  />
                </div>
                <span className={`text-xs font-medium ${
                  getPasswordStrength(passwords.newPassword).color === 'red' ? 'text-red-600' :
                  getPasswordStrength(passwords.newPassword).color === 'yellow' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {getPasswordStrength(passwords.newPassword).text}
                </span>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Password should contain uppercase, lowercase, numbers, and special characters
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-md font-semibold mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
            required
            minLength={8}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              passwords.confirmPassword && passwords.newPassword && passwords.confirmPassword !== passwords.newPassword
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
            }`}
            placeholder="Confirm new password"
          />
          {passwords.confirmPassword && passwords.newPassword && (
            <p className={`text-xs mt-1 ${
              passwords.confirmPassword === passwords.newPassword 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {passwords.confirmPassword === passwords.newPassword 
                ? '✓ Passwords match' 
                : '✗ Passwords do not match'}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || (!!passwords.newPassword && !!passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword)}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
        >
          {loading ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>

      {/* Alternative: Password Reset */}
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-900 mb-2">Forgot Your Current Password?</h3>
        <p className="text-sm text-red-700 mb-4">
          If you don't remember your current password, you can reset it via email instead.
        </p>
        {!showResetOption ? (
          <button
            onClick={() => setShowResetOption(true)}
            className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline transition-colors"
          >
            Reset Password via Email
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-700">
              This will send a password reset link to your email: <strong>{user?.email}</strong>
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handlePasswordReset}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors shadow-md hover:shadow-lg"
              >
                {loading ? 'Sending...' : 'Send Reset Email'}
              </button>
              <button
                onClick={() => setShowResetOption(false)}
                className="bg-white border border-red-300 text-red-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Tips */}
      <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-900 mb-2 flex items-center">
          <FaShieldAlt className="mr-2 text-red-600" />
          Security Tips
        </h3>
        <ul className="text-sm text-red-800 space-y-2">
          <li className="flex items-start">
            <span className="inline-block w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Use a unique password that you don't use on other websites
          </li>
          <li className="flex items-start">
            <span className="inline-block w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Include uppercase and lowercase letters, numbers, and symbols
          </li>
          <li className="flex items-start">
            <span className="inline-block w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Avoid using personal information like your name or birthday
          </li>
          <li className="flex items-start">
            <span className="inline-block w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Consider using a password manager to generate and store strong passwords
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SecuritySettings;