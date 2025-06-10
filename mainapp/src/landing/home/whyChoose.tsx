import { motion } from 'framer-motion';
import AnimateInView from '../../components/ui/animate-in-view';

export default function WhyChoose() {
	// Define why choose us items
	const whyChooseItems = [
		{
			icon: 'heart',
			title: 'Reliability',
			description: '99.8% on-time delivery rate with real-time tracking and notifications',
			stat: '99.8%',
			statLabel: 'On-time delivery'
		},
		{
			icon: 'clock',
			title: 'Fast Shipment',
			description: 'Quick shipping from China to the USA',
			stat: '4-7 Days',
			statLabel: 'Average delivery time'
		},
		{
			icon: 'tech',
			title: 'Technology-Driven',
			description: 'AI-powered route optimization and predictive analytics for efficient delivery',
			stat: '30%',
			statLabel: 'Faster than average'
		},
		{
			icon: 'lightning',
			title: 'Fast Turnaround',
			description: 'Expedited shipping options with priority handling for urgent cargo',
			stat: '24/7',
			statLabel: 'Support available'
		}
	];

	return (
		<section className="py-16 bg-gray-50">
			<div className="container mx-auto px-4">
				<AnimateInView variant="fadeInDown">
					<h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
				</AnimateInView>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{whyChooseItems.map((item, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							viewport={{ once: true }}
							whileHover={{ y: -5, transition: { duration: 0.2 } }}
							className="h-full"
						>
							<div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm h-full flex flex-col">
								<div className="flex justify-center mb-4">
									{item.icon === 'heart' && (
										<motion.div
											className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600"
											whileHover={{ scale: 1.1, rotate: 5 }}
											transition={{ type: "spring", stiffness: 300, damping: 15 }}
										>
											<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
											</svg>
										</motion.div>
									)}
									{item.icon === 'clock' && (
										<motion.div
											className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600"
											whileHover={{ scale: 1.1, rotate: 5 }}
											transition={{ type: "spring", stiffness: 300, damping: 15 }}
										>
											<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</motion.div>
									)}
									{item.icon === 'tech' && (
										<motion.div
											className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600"
											whileHover={{ scale: 1.1, rotate: 5 }}
											transition={{ type: "spring", stiffness: 300, damping: 15 }}
										>
											<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
											</svg>
										</motion.div>
									)}
									{item.icon === 'lightning' && (
										<motion.div
											className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600"
											whileHover={{ scale: 1.1, rotate: 5 }}
											transition={{ type: "spring", stiffness: 300, damping: 15 }}
										>
											<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
											</svg>
										</motion.div>
									)}
								</div>
								<motion.h3
									className="text-xl font-bold mb-2 text-center"
									whileInView={{ opacity: [0, 1], y: [10, 0] }}
									transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
								>
									{item.title}
								</motion.h3>
								<p className="text-gray-600 mb-4 text-center text-sm">{item.description}</p>
								<motion.div
									className="text-center mt-auto"
									initial={{ opacity: 0, scale: 0.8 }}
									whileInView={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
								>
									<motion.div
										className="text-2xl font-bold text-red-600"
										whileInView={{
											opacity: [0, 1],
											y: [20, 0],
										}}
										transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
									>
										{item.stat}
									</motion.div>
									<div className="text-sm text-gray-500">{item.statLabel}</div>
								</motion.div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}