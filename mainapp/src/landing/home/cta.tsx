import { Link } from 'react-router-dom';
import AnimateInView from '../../components/ui/animate-in-view';
import { motion } from 'framer-motion';
import Image from '../../images/deliveryparcel.jpg';

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
		<section className="py-16 bg-[#ff3b3b] text-white relative overflow-hidden">
			{/* Background with slight opacity gradient */}
			<div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/10"></div>

			<div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10 relative z-10">
				{/* Left Content Area */}
				<div className="flex-1">
					<AnimateInView>
						<h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Transform Your Logistics?</h2>
					</AnimateInView>
					<AnimateInView variant="fadeInUp" delay={0.2}>
						<p className="text-lg mb-8 text-white/90">
							Partner with us to innovative Solutions that elevate your supply chain management
						</p>
					</AnimateInView>
					<AnimateInView variant="fadeInUp" delay={0.3}>
						<Link to="/contact">
							<AnimatedButton size="lg" className="bg-white hover:bg-gray-100 text-red-600 font-medium">
								Request a Quote
							</AnimatedButton>
						</Link>
					</AnimateInView>
				</div>

				{/* Right Image Area */}
				<div className="flex-1 flex justify-center items-center">
					<AnimateInView variant="fadeInRight" delay={0.4}>
						<div className="relative max-w-xs md:max-w-md">
							<img
								src={Image}
								alt="Logistics delivery worker"
								className="rounded-lg shadow-xl object-cover"
								style={{ maxHeight: "300px", width: "100%" }}
								loading="lazy"
							/>
						</div>
					</AnimateInView>
				</div>
			</div>
		</section>
	);
}
