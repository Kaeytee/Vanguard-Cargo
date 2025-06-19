import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Phone,
  Mail,
  MessageSquare,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

interface ContactSectionProps {
  containerVariants: any;
  itemVariants: any;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  containerVariants,
  itemVariants,
}) => {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Contact information
  const contactInfo = [
    {
      icon: Phone,
      label: "Phone",
      value: "+1 (555) 123-4567",
      link: "tel:+15551234567",
    },
    {
      icon: Mail,
      label: "Email",
      value: "support@logistics.com",
      link: "mailto:support@logistics.com",
    },
    {
      icon: MessageSquare,
      label: "Live Chat",
      value: "Available 24/7",
      link: "#",
    },
  ];

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Support ticket submitted:", {
        name,
        email,
        subject,
        message,
        category,
      });
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Reset form after submission
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setCategory("general");

      // Reset submission status after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <motion.div
      className="lg:col-span-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Information */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <HelpCircle className="mr-2 text-red-500" size={20} />
            Contact Us
          </h2>
          <div className="space-y-4">
            {contactInfo.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="flex items-center">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <IconComponent size={18} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <a
                      href={item.link}
                      className="text-gray-800 font-medium hover:text-red-500 transition-colors"
                    >
                      {item.value}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Support ticket form */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <AlertCircle className="mr-2 text-red-500" size={20} />
            Submit a Support Ticket
          </h2>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-md p-4 text-center"
            >
              <h3 className="text-green-800 font-medium text-lg mb-2">
                Ticket Submitted Successfully!
              </h3>
              <p className="text-green-700">
                Our support team will get back to you within 24 hours.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>

                {/* Email field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Category dropdown */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors"
                >
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="shipping">Shipping Issue</option>
                </select>
              </div>

              {/* Subject field */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors"
                />
              </div>

              {/* Message field */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors"
                ></textarea>
              </div>

              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center px-6 py-3 rounded-md transition-all duration-200 ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      Submit Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ContactSection;
