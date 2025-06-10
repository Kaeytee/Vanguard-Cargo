import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Globe, Plane, Ship, Truck } from "lucide-react"
import AnimateInView from '../../components/ui/animate-in-view';

export default function Services() {
	// Track hover state for each service item
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	// Define service items
	const serviceItems = [
		{
			icon: Plane,
			title: 'Air Freight',
			description: 'Fast and reliable air transportation solutions for time-sensitive cargo.'
		},
		{
			icon: Ship,
			title: 'Ocean Freight',
			description: 'Cost-effective shipping solutions for large volume cargo across global waters.'
		},
		{
			icon: Truck,
			title: 'Land Freight',
			description: 'Efficient ground transportation with extensive network coverage.'
		},
		{
			icon: Globe,
			title: 'Global Solutions',
			description: 'Expert customs brokerage and international logistics management.'
		}
	];

	return (
		<section className="py-16 bg-white">
			<div className="container mx-auto px-4">
				<AnimateInView variant="fadeInDown">
					<h2 className="text-3xl font-bold text-center mb-12">
						Our Services
					</h2>
				</AnimateInView>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{serviceItems.map((service, index) => {
						const isHovered = hoveredIndex === index;
						const Icon = service.icon;

						return (
							<AnimateInView
								key={index}
								variant="fadeInUp"
								delay={index * 0.1}
							>
								<motion.div
									whileHover={{ y: -5 }}
									className="h-full"
								>
									<div
										className={cn(
											"border border-gray-200 rounded-lg p-6 text-center transition-all duration-300 h-full",
											isHovered && "shadow-lg shadow-[rgba(220,38,38,0.2)] border-[rgba(220,38,38,0.5)]"
										)}
										onMouseEnter={() => setHoveredIndex(index)}
										onMouseLeave={() => setHoveredIndex(null)}
									>
										<motion.div
											className={cn(
												"flex justify-center mb-4 mx-auto p-2 rounded-full w-16 h-16 items-center transition-all duration-300 bg-gray-100",
												isHovered && "bg-[rgba(220,38,38,0.1)] text-[#dc2626]"
											)}
											animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
											transition={{ type: "spring", stiffness: 300, damping: 15 }}
										>
											<Icon className="w-10 h-10" />
										</motion.div>
										<motion.h3
											className="text-xl font-bold mb-2"
											animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
											transition={{ duration: 0.2 }}
										>
											{service.title}
										</motion.h3>
										<p className="text-gray-600 mb-4">{service.description}</p>
									</div>
								</motion.div>
							</AnimateInView>
						);
					})}
				</div>

				<AnimateInView variant="fadeInUp" delay={0.4}>
					<div className="text-center mt-10">
						<Link to="/services" className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded transition duration-300">
							View All Services
						</Link>
					</div>
				</AnimateInView>
			</div>
		</section>
	);
}