import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Package, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

// Hero slider images - shipping and logistics themed
const heroImages = [
  {
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
    alt: "Packages ready for shipping"
  },
  {
    url: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&q=80",
    alt: "Cargo plane loading"
  },
  {
    url: "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=800&q=80",
    alt: "Delivery service"
  },
  {
    url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80",
    alt: "Warehouse logistics"
  },
  {
    url: "https://images.unsplash.com/photo-1605732562742-3023a888e56e?w=800&q=80",
    alt: "Package delivery"
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance slider
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000); // Resume auto-play after 8 seconds
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % heroImages.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <section className="relative bg-white min-h-[600px] md:min-h-[700px] overflow-hidden">
      {/* Background Image Slider - Full Screen */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.7,
              ease: "easeInOut"
            }}
            className="absolute inset-0"
          >
            <img
              src={heroImages[currentSlide].url}
              alt={heroImages[currentSlide].alt}
              className="w-full h-full object-cover"
            />
            {/* Dark Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
          </motion.div>
        </AnimatePresence>
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

      {/* Navigation Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 p-3 rounded-full transition-all duration-200 hover:scale-110 z-20 hidden md:block"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 p-3 rounded-full transition-all duration-200 hover:scale-110 z-20 hidden md:block"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? "bg-white w-12" 
                : "bg-white/50 hover:bg-white/75 w-8"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
