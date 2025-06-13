import { useState } from 'react';
import { BsPerson, BsLock } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
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
  
  // State for form inputs and UI states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle form submission
   * @param {React.FormEvent} e - Form event
   */
/**
 * Interface for login credentials
 */
interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Handles the login form submission
 * Shows loading state, simulates authentication, and navigates to dashboard
 * @param {React.FormEvent<HTMLButtonElement>} e - Form event
 */
const handleSubmit = (e: React.FormEvent<HTMLButtonElement>): void => {
  // Prevent default form submission behavior
  e.preventDefault();
  
  // Reset any previous errors
  setError('');
  
  // Validate form inputs
  if (!username || !password) {
    setError('Please enter both username and password');
    return;
  }
  
  // Set loading state
  setIsLoading(true);
  
  // Create credentials object
  const credentials: LoginCredentials = { username, password };
  console.log('Login attempt with:', credentials);
  
  // Simulate authentication process with a delay
  setTimeout(() => {
    // For demo purposes, we'll consider any login successful
    // In a real application, you would validate credentials against an API
    
    // Set authentication state in session storage
    sessionStorage.setItem('isAuthenticated', 'true');
    
    // Store user info if needed
    sessionStorage.setItem('user', JSON.stringify({
      username,
      role: 'admin',
      lastLogin: new Date().toISOString()
    }));
    
    // Navigate to dashboard after successful login
    setIsLoading(false);
    navigate('/dashboard');
  }, 2000); // 2 seconds delay to show the loader
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
            <div className="space-y-6">
              {/* Username Input */}
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <BsPerson className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 pr-12 py-4 bg-gray-50 border-0 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:bg-white focus:shadow-sm transition-all duration-200"
                  placeholder="Enter ID"
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
                  className="w-full px-4 pr-12 py-4 bg-gray-50 border-0 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:bg-white focus:shadow-sm transition-all duration-200"
                  placeholder="Enter password"
                />
              </div>

              {/* Error message display */}
              {error && (
                <div className="text-red-500 text-sm mt-2 mb-4">
                  {error}
                </div>
              )}
              
              {/* Login Button with Loading State */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;