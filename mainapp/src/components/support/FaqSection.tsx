import React, { useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { FileText, Phone } from "lucide-react";

interface FaqSectionProps {
  containerVariants: Variants;
  itemVariants: Variants;
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
      question: "How do I get my free US address?",
      answer:
        "Register for an account on our platform and you'll receive a unique US shipping address within minutes. Use this address when shopping at any US retailer, and we'll receive your packages at our warehouse.",
    },
    {
      question: "How does package consolidation work?",
      answer:
        "When multiple packages arrive for you at our US warehouse, we can combine them into one shipment to Ghana. This significantly reduces your shipping costs compared to shipping each package individually.",
    },
    {
      question: "How much can I save with your service?",
      answer:
        "Our customers typically save 40-70% on shipping costs through consolidation and our bulk shipping rates. The exact savings depend on the number and size of your packages.",
    },
    {
      question: "What items can I ship from the US to Ghana?",
      answer:
        "You can ship most items including electronics, clothing, books, and personal items. We cannot ship prohibited items such as hazardous materials, perishables, liquids over 100ml, or items restricted by Ghana Customs.",
    },
    {
      question: "How long does shipping take to Ghana?",
      answer:
        "Standard shipping takes 7-14 business days from our US warehouse to Ghana. We also offer express shipping options for 3-7 business days delivery.",
    },
    {
      question: "How do I track my packages?",
      answer:
        "You can track your packages in real-time through your dashboard. We provide updates from when your package arrives at our US warehouse until it's delivered to your address in Ghana.",
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
      className="lg:col-span-3 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* FAQs */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full max-w-full"
      >
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center">
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
                className="w-full text-left p-3 sm:p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium text-gray-800 text-base sm:text-lg">
                  {faq.question}
                </span>
                <span className="text-gray-500 transform transition-transform text-xl sm:text-2xl">
                  {expandedFaq === index ? "−" : "+"}
                </span>
              </button>
              {expandedFaq === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-3 sm:p-4 bg-white border-t border-gray-200"
                >
                  <p className="text-gray-600 text-sm sm:text-base">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </div>
          ))}
          <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row items-center justify-between border border-gray-200 rounded-md p-3 sm:p-4 bg-[#B3B8CE] mt-4">
            <div className="flex-1 w-full sm:w-auto">
              <span className="text-[#1A2B6D] font-bold text-base sm:text-lg">
                Still have more questions?
              </span>
              <p className="text-gray-600 mt-1 mb-2 sm:mb-0 text-sm sm:text-base">
                Our support team is here to help.
              </p>
            </div>
            <button
              type="button"
              className="flex items-center justify-center px-4 sm:px-5 py-2 rounded-md font-medium border transition-colors duration-150 hover:bg-white hover:text-[#1A2B6D] border-[#1A2B6D] bg-[#1A2B6D] text-white w-full sm:w-auto"
              onClick={() => {
                if (onSwitchToContact) {
                  onSwitchToContact();
                } else {
                  window.location.href = "mailto:support@Vanguardcargo.org";
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
