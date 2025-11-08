import { Link } from 'react-router-dom';
import AnimateInView from '../../components/ui/animate-in-view';
import { motion } from 'framer-motion';
import { MapPin, Check, Rocket } from 'lucide-react';
import deliveryImage from '../../assets/deliver.png';

// Simple animated button component
const AnimatedButton = ({
	children,
	className = "",
	size = "md"
}: {
	children: React.ReactNode;
	className?: string;
	size?: "sm" | "md" | "lg";
}) => {
	const sizeClasses = {
		sm: "px-3 py-1.5 text-sm",
		md: "px-4 py-2",
		lg: "px-6 py-3 text-lg"
	};

	return (
		<motion.button
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.98 }}
			className={`font-medium rounded transition duration-300 ${sizeClasses[size]} ${className}`}
		>
			{children}
		</motion.button>
	);
};

export default function CTA() {
	return (
		<section className="py-12 md:py-16 bg-red-700 text-white relative overflow-hidden">
			<div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-8 md:gap-10 relative z-10">
				{/* Left Content Area */}
				<div className="flex-1 text-center md:text-left w-full">
					<AnimateInView>
						<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-white flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2">
							<span>Ready to Start Shopping in the US?</span>
							<MapPin className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
						</h2>
					</AnimateInView>
					<AnimateInView variant="fadeInUp" delay={0.2}>
						<p className="text-base sm:text-lg mb-5 md:mb-6 text-white/90 px-2 sm:px-0">
							Join 5000+ Ghanaians who save money and shop from any US store with their free Vanguard address.
						</p>
					</AnimateInView>

					{/* Benefits list */}
					<AnimateInView variant="fadeInUp" delay={0.3}>
						<div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 mb-6 md:mb-8 px-2 sm:px-0">
							<div className="flex items-center bg-white/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
								<Check className="w-4 h-4 text-red-300 mr-2 flex-shrink-0" />
								<span className="text-xs sm:text-sm whitespace-nowrap">Free US address</span>
							</div>
							<div className="flex items-center bg-white/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
								<Check className="w-4 h-4 text-red-300 mr-2 flex-shrink-0" />
								<span className="text-xs sm:text-sm whitespace-nowrap">Package consolidation</span>
							</div>
							<div className="flex items-center bg-white/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
								<Check className="w-4 h-4 text-red-300 mr-2 flex-shrink-0" />
								<span className="text-xs sm:text-sm whitespace-nowrap">Save up to 80%</span>
							</div>
						</div>
					</AnimateInView>

					<AnimateInView variant="fadeInUp" delay={0.4}>
						<div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-start w-full px-2 sm:px-0">
							<Link to="/register" className="w-full sm:w-auto">
								<AnimatedButton size="lg" className="w-full sm:w-auto bg-white hover:bg-red-100 text-red-900 font-bold flex items-center justify-center gap-2 animate-pulse-glow-white hover:animate-none">
									Get My Free US Address 
									<Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
								</AnimatedButton>
							</Link>
							<Link to="/services" className="w-full sm:w-auto">
								<AnimatedButton size="lg" className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-900 font-medium">
									Learn More
								</AnimatedButton>
							</Link>
						</div>
					</AnimateInView>

					<AnimateInView variant="fadeInUp" delay={0.5}>
						<p className="text-red-200 mt-4 text-xs sm:text-sm px-2 sm:px-0">
							No setup fees • No monthly charges • Start shopping immediately
						</p>
					</AnimateInView>
				</div>

				{/* Right Image Area - Hidden on mobile */}
				<div className="hidden md:flex flex-1 justify-center items-center">
					<AnimateInView variant="fadeInRight" delay={0.4}>
						<div className="relative max-w-xs md:max-w-md w-full">
							{/* Delivery Image */}
							<img 
								src={deliveryImage} 
								alt="Fast Delivery to Ghana" 
								className="w-full h-auto object-contain rounded-lg"
							/>
						</div>
					</AnimateInView>
				</div>
			</div>
		</section>
	);
}
