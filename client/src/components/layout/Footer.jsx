import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ background: 'var(--gradient-compliance)' }} className="text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="!text-white text-lg font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              PhilDPA Compliance
            </h3>
            <p className="!text-white text-sm mt-1">
              Simplifying Data Privacy Act compliance for Philippine businesses
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex space-x-4 mb-3 md:mb-0 md:mr-6">
              {/* Changed from <a> to <Link> for proper routing */}
              <Link to="/privacy" className="!text-white hover:underline transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="!text-white hover:underline transition-colors">Terms</Link>
              <Link to="/contact" className="!text-white hover:underline transition-colors">Contact</Link>
            </div>
            <div className="!text-white text-sm">
              &copy; {new Date().getFullYear()} domnatz. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;