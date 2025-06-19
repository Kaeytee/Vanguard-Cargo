import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, HelpCircle } from "lucide-react";
import FaqSection from "../../components/support/FaqSection";
import ContactSection from "../../components/support/ContactSection";

/**
 * AppSupport - Client app support page
 *
 * This component provides support resources for authenticated users including
 * FAQs, contact information, and a support ticket submission form.
 *
 * @returns {JSX.Element} The AppSupport component
 */
const AppSupport: React.FC = () => {
  // Active section state
  const [activeSection, setActiveSection] = useState<"faq" | "contact">("faq");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <div className="md:p-8 max-w-6xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Support</h1>
        <p className="text-gray-600 text-lg">
          Get help with your shipments, and services.
        </p>{" "}
      </motion.div>{" "}
      <motion.div
        className="flex gap-4 mb-8 md:w-[30%]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {" "}
        <button
          type="button"
          className={`flex items-center justify-center px-5 py-2 rounded-md font-medium border transition-colors duration-150 flex-1 ${
            activeSection === "faq"
              ? "bg-[#1A2B6D] text-white border-[#1A2B6D]"
              : "bg-white text-[#1A2B6D] border-[#1A2B6D]"
          }`}
          onClick={() => setActiveSection("faq")}
        >
          FAQs
          <HelpCircle className="ml-2" size={18} />
        </button>
        <button
          type="button"
          className={`flex items-center justify-center px-5 py-2 rounded-md font-medium border transition-colors duration-150 flex-1 ${
            activeSection === "contact"
              ? "bg-[#1A2B6D] text-white border-[#1A2B6D]"
              : "bg-white text-[#1A2B6D] border-[#1A2B6D]"
          }`}
          onClick={() => setActiveSection("contact")}
        >
          Contact Us
          <Phone className="ml-2" size={18} />
        </button>
      </motion.div>{" "}
      {/* Dynamic content based on active section */}
      {activeSection === "faq" ? (
        <FaqSection
          containerVariants={containerVariants}
          itemVariants={itemVariants}
          onSwitchToContact={() => setActiveSection("contact")}
        />
      ) : (
        <ContactSection
          containerVariants={containerVariants}
          itemVariants={itemVariants}
        />
      )}
    </div>
  );
};

export default AppSupport;
