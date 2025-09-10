import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Star, Globe, Plane, MapPin, Rocket, ShoppingBag } from "lucide-react";
import svgBackground from "../../assets/svg.png";

export default function Hero() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Akosua M.",
      location: "Accra, Ghana",
      text: "I saved over 60% on shipping costs by consolidating my packages. Amazing!",
      avatar: "data:image/jpeg;base64,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",
    },
    {
      name: "Kwame A.",
      location: "Kumasi, Ghana",
      text: "Finally got those limited edition sneakers. My US address made it possible!",
      avatar: "data:image/jpeg;base64,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",
    },
    {
      name: "Ama D.",
      location: "Tamale, Ghana",
      text: "Three separate purchases became one shipment. The consolidation is genius!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
  ];

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

  return (
    <>
    <section className="relative min-h-screen bg-gray-50 overflow-hidden flex items-center">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* SVG Background Image */}
        <div 
          className="absolute inset-0 bg-no-repeat bg-center bg-contain opacity-20"
          style={{
            backgroundImage: `url(${svgBackground})`,
            backgroundPosition: 'center',
          }}
        ></div>
        
        {/* Animated decorative elements */}
       </div>

      <div className="relative z-10 w-full py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <Plane className="w-4 h-4" />
                  <MapPin className="w-4 h-4" />
                  FREE US ADDRESS
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-700 mb-6 leading-tight">
                Shop in the US.{" "}
                <span className="text-red-600">Ship to Ghana,</span>{" "}
                <span className="text-gray-700">stress-free.</span>
              </h1>


              {/* Key Benefits */}
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {[
                  "Save up to 70% on shipping",
                  "Package consolidation",
                  "Real-time tracking",
                  "Secure delivery to Ghana",
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center text-gray-700">
                    <CheckCircle className="h-5 w-5 text-gray-700 mr-3 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link
                  to="/register"
                  className="bg-red-500 hover:bg-gray-300 hover:text-gray-700 text-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Get My Free US Address 
                  <Rocket className="w-5 h-5" />
                </Link>
                <Link
                  to="/services"
                  className="bg-transparent border-2 border-gray-800 text-black hover:bg-gray-700 hover:text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300"
                >
                  See How It Works
                </Link>
              </div>

             
            </motion.div>

            {/* Right Column - Testimonial & Address Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Customer Testimonial Card */}
              <div className="bg-white rounded-2xl p-8 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 mr-4">
                    <img 
                      src={testimonials[currentTestimonial].avatar}
                      alt={`${testimonials[currentTestimonial].name} profile`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {testimonials[currentTestimonial].name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {testimonials[currentTestimonial].location}
                    </p>
                  </div>
                  <div className="ml-auto flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-800 italic">
                  "{testimonials[currentTestimonial].text}"
                </p>

                {/* Testimonial Navigation */}
                <div className="flex justify-center mt-6 space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                        index === currentTestimonial
                          ? "bg-red-600"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* US Address Preview Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold">YOUR US ADDRESS:</div>
                  <Globe className="h-5 w-5" />
                </div>
                <div className="text-sm leading-relaxed">
                  <div className="font-semibold">John Doe (TTL-12345)</div>
                  <div>2891 NE 2nd Ave</div>
                  <div>Miami, FL 33137, USA</div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/20">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Ready to receive packages!</span>
                  </div>
                </div>
              </motion.div>

              {/* Floating Benefits */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-red-900 px-3 py-2 rounded-full text-xs font-bold animate-bounce">
                70% SAVINGS
              </div>
              <div className="absolute -bottom-4 -left-4 bg-green-500 text-white px-3 py-2 rounded-full text-xs font-bold">
                INSTANT SETUP
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>

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
            Access thousands of US stores and brands. Use your Ttarius address at checkout and we'll handle the rest.
          </motion.p>
        </div>

        {/* Popular Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
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

        

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/app/submit-request"
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
    </>
  );
}
