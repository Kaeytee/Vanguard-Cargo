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
		<section className="py-16 bg-gradient-to-br from-red-900 via-red-800 to-red-700 text-white relative overflow-hidden">
			<div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10 relative z-10">
				{/* Left Content Area */}
				<div className="flex-1 text-center md:text-left">
					<AnimateInView>
						<h2 className="text-3xl md:text-4xl font-bold mb-4 text-white flex items-center justify-center md:justify-start gap-2">
							Ready to Start Shopping in the US?
							<MapPin className="w-8 h-8" />
						</h2>
					</AnimateInView>
					<AnimateInView variant="fadeInUp" delay={0.2}>
						<p className="text-lg mb-6 text-white/90">
							Join 5000+ Ghanaians who save money and shop from any US store with their free Vanguard address.
						</p>
					</AnimateInView>

					{/* Benefits list */}
					<AnimateInView variant="fadeInUp" delay={0.3}>
						<div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
							<div className="flex items-center bg-white/20 rounded-full px-4 py-2">
								<Check className="w-4 h-4 text-red-300 mr-2" />
								<span className="text-sm">Free US address</span>
							</div>
							<div className="flex items-center bg-white/20 rounded-full px-4 py-2">
								<Check className="w-4 h-4 text-red-300 mr-2" />
								<span className="text-sm">Package consolidation</span>
							</div>
							<div className="flex items-center bg-white/20 rounded-full px-4 py-2">
								<Check className="w-4 h-4 text-red-300 mr-2" />
								<span className="text-sm">Save up to 80%</span>
							</div>
						</div>
					</AnimateInView>

					<AnimateInView variant="fadeInUp" delay={0.4}>
						<div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
							<Link to="/register">
								<AnimatedButton size="lg" className="bg-white hover:bg-red-100 text-red-900 font-bold flex items-center gap-2">
									Get My Free US Address 
									<Rocket className="w-5 h-5" />
								</AnimatedButton>
							</Link>
							<Link to="/services">
								<AnimatedButton size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-900 font-medium">
									Learn More
								</AnimatedButton>
							</Link>
						</div>
					</AnimateInView>

					<AnimateInView variant="fadeInUp" delay={0.5}>
						<p className="text-red-200 mt-4 text-sm">
							No setup fees • No monthly charges • Start shopping immediately
						</p>
					</AnimateInView>
				</div>

				{/* Right Image Area */}
				<div className="flex-1 flex justify-center items-center">
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
