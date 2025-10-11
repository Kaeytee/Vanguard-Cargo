import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Phone,
  Mail,
  MessageSquare,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { CONTACT_INFO, getPhoneLink } from "../../constants/contact";
import { SupportService } from "../../services/supportService";
import type { SupportMessageData } from "../../services/supportService";
import { useReduxAuth as useAuth } from "../../hooks/useReduxAuth";

interface ContactSectionProps {
  containerVariants: import("framer-motion").Variants;
  itemVariants: import("framer-motion").Variants;
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
  const [category, setCategory] = useState<SupportMessageData['category']>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const { user, profile } = useAuth();

  /**
   * Load user data and prefill form if user is authenticated
   */
  useEffect(() => {
    const loadUserData = () => {
      try {
        if (profile) {
          // Use profile data (same as AccountSettings)
          const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
          if (fullName) {
            setName(fullName);
          }
          if (profile.email) {
            setEmail(profile.email);
          }
        } else if (user?.email) {
          // Fallback to auth user email if no profile
          setEmail(user.email);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Continue without prefilling - user can enter manually
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUserData();
  }, [user, profile]);

  /**
   * Handle form submission with real email functionality
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmitting(true);

    try {
      // Prepare message data
      const messageData: SupportMessageData = {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        category,
      };

      // Submit support message via service
      const response = await SupportService.submitSupportMessage(messageData);

      if (response.success) {
        // Success - show success message
        setSubmitSuccess(response.message);
        setIsSubmitted(true);

        // Reset form after successful submission
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        setCategory("general");

        // Reset success status after 8 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setSubmitSuccess(null);
        }, 8000);

      } else {
        // Error - show error message
        setSubmitError(response.error || response.message);
      }

    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
                <div className="space-y-1">
                  <a
                    href={getPhoneLink(CONTACT_INFO.MOBILE_PHONE)}
                    className="block text-gray-800 font-medium hover:text-red-500 transition-colors text-sm sm:text-base"
                  >
                    {CONTACT_INFO.MOBILE_DISPLAY} (Mobile)
                  </a>
                  <a
                    href={getPhoneLink(CONTACT_INFO.LANDLINE_PHONE)}
                    className="block text-gray-800 font-medium hover:text-red-500 transition-colors text-sm sm:text-base"
                  >
                    {CONTACT_INFO.LANDLINE_DISPLAY} (Landline)
                  </a>
                </div>
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
                  href={`mailto:${CONTACT_INFO.SUPPORT_EMAIL}`}
                  className="text-gray-800 font-medium hover:text-red-500 transition-colors text-sm sm:text-base"
                >
                  {CONTACT_INFO.SUPPORT_EMAIL}
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
                  {CONTACT_INFO.ADDRESS.FULL}
                </span>
              </div>
            </div>

            {/* Office Hours */}
            <div className="mt-4">
              <h4 className="text-sm sm:text-md font-semibold text-[#1A2B6D] mb-1">
                Office Hours
              </h4>
              <ul className="text-gray-700 text-xs sm:text-sm">
                <li>{CONTACT_INFO.BUSINESS_HOURS.WEEKDAYS}</li>
                <li>{CONTACT_INFO.BUSINESS_HOURS.SATURDAY}</li>
                <li>{CONTACT_INFO.BUSINESS_HOURS.SUNDAY}</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Location Info */}
        <motion.div
          variants={itemVariants}
          className="w-full flex justify-center"
        >
          <div className="w-full h-48 sm:h-64 md:h-80 rounded-lg border border-gray-200 shadow bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="bg-red-100 p-4 rounded-full mb-4 inline-block">
                <MessageSquare size={32} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Visit Our Office</h3>
              <p className="text-gray-600 text-sm mb-2">
                {CONTACT_INFO.ADDRESS.FULL}
              </p>
              <button
                onClick={() => window.open(`https://maps.google.com/?q=5.6037,0.1870`, '_blank')}
                className="text-red-500 hover:text-red-600 text-sm font-medium underline"
              >
                View on Google Maps
              </button>
            </div>
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
                  Name {name && <span className="text-green-600 text-xs">(prefilled)</span>}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 text-xs sm:text-sm"
                  value={name}
                  placeholder={isLoadingUser ? "Loading your name..." : "Enter your name"}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting || isLoadingUser}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Email {email && <span className="text-green-600 text-xs">(prefilled)</span>}
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 text-xs sm:text-sm"
                  placeholder={isLoadingUser ? "Loading your email..." : "Enter your email address"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting || isLoadingUser}
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
                  disabled={isSubmitting || isLoadingUser}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 text-xs sm:text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupportMessageData['category'])}
                  disabled={isSubmitting || isLoadingUser}
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
                placeholder={isLoadingUser ? "Loading..." : "How may we help you?"}
                disabled={isSubmitting || isLoadingUser}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-1/2 md:w-1/4 min-w-[120px] flex items-center justify-center bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-[#1A2B6D] transition-colors disabled:opacity-60 text-xs sm:text-base"
                disabled={isSubmitting || isLoadingUser}
              >
                <Send className="mr-2" size={18} />
                {isLoadingUser ? "Loading..." : isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </div>
            {/* Success Message */}
            {isSubmitted && submitSuccess && (
              <div className="text-green-600 text-xs sm:text-sm mt-2 flex items-center bg-green-50 p-3 rounded-md border border-green-200">
                <CheckCircle className="mr-2 w-4 h-4 flex-shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}
            
            {/* Error Message */}
            {submitError && (
              <div className="text-red-600 text-xs sm:text-sm mt-2 flex items-center bg-red-50 p-3 rounded-md border border-red-200">
                <XCircle className="mr-2 w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ContactSection;
