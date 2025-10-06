/**
 * Terms of Service Page Component
 * Comprehensive legal terms for Vanguard Cargo LLC
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

import React from 'react';
import { Truck, Package, AlertTriangle } from 'lucide-react';
import logoImage from '../assets/logo.png';

/**
 * Terms of Service Component
 * Displays comprehensive terms and conditions for the platform
 */
const TermsOfService: React.FC = () => {

  return (
    <div className="py-14 min-h-screen bg-gray-50 relative">
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
                <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
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
              These terms are effective immediately and apply to all users of the Vanguard Cargo platform.
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-red-600" />
              1. Introduction and Acceptance
            </h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                Welcome to Vanguard Cargo ("we," "our," or "us"). These Terms of Service ("Terms") 
                govern your use of our logistics and cargo management platform, including our website, 
                mobile applications, and related services (collectively, the "Service").
              </p>
              <p>
                By accessing or using our Service, you agree to be bound by these Terms. If you 
                disagree with any part of these terms, you may not access the Service.
              </p>
            </div>
          </section>

          {/* Service Description */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-red-600" />
              2. Service Description
            </h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                Vanguard Cargo provides a comprehensive LLC that enables users to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Register and manage package shipments</li>
                <li>Track packages in real-time</li>
                <li>Manage shipping addresses and preferences</li>
                <li>Receive notifications about package status</li>
                <li>Access consolidated shipping services</li>
                <li>Communicate with warehouse administrators</li>
              </ul>
              <p>
                Our warehouse address: <strong>ALX-E2: 4700 Eisenhower Avenue, Alexandria, VA 22304, USA</strong>
              </p>
            </div>
          </section>

          {/* User Accounts */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                To use our Service, you must create an account by providing accurate and complete information. 
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Providing accurate shipping and contact information</li>
                <li>Keeping your account information up to date</li>
              </ul>
              <p>
                Each user will be assigned a unique suite number (format: VC-XXX) for package identification.
              </p>
            </div>
          </section>

          {/* Package Handling */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Package Handling and Liability</h2>
            <div className="prose text-gray-700 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Important Notice</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      Please read this section carefully as it contains important limitations on our liability.
                    </p>
                  </div>
                </div>
              </div>
              
              <h3 className="font-medium text-gray-900">4.1 Package Acceptance</h3>
              <p>
                We reserve the right to refuse packages that:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Contain prohibited or restricted items</li>
                <li>Are improperly packaged or labeled</li>
                <li>Exceed size or weight limitations</li>
                <li>Pose safety or security risks</li>
              </ul>

              <h3 className="font-medium text-gray-900">4.2 Liability Limitations</h3>
              <p>
                Our liability for lost, damaged, or delayed packages is limited to the declared value 
                of the package, not to exceed $100 unless additional insurance is purchased. We are 
                not liable for:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Consequential or indirect damages</li>
                <li>Delays due to customs or regulatory issues</li>
                <li>Damage due to improper packaging by sender</li>
                <li>Items not properly declared or documented</li>
              </ul>
            </div>
          </section>

          {/* Prohibited Items */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Prohibited Items</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                The following items are strictly prohibited and will not be accepted:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Dangerous Goods</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Explosives and fireworks</li>
                    <li>Flammable liquids and gases</li>
                    <li>Toxic and corrosive substances</li>
                    <li>Radioactive materials</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Restricted Items</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Illegal drugs and substances</li>
                    <li>Weapons and ammunition</li>
                    <li>Perishable food items</li>
                    <li>Live animals or plants</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Payment and Fees */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Payment and Fees</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                Users are responsible for all applicable fees, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Shipping and handling charges</li>
                <li>Storage fees for packages held beyond the free period</li>
                <li>Special handling fees for oversized or fragile items</li>
                <li>Customs duties and taxes (where applicable)</li>
                <li>Return shipping costs for undeliverable packages</li>
              </ul>
              <p>
                All fees must be paid before package release. We accept major credit cards and 
                electronic payment methods.
              </p>
            </div>
          </section>

          {/* Privacy and Data */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                We collect and process personal information in accordance with our Privacy Policy. 
                By using our Service, you consent to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Collection of shipping and contact information</li>
                <li>Processing of package and tracking data</li>
                <li>Communication via email, SMS, and push notifications</li>
                <li>Sharing information with shipping partners as necessary</li>
              </ul>
            </div>
          </section>

          {/* User Conduct */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. User Conduct</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                Users agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Service for illegal or unauthorized purposes</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Provide false or misleading information</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Harass or abuse our staff or other users</li>
              </ul>
            </div>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Termination</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                We may terminate or suspend your account immediately, without prior notice, for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Non-payment of fees</li>
                <li>Abuse of our staff or services</li>
              </ul>
              <p>
                Upon termination, your right to use the Service ceases immediately. We will make 
                reasonable efforts to return any packages in our possession, subject to payment 
                of outstanding fees.
              </p>
            </div>
          </section>

          {/* Disclaimers */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Disclaimers and Warranties</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL 
                WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR 
                PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p>
                We do not guarantee uninterrupted or error-free service, and we are not responsible 
                for delays caused by factors beyond our control.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                We reserve the right to modify these Terms at any time. Changes will be effective 
                immediately upon posting. Your continued use of the Service constitutes acceptance 
                of the modified Terms.
              </p>
              <p>
                We will notify users of significant changes via email or platform notifications.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                For questions about these Terms or our Service, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><strong>Vanguard Cargo</strong></p>
                <p>4700 Eisenhower Avenue</p>
                <p>Alexandria, VA 22304, USA</p>
                <p>Email: support@vanguardcargo.co</p>
                <p>Local Office Lines: 0303982320, 0544197819</p>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                These Terms are governed by the laws of Virginia, United States, without regard 
                to conflict of law principles. Any disputes will be resolved in the courts of 
                Alexandria, Virginia.
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
                These Terms of Service constitute a legally binding agreement between you and Vanguard Cargo.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
