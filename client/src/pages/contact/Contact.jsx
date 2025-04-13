import React from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--privacy-teal)' }}>
          Contact Us
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
          <p className="mb-4">
            Have questions about PhilDPA compliance or need assistance with our platform? 
            Our team is here to help you navigate your data privacy compliance journey.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="border-l-4 pl-4" style={{ borderColor: 'var(--privacy-teal)' }}>
              <h3 className="font-semibold mb-2">Support</h3>
              <p className="text-gray-600 mb-2">For general inquiries and support:</p>
              <a 
                href="mailto:support@phildpa.com" 
                className="text-blue-600 hover:underline"
              >
                support@phildpa.com
              </a>
            </div>
            
            <div className="border-l-4 pl-4" style={{ borderColor: 'var(--privacy-indigo)' }}>
              <h3 className="font-semibold mb-2">Compliance Consulting</h3>
              <p className="text-gray-600 mb-2">For specialized compliance assistance:</p>
              <a 
                href="mailto:compliance@phildpa.com" 
                className="text-blue-600 hover:underline"
              >
                compliance@phildpa.com
              </a>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Office Location</h2>
          <p className="mb-2">PhilDPA Compliance</p>
          <p className="mb-2">123 Data Privacy Avenue</p>
          <p className="mb-2">Makati City, 1200</p>
          <p className="mb-2">Philippines</p>
          <p className="mb-2">Phone: +63 (2) 8123-4567</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Send Us a Message</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Your email address"
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Message subject"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                rows="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Your message"
              ></textarea>
            </div>
            
            <div>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Send Message
              </button>
            </div>
          </form>
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

export default Contact;