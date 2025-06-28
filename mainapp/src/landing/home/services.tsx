import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Plane, Box, FileText, ArrowUpCircle } from "lucide-react";
import AnimateInView from "../../components/ui/animate-in-view";

export default function Services() {
  // Track hover state for each service item
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Define service items based on the design with placeholder images
  const serviceItems = [
    {
      icon: Plane,
      title: "Air Freight",
      description: "Fast and reliable air transportation solutions for time-sensitive cargo.",
      image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      icon: Box,
      title: "Packaging Services",
      description: "Secure, professional packaging that meets international air freight standards for safe delivery.",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      icon: FileText,
      title: "Customs Clearance Assistance",
      description: "Fast, hassle-free clearance in Ghana and the USA.",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      icon: ArrowUpCircle,
      title: "Consolidation Services",
      description: "Bundle multiple items to reduce shipping cost.",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <AnimateInView variant="fadeInDown">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">Our Services</h2>
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
              to="/services"
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              View All Services
            </Link>
          </div>
        </AnimateInView>
      </div>
    </section>
  );
}