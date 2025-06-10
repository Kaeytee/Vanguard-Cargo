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
			description: 'Lorem ipsum dolor sit amet consectetur. Lobortis adipiscing lacus tincidunt ipsum felis tincidunt sem adipiscing. Tincidunt et donec massa purus et. Scelerisque nunc consequat interdum suspendisse mattesque sed ut lorem suspendisse lacus. Condimentum pellentesque et ligula vitae amet sociis blandit.'
		},
		{
			icon: Clock,
			title: 'Our Vision',
			description: 'Lorem ipsum dolor sit amet consectetur. Lobortis adipiscing lacus tincidunt ipsum felis tincidunt sem adipiscing. Tincidunt et donec massa purus et. Scelerisque nunc consequat interdum suspendisse mattesque sed ut lorem suspendisse lacus. Condimentum pellentesque et ligula vitae amet sociis blandit.'
		}
	];

	// Define value items
	const valueItems = [
		{
			icon: Lightbulb,
			title: 'Innovative',
			description: 'We constantly seek new ways to improve and revolutionize logistics processes.'
		},
		{
			icon: CheckCircle,
			title: 'Reliability',
			description: 'We deliver on our promises, ensuring consistent and dependable service.'
		},
		{
			icon: Package,
			title: 'Sustainability',
			description: 'We\'re committed to environmentally responsible logistics solutions.'
		},
		{
			icon: Star,
			title: 'Excellence',
			description: 'We strive for the highest standards in every aspect of our operations.'
		}
	];

	// Define benefit items for the checklist
	const benefits = [
		'Fast delivery from Ghana to the USA',
		'98% on-time delivery rate',
		'24/7 customer support'
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
										About Logistics.
									</h1>
									<p className="text-lg text-gray-600 leading-relaxed mb-8">
										Lorem ipsum dolor sit amet consectetur. Non in bibendum et ut. 
										Facilisi aliquam commodo vitae ipsum dolor.
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
							Join Us on Our Journey
						</motion.h2>
						<motion.p 
							className="text-xl text-red-100 mb-8"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							viewport={{ once: true }}
						>
							Experience the future of logistics with our innovative solutions
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