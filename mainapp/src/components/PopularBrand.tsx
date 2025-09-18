import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

// Popular brands data
const popularBrands = [
  {
    name: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    category: "Everything",
    url: "https://www.amazon.com"
  },
  {
    name: "Nike",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
    category: "Sportswear",
    url: "https://www.nike.com"
  },
  {
    name: "Apple",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    category: "Electronics",
    url: "https://www.apple.com"
  },
  {
    name: "Samsung",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
    category: "Electronics",
    url: "https://www.samsung.com"
  },
  {
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    category: "Technology",
    url: "https://www.microsoft.com"
  },
  {
    name: "Adidas",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
    category: "Sportswear",
    url: "https://www.adidas.com"
  },
  {
    name: "eBay",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg",
    category: "Marketplace",
    url: "https://www.ebay.com"
  },
  {
    name: "Walmart",
    logo: "data:image/png;base64,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",
    category: "Retail",
    url: "https://www.walmart.com"
  },
  {
    name: "Target",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg",
    category: "Retail",
    url: "https://www.target.com"
  },
  {
    name: "Costco",
    logo: "data:image/png;base64,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",
    category: "Wholesale",
    url: "https://www.costco.com"
  },
  {
    name: "Zara",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg",
    category: "Fashion",
    url: "https://www.zara.com"
  },
  {
    name: "H&M",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg",
    category: "Fashion",
    url: "https://www2.hm.com"
  }
];
const PopularBrand = () => {
  return (
	 <div>
		


{/* Popular Brands & Shops Section */}
	 <section className="py-16 bg-white">
		<div className="container mx-auto px-4">
		  <div className="text-center mb-12">
			 <motion.h2
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				viewport={{ once: true }}
				className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
			 >
				Shop From Your <span className="text-red-600">Favorite Brands</span>
			 </motion.h2>
			 <motion.p
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.1 }}
				viewport={{ once: true }}
				className="text-xl text-gray-600 max-w-3xl mx-auto"
			 >
				Access thousands of US stores and brands. Use your Vanguard address at checkout and we'll handle the rest.
			 </motion.p>
		  </div>

		  {/* Popular Brands - Responsive: Grid on Mobile, Marquee on Desktop */}
		  
		  {/* Mobile Grid (hidden on lg and up) */}
		  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12 lg:hidden">
			 {popularBrands.map((brand, index) => (
				<motion.a
				  key={brand.name}
				  href={brand.url}
				  target="_blank"
				  rel="noopener noreferrer"
				  initial={{ opacity: 0, y: 20 }}
				  whileInView={{ opacity: 1, y: 0 }}
				  transition={{ duration: 0.5, delay: index * 0.1 }}
				  viewport={{ once: true }}
				  whileHover={{ scale: 1.05, y: -5 }}
				  className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-300 group aspect-square flex items-center justify-center"
				>
				  <img 
					 src={brand.logo} 
					 alt={`${brand.name} logo`}
					 className="w-full h-full object-contain max-w-[80%] max-h-[80%]"
				  />
				</motion.a>
			 ))}
		  </div>

		  {/* Desktop Marquee (hidden on mobile, visible on lg and up) */}
		  <div className="space-y-8 mb-12 hidden lg:block">
			 {/* Top Row - Left to Right */}
			 <div className="overflow-hidden relative">
				<div className="flex animate-marquee-left whitespace-nowrap">
				  {/* Create multiple copies for true infinite scroll */}
				  {[...Array(4)].map((_, setIndex) => (
					 <div key={`top-set-${setIndex}`} className="flex">
						{popularBrands.slice(0, 6).map((brand) => (
						  <motion.a
							 key={`top-${setIndex}-${brand.name}`}
							 href={brand.url}
							 target="_blank"
							 rel="noopener noreferrer"
							 initial={{ opacity: 0, y: 20 }}
							 whileInView={{ opacity: 1, y: 0 }}
							 transition={{ duration: 0.5 }}
							 viewport={{ once: true }}
							 whileHover={{ scale: 1.05, y: -5 }}
							 className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-300 group flex-shrink-0 w-32 h-32 flex items-center justify-center mx-3"
						  >
							 <img 
								src={brand.logo} 
								alt={`${brand.name} logo`}
								className="w-full h-full object-contain max-w-[80%] max-h-[80%]"
							 />
						  </motion.a>
						))}
					 </div>
				  ))}
				</div>
			 </div>

			 {/* Bottom Row - Right to Left */}
			 <div className="overflow-hidden relative">
				<div className="flex animate-marquee-right whitespace-nowrap">
				  {/* Create multiple copies for true infinite scroll */}
				  {[...Array(4)].map((_, setIndex) => (
					 <div key={`bottom-set-${setIndex}`} className="flex">
						{popularBrands.slice(6).map((brand) => (
						  <motion.a
							 key={`bottom-${setIndex}-${brand.name}`}
							 href={brand.url}
							 target="_blank"
							 rel="noopener noreferrer"
							 initial={{ opacity: 0, y: 20 }}
							 whileInView={{ opacity: 1, y: 0 }}
							 transition={{ duration: 0.5 }}
							 viewport={{ once: true }}
							 whileHover={{ scale: 1.05, y: -5 }}
							 className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-300 group flex-shrink-0 w-32 h-32 flex items-center justify-center mx-3"
						  >
							 <img 
								src={brand.logo} 
								alt={`${brand.name} logo`}
								className="w-full h-full object-contain max-w-[80%] max-h-[80%]"
							 />
						  </motion.a>
						))}
					 </div>
				  ))}
				</div>
			 </div>
		  </div>

		  

		  {/* Call to Action */}
		  <motion.div
			 initial={{ opacity: 0, y: 20 }}
			 whileInView={{ opacity: 1, y: 0 }}
			 transition={{ duration: 0.6, delay: 0.3 }}
			 viewport={{ once: true }}
			 className="text-center mt-12"
		  >
			 <Link
				to="/app/dashboard"
				className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
			 >
				<ShoppingBag className="h-5 w-5 mr-2" />
				Get Your US Address & Start Shopping
			 </Link>
			 <p className="text-sm text-gray-500 mt-3">
				Free setup • No monthly fees • 70% shipping savings
			 </p>
		  </motion.div>
		</div>
	 </section>
	 </div>
  )
}

export default PopularBrand
