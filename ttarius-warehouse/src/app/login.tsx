import { useState } from 'react';
import { BsPerson, BsLock } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './auth/hooks/useAuth';
import image from '../assets/Login.png';


/**
 * Login Component
 * 
 * This component renders the login page for TTarius Logistics warehouse application.
 * It includes a form with username and password inputs, and a login button with loading state.
 * After successful login, it navigates to the dashboard.
 * The design matches the provided mockup with a split layout - image on left, form on right.
 */
const Login = () => {
  // Navigation hook for redirecting after login
  const navigate = useNavigate();
  const { login, error, isLoading } = useAuth();
  
  // State for form inputs and UI states
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  /**
   * Handle form submission
   * @param {React.FormEvent} e - Form event
   */
/**
 * Handles the login form submission
 * Shows loading state, authenticates with the AuthContext, and navigates to dashboard
 * @param {React.FormEvent<HTMLFormElement>} e - Form event
 */
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
  // Prevent default form submission behavior
  e.preventDefault();
  
  // Reset any previous errors
  setLocalError('');
  
  // Validate form inputs
  if (!employeeId || !password) {
    setLocalError('Please enter both employee ID and password');
    return;
  }

  // Validate employee ID format (10 digits)
  if (!/^\d{10}$/.test(employeeId)) {
    setLocalError('Employee ID must be 10 digits');
    return;
  }

  // Validate password format (6 characters)
  if (password.length !== 6) {
    setLocalError('Password must be 6 characters');
    return;
  }
  
  try {
    // Use the AuthContext login function (no logging of sensitive data)
    await login(employeeId, password);
    
    // Navigate to dashboard after successful login
    navigate('/dashboard');
  } catch (loginError) {
    // Error is handled by AuthContext, but we can show additional feedback
    console.error('Login attempt failed:', loginError);
    setLocalError('Login failed. Please check your credentials.');
  }
};

  return (
    // Main container with full viewport height and custom background
    <div className="min-h-screen w-full  relative overflow-hidden flex items-center justify-center p-4">
      {/* Background decorative elements matching the exact design */}
      {/* Top large ellipse - positioned at top with exact dimensions */}
      <div 
        className="absolute bg-gradient-to-br from-blue-700 to-blue-900 rounded-full"
        style={{
          width: '120%',
          height: '110%',
          flexShrink: 0,
          bottom: '350px',
          left: '-40px',
          transform: 'rotate(15deg)'
        }}>
      </div>
      
    
      
      {/* Bottom left curved accent to match the design flow */}
      <div 
        className="absolute bg-gradient-to-tr from-blue-900 to-blue-800 rounded-full"
        style={{
          width: '500px',
          height: '500px',
          bottom: '-250px',
          left: '-250px',
          opacity: 0.8,
          transform: 'rotate(-15deg)'
        }}>
      </div>
      {/* Centered card container - positioned above background elements */}
      <div className="relative z-10 w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        {/* Left side - Image container */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            {/* Container ship illustration */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src={image}
                alt="Container ship at port with cranes"
                className="w-full h-full object-cover rounded-l-3xl"
              />
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16">
          <div className="w-full max-w-md">
            {/* Logo and Title */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-blue-900 mb-4">TTarius logistics.</h1>
              <p className="text-gray-400 text-lg font-medium">Login as Admin</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Employee ID Input */}
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <BsPerson className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  maxLength={10}
                  pattern="\d{10}"
                  className="w-full px-4 pr-12 py-4 bg-gray-50 border-0 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:bg-white focus:shadow-sm transition-all duration-200"
                  placeholder="Enter Employee ID (10 digits)"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <BsLock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={6}
                  className="w-full px-4 pr-12 py-4 bg-gray-50 border-0 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:bg-white focus:shadow-sm transition-all duration-200"
                  placeholder="Enter Password (6 characters)"
                />
              </div>

              {/* Error message display */}
              {(error || localError) && (
                <div className="text-red-500 text-sm mt-2 mb-4">
                  {error || localError}
                </div>
              )}
              
              {/* Test credentials for development */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs">
                <p className="text-blue-900 font-medium mb-1">Test Credentials:</p>
                <p className="text-blue-800">Worker: 1234567890 / work01</p>
                <p className="text-blue-800">Analyst: 4567890123 / inv001</p>
                <p className="text-blue-800">Manager: 7890123456 / mgr001</p>
              </div>
              
              {/* Login Button with Loading State */}
              <button
                type="submit"
                disabled={isLoading || !employeeId || !password}
                className={`w-full bg-blue-900 text-white py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg flex items-center justify-center ${isLoading ? 'opacity-90 cursor-not-allowed' : 'hover:bg-blue-800 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Log In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;