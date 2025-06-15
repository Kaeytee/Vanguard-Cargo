import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { 
	Eye, 
	EyeOff
} from 'lucide-react';
import { cn } from '../../lib/utils';
import AnimateInView from '../../components/ui/animate-in-view';
import loginbg from '../../images/register-bg.jpg';
import Image from '../../images/delivery-man.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
/**
 * Login component - Displays the Login page with animations matching the design
 * @returns {JSX.Element} The Login page component	
 */
/**
 * Login component - Handles user authentication and redirects to the client app
 * 
 * This component manages the login form, authentication process, and redirection
 * to the client app dashboard or the originally requested protected route.
 * 
 * @returns {JSX.Element} The Login page component
 */
export default function Login() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, setUser, setLoading: setAuthLoading } = useAuth();
	
	// Get the path the user was trying to access before being redirected to login
	const from = location.state?.from || '/app/dashboard';
	
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	
	// Check if user is already authenticated on component mount
	useEffect(() => {
		if (user) {
			// If already authenticated via context, redirect to dashboard
			navigate('/app/dashboard');
		} else {
			// Fallback check for backward compatibility
			const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
			if (isAuthenticated) {
				// If authenticated via localStorage, redirect to dashboard
				navigate('/app/dashboard');
			}
		}
	}, [navigate, user]);

	/**
	 * Handle form submission for login
	 * Authenticates the user and redirects to the appropriate route
	 */
	const handleSubmit = async () => {
		setIsLoading(true);
		setAuthLoading(true);

		// Simulate login (replace with actual authentication)
		setTimeout(() => {
			// Create mock user data (in a real app, this would come from your backend)
			const mockUser = {
				id: "1",
				name: email.split("@")[0],
				email: email,
				image: "https://www.pngall.com/wp-content/uploads/12/Avatar-PNG-Background.png"
			};

			// Update auth context with user data
			setUser(mockUser);
			
			// Also store in localStorage for backward compatibility
			localStorage.setItem('isAuthenticated', 'true');

			console.log('Login successful:', mockUser);
			setIsLoading(false);
			setAuthLoading(false);
			
			// Redirect to the original route the user was trying to access or dashboard
			navigate(from);
		}, 1000);
	};

	// Form validation
	const isFormValid = email && password;

	return (
		<div className="login-container">
			{/* Main Login Section */}
			<section 
				className="relative min-h-screen flex items-center justify-center p-4"
				style={{
					backgroundImage: `url(${loginbg})`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat'
				}}
			>
				<AnimateInView variant="fadeInUp" delay={0.2}>
					<motion.div 
						className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row"
						whileHover={{ y: -2 }}
						transition={{ duration: 0.3 }}
					>
						{/* Left Side - Logistics Image */}
						<AnimateInView variant="fadeInLeft" delay={0.4} className="md:w-1/2">
							<motion.div 
								className="relative h-64 md:h-full min-h-[500px] flex items-center justify-center"
								whileHover={{ scale: 1.02 }}
								transition={{ duration: 0.3 }}
							>
								<img 
									src={Image}
									alt="Airplane flying over logistics trucks and containers at sunset"
									className="w-full h-full object-cover"
								/>
							</motion.div>
						</AnimateInView>

						{/* Right Side - Login Form */}
						<AnimateInView variant="fadeInRight" delay={0.6} className="md:w-1/2">
							<div className="p-8 md:p-12 h-full flex flex-col justify-center">
								<div className="mb-8">
									<h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
									<p className="text-gray-600">Begin your logistics journey here</p>
								</div>

								<div className="space-y-6">
									{/* Email Field */}
									<motion.div
										whileFocus={{ scale: 1.02 }}
										transition={{ duration: 0.2 }}
									>
										<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
											Email Address *
										</label>
										<input
											type="email"
											id="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											placeholder="you@example.com"
											className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
										/>
									</motion.div>

									{/* Password Field */}
									<motion.div
										whileFocus={{ scale: 1.02 }}
										transition={{ duration: 0.2 }}
									>
										<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
											Password *
										</label>
										<div className="relative">
											<input
												type={showPassword ? "text" : "password"}
												id="password"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												placeholder="••••••••"
												className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
											/>
											<button
												className="absolute right-4 top-1/2 transform -translate-y-1/2"
												onClick={() => setShowPassword(!showPassword)}
											>
												{showPassword ? (
													<EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
												) : (
													<Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
												)}
											</button>
										</div>
									</motion.div>

									{/* Remember Me & Forgot Password */}
									<div className="flex items-center justify-between">
										<motion.label 
											className="flex items-center space-x-2 cursor-pointer"
											whileHover={{ x: 2 }}
											transition={{ duration: 0.2 }}
										>
											<input
												type="checkbox"
												checked={rememberMe}
												onChange={(e) => setRememberMe(e.target.checked)}
												className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
											/>
											<span className="text-sm text-gray-700">Remember Me</span>
										</motion.label>

										<a 
											href="/forgot-password" 
											className="text-sm text-red-500 hover:text-red-600 font-medium"
										>
											Forgot password?
										</a>
									</div>

									{/* Submit Button */}
									<motion.button
										onClick={handleSubmit}
										disabled={!isFormValid || isLoading}
										className={cn(
											"w-full font-semibold px-6 py-3 rounded-md transition-all duration-200 flex items-center justify-center",
											isFormValid && !isLoading
												? "bg-red-500 hover:bg-red-600 text-white"
												: "bg-gray-300 text-gray-500 cursor-not-allowed"
										)}
										whileHover={isFormValid && !isLoading ? { scale: 1.02, y: -2 } : {}}
										whileTap={isFormValid && !isLoading ? { scale: 0.98 } : {}}
									>
										{isLoading ? (
											<>
												<motion.div
													className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
													animate={{ rotate: 360 }}
													transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
												/>
												Signing in...
											</>
										) : (
											'Sign In'
										)}
									</motion.button>

									{/* Register Link */}
									<div className="text-center">
										<p className="text-sm text-gray-600">
											Don't have an account?{' '}
											<a href="register" className="text-red-500 hover:text-red-600 font-medium">
												Register
											</a>
										</p>
									</div>
								</div>
							</div>
						</AnimateInView>
					</motion.div>
				</AnimateInView>
			</section>		</div>
	);
}