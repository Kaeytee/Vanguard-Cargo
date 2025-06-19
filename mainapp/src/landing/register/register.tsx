import { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { cn } from '../../lib/utils';
import AnimateInView from '../../components/ui/animate-in-view';
import registerbg from '../../images/register-bg.jpg';
import { useNavigate } from 'react-router-dom';
import DeliveryImage from '../../images/deliveryparcel.jpg';

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
    agreeToMarketing: false,
  });

  // UI state and validation
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [errors, setErrors] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    agreeToTerms: string;
    general: string;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    agreeToTerms: '',
    general: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState<{
    firstName: boolean;
    lastName: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
    agreeToTerms: boolean;
  }>({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
    agreeToTerms: false,
  });
  const navigate = useNavigate();

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  // Handle phone number change
  const handlePhoneChange = (value?: string) => {
    setFormData((prev) => ({ ...prev, phoneNumber: value || '' }));
    if (value && !isValidPhoneNumber(value)) {
      setPhoneError('Please enter a valid phone number');
    } else {
      setPhoneError('');
    }
  };

  // Email validation helper
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validate all fields
  const validate = () => {
    const newErrors: typeof errors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      agreeToTerms: '',
      general: '',
    };
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!isValidEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.phoneNumber || !isValidPhoneNumber(formData.phoneNumber))
      newErrors.phoneNumber = 'Valid phone number is required';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms of service';
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async () => {
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error)) return;

    setLoading(true);
    setErrors((prev) => ({ ...prev, general: '' }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (formData.email === 'test@example.com' || formData.email === 'existing@example.com') {
        setErrors((prev) => ({ ...prev, general: 'Email already exists' }));
      } else {
        setSuccess(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          password: '',
          confirmPassword: '',
          agreeToTerms: false,
          agreeToMarketing: false,
        });
        setTouched({
          firstName: false,
          lastName: false,
          email: false,
          password: false,
          confirmPassword: false,
          agreeToTerms: false,
        });
        setTimeout(() => navigate('/login'), 1000);
      }
    } catch {
      setErrors((prev) => ({ ...prev, general: 'An error occurred. Please try again.' }));
    } finally {
      setLoading(false);
    }
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
    formData.password === formData.confirmPassword &&
    formData.agreeToTerms;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const newErrors = validate();
    setErrors(newErrors);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <section
        className="relative min-h-screen w-full flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: `url(${registerbg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <style>
          {`
            .error-shake {
              animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
            }
            @keyframes shake {
              10%, 90% { transform: translateX(-1px); }
              20%, 80% { transform: translateX(2px); }
              30%, 50%, 70% { transform: translateX(-4px); }
              40%, 60% { transform: translateX(4px); }
            }
            @media (max-width: 767px) {
              .bg-image {
                background-image: none !important;
                background-color: #f3f4f6;
              }
            }
          `}
        </style>
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white shadow-2xl rounded-2xl overflow-hidden">
            <img src={DeliveryImage} alt="Delivery person with parcels" className="w-full lg:w-1/2  object-cover object-center" />
            <AnimateInView variant="fadeInRight" delay={0.4} className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8">
              <div className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-md mx-auto">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Account</h2>
                  <p className="text-gray-600 mt-2 text-sm sm:text-base">Begin your logistics journey here</p>
                </div>
                {success && (
                  <div className="mb-4 text-green-600 text-sm text-center bg-green-50 p-3 rounded-md">
                    Account created successfully!
                  </div>
                )}
                {errors.general && (
                  <div className="mb-4 text-red-600 text-sm text-center bg-red-50 p-3 rounded-md error-shake">
                    {errors.general}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="John"
                        className={cn(
                          'w-full px-4 py-2 border rounded-md transition-colors duration-200',
                          errors.firstName && touched.firstName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                        )}
                        aria-invalid={!!errors.firstName}
                        aria-describedby="firstName-error"
                      />
                      {errors.firstName && touched.firstName && (
                        <p id="firstName-error" className="mt-1 text-sm text-red-600">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Doe"
                        className={cn(
                          'w-full px-4 py-2 border rounded-md transition-colors duration-200',
                          errors.lastName && touched.lastName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                        )}
                        aria-invalid={!!errors.lastName}
                        aria-describedby="lastName-error"
                      />
                      {errors.lastName && touched.lastName && (
                        <p id="lastName-error" className="mt-1 text-sm text-red-600">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="you@example.com"
                      className={cn(
                        'w-full px-4 py-2 border rounded-md transition-colors duration-200',
                        errors.email && touched.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                      )}
                      aria-invalid={!!errors.email}
                      aria-describedby="email-error"
                    />
                    {errors.email && touched.email && (
                      <p id="email-error" className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <PhoneInput
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="Enter phone number"
                      className={cn(
                        'w-full px-4 py-2 border rounded-md transition-colors duration-200',
                        phoneError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                      )}
                      data-testid="phone-input"
                      aria-invalid={!!phoneError}
                      aria-describedby="phoneNumber-error"
                    />
                    {phoneError && (
                      <p id="phoneNumber-error" className="mt-1 text-sm text-red-600">
                        {phoneError}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={cn(
                          'w-full px-4 py-2 pr-12 border rounded-md transition-colors duration-200',
                          errors.password && touched.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                        )}
                        aria-invalid={!!errors.password}
                        aria-describedby="password-error"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        aria-label="Toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400" data-testid="mock-icon" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400" data-testid="mock-icon" />
                        )}
                      </button>
                    </div>
                    {errors.password && touched.password && (
                      <p id="password-error" className="mt-1 text-sm text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={cn(
                          'w-full px-4 py-2 pr-12 border rounded-md transition-colors duration-200',
                          errors.confirmPassword && touched.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
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
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400" data-testid="mock-icon" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400" data-testid="mock-icon" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
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
                        <div
                          className={cn(
                            'w-5 h-5 border-2 rounded flex items-center justify-center transition-colors duration-200',
                            formData.agreeToTerms ? 'bg-red-500 border-red-500' : 'border-gray-300'
                          )}
                        >
                          {formData.agreeToTerms && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">
                        I agree to the{' '}
                        <a href="#" className="text-red-500 hover:text-red-600 font-medium">
                          terms of service
                        </a>
                      </span>
                    </label>
                    {errors.agreeToTerms && touched.agreeToTerms && (
                      <p className="ml-8 text-sm text-red-600">You must agree to the terms and conditions</p>
                    )}
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="agreeToMarketing"
                          checked={formData.agreeToMarketing}
                          onChange={handleInputChange}
                          className="sr-only"
                          aria-label="I agree to receive marketing communications"
                        />
                        <div
                          className={cn(
                            'w-5 h-5 border-2 rounded flex items-center justify-center transition-colors duration-200',
                            formData.agreeToMarketing ? 'bg-red-500 border-red-500' : 'border-gray-300'
                          )}
                        >
                          {formData.agreeToMarketing && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">I agree to receive marketing communications</span>
                    </label>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!isFormValid || loading}
                    className={cn(
                      'w-full font-semibold px-6 py-3 rounded-md transition-all duration-200 flex items-center justify-center',
                      isFormValid && !loading
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    )}
                    aria-busy={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Creating account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <a
                        href="#"
                        className="text-red-500 hover:text-red-600 font-medium"
                        aria-label="Log in"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/login');
                        }}
                      >
                        Log in
                      </a>
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