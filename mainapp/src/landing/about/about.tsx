import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Heart, Clock, Lightbulb, CheckCircle, Package, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import AnimateInView from '../../components/ui/animate-in-view';
import about from "../../images/about.png"

/**
 * About component - Displays the About page content of the Logistics company with animations
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
			description: 'To bridge the gap between Ghana and the USA through reliable, efficient, and affordable logistics services. We are committed to connecting families, empowering businesses, and fostering international trade by providing seamless shipping solutions that our customers can trust and depend on.'
		},
		{
			icon: Clock,
			title: 'Our Vision',
			description: 'To become the leading logistics provider for Ghana-USA trade corridor, recognized for our exceptional service quality, innovative technology solutions, and unwavering commitment to customer satisfaction. We envision a world where distance is no barrier to commerce and connection.'
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
		'Secure shipping from Ghana to the USA',
		'Real-time package tracking system',
		'Competitive pricing and transparent fees',
		'Dedicated customer support team',
		'Insurance coverage for all shipments'
	];

	return (
		<div className="about-container">
			{/* About Header Section */}
			<section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div className="space-y-8">
							<AnimateInView variant="fadeInLeft">
								<div>
									<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
										About Ttarius Logistics.
									</h1>
									<p className="text-lg text-gray-600 leading-relaxed mb-8">
										Ttarius Logistics is your trusted partner for reliable and efficient shipping solutions between Ghana and the USA. We specialize in connecting families, businesses, and communities across continents with our comprehensive logistics services.
									</p>
								</div>
							</AnimateInView>
							
							<div className="space-y-4">
								{benefits.map((benefit, index) => (
									<AnimateInView 
										key={index}
										variant="fadeInLeft" 
										delay={0.2 + index * 0.1}
									>
										<motion.li 
											className="flex items-center space-x-3"
											whileHover={{ x: 5 }}
											transition={{ type: "spring", stiffness: 300, damping: 20 }}
										>
											<div className="flex-shrink-0">
												<motion.div 
													className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
													whileHover={{ scale: 1.1 }}
													transition={{ type: "spring", stiffness: 400, damping: 15 }}
												>
													<Check className="w-4 h-4 text-white" strokeWidth={2} />
												</motion.div>
											</div>
											<span className="text-gray-700 font-medium">{benefit}</span>
										</motion.li>
									</AnimateInView>
								))}
							</div>
						</div>
						
						<AnimateInView variant="fadeInRight" delay={0.3}>
							<motion.div 
								className="relative"
								whileHover={{ scale: 1.02 }}
								transition={{ duration: 0.3 }}
							>
								<img 
									src={about} 
									alt="Logistics container port at sunset with airplane"
									className="w-full h-80 lg:h-96 object-cover rounded-lg shadow-lg"
								/>
							</motion.div>
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
							Ready to Ship with Ttarius Logistics?
						</motion.h2>
						<motion.p 
							className="text-xl text-red-100 mb-8"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							viewport={{ once: true }}
						>
							Experience reliable shipping services between Ghana and the USA. Let us handle your logistics needs with care and professionalism.
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