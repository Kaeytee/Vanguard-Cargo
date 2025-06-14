import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
	Check, 
	Plane, 
	Package, 
	FileText, 
	Shield, 
	AlertTriangle, 
	Truck, 
	ShoppingBag, 
	Bell, 
	Archive 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import AnimateInView from '../../components/ui/animate-in-view';
import air from '../../images/air.png';
import packaging from '../../images/packaging.png';
import customs from '../../images/customs.png';
/**
 * Services component - Displays the Services page content with animations
 * @returns {JSX.Element} The Services page component
 */
export default function Services() {
	// Track hover state for service sections and additional service cards
	const [hoveredServiceIndex, setHoveredServiceIndex] = useState<number | null>(null);
	const [hoveredAdditionalIndex, setHoveredAdditionalIndex] = useState<number | null>(null);

	// Define main service sections
	const mainServices = [
		{
			icon: Plane,
			title: 'Air Freight',
			description: 'Our core service is reliable, efficient air cargo delivery for personal and business shipments. Whether you\'re sending small parcels or larger cargo, we handle every step with care.',
			benefits: [
				'Safe packaging options',
				'Support with documentation',
				'Charter services for oversized or specialized cargo',
				'Temperature-controlled solutions for sensitive goods'
			],
			image: air,
			imageAlt: 'Airplane flying over container port at sunset',
			reverse: false
		},
		{
			icon: Package,
			title: 'Packaging Services',
			description: 'Professional packaging to ensure your items meet international air freight standards and arrive safely.',
			benefits: [
				'Custom packaging solutions',
				'Use of high-quality materials',
				'Protection against damage',
				'Compliance with airline regulations'
			],
			image: packaging,
			imageAlt: 'Workers in packaging facility',
			reverse: true
		},
		{
			icon: FileText,
			title: 'Customs Clearance Assistance',
			description: 'Our expert team ensures your shipments smoothly clear customs in both Ghana and the USA, handling all necessary documentation and compliance to avoid delays and extra costs.',
			benefits: [
				'Accurate documentation preparation',
				'Fast clearance to minimize shipment delays',
				'Coordination with customs authorities',
				'Compliance with import/export regulations'
			],
			image: customs,
			imageAlt: 'Warehouse worker with documentation',
			reverse: false
		}
	];

	// Define additional services
	const additionalServices = [
		{
			icon: Shield,
			title: 'Cargo Insurance',
			description: 'Comprehensive coverage to protect your valuable shipments during transit.'
		},
		{
			icon: AlertTriangle,
			title: 'Dangerous Goods Handling',
			description: 'Careful transport of hazardous materials with strict adherence to safety regulations.'
		},
		{
			icon: Truck,
			title: 'Project Logistics',
			description: 'Certified transportation of hazardous materials with strict adherence to safety regulations.'
		},
		{
			icon: ShoppingBag,
			title: 'Item Procurement Assistance',
			description: 'Help customers in Ghana purchase and ship items from the USA, even if they don\'t have a U.S. address or card.'
		},
		{
			icon: Bell,
			title: 'Shipment Notifications (SMS/Email Alerts)',
			description: 'Send automated SMS or email alerts to update customers about their shipment status at key stages.'
		},
		{
			icon: Archive,
			title: 'Consolidated Shipping',
			description: 'Group multiple customers\' packages into one shipment to reduce costs and speed up delivery times.'
		}
	];

	return (
		<div className="services-container">
			{/* Services Header Section */}
			<section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
				<div className="max-w-4xl mx-auto text-center">
					<AnimateInView variant="fadeInDown">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
							Our Services
						</h1>
						<p className="text-lg text-gray-600 leading-relaxed">
							We provide reliable air freight delivery between Ghana and the 
							United States, offering seamless shipping from Ghana to the USA 
							and from the USA back to Ghana.
						</p>
					</AnimateInView>
				</div>
			</section>

			{/* Main Services Sections */}
			{mainServices.map((service, index) => {
				const isHovered = hoveredServiceIndex === index;
				const Icon = service.icon;
				
				return (
					<section 
						key={index}
						className={cn(
							"py-16 px-4 sm:px-6 lg:px-8",
							index % 2 === 0 ? "bg-white" : "bg-gray-50"
						)}
					>
						<div className="max-w-7xl mx-auto">
							<div className={cn(
								"grid grid-cols-1 lg:grid-cols-2 gap-12 items-center",
								service.reverse && "lg:grid-flow-col-dense"
							)}>
								{/* Content Side */}
								<div className={cn(
									"space-y-8",
									service.reverse && "lg:col-start-2"
								)}>
									<AnimateInView 
										variant={service.reverse ? "fadeInRight" : "fadeInLeft"}
										delay={0.2}
									>
										<div 
											className="flex items-start space-x-4"
											onMouseEnter={() => setHoveredServiceIndex(index)}
											onMouseLeave={() => setHoveredServiceIndex(null)}
										>											<motion.div
												className={cn(
													"flex-shrink-0 w-12 h-12 bg-red-600/10 rounded-lg flex items-center justify-center transition-all duration-300",
													isHovered && "bg-red-600/20"
												)}
												animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
												transition={{ type: "spring", stiffness: 300, damping: 15 }}
											>
												<Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
											</motion.div>
											<div>
												<motion.h2 
													className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
													animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
													transition={{ duration: 0.2 }}
												>
													{service.title}
												</motion.h2>
												<p className="text-gray-600 leading-relaxed mb-6">
													{service.description}
												</p>
											</div>
										</div>
									</AnimateInView>

									<AnimateInView 
										variant={service.reverse ? "fadeInRight" : "fadeInLeft"}
										delay={0.4}
									>
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-4">
												What you get
											</h3>
											<div className="space-y-3">
												{service.benefits.map((benefit, benefitIndex) => (
													<AnimateInView 
														key={benefitIndex}
														variant={service.reverse ? "fadeInRight" : "fadeInLeft"}
														delay={0.5 + benefitIndex * 0.1}
													>
														<motion.div 
															className="flex items-center space-x-3"
															whileHover={{ x: service.reverse ? -5 : 5 }}
															transition={{ type: "spring", stiffness: 300, damping: 20 }}
														>
															<motion.div 
																className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
																whileHover={{ scale: 1.1 }}
																transition={{ type: "spring", stiffness: 400, damping: 15 }}
															>
																<Check className="w-3 h-3 text-white" strokeWidth={2} />
															</motion.div>
															<span className="text-gray-700">{benefit}</span>
														</motion.div>
													</AnimateInView>
												))}
											</div>
										</div>
									</AnimateInView>
								</div>

								{/* Image Side */}
								<AnimateInView 
									variant={service.reverse ? "fadeInLeft" : "fadeInRight"}
									delay={0.3}
									className={service.reverse ? "lg:col-start-1" : ""}
								>
									<motion.div 
										className="relative"
										whileHover={{ scale: 1.02 }}
										transition={{ duration: 0.3 }}
									>
										<img 
											src={service.image}
											alt={service.imageAlt}
											className="w-full h-80 lg:h-96 object-cover rounded-lg shadow-lg"
										/>
									</motion.div>
								</AnimateInView>
							</div>
						</div>
					</section>
				);
			})}

			{/* Additional Services Section */}
			<section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
				<div className="max-w-6xl mx-auto">
					<AnimateInView variant="fadeInDown">
						<div className="text-center mb-4">
							<h2 className="text-3xl font-bold text-gray-900">Additional Services</h2>
							<p className="text-gray-600 mt-2">Complementary solutions to enhance your logistics experience</p>
						</div>
					</AnimateInView>
					
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
						{additionalServices.map((service, index) => {
							const isHovered = hoveredAdditionalIndex === index;
							const Icon = service.icon;
							
							return (
								<AnimateInView 
									key={index}
									variant="fadeInUp" 
									delay={index * 0.1}
								>
									<motion.div 
										className="h-full"
										whileHover={{ y: -8 }}
										transition={{ type: "spring", stiffness: 300, damping: 20 }}
									>
										<div 
											className={cn(
												"p-6 bg-white rounded-lg border border-gray-200 transition-all duration-300 h-full",
												isHovered && "shadow-lg shadow-red-500/20 border-red-500/50"
											)}
											onMouseEnter={() => setHoveredAdditionalIndex(index)}
											onMouseLeave={() => setHoveredAdditionalIndex(null)}
										>
											<motion.div 
												className={cn(
													"w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4 transition-all duration-300",
													isHovered && "bg-red-500/10"
												)}
												animate={isHovered ? { scale: 1.1, rotate: 10 } : { scale: 1, rotate: 0 }}
												transition={{ type: "spring", stiffness: 300, damping: 15 }}
											>
												<Icon 
													className={cn(
														"w-6 h-6 text-gray-700 transition-colors duration-300",
														isHovered && "text-red-500"
													)} 
													strokeWidth={1.5} 
												/>
											</motion.div>
											<motion.h3 
												className="text-lg font-semibold text-gray-900 mb-3"
												animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
												transition={{ duration: 0.2 }}
											>
												{service.title}
											</motion.h3>
											<p className="text-gray-600 text-sm leading-relaxed">
												{service.description}
											</p>
										</div>
									</motion.div>
								</AnimateInView>
							);
						})}
					</div>
				</div>
			</section>

			{/* Call to Action Section */}
			<AnimateInView variant="fadeInUp" delay={0.2}>
				<section className="bg-gradient-to-r from-red-500 to-red-600 py-16 px-4 sm:px-6 lg:px-8">
					<div className="max-w-4xl mx-auto text-center">
						<motion.h2 
							className="text-3xl font-bold text-white mb-4"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							viewport={{ once: true }}
						>
							Ready to Optimize Your Logistics?
						</motion.h2>
						<motion.p 
							className="text-xl text-red-100 mb-8"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							viewport={{ once: true }}
						>
							Contact our team today to discuss your specific requirements and 
							discover how our services can benefit your business.
						</motion.p>
						<Link to="/contact">
						<motion.button 
							className="bg-white text-red-600 hover:bg-gray-50 font-semibold px-8 py-3 rounded-md transition-colors duration-200"
							whileHover={{ scale: 1.05, y: -2 }}
							whileTap={{ scale: 0.95 }}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
							viewport={{ once: true }}
						>
							Get in Touch
						</motion.button>
						</Link>
					</div>
				</section>
			</AnimateInView>
		</div>
	);
}