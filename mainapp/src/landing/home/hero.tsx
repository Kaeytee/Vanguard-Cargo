import { motion } from "framer-motion";
import { CheckCircle, Package, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const heroImage = {
  url: "/jet.jpeg",
  alt: "Vanguard Cargo Jet"
};

export default function Hero() {
  return (
    <section className="relative bg-white min-h-[600px] md:min-h-[700px] overflow-hidden">
      {/* Background Image - Full Screen */}
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          <img
            src={heroImage.url}
            alt={heroImage.alt}
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 min-h-[600px] md:min-h-[700px] flex items-center">
        <div className="w-full max-w-2xl py-12 md:py-20">
          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Shop in the US.{" "}
              <span style={{ color: '#D81515' }}>Ship to Ghana,</span>
              <br />
              in 3 Days.
            </h1>

            <p className="text-lg md:text-xl text-gray-200 max-w-xl">
              Your trusted partner for fast, affordable, and secure shipping from the US to Ghana
            </p>

            <div className="space-y-4">
              <div className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 text-green-400" />
                <span className="text-base md:text-lg">Save up to 80% on Shipping</span>
              </div>
              <div className="flex items-center text-white">
                <Package className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400" />
                <span className="text-base md:text-lg">Package Consolidation</span>
              </div>
              <div className="flex items-center text-white">
                <Shield className="w-5 h-5 mr-3 flex-shrink-0 text-yellow-400" />
                <span className="text-base md:text-lg">Secure Delivery</span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <Link
                to="/register"
                className="inline-block w-full sm:w-auto text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl text-center hover:bg-red-600 active:scale-95 animate-pulse-glow hover:animate-none"
                style={{ backgroundColor: '#D81515' }}
              >
                Get My Free US Address
              </Link>
              <p className="text-gray-300">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
