/**
 * Data Deletion Request Page Component
 * GDPR-compliant data deletion request form for Vanguard Cargo LLC
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, AlertCircle, Send, CheckCircle, XCircle } from 'lucide-react';
import logoImage from '../assets/logo.png';
import { SupportService } from '../services/supportService';
import type { SupportMessageData } from '../services/supportService';

/**
 * Data Deletion Request Component
 * Displays information about data deletion rights and provides a form to request account/data deletion
 */
const DataDeletion: React.FC = () => {
  // Form state for data deletion request
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    accountEmail: '',
    reason: '',
    additionalInfo: ''
  });

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  /**
   * Handle form input changes
   * Updates form state as user types
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle form submission
   * Sends data deletion request via the same support email system
   */
  const handleSubmit = async () => {
    // Clear previous messages
    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.accountEmail.trim() || !formData.reason.trim()) {
        setSubmitError('Please fill in all required fields.');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email) || !emailRegex.test(formData.accountEmail)) {
        setSubmitError('Please enter valid email addresses.');
        return;
      }

      // Prepare message data for the support service
      // Using the existing support email system with clear identification as data deletion request
      const messageData: SupportMessageData = {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        subject: `DATA DELETION REQUEST - ${formData.accountEmail.trim()}`,
        message: `
DATA DELETION REQUEST
=====================

REQUESTER INFORMATION:
- Full Name: ${formData.fullName.trim()}
- Contact Email: ${formData.email.trim()}
- Account Email to Delete: ${formData.accountEmail.trim()}

REASON FOR DELETION:
${formData.reason.trim()}

ADDITIONAL INFORMATION:
${formData.additionalInfo.trim() || 'N/A'}

---
This is an automated data deletion request submitted via the Vanguard Cargo platform.
Please process this request according to GDPR and data protection regulations.
        `.trim(),
        category: 'complaint', // Using 'complaint' category to prioritize data deletion requests
      };

      // Submit data deletion request via support service
      const response = await SupportService.submitSupportMessage(messageData);

      if (response.success) {
        // Success - show success message
        setSubmitSuccess(
          'Your data deletion request has been received! We will process your request within 30 days as required by GDPR regulations. You will receive a confirmation email shortly.'
        );
        setIsSubmitted(true);

        // Reset form after successful submission
        setFormData({
          fullName: '',
          email: '',
          accountEmail: '',
          reason: '',
          additionalInfo: ''
        });

        // Reset success status after 10 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setSubmitSuccess(null);
        }, 10000);

      } else {
        // Error - show error message
        setSubmitError(response.error || response.message);
      }

    } catch (error) {
      console.error('Data deletion request submission error:', error);
      setSubmitError('An unexpected error occurred. Please try again or contact support directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative py-14">
      {/* Logo Watermark Background */}
      <div 
        className="fixed inset-0 bg-no-repeat bg-center bg-contain opacity-5 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${logoImage})`,
          backgroundSize: '400px',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Header Section */}
      <div className="bg-transparent shadow-sm border-b relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <img 
                src={logoImage} 
                alt="Vanguard Cargo Logo" 
                className="w-10 h-10 object-contain"
              />
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Data Deletion Request</h1>
                <p className="text-gray-600">Vanguard Cargo LLC</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="bg-transparent rounded-lg shadow-sm p-8">
          
          {/* Information Banner */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-medium">Your Right to Data Deletion</p>
                <p className="text-blue-700 text-sm mt-1">
                  Under GDPR and data protection laws, you have the right to request deletion of your personal data. 
                  We will process your request within 30 days and confirm once completed.
                </p>
              </div>
            </div>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Request Account and Data Deletion
            </h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                At Vanguard Cargo, we respect your privacy and your right to control your personal information. 
                If you wish to delete your account and all associated data from our systems, please complete 
                the form below.
              </p>
              <p>
                <strong>What will be deleted:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your account information (name, email, phone number, addresses)</li>
                <li>All package and shipment records associated with your account</li>
                <li>Communication history and support messages</li>
                <li>Preferences and settings</li>
                <li>Any uploaded documents or photos</li>
              </ul>
              <p className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <strong>Important:</strong> This action cannot be undone. Once your data is deleted, 
                you will not be able to recover your account or access any historical information. 
                We may retain certain data for a limited period if required by law or for legitimate business purposes.
              </p>
            </div>
          </section>

          {/* Data Deletion Request Form */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Deletion Request</h2>
            <p className="text-gray-600 mb-6">
              Please fill out the form below to request deletion of your account and personal data. 
              We will verify your identity and process your request within 30 days.
            </p>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-6">
                {/* Full Name Field */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Contact Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email where we can send confirmation of your deletion request
                  </p>
                </div>

                {/* Account Email to Delete */}
                <div>
                  <label htmlFor="accountEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Account Email to Delete <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    id="accountEmail"
                    name="accountEmail"
                    value={formData.accountEmail}
                    onChange={handleInputChange}
                    placeholder="account@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The email address associated with your Vanguard Cargo account
                  </p>
                </div>

                {/* Reason for Deletion */}
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Deletion <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Please tell us why you want to delete your account (optional but helps us improve our service)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200 resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Additional Information */}
                <div>
                  <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any additional information to help us process your request"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors duration-200 resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isSubmitted}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
                  whileHover={!isSubmitting && !isSubmitted ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isSubmitting && !isSubmitted ? { scale: 0.98 } : {}}
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Request...' : isSubmitted ? 'Request Submitted' : 'Submit Deletion Request'}</span>
                </motion.button>

                {/* Success Message */}
                {isSubmitted && submitSuccess && (
                  <motion.div 
                    className="text-green-600 text-sm mt-4 flex items-start bg-green-50 p-4 rounded-md border border-green-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CheckCircle className="mr-2 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{submitSuccess}</span>
                  </motion.div>
                )}
                
                {/* Error Message */}
                {submitError && (
                  <motion.div 
                    className="text-red-600 text-sm mt-4 flex items-start bg-red-50 p-4 rounded-md border border-red-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <XCircle className="mr-2 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </motion.div>
                )}
              </div>
            </div>
          </section>

          {/* What Happens Next */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What Happens Next?</h2>
            <div className="prose text-gray-700 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <strong>Verification (1-2 business days):</strong> We will verify your identity by sending 
                    a confirmation email to your registered account email address.
                  </li>
                  <li>
                    <strong>Processing (7-14 business days):</strong> Once verified, we will begin the deletion 
                    process across all our systems.
                  </li>
                  <li>
                    <strong>Confirmation (30 days maximum):</strong> You will receive a final confirmation email 
                    once your data has been completely removed from our systems.
                  </li>
                  <li>
                    <strong>Legal Compliance:</strong> Some information may be retained for a limited period 
                    if required by law (e.g., tax records, fraud prevention).
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* Alternative Options */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Consider These Alternatives</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>Before deleting your account, you might want to consider:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Temporarily Deactivate</h3>
                  <p className="text-sm text-gray-700">
                    Deactivate your account temporarily if you're not sure about permanent deletion. 
                    You can reactivate anytime.
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Download Your Data</h3>
                  <p className="text-sm text-gray-700">
                    Request a copy of your data before deletion. We can provide a complete export 
                    of your account information.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                If you have questions about data deletion or need assistance with your request:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><strong>Vanguard Cargo - Data Protection Officer</strong></p>
                <p>4700 Eisenhower Avenue</p>
                <p>Alexandria, VA 22304, USA</p>
                <p>Email: privacy@vanguardcargo.co</p>
                <p>Local Office Lines: 0303982320, 0544197819</p>
              </div>
              <p className="text-sm text-gray-600">
                For general inquiries: support@vanguardcargo.co
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center text-gray-600">
              <p className="text-sm">
                © {new Date().getFullYear()} Vanguard Cargo. All rights reserved.
              </p>
              <p className="text-xs mt-2">
                Your privacy and data protection rights are important to us.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DataDeletion;
