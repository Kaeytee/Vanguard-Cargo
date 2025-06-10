
import Hero from './hero';
import Services from './services';
import WhyChoose from './whyChoose';
import CTA from './cta';

export default function Home() {
	return (
		<div className="min-h-screen pt-16">
			{/* Hero Section */}
			<Hero />

			{/* Services Section */}
			<Services />

			{/* Why Choose Us Section */}
			<WhyChoose />

			{/* Call to Action Section */}
			<CTA />
		</div>
	)
}
