import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Heart, Star, ShoppingBag, Globe, MapPin, Plane, Rocket } from "lucide-react";

export default function Hero() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Akosua M.",
      location: "Accra, Ghana",
      text: "I saved over 60% on shipping costs by consolidating my packages. Amazing!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c1cd?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Kwame A.", 
      location: "Kumasi, Ghana",
      text: "Finally got those limited edition sneakers. My US address made it possible!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Ama D.",
      location: "Tamale, Ghana", 
      text: "Three separate purchases became one shipment. The consolidation is genius!",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
    }
  ];

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden flex items-center">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-green-400 rounded-full opacity-10 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-red-400 rounded-full opacity-10 animate-ping"></div>
        <div className="absolute bottom-40 right-1/3 w-8 h-8 bg-purple-400 rounded-full opacity-10 animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Main Hero Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Hero Text */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <span className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> <Plane className="w-4 h-4" /> <MapPin className="w-4 h-4" /> FREE US ADDRESS
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link 
                  to="/register" 
                  className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Get My Free US Address <Rocket className="w-5 h-5" />
                </Link>
                <Link 
                  to="/services" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300"
                >
                  See How It Works
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-blue-200">
                <div className="flex items-center">
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
                <div className="flex items-center">
                  <ShoppingBag className="h-4 w-4 text-green-400 mr-2" />
                  <span className="text-sm">10,000+ US stores</span>
                </div>
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
                  <img 
                    src={testimonials[currentTestimonial].avatar} 
                    alt={testimonials[currentTestimonial].name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-gray-600 text-sm">{testimonials[currentTestimonial].location}</p>
                  </div>
                  <div className="ml-auto flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
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

              {/* US Address Preview Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-xl shadow-lg"
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
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-blue-900 px-3 py-2 rounded-full text-xs font-bold animate-bounce">
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
  );
}
