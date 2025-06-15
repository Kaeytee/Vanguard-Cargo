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
import { useNavigate } from 'react-router-dom';

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
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: '',
    general: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
    agreeToTerms: false
  });
  const navigate = useNavigate();

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

  // Email validation helper
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validate all fields
  const validate = () => {
    const newErrors: any = {};
    if (!formData.firstName) newErrors.firstName = 'first name is required';
    if (!formData.lastName) newErrors.lastName = 'last name is required';
    if (!formData.email) newErrors.email = 'email is required';
    else if (!isValidEmail(formData.email)) newErrors.email = 'please enter a valid email address';
    if (!formData.password) newErrors.password = 'password is required';
    else if (formData.password.length < 8) newErrors.password = 'password must be at least 8 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'passwords do not match';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'you must agree to the terms of service';
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async () => {
    const newErrors = validate();
    if (!isValidPhoneNumber(formData.phoneNumber)) {
      setPhoneError('Please enter a valid phone number');
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    setErrors({ ...errors, general: '' });
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (formData.email === 'test@example.com') {
        setErrors({ ...errors, general: 'Email already exists' });
        window.alert('Email already exists');
      } else {
        setSuccess(true);
        window.alert('Account created successfully!');
        setFormData({
          firstName: '', lastName: '', email: '', phoneNumber: '', password: '', confirmPassword: '', agreeToTerms: false, agreeToMarketing: false
        });
      }
    }, 1200);
  };

  // Form validation
  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    isValidEmail(formData.email) &&
    formData.phoneNumber &&
    isValidPhoneNumber(formData.phoneNumber) &&
    !phoneError &&
    formData.password &&
    formData.password.length >= 8 &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword &&
    formData.agreeToTerms;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

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
                {/* Feedback messages */}
                {success && (
                  <div className="mb-4 text-green-600 text-sm text-center">Account created successfully!</div>
                )}
                {!success && errors.general && (
                  <div className="mb-4 text-red-600 text-sm text-center">{errors.general}</div>
                )}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="John"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        aria-invalid={!!errors.firstName}
                        aria-describedby="firstName-error"
                      />
                      {(errors.firstName && (touched.firstName || errors.firstName)) && <p id="firstName-error" className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Doe"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        aria-invalid={!!errors.lastName}
                        aria-describedby="lastName-error"
                      />
                      {(errors.lastName && (touched.lastName || errors.lastName)) && <p id="lastName-error" className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      aria-invalid={!!errors.email}
                      aria-describedby="email-error"
                    />
                    {(errors.email && (touched.email || errors.email)) && <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <div className="flex items-center space-x-2">
                      <PhoneInput
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="Enter phone number"
                        data-testid="phone-input"
                        aria-invalid={!!phoneError}
                        aria-describedby="phoneNumber-error"
                      />
                    </div>
                    {phoneError && <p id="phoneNumber-error" className="mt-1 text-sm text-red-600">{phoneError}</p>}
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        aria-invalid={!!errors.password}
                        aria-describedby="password-error"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        aria-label="Toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" data-testid="mock-icon" /> : <Eye className="w-5 h-5 text-gray-400" data-testid="mock-icon" />}
                      </button>
                    </div>
                    {(errors.password && (touched.password || errors.password)) && <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={cn(
                          "w-full px-4 py-2 pr-12 border rounded-md transition-colors duration-200",
                          formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                        )}
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby="confirmPassword-error"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        aria-label="Toggle password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400" data-testid="mock-icon" /> : <Eye className="w-5 h-5 text-gray-400" data-testid="mock-icon" />}
                      </button>
                    </div>
                    {(errors.confirmPassword && (touched.confirmPassword || errors.confirmPassword)) && <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && !errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                    )}
                  </div>
                  <div className="space-y-3">
                    {/* Only one terms of service checkbox */}
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className="sr-only"
                          aria-label="I agree to the terms of service"
                        />
                        <div className={cn(
                          "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors duration-200",
                          formData.agreeToTerms 
                            ? "bg-red-500 border-red-500" 
                            : "border-gray-300"
                        )}>
                          {formData.agreeToTerms && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">
                        I agree to the{' '}
                        <a href="#" className="text-red-500 hover:text-red-600 font-medium">terms of service</a>
                      </span>
                    </label>
                    {(errors.agreeToTerms && (touched.agreeToTerms || errors.agreeToTerms)) && <p className="ml-8 text-sm text-red-600">you must agree to the terms and conditions</p>}
                    {/* Only one marketing communications checkbox */}
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="agreeToMarketing"
                          checked={formData.agreeToMarketing}
                          onChange={handleInputChange}
                          className="sr-only"
                          aria-label="I agree to receive marketing communications from your company"
                        />
                        <div className={cn(
                          "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors duration-200",
                          formData.agreeToMarketing 
                            ? "bg-red-500 border-red-500" 
                            : "border-gray-300"
                        )}>
                          {formData.agreeToMarketing && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">
                        I agree to receive marketing communications from your company
                      </span>
                    </label>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!isFormValid || loading}
                    className={cn(
                      "w-full font-semibold px-6 py-3 rounded-md transition-all duration-200 flex items-center justify-center",
                      isFormValid && !loading
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                    aria-busy={loading}
                  >
                    {loading ? (
                      <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Creating account...</span>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <a href="#" className="text-red-500 hover:text-red-600 font-medium" aria-label="Log in" onClick={e => { e.preventDefault(); navigate('/login'); }}>Log in</a>
                    </p>
                  </div>
                </div>
              </div>
            </AnimateInView>
          </div>
        </div>
      </section>
    </div>
  );
}