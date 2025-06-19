import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Phone } from "lucide-react";

interface FaqSectionProps {
  containerVariants: any;
  itemVariants: any;
  onSwitchToContact?: () => void;
}

const FaqSection: React.FC<FaqSectionProps> = ({
  containerVariants,
  itemVariants,
  onSwitchToContact,
}) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // FAQ data
  const faqs = [
    {
      question: "How do I track my shipment?",
      answer:
        "You can track your shipment by navigating to the Shipment History page and clicking on the tracking number of your shipment. This will show you real-time updates on your shipment's location and estimated delivery time.",
    },
    {
      question: "What information do I need to submit a new shipment?",
      answer:
        "To submit a new shipment, you'll need the recipient's full address, contact information, package dimensions, weight, and any special handling instructions. You can also specify pickup times and delivery preferences.",
    },
    {
      question: "How do I update my account information?",
      answer:
        "You can update your account information by navigating to the Settings page. There you can change your personal details, update your password, and manage notification preferences.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, PayPal, bank transfers, and corporate accounts with approved credit. Payment options can be selected during the shipment submission process.",
    },
    {
      question: "How can I cancel a shipment?",
      answer:
        'You can cancel a shipment by going to Shipment History, selecting the shipment you wish to cancel, and clicking the "Cancel Shipment" button. Note that cancellations are only possible before the shipment has been picked up.',
    },
  ];

  /**
   * Toggle FAQ expansion
   */
  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <motion.div
      className="lg:col-span-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* FAQs */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <FileText className="mr-2 text-red-500" size={20} />
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-md overflow-hidden"
            >
              <button
                className="w-full text-left p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium text-gray-800">
                  {faq.question}
                </span>
                <span className="text-gray-500 transform transition-transform">
                  {expandedFaq === index ? "−" : "+"}
                </span>
              </button>
              {expandedFaq === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-white border-t border-gray-200"
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              )}
            </div>
          ))}
          <div className="flex flex-col md:flex-row items-center justify-between border border-gray-200 rounded-md p-4 bg-[#B3B8CE] mt-4">
            <div>
              <span className="text-[#1A2B6D] font-bold text-lg">
                Still have more questions?
              </span>
              <p className="text-gray-600 md:mt-1 mb-2 md:mb-0">
                Our support team is here to help.
              </p>
            </div>{" "}
            <button
              type="button"
              className={`flex items-center justify-center px-5 py-2 rounded-md font-medium border transition-colors duration-150 hover:bg-white hover:text-[#1A2B6D] border-[#1A2B6D] bg-[#1A2B6D] text-white`}
              onClick={() => {
                if (onSwitchToContact) {
                  onSwitchToContact();
                } else {
                  // Fallback to email if no callback is provided
                  window.location.href = "mailto:support@ttarius.com";
                }
              }}
            >
              Contact Us
              <Phone className="ml-2" size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FaqSection;
