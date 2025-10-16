import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FloatingSupportButton Component
 * 
 * A floating support button that appears in the bottom-right corner of the screen.
 * When clicked, it redirects users to the contact/support page.
 * Includes hover effects and responsive design.
 * 
 * VISIBILITY: Hidden on contact/support pages (no need to show button when already on support page)
 * 
 * @component
 * @returns {JSX.Element | null} The floating support button component or null if on support page
 */
export default function FloatingSupportButton() {
	// Get current location to check if we're on contact/support page
	const location = useLocation();
	
	// State to track hover status for animation effects
	const [isHovered, setIsHovered] = useState<boolean>(false);
	
	// State to show/hide tooltip on hover
	const [showTooltip, setShowTooltip] = useState<boolean>(false);

	/**
	 * Check if current page is a support/contact page
	 * @returns {boolean} True if on support/contact page, false otherwise
	 */
	const isOnSupportPage = (): boolean => {
		const path = location.pathname.toLowerCase();
		return path === '/contact' || path === '/app/support';
	};

	// Don't render button if user is already on contact/support page
	if (isOnSupportPage()) {
		return null;
	}

	/**
	 * Handle mouse enter event
	 * Shows tooltip and triggers hover state
	 */
	const handleMouseEnter = () => {
		setIsHovered(true);
		setShowTooltip(true);
	};

	/**
	 * Handle mouse leave event
	 * Hides tooltip and resets hover state
	 */
	const handleMouseLeave = () => {
		setIsHovered(false);
		setShowTooltip(false);
	};

	return (
		<div className="fixed bottom-6 right-6 z-50">
			{/* Tooltip */}
			<AnimatePresence>
				{showTooltip && (
					<motion.div
						initial={{ opacity: 0, x: 10 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 10 }}
						transition={{ duration: 0.2 }}
						className="absolute bottom-full right-0 mb-2 mr-1"
					>
						<div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg whitespace-nowrap text-sm font-medium">
							Need help? Contact us
							{/* Tooltip arrow */}
							<div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Main Support Button */}
			<Link to="/contact">
				<motion.button
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					className="relative w-14 h-14 md:w-16 md:h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center group"
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.95 }}
					animate={isHovered ? { rotate: [0, -10, 10, -10, 0] } : {}}
					transition={{ duration: 0.5 }}
					aria-label="Contact Support"
				>
					{/* Icon Container */}
					<motion.div
						animate={isHovered ? { scale: [1, 1.2, 1] } : {}}
						transition={{ duration: 0.3 }}
					>
						<MessageCircle className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2} />
					</motion.div>

					{/* Pulsing ring animation */}
					<motion.div
						className="absolute inset-0 rounded-full bg-red-600 opacity-0 group-hover:opacity-75"
						animate={{
							scale: [1, 1.5, 1],
							opacity: [0.5, 0, 0.5],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>

					{/* Notification badge (optional - can be enabled for unread messages) */}
					{/* <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div> */}
				</motion.button>
			</Link>

			{/* Mobile-only text label (appears below button on small screens) */}
			<div className="md:hidden text-center mt-1">
				<span className="text-xs text-gray-600 font-medium">Support</span>
			</div>
		</div>
	);
}
