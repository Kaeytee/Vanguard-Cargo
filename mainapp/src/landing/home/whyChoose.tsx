import { motion } from 'framer-motion';
import AnimateInView from '../../components/ui/animate-in-view';

export default function WhyChoose() {
	// Define why choose us items for package forwarding
	const whyChooseItems = [
		{
			icon: 'savings',
			title: 'Massive Savings',
			description: 'Save up to 70% on shipping costs with our package consolidation service',
			stat: '70%',
			statLabel: 'Average savings'
		},
		{
			icon: 'stores',
			title: '10,000+ US Stores',
			description: 'Shop from Amazon, Nike, Best Buy, and thousands of stores that don\'t ship to Ghana',
			stat: '10K+',
			statLabel: 'Partner stores'
		},
		{
			icon: 'delivery',
			title: 'Reliable Delivery Service',
			description: 'We handle everything from US pickup to secure delivery at pickup locations in Ghana',
			stat: '3 Days',
			statLabel: 'Delivery to Ghana'
		},
		{
			icon: 'support',
			title: 'Expert Support',
			description: 'Our Ghana-based team understands your needs and provides local language support',
			stat: '24/7',
			statLabel: 'Customer support'
		}
	];

	return (
		<section className="py-16 bg-gray-50">
			<div className="container mx-auto px-4">
				<AnimateInView variant="fadeInDown">
					<h2 className="text-3xl font-bold text-center mb-4">Why 5000+ Ghanaians Choose Vanguard</h2>
					<p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
						Join thousands of satisfied customers who trust us to bring the best of US shopping to Ghana
					</p>
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
									{item.icon === 'savings' && (
										<motion.div
											className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600"
											whileHover={{ scale: 1.1, rotate: 5 }}
											transition={{ type: "spring", stiffness: 300, damping: 15 }}
										>
											<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</motion.div>
									)}
									{item.icon === 'stores' && (
										<motion.div
											className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600"
											whileHover={{ scale: 1.1, rotate: 5 }}
											transition={{ type: "spring", stiffness: 300, damping: 15 }}
										>
											<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
											</svg>
										</motion.div>
									)}
									{item.icon === 'delivery' && (
										<motion.div
											className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600"
											whileHover={{ scale: 1.1, rotate: 5 }}
											transition={{ type: "spring", stiffness: 300, damping: 15 }}
										>
											<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
											</svg>
										</motion.div>
									)}
									{item.icon === 'support' && (
										<motion.div
											className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600"
											whileHover={{ scale: 1.1, rotate: 5 }}
											transition={{ type: "spring", stiffness: 300, damping: 15 }}
										>
											<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 110 19.5 9.75 9.75 0 010-19.5z" />
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