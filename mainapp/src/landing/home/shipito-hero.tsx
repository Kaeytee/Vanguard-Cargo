import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, MapPin, Package, Plane, Heart, Star } from "lucide-react";

export default function ShipitoHero() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Akosua M.",
      location: "Accra, Ghana",
      text: "I saved over 60% on shipping costs by consolidating my packages. Vanguard made shopping from the US so easy!",
      rating: 5,
      avatar: "👩🏾‍💼"
    },
    {
      name: "Kwame A.",
      location: "Kumasi, Ghana", 
      text: "Finally got my hands on that limited edition sneaker drop! My US address made it possible.",
      rating: 5,
      avatar: "👨🏾‍💻"
    },
    {
      name: "Ama D.",
      location: "Tamale, Ghana",
      text: "The package consolidation service is genius. Three separate purchases became one shipment!",
      rating: 5,
      avatar: "👩🏾‍🎓"
    }
  ];

  const steps = [
    {
      number: "1",
      icon: MapPin,
      title: "Get Your Free US Address",
      description: "Sign up instantly and receive your personal US shipping address"
    },
    {
      number: "2", 
      icon: Package,
      title: "Shop Any US Store",
      description: "Use your new address to shop from Amazon, Nike, Best Buy, and thousands more"
    },
    {
      number: "3",
      icon: Plane,
      title: "We Ship to Ghana",
      description: "Combine packages to save money, then we deliver straight to your door"
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-green-400 rounded-full opacity-10 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-red-400 rounded-full opacity-10 animate-ping"></div>
        <div className="absolute bottom-40 right-1/3 w-8 h-8 bg-purple-400 rounded-full opacity-10 animate-pulse"></div>
      </div>

      <div className="relative z-10 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Main Hero Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            
            {/* Left Column - Hero Text */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="flex items-center justify-center lg:justify-start mb-4">
                <span className="bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-sm font-semibold mr-3">
                  🇺🇸 ✈️ 🇬🇭 FREE US ADDRESS
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Shop in the US.{" "}
                <span className="text-yellow-400">Ship to Ghana,</span>{" "}
                <span className="text-green-400">stress-free.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                Get your personal US shipping address and access thousands of US stores that don't ship to Ghana. 
                We'll consolidate your packages and forward them to your door at unbeatable prices.
              </p>

              {/* Key Benefits */}
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                <div className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>Save up to 70% on shipping</span>
                </div>
                <div className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>Package consolidation</span>
                </div>
                <div className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>Real-time tracking</span>
                </div>
                <div className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>Secure delivery to Ghana</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/register" 
                  className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Get My Free US Address 🚀
                </Link>
                <Link 
                  to="#how-it-works" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300"
                >
                  See How It Works
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center lg:justify-start mt-8 text-blue-200">
                <div className="flex items-center mr-6">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm">4.9/5 rating</span>
                </div>
                <div className="flex items-center">
                  <Heart className="h-4 w-4 text-red-400 mr-2" />
                  <span className="text-sm">5000+ happy customers</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Visual/Testimonial */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Testimonial Card */}
              <div className="bg-white rounded-2xl p-8 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4">{testimonials[currentTestimonial].avatar}</div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-gray-600 text-sm">{testimonials[currentTestimonial].location}</p>
                  </div>
                  <div className="ml-auto flex text-yellow-400">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-800 italic">"{testimonials[currentTestimonial].text}"</p>
                
                {/* Testimonial Navigation */}
                <div className="flex justify-center mt-6 space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                        index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Address Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-green-500 text-white p-4 rounded-lg shadow-lg"
              >
                <div className="text-xs font-semibold mb-1">YOUR US ADDRESS:</div>
                <div className="text-sm">
                  John Doe (TTL-12345)<br />
                  2891 NE 2nd Ave<br />
                  Miami, FL 33137
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* How It Works Section */}
          <motion.div 
            id="how-it-works"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works - Simple as 1, 2, 3
            </h2>
            <p className="text-xl text-blue-200 mb-12 max-w-3xl mx-auto">
              Start shopping from any US store in minutes. No contracts, no monthly fees.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.2 }}
                    className="relative"
                  >
                    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-blue-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
                        {step.number}
                      </div>
                      <IconComponent className="h-12 w-12 text-blue-600 mx-auto mb-4 mt-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Final CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="mt-16"
            >
              <Link 
                to="/register" 
                className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-blue-900 px-10 py-5 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
              >
                Start Shopping Now - It's Free! 🛍️
              </Link>
              <p className="text-blue-200 mt-4 text-sm">
                No setup fees • No monthly charges • Cancel anytime
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
