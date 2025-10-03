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
import SEO from '../../components/SEO';
import supportImage from '../../assets/support.jpg';

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
			details: '+233 544 197 819 (Mobile)\n030 398 2320 (Landline)'
		},
		{
			icon: MapPin,
			title: 'Address',
			description: 'Drop in during business hours',
			details: 'Vanguard cargo Center\nEast Legon, Accra, Ghana'
		},
		{
			icon: Mail,
			title: 'Email',
			description: 'Response within 24 hours',
			details: 'support@vanguardcargo.co'
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
			question: 'How do I get my free US address?',
			answer: 'Simply register for an account on our platform, and you\'ll receive a unique US shipping address within minutes. This address can receive packages from any US retailer and we\'ll consolidate and forward them to you in Ghana.'
		},
		{
			question: 'How much money can I save with package consolidation?',
			answer: 'Our customers typically save 40-70% on shipping costs by consolidating multiple packages into one shipment. The exact savings depend on the number of packages, their weight, and dimensions.'
		},
		{
			question: 'How long does shipping take from the US to Ghana?',
			answer: 'Standard shipping typically takes 7-14 business days from our US warehouse to Ghana. We also offer express shipping options that can deliver in 3-7 business days for urgent packages.'
		},
		{
			question: 'What items cannot be shipped through your service?',
			answer: 'We cannot ship prohibited items such as hazardous materials, perishable foods, liquids, firearms, and items restricted by Ghana Customs. Please check our prohibited items list for a complete overview.'
		},
		{
			question: 'How do I track my packages?',
			answer: 'You can track your packages in real-time through your dashboard. We provide tracking updates from the moment your package arrives at our US warehouse until it\'s delivered to your door in Ghana.'
		}
	];

	return (
		<div className="contact-container">
			<SEO 
				title="Contact Vanguard Cargo - Get Support for Your Package Forwarding"
				description="Get in touch with Vanguard Cargo for expert package forwarding support. Contact our team for shipping quotes, tracking assistance, or general inquiries. We're here to help with your USA to Ghana shipping needs."
				keywords="contact Vanguard Cargo, package forwarding support, shipping customer service, Ghana logistics contact, international shipping help, cargo forwarding assistance"
				url="https://www.vanguardcargo.co/contact"
			/>
			
			{/* Enhanced Contact Hero Section */}
			<section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
				{/* Background elements */}
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] [background-size:20px_20px]"></div>
				
				{/* SVG Background Placeholder */}
				<div className="absolute inset-0 opacity-10">
					<svg viewBox="0 0 100 100" className="w-full h-full">
						<defs>
							<pattern id="contact-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
								<circle cx="2" cy="2" r="1" fill="gray" opacity="0.5"/>
							</pattern>
						</defs>
						<rect width="100" height="100" fill="url(#contact-pattern)"/>
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
									24/7 Customer Support
								</motion.div>
								<h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-700">
									Get in Touch
									<span className="block text-red-600">We're Here to Help</span>
								</h1>
								<p className="text-xl text-gray-700 mb-8 leading-relaxed">
									Have questions about package forwarding? Need help with your shipment? Our dedicated 
									support team is ready to assist you every step of the way.
								</p>
								
								{/* Contact methods preview */}
								<div className="space-y-4 mb-8">
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
											<div className="w-6 h-6 bg-red-600 rounded"></div>
										</div>
										<div>
											<div className="font-semibold text-gray-900">Quick Response</div>
											<div className="text-gray-600 text-sm">Average response time under 2 hours</div>
										</div>
									</div>
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
											<div className="w-6 h-6 bg-red-600 rounded"></div>
										</div>
										<div>
											<div className="font-semibold text-gray-900">Multiple Channels</div>
											<div className="text-gray-600 text-sm">Email, phone, and live chat support</div>
										</div>
									</div>
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
											<div className="w-6 h-6 bg-red-600 rounded"></div>
										</div>
										<div>
											<div className="font-semibold text-gray-900">Expert Team</div>
											<div className="text-gray-600 text-sm">Shipping specialists ready to help</div>
										</div>
									</div>
								</div>
								
								{/* Quick action button */}
								<motion.a 
									href="tel:+233544197819"
									className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-lg transition-all duration-300"
									whileHover={{ scale: 1.05, y: -2 }}
									whileTap={{ scale: 0.95 }}
								>
									Call Us Now: +233 544 197 819
								</motion.a>
							</div>
						</AnimateInView>
						
						{/* Visual Side - Placeholder for SVG */}
						<AnimateInView variant="fadeInRight" delay={0.2}>
							<div className="relative">
								<div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
									<div className="text-center text-gray-700">
										<div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-6">
											<img 
												src={supportImage} 
												alt="Customer support illustration" 
												className="w-full h-full object-cover"
											/>
										</div>
										<div className="space-y-4">
											<div className="bg-gray-50 rounded-lg p-4">
												<div className="text-sm text-gray-600">Email Support</div>
												<div className="font-semibold text-gray-900">support@www.vanguardcargo.co</div>
											</div>
											<div className="bg-gray-50 rounded-lg p-4">
												<div className="text-sm text-gray-600">Office Hours</div>
												<div className="font-semibold text-gray-900">Mon-Fri: 8AM-8PM</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</AnimateInView>
					</div>
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
												placeholder="your.email@example.com"
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
							Our team is ready to help you with your package forwarding needs. Contact us 
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