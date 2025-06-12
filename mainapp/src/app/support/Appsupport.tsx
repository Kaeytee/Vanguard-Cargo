import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Phone, Mail, MessageSquare, HelpCircle, FileText, AlertCircle } from 'lucide-react';

/**
 * AppSupport - Client app support page
 * 
 * This component provides support resources for authenticated users including
 * FAQs, contact information, and a support ticket submission form.
 * 
 * @returns {JSX.Element} The AppSupport component
 */
const AppSupport: React.FC = () => {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // FAQ state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };
  
  // FAQ data
  const faqs = [
    {
      question: 'How do I track my shipment?',
      answer: 'You can track your shipment by navigating to the Shipment History page and clicking on the tracking number of your shipment. This will show you real-time updates on your shipment\'s location and estimated delivery time.'
    },
    {
      question: 'What information do I need to submit a new shipment?',
      answer: 'To submit a new shipment, you\'ll need the recipient\'s full address, contact information, package dimensions, weight, and any special handling instructions. You can also specify pickup times and delivery preferences.'
    },
    {
      question: 'How do I update my account information?',
      answer: 'You can update your account information by navigating to the Settings page. There you can change your personal details, update your password, and manage notification preferences.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, bank transfers, and corporate accounts with approved credit. Payment options can be selected during the shipment submission process.'
    },
    {
      question: 'How can I cancel a shipment?',
      answer: 'You can cancel a shipment by going to Shipment History, selecting the shipment you wish to cancel, and clicking the "Cancel Shipment" button. Note that cancellations are only possible before the shipment has been picked up.'
    }
  ];
  
  // Contact information
  const contactInfo = [
    { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567', link: 'tel:+15551234567' },
    { icon: Mail, label: 'Email', value: 'support@logistics.com', link: 'mailto:support@logistics.com' },
    { icon: MessageSquare, label: 'Live Chat', value: 'Available 24/7', link: '#' }
  ];
  
  /**
   * Handle form submission
   * @param {React.FormEvent} e - Form event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Support ticket submitted:', { name, email, subject, message, category });
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form after submission
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setCategory('general');
      
      // Reset submission status after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };
  
  /**
   * Toggle FAQ expansion
   * @param {number} index - FAQ index to toggle
   */
  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Page header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Customer Support</h1>
        <p className="text-gray-600 text-lg">Get help with your shipments, account, or general inquiries</p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Contact info and FAQs */}
        <motion.div 
          className="lg:col-span-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Contact Information */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
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
                    <span className="font-medium text-gray-800">{faq.question}</span>
                    <span className="text-gray-500 transform transition-transform">
                      {expandedFaq === index ? '−' : '+'}
                    </span>
                  </button>
                  {expandedFaq === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 bg-white border-t border-gray-200"
                    >
                      <p className="text-gray-600">{faq.answer}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
        
        {/* Right column - Support ticket form */}
        <motion.div 
          className="lg:col-span-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
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
                <h3 className="text-green-800 font-medium text-lg mb-2">Ticket Submitted Successfully!</h3>
                <p className="text-green-700">Our support team will get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="shipment">Shipment Issue</option>
                    <option value="account">Account Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="technical">Technical Support</option>
                  </select>
                </div>
                
                {/* Subject field */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className={`w-full flex items-center justify-center px-6 py-3 rounded-md transition-all duration-200 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
        </motion.div>
      </div>
    </div>
  );
};

export default AppSupport;
