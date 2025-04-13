import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--privacy-teal)' }}>
          Privacy Policy
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <p className="text-gray-600 mb-6">Last Updated: April 13, 2024</p>
          
          <p className="mb-4">
            At PhilDPA Compliance, we are committed to protecting your privacy and personal data. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
            when you use our platform.
          </p>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">1. Information We Collect</h2>
          <p className="mb-3">We collect the following types of information:</p>
          
          <h3 className="text-lg font-medium mb-2">1.1 Personal Data</h3>
          <p className="mb-4">
            When you register for an account, we collect:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Name</li>
            <li>Email address</li>
            <li>Organization name</li>
            <li>Contact information</li>
            <li>Job title</li>
          </ul>
          
          <h3 className="text-lg font-medium mb-2">1.2 Assessment Data</h3>
          <p className="mb-4">
            When you use our compliance assessment tools, we collect your responses to assessment 
            questions and other information you provide about your organization's data processing activities.
          </p>
          
          <h3 className="text-lg font-medium mb-2">1.3 Usage Data</h3>
          <p className="mb-4">
            We automatically collect certain information when you visit or use our platform, including:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>IP address</li>
            <li>Browser type</li>
            <li>Device information</li>
            <li>Pages visited</li>
            <li>Time spent on pages</li>
            <li>Referring website</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">2. How We Use Your Information</h2>
          <p className="mb-3">We use the collected information for various purposes:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>To provide and maintain our services</li>
            <li>To notify you about changes to our services</li>
            <li>To allow you to participate in interactive features</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information to improve our services</li>
            <li>To monitor the usage of our services</li>
            <li>To detect, prevent and address technical issues</li>
            <li>To fulfill any other purpose for which you provide it</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">3. Security of Your Information</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to maintain the safety of 
            your personal data. However, no method of transmission over the Internet or electronic 
            storage is 100% secure, and we cannot guarantee absolute security.
          </p>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">4. Data Retention</h2>
          <p className="mb-4">
            We will retain your personal data only for as long as necessary for the purposes set out 
            in this Privacy Policy. We will retain and use your data to the extent necessary to comply 
            with our legal obligations, resolve disputes, and enforce our policies.
          </p>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">5. Disclosure of Your Information</h2>
          <p className="mb-3">We may disclose your information in the following situations:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Service Providers:</strong> We may share your data with third-party vendors who perform services on our behalf.</li>
            <li><strong>Business Transfers:</strong> We may share your data if we are involved in a merger, acquisition, or sale of assets.</li>
            <li><strong>Legal Requirements:</strong> We may disclose your information to comply with applicable laws and regulations.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">6. Your Data Protection Rights</h2>
          <p className="mb-3">Under the Philippine Data Privacy Act, you have the following rights:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Right to Information:</strong> You have the right to be informed about the processing of your personal data.</li>
            <li><strong>Right to Access:</strong> You have the right to access your personal data that we hold.</li>
            <li><strong>Right to Object:</strong> You have the right to object to the processing of your personal data.</li>
            <li><strong>Right to Erasure:</strong> You have the right to request the removal of your personal data.</li>
            <li><strong>Right to Rectification:</strong> You have the right to request the correction of inaccurate personal data.</li>
            <li><strong>Right to Data Portability:</strong> You have the right to receive your personal data in a structured format.</li>
            <li><strong>Right to Damages:</strong> You have the right to be indemnified for damages sustained due to inaccurate processing.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">7. Cookies and Tracking Technologies</h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to track activity on our platform and 
            store certain information. You can instruct your browser to refuse all cookies or to 
            indicate when a cookie is being sent.
          </p>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">8. Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by 
            posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          
          <h2 className="text-xl font-semibold mb-3 mt-6">9. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at privacy@phildpa.com.
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

export default Privacy;