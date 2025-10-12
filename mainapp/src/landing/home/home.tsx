
import SEO from '../../components/SEO';
import MarqueeBanner from '../../components/MarqueeBanner';
import Hero from './hero';
import Services from './services';
// import WhyChoose from './whyChoose';
// import Testimonials from './testimonials';
import CTA from './cta';

export default function Home() {
	return (
		<div className="min-h-screen pt-16">
			<SEO 
				title="Vanguard Cargo - Premium Package Forwarding from USA to Ghana"
				description="Ship from any US store to Ghana with Vanguard Cargo. Get your free US address, consolidate packages, and save up to 80% on international shipping. Trusted by thousands of Ghanaians worldwide."
				keywords="package forwarding Ghana, USA to Ghana shipping, international shipping, US address Ghana, cargo forwarding, online shopping USA, package consolidation, shipping service Ghana, freight forwarding"
				url="https://www.vanguardcargo.co/"
			/>

			{/* Marquee Banner - Promotional scrolling banner */}
			<MarqueeBanner />

			{/* Hero Section */}
			<Hero />

			{/* Services Section */}
			<Services />

			{/* Why Choose Us Section */}
			{/* <WhyChoose /> */}

			{/* Testimonials Section */}
			{/* <Testimonials /> */}

			{/* Call to Action Section */}
			<CTA />
		</div>
	)
}
