// About page component for the logistics application - displays company information, mission, and values
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Heart, Clock, Lightbulb, CheckCircle, Package, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import AnimateInView from '../../components/ui/animate-in-view';
import SEO from '../../components/SEO';
import servicesImage from '../../assets/services.jpg';

/**
 * About component - Displays the About page content of the cargo company with animations
 * @returns {JSX.Element} The About page component
 */
export default function About() {
	// Track hover state for mission cards and value cards
	const [hoveredMissionIndex, setHoveredMissionIndex] = useState<number | null>(null);
	const [hoveredValueIndex, setHoveredValueIndex] = useState<number | null>(null);

	// Define mission items
	const missionItems = [
		{
			icon: Heart,
			title: 'Our Mission',
			description: 'To bridge the gap between Ghana and the USA through reliable, efficient, and affordable cargo services. We are committed to connecting families, empowering businesses, and fostering international trade by providing seamless shipping solutions that our customers can trust and depend on.'
		},
		{
			icon: Clock,
			title: 'Our Vision',
			description: 'To become the leading cargo provider for Ghana-USA trade corridor, recognized for our exceptional service quality, innovative technology solutions, and unwavering commitment to customer satisfaction. We envision a world where distance is no barrier to commerce and connection.'
		}
	];

	// Define value items
	const valueItems = [
		{
			icon: Lightbulb,
			title: 'Innovation',
			description: 'We leverage cutting-edge technology and innovative solutions to streamline the shipping process and enhance customer experience.'
		},
		{
			icon: CheckCircle,
			title: 'Reliability',
			description: 'With our proven track record of 98% on-time delivery, you can trust us to handle your shipments with utmost care and precision.'
		},
		{
			icon: Package,
			title: 'Security',
			description: 'Your packages are our priority. We ensure secure handling, real-time tracking, and safe delivery of all shipments.'
		},
		{
			icon: Star,
			title: 'Excellence',
			description: 'We strive for excellence in every interaction, continuously improving our services to exceed customer expectations.'
		}
	];

	// Define benefit items for the checklist
	const benefits = [
		'Free US shipping address for all customers',
		'Package consolidation saving up to 70%',
		'Real-time tracking from US to Ghana',
		'Professional customer support team',
		'Full insurance coverage on all shipments'
	];

	return (
		<div className="about-container">
			<SEO 
				title="About Vanguard Cargo - Your Trusted Package Forwarding Partner"
				description="Learn about Vanguard Cargo's mission to connect Ghana with global markets through reliable package forwarding. Discover our story, values, and commitment to excellence in international shipping."
				keywords="about Vanguard Cargo, package forwarding company, international shipping Ghana, cargo company history, logistics services, shipping expertise, Ghana international trade"
				url="https://www.vanguardcargo.co/about"
			/>
			
			{/* Enhanced About Hero Section */}
			<section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
				{/* Background decoration */}
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] [background-size:20px_20px]"></div>
				
				{/* SVG Background Placeholder */}
				<div className="absolute inset-0 opacity-10">
					<svg viewBox="0 0 100 100" className="w-full h-full">
						<defs>
							<pattern id="about-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
								<circle cx="2" cy="2" r="1" fill="gray" opacity="0.5"/>
							</pattern>
						</defs>
						<rect width="100" height="100" fill="url(#about-pattern)"/>
					</svg>
				</div>
				
				<div className="relative max-w-7xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						{/* Content Side */}
						<div className="space-y-8">
							<AnimateInView variant="fadeInLeft">
								<div className="text-gray-700">
									<motion.div 
										className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-6"
										whileHover={{ scale: 1.05 }}
										transition={{ duration: 0.2 }}
									>
										Founded in 2020 - Serving 10,000+ Customers
									</motion.div>
									<h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-700">
										About 
										<span className="block text-red-600">Vanguard cargo</span>
									</h1>
									<p className="text-xl text-gray-700 leading-relaxed mb-8">
										We're Ghana's premier package forwarding service, connecting you to the best of American shopping. 
										Our mission is to make US shopping accessible, affordable, and reliable for every Ghanaian.
									</p>
								</div>
							</AnimateInView>
							
							{/* Key achievements */}
							<div className="grid grid-cols-2 gap-6">
								<AnimateInView variant="fadeInLeft" delay={0.2}>
									<div className="text-center">
										<div className="text-3xl font-bold text-red-600">50K+</div>
										<div className="text-gray-600 text-sm">Packages Delivered</div>
									</div>
								</AnimateInView>
								<AnimateInView variant="fadeInLeft" delay={0.3}>
									<div className="text-center">
										<div className="text-3xl font-bold text-red-600">10K+</div>
										<div className="text-gray-600 text-sm">Happy Customers</div>
									</div>
								</AnimateInView>
								<AnimateInView variant="fadeInLeft" delay={0.4}>
									<div className="text-center">
										<div className="text-3xl font-bold text-red-600">98%</div>
										<div className="text-gray-600 text-sm">On-Time Delivery</div>
									</div>
								</AnimateInView>
								<AnimateInView variant="fadeInLeft" delay={0.5}>
									<div className="text-center">
										<div className="text-3xl font-bold text-red-600">4.9★</div>
										<div className="text-gray-600 text-sm">Customer Rating</div>
									</div>
								</AnimateInView>
							</div>
							
							{/* Key benefits with clean design */}
							<div className="space-y-4">
								{benefits.map((benefit, index) => (
									<AnimateInView 
										key={index}
										variant="fadeInLeft" 
										delay={0.6 + index * 0.1}
									>
										<motion.div 
											className="flex items-center space-x-3 text-gray-700"
											whileHover={{ x: 5 }}
											transition={{ type: "spring", stiffness: 300, damping: 20 }}
										>
											<div className="flex-shrink-0">
												<motion.div 
													className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center"
													whileHover={{ scale: 1.1 }}
													transition={{ type: "spring", stiffness: 400, damping: 15 }}
												>
													<Check className="w-4 h-4 text-white" strokeWidth={2} />
												</motion.div>
											</div>
											<span className="font-medium">{benefit}</span>
										</motion.div>
									</AnimateInView>
								))}
							</div>
							
							{/* CTA */}
							<AnimateInView variant="fadeInLeft" delay={1.0}>
								<Link to="/services">
									<motion.button 
										className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-lg transition-all duration-300"
										whileHover={{ scale: 1.05, y: -2 }}
										whileTap={{ scale: 0.95 }}
									>
										Discover Our Services
									</motion.button>
								</Link>
							</AnimateInView>
						</div>
						
						{/* Visual Side - Placeholder for SVG */}
						<AnimateInView variant="fadeInRight" delay={0.3}>
							<div className="relative">
								<div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
									<div className="text-center text-gray-700">
										<div className="w-full h-80 bg-gray-100 rounded-lg overflow-hidden mb-6">
											<img 
												src={servicesImage} 
												alt="About us illustration" 
												className="w-full h-full object-cover"
											/>
										</div>
										<div className="text-center">
											<h3 className="text-xl font-bold mb-4 text-gray-900">Why Choose Vanguard?</h3>
											<div className="space-y-3 text-sm">
												<div className="bg-gray-50 rounded-lg p-3">
													<div className="font-semibold text-gray-900">Fast & Reliable</div>
													<div className="text-gray-600">3 Days delivery guaranteed</div>
												</div>
												<div className="bg-gray-50 rounded-lg p-3">
													<div className="font-semibold text-gray-900">Huge Savings</div>
													<div className="text-gray-600">Up to 70% off shipping costs</div>
												</div>
												<div className="bg-gray-50 rounded-lg p-3">
													<div className="font-semibold text-gray-900">Trusted Service</div>
													<div className="text-gray-600">4.9★ rating from customers</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</AnimateInView>
					</div>
				</div>
			</section>

			{/* Mission Section */}
			<section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
				<div className="max-w-6xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{missionItems.map((mission, index) => {
							const isHovered = hoveredMissionIndex === index;
							const Icon = mission.icon;
							
							return (
								<AnimateInView 
									key={index}
									variant="fadeInUp" 
									delay={index * 0.2}
								>
									<motion.div 
										className="h-full"
										whileHover={{ y: -5 }}
										transition={{ type: "spring", stiffness: 300, damping: 20 }}
									>
										<div 
											className={cn(
												"bg-white p-8 rounded-lg border border-gray-200 transition-all duration-300 h-full",
												isHovered && "shadow-lg shadow-red-500/20 border-red-500/50"
											)}
											onMouseEnter={() => setHoveredMissionIndex(index)}
											onMouseLeave={() => setHoveredMissionIndex(null)}
										>
											<div className="mb-6">
												<motion.div 
													className={cn(
														"w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4 transition-all duration-300",
														isHovered && "bg-red-500/10"
													)}
													animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
													transition={{ type: "spring", stiffness: 300, damping: 15 }}
												>
													<Icon className="w-6 h-6 text-red-500" strokeWidth={1.5} />
												</motion.div>
												<motion.h3 
													className="text-xl font-semibold text-gray-900 mb-4"
													animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
													transition={{ duration: 0.2 }}
												>
													{mission.title}
												</motion.h3>
												<p className="text-gray-600 leading-relaxed">
													{mission.description}
												</p>
											</div>
										</div>
									</motion.div>
								</AnimateInView>
							);
						})}
					</div>
				</div>
			</section>

			{/* Core Values Section */}
			<section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
				<div className="max-w-6xl mx-auto">
					<AnimateInView variant="fadeInDown">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
						</div>
					</AnimateInView>
					
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{valueItems.map((value, index) => {
							const isHovered = hoveredValueIndex === index;
							const Icon = value.icon;
							
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
												"text-center p-6 bg-white rounded-lg border border-gray-200 transition-all duration-300 h-full",
												isHovered && "shadow-lg shadow-red-500/20 border-red-500/50"
											)}
											onMouseEnter={() => setHoveredValueIndex(index)}
											onMouseLeave={() => setHoveredValueIndex(null)}
										>
											<motion.div 
												className={cn(
													"w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4 transition-all duration-300",
													isHovered && "bg-red-500/10"
												)}
												animate={isHovered ? { scale: 1.1, rotate: 10 } : { scale: 1, rotate: 0 }}
												transition={{ type: "spring", stiffness: 300, damping: 15 }}
											>
												<Icon 
													className={cn(
														"w-8 h-8 text-gray-700 transition-colors duration-300",
														isHovered && "text-red-500"
													)} 
													strokeWidth={1.5} 
												/>
											</motion.div>
											<motion.h3 
												className="text-lg font-semibold text-gray-900 mb-3"
												animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
												transition={{ duration: 0.2 }}
											>
												{value.title}
											</motion.h3>
											<p className="text-gray-600 text-sm leading-relaxed">
												{value.description}
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
							Ready to Ship with Vanguard cargo?
						</motion.h2>
						<motion.p 
							className="text-xl text-red-100 mb-8"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							viewport={{ once: true }}
						>
							Experience reliable shipping services between Ghana and the USA. Let us handle your cargo needs with care and professionalism.
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