import { useState } from 'react';
import { BsPerson, BsLock } from 'react-icons/bs';
import image from '../assets/Login.png';


/**
 * Login Component
 * 
 * This component renders the login page for TTarius Logistics warehouse application.
 * It includes a form with username and password inputs, and a login button.
 * The design matches the provided mockup with a split layout - image on left, form on right.
 */
const Login = () => {
  // State for form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Handle form submission
   * @param {React.FormEvent} e - Form event
   */
interface LoginCredentials {
  username: string;
  password: string;
}

const handleSubmit = (e: React.FormEvent<HTMLButtonElement>): void => {
  // Prevent default form submission behavior
  e.preventDefault();
  // Handle login logic here (to be implemented)
  const credentials: LoginCredentials = { username, password };
  console.log('Login attempt with:', credentials);
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

              {/* Login Button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-900 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;