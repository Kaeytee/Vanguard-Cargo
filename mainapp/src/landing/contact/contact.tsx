import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
	Phone, 
	MapPin, 
	Mail, 
	Send,
	ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import AnimateInView from '../../components/ui/animate-in-view';

/**
 * Contact component - Displays the Contact page content with animations
 * @returns {JSX.Element} The Contact page component
 */
export default function Contact() {
	// Form state
	const [formData, setFormData] = useState({
		fullName: '',
		email: '',
		subject: '',
		message: ''
	});

	// FAQ state
	const [expandedFAQ, setExpandedFAQ] = useState<number | null>(0);

	// Hover states
	const [hoveredContact, setHoveredContact] = useState<number | null>(null);
	const [hoveredLocation, setHoveredLocation] = useState<number | null>(null);
	
	// Selected location for map
	const [selectedLocation, setSelectedLocation] = useState<number>(0);

	// Handle form input changes
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	// Handle form submission
	const handleSubmit = () => {
		console.log('Form submitted:', formData);
		// Add your form submission logic here
		alert('Message sent successfully!');
	};

	// Contact information items
	const contactInfo = [
		{
			icon: Phone,
			title: 'Phone',
			description: 'Available 24/7 for urgent matters',
			details: '(+233) 456-7890'
		},
		{
			icon: MapPin,
			title: 'Address',
			description: 'Drop in during business hours',
			details: '123 Cargo Lane\nEast Legon, Accra'
		},
		{
			icon: Mail,
			title: 'Email',
			description: 'Response less than 24 hours',
			details: 'support@vanguardcargo.com'
		}
	];

	// Location items with maps
	const locations = [
		{
			title: 'Accra, Ghana',
			subtitle: 'Main Office',
			isMain: true,
			mapImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
			mapAlt: 'Map of Accra, Ghana showing main office location'
		},
		{
			title: 'Washington, D.C., USA',
			subtitle: 'Field Office',
			isMain: false,
			mapImage: 'https://images.unsplash.com/photo-1551522435-a13afa10f103?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
			mapAlt: 'Map of Washington DC, USA showing field office location'
		}
	];

	// FAQ items
	const faqItems = [
		{
			question: 'Add commonly asked questions here',
			answer: 'Lorem ipsum dolor sit amet consectetur. Non in bibendum et ut. Facilisi aliquam commodo vitae ipsum dolor.'
		},
		{
			question: 'Add commonly asked questions here',
			answer: 'Lorem ipsum dolor sit amet consectetur. Non in bibendum et ut. Facilisi aliquam commodo vitae ipsum dolor.'
		},
		{
			question: 'Add commonly asked questions here',
			answer: 'Lorem ipsum dolor sit amet consectetur. Non in bibendum et ut. Facilisi aliquam commodo vitae ipsum dolor.'
		},
		{
			question: 'Add commonly asked questions here',
			answer: 'Lorem ipsum dolor sit amet consectetur. Non in bibendum et ut. Facilisi aliquam commodo vitae ipsum dolor.'
		},
		{
			question: 'Add commonly asked questions here',
			answer: 'Lorem ipsum dolor sit amet consectetur. Non in bibendum et ut. Facilisi aliquam commodo vitae ipsum dolor.'
		}
	];

	return (
		<div className="contact-container">
			{/* Contact Header Section */}
			<section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
				<div className="max-w-4xl mx-auto text-center">
					<AnimateInView variant="fadeInDown">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
							Contact Us
						</h1>
						<p className="text-lg text-gray-600 leading-relaxed">
							Our team is here to help you with your shipping needs. Reach out 
							to us anytime – we're just a message or call away!
						</p>
					</AnimateInView>
				</div>
			</section>

			{/* Contact Form and Info Section */}
			<section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
						{/* Contact Form */}
						<AnimateInView variant="fadeInLeft" delay={0.2}>
							<motion.div 
								className="bg-white"
								whileHover={{ y: -2 }}
								transition={{ duration: 0.3 }}
							>
								<h2 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
								<p className="text-gray-600 mb-8">
									Fill out the form below and we'll get back to you as soon as possible.
								</p>

								<div className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<motion.div
											whileFocus={{ scale: 1.02 }}
											transition={{ duration: 0.2 }}
										>
											<label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
												Full Name
											</label>
											<input
												type="text"
												id="fullName"
												name="fullName"
												value={formData.fullName}
												onChange={handleInputChange}
												placeholder="John Doe"
												className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
											/>
										</motion.div>

										<motion.div
											whileFocus={{ scale: 1.02 }}
											transition={{ duration: 0.2 }}
										>
											<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
												Email
											</label>
											<input
												type="email"
												id="email"
												name="email"
												value={formData.email}
												onChange={handleInputChange}
												placeholder="vanguardcargo@company.com"
												className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
											/>
										</motion.div>
									</div>

									<motion.div
										whileFocus={{ scale: 1.02 }}
										transition={{ duration: 0.2 }}
									>
										<label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
											Subject
										</label>
										<input
											type="text"
											id="subject"
											name="subject"
											value={formData.subject}
											onChange={handleInputChange}
											placeholder="Enter a short subject (e.g., shipping delay)"
											className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
										/>
									</motion.div>

									<motion.div
										whileFocus={{ scale: 1.02 }}
										transition={{ duration: 0.2 }}
									>
										<label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
											Message
										</label>
										<textarea
											id="message"
											name="message"
											value={formData.message}
											onChange={handleInputChange}
											rows={6}
											placeholder="Type your message here..."
											className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200 resize-none"
										/>
									</motion.div>

									<motion.button
										onClick={handleSubmit}
										className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
										whileHover={{ scale: 1.02, y: -2 }}
										whileTap={{ scale: 0.98 }}
									>
										<Send className="w-4 h-4" />
										<span>Send Message</span>
									</motion.button>
								</div>
							</motion.div>
						</AnimateInView>

						{/* Contact Information */}
						<AnimateInView variant="fadeInRight" delay={0.4}>
							<div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">Contact Information</h3>
								<p className="text-gray-600 mb-8">
									You can reach us through any of these channels.
								</p>

								<div className="space-y-6">
									{contactInfo.map((contact, index) => {
										const isHovered = hoveredContact === index;
										const Icon = contact.icon;
										
										return (
											<AnimateInView 
												key={index}
												variant="fadeInRight" 
												delay={0.5 + index * 0.1}
											>
												<motion.div 
													className={cn(
														"flex items-start space-x-4 p-4 rounded-lg transition-all duration-300",
														isHovered && "bg-red-50"
													)}
													onMouseEnter={() => setHoveredContact(index)}
													onMouseLeave={() => setHoveredContact(null)}
													whileHover={{ x: 5 }}
													transition={{ type: "spring", stiffness: 300, damping: 20 }}
												>
													<motion.div 
														className={cn(
															"flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center transition-all duration-300",
															isHovered && "bg-red-500"
														)}
														animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
														transition={{ type: "spring", stiffness: 300, damping: 15 }}
													>
														<Icon 
															className={cn(
																"w-5 h-5 text-red-500 transition-colors duration-300",
																isHovered && "text-white"
															)} 
														/>
													</motion.div>
													<div>
														<h4 className="font-semibold text-gray-900">{contact.title}</h4>
														<p className="text-sm text-gray-600 mb-1">{contact.description}</p>
														<p className="text-gray-900 font-medium whitespace-pre-line">
															{contact.details}
														</p>
													</div>
												</motion.div>
											</AnimateInView>
										);
									})}
								</div>
							</div>
						</AnimateInView>
					</div>
				</div>
			</section>

			{/* Our Locations Section */}
			<section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						{/* Content */}
						<AnimateInView variant="fadeInLeft" delay={0.2}>
							<div>
								<div className="flex items-center space-x-3 mb-6">
									<motion.div 
										className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"
										whileHover={{ scale: 1.1, rotate: 5 }}
										transition={{ type: "spring", stiffness: 300, damping: 15 }}
									>
										<MapPin className="w-5 h-5 text-red-500" />
									</motion.div>
									<h2 className="text-2xl font-bold text-gray-900">Our Locations</h2>
								</div>
								
								<p className="text-gray-600 leading-relaxed mb-8">
									Our core service is reliable, efficient air cargo delivery for personal 
									and business shipments. Whether you're sending small parcels or 
									larger cargo, we handle every step with care.
								</p>
								
								<p className="text-sm text-gray-500 mb-6 italic">
									Click on a location below to view it on the map
								</p>

								<div className="space-y-4">
									{locations.map((location, index) => {
										const isHovered = hoveredLocation === index;
										const isSelected = selectedLocation === index;
										
										return (
											<AnimateInView 
												key={index}
												variant="fadeInLeft" 
												delay={0.4 + index * 0.1}
											>
												<motion.div 
													className={cn(
														"p-4 rounded-lg border-l-4 transition-all duration-300 cursor-pointer",
														location.isMain 
															? "border-red-500 bg-red-50" 
															: isSelected 
																? "border-red-500 bg-red-50"
																: "border-gray-300 bg-white",
														isHovered && "shadow-lg",
														isSelected && "ring-2 ring-red-200"
													)}
													onMouseEnter={() => setHoveredLocation(index)}
													onMouseLeave={() => setHoveredLocation(null)}
													onClick={() => setSelectedLocation(index)}
													whileHover={{ x: 5, scale: 1.02 }}
													whileTap={{ scale: 0.98 }}
													transition={{ type: "spring", stiffness: 300, damping: 20 }}
												>
													<h3 className="font-semibold text-gray-900">{location.title}</h3>
													<p className={cn(
														"text-sm",
														(location.isMain || isSelected) ? "text-red-600" : "text-gray-600"
													)}>
														{location.subtitle}
													</p>
												</motion.div>
											</AnimateInView>
										);
									})}
								</div>
							</div>
						</AnimateInView>

						{/* Map */}
						<AnimateInView variant="fadeInRight" delay={0.3}>
							<motion.div 
								className="relative"
								whileHover={{ scale: 1.02 }}
								transition={{ duration: 0.3 }}
							>
								<motion.img 
									key={selectedLocation}
									src={locations[selectedLocation].mapImage}
									alt={locations[selectedLocation].mapAlt}
									className="w-full h-80 lg:h-96 object-cover rounded-lg shadow-lg"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.5 }}
								/>
								{/* Map overlay pins */}
								<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
									<motion.div 
										className="relative"
										animate={{ y: [0, -5, 0] }}
										transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
									>
										{/* Pin shadow */}
										<div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-black/20 rounded-full blur-sm" />
										
										{/* Pin */}
										<div className="relative">
											<motion.div 
												className="w-8 h-8 bg-red-500 rounded-full shadow-lg border-4 border-white"
												animate={{ scale: [1, 1.2, 1] }}
												transition={{ duration: 1.5, repeat: Infinity }}
											/>
											{/* Pin point */}
											<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-red-500" />
										</div>
									</motion.div>
								</div>
								
								{/* Location indicator */}
								<div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
									<p className="text-sm font-semibold text-gray-900">
										{locations[selectedLocation].title}
									</p>
									<p className="text-xs text-red-600">
										{locations[selectedLocation].subtitle}
									</p>
								</div>
							</motion.div>
						</AnimateInView>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
				<div className="max-w-4xl mx-auto">
					<AnimateInView variant="fadeInDown">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
							<p className="text-gray-600">Find quick answers to common questions about our services.</p>
						</div>
					</AnimateInView>

					<div className="space-y-4">
						{faqItems.map((faq, index) => {
							const isExpanded = expandedFAQ === index;
							
							return (
								<AnimateInView 
									key={index}
									variant="fadeInUp" 
									delay={index * 0.1}
								>
									<motion.div 
										className="border border-gray-200 rounded-lg overflow-hidden"
										whileHover={{ y: -2 }}
										transition={{ duration: 0.2 }}
									>
										<button
											className="w-full px-6 py-4 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors duration-200"
											onClick={() => setExpandedFAQ(isExpanded ? null : index)}
										>
											<span className="font-medium text-gray-900">{faq.question}</span>
											<motion.div
												animate={{ rotate: isExpanded ? 180 : 0 }}
												transition={{ duration: 0.3 }}
											>
												<ChevronDown className="w-5 h-5 text-gray-500" />
											</motion.div>
										</button>
										
										<motion.div
											initial={false}
											animate={{ 
												height: isExpanded ? "auto" : 0,
												opacity: isExpanded ? 1 : 0 
											}}
											transition={{ duration: 0.3 }}
											className="overflow-hidden"
										>
											<div className="px-6 pb-4 text-gray-600 leading-relaxed">
												{faq.answer}
											</div>
										</motion.div>
									</motion.div>
								</AnimateInView>
							);
						})}
					</div>
				</div>
			</section>

			{/* Final CTA Section */}
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
							Ready to Get Started?
						</motion.h2>
						<motion.p 
							className="text-xl text-red-100 mb-8"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							viewport={{ once: true }}
						>
							Our team is ready to help you with your vanguardcargo needs. Contact us 
							today for a personalized solution.
						</motion.p>
						
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<motion.button 
								className="bg-white text-red-600 hover:bg-gray-50 font-semibold px-8 py-3 rounded-md transition-colors duration-200"
								whileHover={{ scale: 1.05, y: -2 }}
								whileTap={{ scale: 0.95 }}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.4 }}
								viewport={{ once: true }}
							>
								Request a quote
							</motion.button>
							
							<motion.button 
								className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-red-600 font-semibold px-8 py-3 rounded-md transition-colors duration-200"
								whileHover={{ scale: 1.05, y: -2 }}
								whileTap={{ scale: 0.95 }}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.5 }}
								viewport={{ once: true }}
							>
								Explore Services
							</motion.button>
						</div>
					</div>
				</section>
			</AnimateInView>
		</div>
	);
}