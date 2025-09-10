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
	Archive,
	Rocket,
	DollarSign 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import AnimateInView from '../../components/ui/animate-in-view';
import SEO from '../../components/SEO';
import air from '../../images/air.png';
import packaging from '../../images/packaging.png';
import customs from '../../images/customs.png';
import servicesImage from '../../assets/services.jpg';
/**
 * Services component - Displays the Services page content with animations
 * @returns {JSX.Element} The Services page component
 */
export default function Services() {
	// Track hover state for service sections and additional service cards
	const [hoveredServiceIndex, setHoveredServiceIndex] = useState<number | null>(null);
	const [hoveredAdditionalIndex, setHoveredAdditionalIndex] = useState<number | null>(null);

	// Define main service sections focused on package forwarding
	const mainServices = [
		{
			icon: Plane,
			title: 'US Address & Shopping',
			description: 'Get your personal US shipping address instantly and start shopping from any US store. We provide a real Miami address that works with all major retailers including Amazon, Nike, Best Buy, and thousands more.',
			benefits: [
				'Instant US address activation',
				'Works with all US online stores',
				'Package receiving notifications',
				'Professional package handling'
			],
			image: air,
			imageAlt: 'Person shopping online with US address',
			reverse: false
		},
		{
			icon: Package,
			title: 'Package Consolidation & Savings',
			description: 'Our smart consolidation service combines multiple purchases into one shipment, saving you up to 70% on shipping costs. We repackage items efficiently and remove unnecessary packaging to reduce weight.',
			benefits: [
				'Combine up to 10 packages',
				'Professional repackaging',
				'Weight optimization',
				'Free package photos before shipping'
			],
			image: packaging,
			imageAlt: 'Professional package consolidation facility',
			reverse: true
		},
		{
			icon: FileText,
			title: 'Hassle-Free Customs & Delivery',
			description: 'We handle all customs paperwork, duties, and taxes to ensure smooth delivery to pickup locations in Ghana. Our team manages the entire process so you don\'t have to worry about complicated customs procedures.',
			benefits: [
				'Complete customs handling',
				'Delivery to pickup locations in Ghana',
				'Duty and tax calculation',
				'Real-time delivery tracking'
			],
			image: customs,
			imageAlt: 'Delivery worker bringing packages to customer door',
			reverse: false
		}
	];

	// Define additional package forwarding services
	const additionalServices = [
		{
			icon: Shield,
			title: 'Package Protection',
			description: 'Comprehensive insurance coverage for all your packages during transit and storage.'
		},
		{
			icon: AlertTriangle,
			title: 'Package Inspection',
			description: 'Free photo service and quality inspection of all incoming packages before shipping.'
		},
		{
			icon: Truck,
			title: 'Express Delivery',
			description: 'Fast-track shipping options for urgent packages with 5-7 day delivery to Ghana.'
		},
		{
			icon: ShoppingBag,
			title: 'Personal Shopper',
			description: 'We can purchase items for you from US stores if you need assistance with shopping or payment.'
		},
		{
			icon: Bell,
			title: 'Smart Notifications',
			description: 'Real-time SMS and email alerts for package arrivals, shipping updates, and delivery confirmations.'
		},
		{
			icon: Archive,
			title: 'Storage & Warehousing',
			description: 'Free 30-day storage at our US facility, giving you time to accumulate packages for consolidation.'
		}
	];

	return (
		<div className="services-container">
			<SEO 
				title="Package Forwarding Services - Ship from USA to Ghana | Vanguard Cargo"
				description="Comprehensive package forwarding services from USA to Ghana. Free US address, package consolidation, customs handling, and reliable delivery. Get up to 80% savings on international shipping."
				keywords="package forwarding services, USA to Ghana shipping, package consolidation, customs clearance, international shipping services, cargo forwarding, freight services, US address service"
				url="https://www.vanguardcargo.org/services"
			/>
			
			{/* Enhanced Services Hero Section */}
			<section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
				{/* Background pattern overlay */}
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] [background-size:20px_20px]"></div>
				
				{/* SVG Background Placeholder */}
				<div className="absolute inset-0 opacity-10">
					<svg viewBox="0 0 100 100" className="w-full h-full">
						<defs>
							<pattern id="services-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
								<circle cx="2" cy="2" r="1" fill="gray" opacity="0.5"/>
							</pattern>
						</defs>
						<rect width="100" height="100" fill="url(#services-pattern)"/>
					</svg>
				</div>
				
				<div className="relative max-w-6xl mx-auto">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						{/* Content Side */}
						<AnimateInView variant="fadeInLeft">
							<div className="text-gray-700">
								<motion.div 
									className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-6"
									whileHover={{ scale: 1.05 }}
									transition={{ duration: 0.2 }}
								>
									Most Affordable Package Forwarding to Ghana
								</motion.div>
								<h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-700">
									Shop the US.
									<span className="block text-red-600">Ship to Ghana.</span>
									<span className="block text-3xl md:text-4xl font-medium text-gray-700">Save Up to 70%.</span>
								</h1>
								<p className="text-xl text-gray-700 mb-8 leading-relaxed">
									Get your free US shipping address and start shopping from thousands of American stores. 
									We consolidate your packages and ship them to Ghana at unbeatable rates.
								</p>
								
								{/* Key benefits */}
								<div className="grid sm:grid-cols-2 gap-4 mb-8">
									<div className="flex items-center space-x-3">
										<div className="w-2 h-2 bg-red-600 rounded-full"></div>
										<span className="text-gray-700">Free US address</span>
									</div>
									<div className="flex items-center space-x-3">
										<div className="w-2 h-2 bg-red-600 rounded-full"></div>
										<span className="text-gray-700">Package consolidation</span>
									</div>
									<div className="flex items-center space-x-3">
										<div className="w-2 h-2 bg-red-600 rounded-full"></div>
										<span className="text-gray-700">7-14 days delivery</span>
									</div>
									<div className="flex items-center space-x-3">
										<div className="w-2 h-2 bg-red-600 rounded-full"></div>
										<span className="text-gray-700">Real-time tracking</span>
									</div>
								</div>
								
								{/* CTA Buttons */}
								<div className="flex flex-col sm:flex-row gap-4">
									<Link to="/register">
										<motion.button 
											className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-lg transition-all duration-300 w-full sm:w-auto"
											whileHover={{ scale: 1.05, y: -2 }}
											whileTap={{ scale: 0.95 }}
										>
											Get My Free US Address
										</motion.button>
									</Link>
									<Link to="/contact">
										<motion.button 
											className="bg-transparent border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold px-8 py-4 rounded-lg transition-all duration-300 w-full sm:w-auto"
											whileHover={{ scale: 1.05, y: -2 }}
											whileTap={{ scale: 0.95 }}
										>
											Learn More
										</motion.button>
									</Link>
								</div>
							</div>
						</AnimateInView>
						
						{/* Visual Side - Placeholder for SVG */}
						<AnimateInView variant="fadeInRight" delay={0.2}>
							<div className="relative">
								<div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
									<div className="text-center text-gray-700">
										<div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-6">
											<img 
												src={servicesImage} 
												alt="Services illustration" 
												className="w-full h-full object-cover"
											/>
										</div>
										<div className="grid grid-cols-3 gap-4 text-sm">
											<div>
												<div className="text-2xl font-bold text-red-600">50K+</div>
												<div className="text-gray-600">Packages Delivered</div>
											</div>
											<div>
												<div className="text-2xl font-bold text-red-600">70%</div>
												<div className="text-gray-600">Average Savings</div>
											</div>
											<div>
												<div className="text-2xl font-bold text-red-600">4.9★</div>
												<div className="text-gray-600">Customer Rating</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</AnimateInView>
					</div>
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

			{/* Savings Calculator Section */}
			<section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-900 via-red-800 to-red-700 text-white">
				<div className="max-w-4xl mx-auto">
					<AnimateInView variant="fadeInDown">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
								See How Much You'll Save <DollarSign className="w-8 h-8" />
							</h2>
							<p className="text-xl text-red-100">
								Our package consolidation can save you hundreds of dollars per year
							</p>
						</div>
					</AnimateInView>

					<div className="grid md:grid-cols-2 gap-12 items-center">
						<AnimateInView variant="fadeInLeft">
							<div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
								<h3 className="text-xl font-bold mb-6">Typical Savings Example</h3>
								
								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<span>3 separate shipments (5 lbs each)</span>
										<span className="font-bold">$180</span>
									</div>
									<div className="flex justify-between items-center">
										<span>1 consolidated shipment (15 lbs)</span>
										<span className="font-bold text-red-300">$65</span>
									</div>
									<div className="border-t border-white/20 pt-4">
										<div className="flex justify-between items-center text-xl font-bold">
											<span>Your Savings:</span>
											<span className="text-red-300">$115 (64%)</span>
										</div>
									</div>
								</div>
								
								<div className="mt-6 text-sm text-red-200">
									* Savings based on typical 5lb packages from popular US retailers
								</div>
							</div>
						</AnimateInView>

						<AnimateInView variant="fadeInRight">
							<div className="space-y-6">
								<div className="flex items-center space-x-4">
									<div className="w-12 h-12 bg-red-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
										1
									</div>
									<div>
										<h4 className="font-bold">Shop Multiple Stores</h4>
										<p className="text-red-200">Buy from different US retailers</p>
									</div>
								</div>
								
								<div className="flex items-center space-x-4">
									<div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
										2
									</div>
									<div>
										<h4 className="font-bold">We Consolidate</h4>
										<p className="text-red-200">Combine packages into one shipment</p>
									</div>
								</div>
								
								<div className="flex items-center space-x-4">
									<div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
										3
									</div>
									<div>
										<h4 className="font-bold">You Save Big</h4>
										<p className="text-red-200">Pay one low shipping rate instead of multiple</p>
									</div>
								</div>

								<div className="mt-8">
									<Link
										to="/register"
										className="bg-white hover:bg-red-100 text-red-900 font-bold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2"
									>
										Start Saving Today <Rocket className="w-5 h-5" />
									</Link>
								</div>
							</div>
						</AnimateInView>
					</div>
				</div>
			</section>

			{/* Additional Services Section */}
			<section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
				<div className="max-w-6xl mx-auto">
					<AnimateInView variant="fadeInDown">
						<div className="text-center mb-4">
							<h2 className="text-3xl font-bold text-gray-900">Value-Added Services</h2>
							<p className="text-gray-600 mt-2">Extra services to make your shopping experience even better</p>
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
							Ready to Optimize Your cargo?
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