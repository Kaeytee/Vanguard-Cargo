
import { Link } from "react-router-dom";
import { CONTACT_INFO, getPhoneLink } from "../constants/contact";

export default function Footer() {
	return (
		<footer className="bg-gray-50 border-t border-gray-200">
			<div className="max-w-7xl mx-auto px-6 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Company Info */}
					<div className="space-y-4">
						<Link to="/" className="text-2xl font-bold text-red-600">
							Vanguard Cargo
						</Link>
						<p className="text-gray-600 text-sm leading-relaxed">
							Transforming global freight with cutting-edge technology and unparalleled service.
						</p>
					</div>

					{/* Quick Links */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
						<div className="space-y-2">
							<Link
								to="/"
								className="block text-gray-600 hover:text-red-600 transition-colors duration-200"
							>
								Home
							</Link>
							<Link
								to="/services"
								className="block text-gray-600 hover:text-red-600 transition-colors duration-200"
							>
								Services
							</Link>
							<Link
								to="/contact"
								className="block text-gray-600 hover:text-red-600 transition-colors duration-200"
							>
								Contact
							</Link>
						</div>
					</div>

					{/* Account */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-gray-900">Account</h3>
						<div className="space-y-2">
							<Link
								to="/login"
								className="block text-gray-600 hover:text-red-600 transition-colors duration-200"
							>
								Login
							</Link>
							<Link
								to="/register"
								className="block text-gray-600 hover:text-red-600 transition-colors duration-200"
							>
								Register
							</Link>
							<Link
								to="/app/dashboard"
								className="block text-gray-600 hover:text-red-600 transition-colors duration-200"
							>
								My Dashboard
							</Link>
							<Link
								to="/app/tracking"
								className="block text-gray-600 hover:text-red-600 transition-colors duration-200"
							>
								Track Package
							</Link>
						</div>
					</div>

					{/* Contact */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-gray-900">
							Contact
						</h3>
						<div className="space-y-2 text-gray-600">
							<p className="text-sm">
								{CONTACT_INFO.ADDRESS.LINE1}<br />
								{CONTACT_INFO.ADDRESS.LINE2}
							</p>
							<p className="text-sm">
								Email: {CONTACT_INFO.SUPPORT_EMAIL}
							</p>
							<div className="text-sm">
								<p>Mobile: <a href={getPhoneLink(CONTACT_INFO.MOBILE_PHONE)} className="hover:text-red-600 transition-colors">{CONTACT_INFO.MOBILE_DISPLAY}</a></p>
								<p>Landline: <a href={getPhoneLink(CONTACT_INFO.LANDLINE_PHONE)} className="hover:text-red-600 transition-colors">{CONTACT_INFO.LANDLINE_DISPLAY}</a></p>
							</div>
						</div>

						{/* Social Media Icons */}
						<div className="flex space-x-4 pt-2">
							<a
								href="#"
								className="text-gray-600 hover:text-red-600 transition-colors duration-200"
								aria-label="Facebook"
							>
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
								</svg>
							</a>
							<a
								href="#"
								className="text-gray-600 hover:text-red-600 transition-colors duration-200"
								aria-label="LinkedIn"
							>
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
								</svg>
							</a>
							<a
								href="#"
								className="text-gray-600 hover:text-red-600 transition-colors duration-200"
								aria-label="Twitter"
							>
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
								</svg>
						</div>
					</div>
				</div>

				{/* Bottom Section */}
				<div className="mt-12 pt-8 border-t border-gray-200">
					<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
						<p className="text-gray-600 text-sm">
							© {new Date().getFullYear()} Vanguard Cargo. All rights reserved.
						</p>
						<div className="flex space-x-6">
							<Link
								to="/privacy-policy"
								className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200"
							>
								Privacy Policy
							</Link>
							<Link
								to="/terms-of-service"
								className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200"
							>
								Terms of Service
							</Link>
							<Link
								to="/data-deletion"
								className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200"
							>
								Data Deletion
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	</footer>
	)
