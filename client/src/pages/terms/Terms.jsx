import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--privacy-teal)' }}>
          Terms of Service
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <p className="text-gray-600 mb-6">Last Updated: April 13, 2024</p>
          
          <p className="mb-4">
            Welcome to PhilDPA Compliance. Please read these Terms of Service ("Terms") carefully 
            before using our platform and services.
          </p>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using the PhilDPA Compliance platform, you agree to be bound by these 
            Terms. If you do not agree to all the terms and conditions, you must not access or use 
            our services.
          </p>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">2. Description of Service</h2>
          <p className="mb-4">
            PhilDPA Compliance provides a platform designed to help organizations assess and improve 
            their compliance with the Philippine Data Privacy Act of 2012 (RA 10173). Our services 
            include assessment tools, task management, resource provision, and compliance tracking.
          </p>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">3. User Accounts</h2>
          <p className="mb-4">
            To access certain features of our platform, you must register for an account. You agree 
            to provide accurate, current, and complete information during the registration process and 
            to update such information to keep it accurate, current, and complete.
          </p>
          <p className="mb-4">
            You are responsible for maintaining the confidentiality of your account and password and 
            for restricting access to your computer. You agree to accept responsibility for all activities 
            that occur under your account.
          </p>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">4. User Responsibilities</h2>
          <p className="mb-4">
            You agree to use our services only for lawful purposes and in accordance with these Terms. 
            You are responsible for:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Ensuring the accuracy of information you provide</li>
            <li>Maintaining the security of your account</li>
            <li>Using the platform in compliance with applicable laws</li>
            <li>Not engaging in any activity that interferes with or disrupts the services</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">5. Intellectual Property</h2>
          <p className="mb-4">
            The PhilDPA Compliance platform, including its content, features, and functionality, is owned 
            by PhilDPA Compliance and is protected by copyright, trademark, and other intellectual property 
            laws. Our materials may not be copied, modified, reproduced, or distributed without our prior 
            written permission.
          </p>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">6. Disclaimer and Limitation of Liability</h2>
          <p className="mb-4">
            The information provided by PhilDPA Compliance is for general informational and educational 
            purposes only. We make no representations or warranties of any kind, express or implied, about 
            the completeness, accuracy, reliability, suitability, or availability of our platform or the 
            information contained therein.
          </p>
          <p className="mb-4">
            In no event will PhilDPA Compliance be liable for any loss or damage including without limitation, 
            indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of 
            data or profits arising out of, or in connection with, the use of our platform.
          </p>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">7. Compliance Guidance</h2>
          <p className="mb-4">
            The compliance assessments, recommendations, and tasks provided by our platform are suggestions 
            based on general interpretations of the Philippine Data Privacy Act. They should not be considered 
            legal advice. We recommend consulting with qualified legal professionals for specific compliance 
            requirements relevant to your organization.
          </p>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">8. Modification of Terms</h2>
          <p className="mb-4">
            PhilDPA Compliance reserves the right to modify these Terms at any time. We will provide notice 
            of any material changes by updating the date at the top of these Terms. Your continued use of 
            our platform after such modifications will constitute your acknowledgment and agreement to the 
            modified terms.
          </p>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">9. Governing Law</h2>
          <p className="mb-4">
            These Terms shall be governed by and construed in accordance with the laws of the Republic of 
            the Philippines. Any disputes arising under or in connection with these Terms shall be subject 
            to the exclusive jurisdiction of the courts of the Philippines.
          </p>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">10. Contact Information</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at terms@phildpa.com.
          </p>
        </div>
        
        <div className="mt-6 text-center">
          <Link to="/" className="text-blue-600 hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;