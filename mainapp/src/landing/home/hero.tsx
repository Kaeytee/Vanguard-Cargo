import { motion } from "framer-motion";
import { CheckCircle, Package, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../../assets/logo.png";

export default function Hero() {
  return (
    <section className="relative bg-white py-12 md:py-20 lg:py-24 overflow-hidden">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] [background-size:20px_20px]"></div>

      {/* SVG Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <pattern id="hero-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="gray" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#hero-pattern)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Hero Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Shop in the US.{" "}
              <span className="text-red-600">Ship to Ghana,</span>
              <br />
              in 3 Days.
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-xl">
              Your trusted partner for fast, affordable, and secure shipping from the US to Ghana
            </p>

            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#29428F' }} />
                <span className="text-base md:text-lg">Save up to 80% on Shipping</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Package className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#29428F' }} />
                <span className="text-base md:text-lg">Package Consolidation</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Shield className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#29428F' }} />
                <span className="text-base md:text-lg">Secure Delivery</span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <Link
                to="/register"
                className="inline-block w-full sm:w-auto text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl text-center active:bg-red-500 active:scale-95"
                style={{ backgroundColor: '#D81515' }}
              >
                Get My Free US Address
              </Link>
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Right Column - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative max-w-lg mx-auto">
              <motion.img
                src={heroImage}
                alt="Vanguard Cargo - Package Delivery Illustration"
                className="w-full h-auto object-contain"
                animate={{ 
                  y: [0, -15, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
