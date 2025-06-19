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
      className="lg:col-span-3 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Contact Information */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-md p-4 sm:p-6"
        >
          <h2 className="text-lg sm:text-xl font-bold text-[#1A2B6D] mb-4 flex items-center">
            <HelpCircle className="mr-2 text-[#1A2B6D]" size={24} />
            Contact Information
          </h2>
          <div className="space-y-4">
            {/* Phone Support */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#1A2B6D] mb-1">
                Phone Support
              </h3>
              <div className="flex items-center mb-2">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <Phone size={18} className="text-red-500" />
                </div>
                <a
                  href="tel:+2338001234567"
                  className="text-gray-800 font-medium hover:text-red-500 transition-colors text-sm sm:text-base"
                >
                  +233 800 123 4567
                </a>
              </div>
            </div>

            {/* Email Support */}
            <div className="mt-4">
              <h3 className="text-base sm:text-lg font-semibold text-[#1A2B6D] mb-1">
                Email Support
              </h3>
              <div className="flex items-center mb-2">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <Mail size={18} className="text-red-500" />
                </div>
                <a
                  href="mailto:support@logistics.com"
                  className="text-gray-800 font-medium hover:text-red-500 transition-colors text-sm sm:text-base"
                >
                  support@logistics.com
                </a>
              </div>
            </div>

            {/* Head Office */}
            <div className="mt-4">
              <h3 className="text-base sm:text-lg font-semibold text-[#1A2B6D] mb-1">
                Head Office
              </h3>
              <div className="flex items-center mb-2">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <MessageSquare size={18} className="text-red-500" />
                </div>
                <span className="text-gray-800 font-medium text-sm sm:text-base">
                  123 Logistics Ave, Suite 400, New York, NY 10001
                </span>
              </div>
            </div>

            {/* Office Hours */}
            <div className="mt-4">
              <h4 className="text-sm sm:text-md font-semibold text-[#1A2B6D] mb-1">
                Office Hours
              </h4>
              <ul className="text-gray-700 text-xs sm:text-sm">
                <li>Mon - Fri: 8:00 AM – 8:00 PM</li>
                <li>Sat: 9:00 AM – 5:00 PM</li>
                <li>Sun: Closed</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Map */}
        <motion.div
          variants={itemVariants}
          className="w-full flex justify-center"
        >
          <div className="w-full h-48 sm:h-64 md:h-80 rounded-lg overflow-hidden border border-gray-200 shadow">
            <iframe
              title="Ttarius Logistics Location"
              src="https://www.google.com/maps?q=6.5244,3.3792&z=15&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </motion.div>

        {/* Instant Contact Form */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col justify-between col-span-1 lg:col-span-2 w-full"
        >
          <h2 className="text-lg sm:text-xl font-bold text-[#1A2B6D] mb-4 flex items-center">
            <AlertCircle className="mr-2 text-[#1A2B6D]" size={24} />
            Instant Contact Form
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 text-xs sm:text-sm"
                  value={name}
                  placeholder="Enter your name"
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 text-xs sm:text-sm"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 text-xs sm:text-sm"
                  value={subject}
                  placeholder="Enter the subject of your message"
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 text-xs sm:text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="complaint">Complaint</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 text-xs sm:text-sm"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="How may we help you?"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-1/2 md:w-1/4 min-w-[120px] flex items-center justify-center bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-[#1A2B6D] transition-colors disabled:opacity-60 text-xs sm:text-base"
                disabled={isSubmitting}
              >
                <Send className="mr-2" size={18} />
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </div>
            {isSubmitted && (
              <div className="text-green-600 text-xs sm:text-sm mt-2 flex items-center">
                <span className="mr-2">✔</span>
                Your message has been sent!
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ContactSection;
