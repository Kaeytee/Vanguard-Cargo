import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Plane, Box, FileText, ArrowUpCircle, MapPin } from "lucide-react";
import AnimateInView from "../../components/ui/animate-in-view";

export default function Services() {
  // Track hover state for each service item
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Define service items based on the package forwarding workflow
  const serviceItems = [
    {
      icon: Plane,
      title: "Get Your US Address",
      description: "Sign up instantly and receive your personal US shipping address. Start shopping from any US store immediately.",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      step: "1"
    },
    {
      icon: Box,
      title: "Shop Any US Store",
      description: "Use your new address at Amazon, Nike, Best Buy, and 10,000+ stores. We'll receive your packages for you.",
      image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      step: "2"
    },
    {
      icon: ArrowUpCircle,
      title: "Package Consolidation",
      description: "Combine multiple purchases into one shipment. Save up to 70% on shipping costs with our smart consolidation.",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      step: "3"
    },
    {
      icon: FileText,
      title: "Secure Delivery to Ghana",
      description: "We handle customs, tracking, and delivery to pickup locations in Ghana. Sit back and wait for your packages!",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      step: "4"
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <AnimateInView variant="fadeInDown">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">How It Works</h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Four simple steps to start shopping from any US store and saving money on shipping costs.
          </p>
        </AnimateInView>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {serviceItems.map((service, index) => {
            const isHovered = hoveredIndex === index;
            const Icon = service.icon;

            return (
              <AnimateInView key={index} variant="fadeInUp" delay={index * 0.1}>
                <motion.div 
                  whileHover={{ y: -8, scale: 1.02 }} 
                  className="h-full"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  <div
                    className={cn(
                      "bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 h-full group",
                      isHovered && "shadow-xl shadow-red-100"
                    )}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Image Section with Icon Overlay */}
                    <div className="relative h-48 ">
                      <img
                        src={service.image}
                        alt={`${service.title} image`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Dark overlay for better icon visibility */}
                      <div className="absolute inset-0 bg-black/20"></div>
                      
                      {/* Step number badge */}
                      <div className="absolute top-4 right-4 bg-gradient-to-br from-red-500 to-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white">
                        {service.step}
                      </div>
                      
                      {/* Icon positioned at bottom left of image */}
                      <motion.div
                        className="absolute -bottom-7 left-4"
                        animate={
                          isHovered
                            ? { scale: 1.1, rotate: 5 }
                            : { scale: 1, rotate: 0 }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                        }}
                      >
                        <div className="bg-white rounded-full p-3 shadow-lg">
                          <Icon className="w-8 h-8 text-red-500" />
                        </div>
                      </motion.div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      <motion.h3
                        className="text-xl font-bold mb-3 text-gray-800"
                        animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {service.title}
                      </motion.h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimateInView>
            );
          })}
        </div>

        <AnimateInView variant="fadeInUp" delay={0.4}>
          <div className="text-center mt-12">
            <Link
              to="/register"
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 justify-center"
            >
              Get My Free US Address Now <MapPin className="w-5 h-5" />
            </Link>
            <p className="text-gray-500 mt-3 text-sm">
              No setup fees • No monthly charges • Start shopping immediately
            </p>
          </div>
        </AnimateInView>
      </div>
    </section>
  );
}