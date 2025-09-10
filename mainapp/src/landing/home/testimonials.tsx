import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, MapPin, Package } from 'lucide-react';
import AnimateInView from '../../components/ui/animate-in-view';

export default function Testimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Akosua Mensah",
      location: "Accra, Ghana",
      text: "I saved over GH₵1,200 on shipping costs by consolidating my Black Friday purchases. Vanguard made shopping from the US so easy!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b17c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
      purchase: "Nike sneakers, iPhone case, and makeup from 3 different stores"
    },
    {
      name: "Kwame Asante",
      location: "Kumasi, Ghana", 
      text: "Finally got my hands on that limited edition PlayStation 5! My US address made it possible when everywhere else said 'no shipping to Ghana'.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
      purchase: "PlayStation 5 bundle from Best Buy"
    },
    {
      name: "Ama Donkor",
      location: "Tamale, Ghana",
      text: "The package consolidation service is genius. Three separate Amazon purchases became one shipment - saved me so much money!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      purchase: "Books, kitchen appliances, and clothes from Amazon"
    },
    {
      name: "Kojo Boateng",
      location: "Cape Coast, Ghana",
      text: "Used Vanguard to import inventory for my electronics store. Professional service and great communication throughout.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      purchase: "Business inventory from multiple US suppliers"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <AnimateInView variant="fadeInDown">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h2 className="text-3xl font-bold">What Our Customers Say</h2>
              <Heart className="w-8 h-8 text-red-500 fill-current" />
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied Ghanaians who trust Vanguard for their US shopping needs
            </p>
          </div>
        </AnimateInView>

        <div className="max-w-4xl mx-auto">
          <AnimateInView variant="fadeInUp">
            <div className="relative">
              {/* Main testimonial card */}
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl p-8 shadow-lg mx-4"
              >
                <div className="flex items-start space-x-6">
                  {/* Avatar and rating */}
                  <div className="flex-shrink-0 text-center">
                    <div className="w-16 h-16 mb-2 mx-auto">
                      <img 
                        src={testimonials[currentTestimonial].avatar}
                        alt={`${testimonials[currentTestimonial].name} profile`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div className="flex text-yellow-400 justify-center">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>

                  {/* Testimonial content */}
                  <div className="flex-1">
                    <blockquote className="text-lg text-gray-800 italic mb-4">
                      "{testimonials[currentTestimonial].text}"
                    </blockquote>
                    
                    <div className="mb-3">
                      <div className="flex items-center gap-2 font-bold text-gray-900">
                        <span>{testimonials[currentTestimonial].name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <MapPin className="w-3 h-3" />
                        <span>{testimonials[currentTestimonial].location}</span>
                      </div>
                    </div>

                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="flex items-start gap-2 text-sm text-red-800">
                        <Package className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">Purchase: </span>
                          <span>{testimonials[currentTestimonial].purchase}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Navigation arrows */}
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow duration-300"
                aria-label="Previous testimonial"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow duration-300"
                aria-label="Next testimonial"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </AnimateInView>

          {/* Dots indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === currentTestimonial ? 'bg-red-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Trust metrics */}
          <AnimateInView variant="fadeInUp" delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 text-center">
              <div>
                <div className="text-2xl font-bold text-red-600">5000+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">₵2.5M+</div>
                <div className="text-sm text-gray-600">Saved in Shipping</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">50,000+</div>
                <div className="text-sm text-gray-600">Packages Delivered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600 flex items-center gap-1">
                  4.9<Star className="w-6 h-6 fill-current" />
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </AnimateInView>
        </div>
      </div>
    </section>
  );
}
