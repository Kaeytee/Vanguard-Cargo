import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff,
  Check
} from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { cn } from '../../lib/utils';
import AnimateInView from '../../components/ui/animate-in-view';
import registerbg from '../../images/register-bg.jpg';
import Image from '../../images/deliveryparcel.jpg';

/**
 * Register component - Displays the Register/Signup page with animations
 * @returns {JSX.Element} The Register page component
 */
export default function Register() {
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    agreeToMarketing: false
  });

  // UI state and validation
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Handle form input changes
  const handleInputChange = (e: { target: { name: any; value: any; type: any; checked: any; }; }) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle phone number change from PhoneInput component
  // Accepts value as string or undefined (E164Number | undefined)
  const handlePhoneChange = (value?: string) => {
    // Update phoneNumber in formData; if value is undefined, set as empty string
    setFormData(prev => ({
      ...prev,
      phoneNumber: value || ''
    }));

    // If value exists and is invalid, set error; otherwise, clear error
    if (value && !isValidPhoneNumber(value)) {
      setPhoneError('Please enter a valid phone number');
    } else {
      setPhoneError('');
    }
  };
  // Handle form submission
  const handleSubmit = () => {
    if (!isValidPhoneNumber(formData.phoneNumber)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    console.log('Form submitted:', formData);
    // Add your form submission logic here
    alert('Account created successfully!');
  };

  // Form validation
  const isFormValid = formData.firstName && 
    formData.lastName && 
    formData.email && 
    formData.phoneNumber && 
    isValidPhoneNumber(formData.phoneNumber) && 
    !phoneError && 
    formData.password && 
    formData.confirmPassword && 
    formData.password === formData.confirmPassword &&
    formData.agreeToTerms;

  return (
    <div className="register-container">
      {/* Main Registration Section */}
      <section className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: `url(${registerbg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Left Side - Delivery Person Image */}
            <AnimateInView variant="fadeInLeft" delay={0.4} className="md:w-1/2">
              <motion.div 
                className="relative h-64 md:h-full min-h-[500px] flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src={Image}
                  alt="Delivery person"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimateInView>

            {/* Right Side - Registration Form */}
            <AnimateInView variant="fadeInRight" delay={0.4} className="w-full lg:w-1/2 p-6 lg:p-8">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                  <p className="text-gray-600 mt-2">Begin your logistics journey here</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      />
                    </motion.div>
                    <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      />
                    </motion.div>
                  </div>

                  <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </motion.div>

                  <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <div className="flex items-center space-x-2">
                      <PhoneInput
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="Enter phone number"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
                  </motion.div>

                  <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full px-4 py-2 pr-12 border rounded-md transition-colors duration-200",
                          formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                        )}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                    )}
                  </motion.div>

                  <div className="space-y-3">
                    <motion.label 
                      className="flex items-start space-x-3 cursor-pointer"
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <motion.div 
                          className={cn(
                            "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors duration-200",
                            formData.agreeToTerms 
                              ? "bg-red-500 border-red-500" 
                              : "border-gray-300"
                          )}
                          whileTap={{ scale: 0.9 }}
                        >
                          {formData.agreeToTerms && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </motion.div>
                      </div>
                      <span className="text-sm text-gray-700">
                        I agree to the{' '}
                        <a href="#" className="text-red-500 hover:text-red-600 font-medium">Terms of Service</a>
                      </span>
                    </motion.label>

                    <motion.label 
                      className="flex items-start space-x-3 cursor-pointer"
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="agreeToMarketing"
                          checked={formData.agreeToMarketing}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <motion.div 
                          className={cn(
                            "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors duration-200",
                            formData.agreeToMarketing 
                              ? "bg-red-500 border-red-500" 
                              : "border-gray-300"
                          )}
                          whileTap={{ scale: 0.9 }}
                        >
                          {formData.agreeToMarketing && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </motion.div>
                      </div>
                      <span className="text-sm text-gray-700">
                        I agree to receive marketing communications from your company
                      </span>
                    </motion.label>
                  </div>

                  <motion.button
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                    className={cn(
                      "w-full font-semibold px-6 py-3 rounded-md transition-all duration-200",
                      isFormValid
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                    whileHover={isFormValid ? { scale: 1.02, y: -2 } : {}}
                    whileTap={isFormValid ? { scale: 0.98 } : {}}
                  >
                    Create Account
                  </motion.button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <a href="/login" className="text-red-500 hover:text-red-600 font-medium">Log in</a>
                    </p>
                  </div>
                </div>
              </div>
            </AnimateInView>
          </div>
        </div>
      </section>    </div>
  );
}