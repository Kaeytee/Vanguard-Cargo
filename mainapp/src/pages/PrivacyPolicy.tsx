/**
 * Privacy Policy Page Component
 * Comprehensive privacy policy for Vanguard Cargo LLC
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

import React from 'react';
import { Eye, Lock, Database } from 'lucide-react';
import logoImage from '../assets/logo.png';

/**
 * Privacy Policy Component
 * Displays comprehensive privacy policy for the platform
 */
const PrivacyPolicy: React.FC = () => {

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
                <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
                <p className="text-gray-600">Vanguard Cargo LLC</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="bg-transparent rounded-lg shadow-sm p-8">
          
          {/* Last Updated */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">
              Last Updated: October 6, 2025
            </p>
            <p className="text-blue-700 text-sm mt-1">
              This Privacy Policy is effective immediately and applies to all users of the Vanguard Cargo platform.
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-red-600" />
              1. Introduction
            </h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                At Vanguard Cargo ("we," "our," or "us"), we are committed to protecting your privacy 
                and ensuring the security of your personal information. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you use our 
                logistics and cargo management platform.
              </p>
              <p>
                By using our Service, you consent to the data practices described in this policy.
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-red-600" />
              2. Information We Collect
            </h2>
            <div className="prose text-gray-700 space-y-4">
              <h3 className="font-medium text-gray-900">2.1 Personal Information</h3>
              <p>We collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, and phone number</li>
                <li>Shipping and billing addresses</li>
                <li>Account credentials and preferences</li>
                <li>Communication preferences and history</li>
              </ul>

              <h3 className="font-medium text-gray-900">2.2 Package Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Package descriptions, dimensions, and weight</li>
                <li>Tracking numbers and delivery status</li>
                <li>Sender and recipient information</li>
                <li>Declared values and contents</li>
              </ul>

              <h3 className="font-medium text-gray-900">2.3 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address and device information</li>
                <li>Browser type and operating system</li>
                <li>Usage patterns and preferences</li>
                <li>Location data (with your consent)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>We use the collected information for the following purposes:</p>
              
              <h3 className="font-medium text-gray-900">3.1 Service Provision</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Processing and tracking your packages</li>
                <li>Managing your account and preferences</li>
                <li>Providing customer support</li>
                <li>Facilitating payments and billing</li>
              </ul>

              <h3 className="font-medium text-gray-900">3.2 Communication</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sending package status updates</li>
                <li>Providing important service notifications</li>
                <li>Responding to your inquiries</li>
                <li>Sending security alerts when necessary</li>
              </ul>

              <h3 className="font-medium text-gray-900">3.3 Improvement and Analytics</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Analyzing usage patterns to improve our services</li>
                <li>Developing new features and functionality</li>
                <li>Ensuring platform security and preventing fraud</li>
                <li>Complying with legal and regulatory requirements</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>We may share your information in the following circumstances:</p>

              <h3 className="font-medium text-gray-900">4.1 Service Providers</h3>
              <p>
                We share information with trusted third-party service providers who assist us in:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Package transportation and delivery</li>
                <li>Payment processing</li>
                <li>Customer support services</li>
                <li>IT infrastructure and security</li>
              </ul>

              <h3 className="font-medium text-gray-900">4.2 Legal Requirements</h3>
              <p>We may disclose information when required by law or to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Comply with legal processes or government requests</li>
                <li>Protect our rights and property</li>
                <li>Ensure user safety and security</li>
                <li>Investigate potential violations of our terms</li>
              </ul>

              <h3 className="font-medium text-gray-900">4.3 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, or sale of assets, your information may be 
                transferred as part of the transaction, subject to appropriate confidentiality protections.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" />
              5. Data Security
            </h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                We implement appropriate technical and organizational measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              
              <h3 className="font-medium text-gray-900">5.1 Security Measures</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication systems</li>
                <li>Employee training on data protection</li>
                <li>Secure data centers and infrastructure</li>
              </ul>

              <p className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <strong>Important:</strong> While we strive to protect your information, no method of 
                transmission over the internet or electronic storage is 100% secure. We cannot guarantee 
                absolute security but are committed to using industry-standard practices.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Privacy Rights</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>You have the following rights regarding your personal information:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request copies of your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Restriction:</strong> Request limitation of data processing</li>
                <li><strong>Objection:</strong> Object to certain types of data processing</li>
              </ul>

              <p>
                To exercise these rights, please contact us using the information provided below. 
                We will respond to your request within 30 days.
              </p>
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                We use cookies and similar technologies to enhance your experience and collect 
                information about how you use our platform.
              </p>

              <h3 className="font-medium text-gray-900">7.1 Types of Cookies</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                <li><strong>Performance Cookies:</strong> Help us analyze usage and improve performance</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Analytics Cookies:</strong> Provide insights into user behavior</li>
              </ul>

              <p>
                You can control cookie settings through your browser preferences. Note that disabling 
                certain cookies may limit platform functionality.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                We retain your personal information only as long as necessary to provide our services 
                and comply with legal obligations.
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Retained while your account is active</li>
                <li><strong>Package Data:</strong> Retained for 7 years for business and legal purposes</li>
                <li><strong>Communication Records:</strong> Retained for 3 years</li>
                <li><strong>Analytics Data:</strong> Anonymized after 2 years</li>
              </ul>

              <p>
                When information is no longer needed, we securely delete or anonymize it according 
                to our data retention policies.
              </p>
            </div>
          </section>

          {/* International Transfers */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                Your information may be transferred to and processed in countries other than your 
                country of residence. We ensure appropriate safeguards are in place to protect 
                your information during such transfers.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                Our services are not intended for children under 18 years of age. We do not 
                knowingly collect personal information from children under 18. If you become 
                aware that a child has provided us with personal information, please contact us.
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any 
                material changes by posting the new policy on this page and updating the "Last Updated" 
                date. Your continued use of our services after such changes constitutes acceptance 
                of the updated policy.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><strong>Vanguard Cargo - Privacy Officer</strong></p>
                <p>4700 Eisenhower Avenue</p>
                <p>Alexandria, VA 22304, USA</p>
                <p>Email: privacy@vanguardcargo.co</p>
                <p>Local Office Lines: 0303982320, 0544197819</p>
              </div>
              <p className="text-sm text-gray-600">
                For general inquiries, you can also reach us at support@vanguardcargo.co
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
                This Privacy Policy constitutes part of our commitment to protecting your personal information.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
