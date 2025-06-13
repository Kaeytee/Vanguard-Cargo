import { useState } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';

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
  const handleSubmit = (e: React.FormEvent) => {
    // Prevent default form submission behavior
    e.preventDefault();
    // Handle login logic here (to be implemented)
    console.log('Login attempt with:', { username, password });
  };

  return (
    // Main container with full viewport height and width
    <div className="flex h-screen w-screen overflow-hidden bg-[#1e3a8a]">
      {/* Left side - Image container */}
      <div className="hidden md:block md:w-1/2 relative">
        <img 
          src="/logistics-ship.jpg" 
          alt="Logistics Ship" 
          className="h-full w-full object-cover"
        />
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white p-8 rounded-l-3xl">
        <div className="w-full max-w-md p-6">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1e3a8a]">TTarius logistics.</h1>
            <p className="text-gray-500 mt-2">Login as Admin</p>
          </div>
          
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                placeholder="Enter ID"
                required
              />
            </div>
            
            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>
            
            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-[#1e3a8a] text-white py-3 rounded-md hover:bg-[#152b63] transition-colors duration-300"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;