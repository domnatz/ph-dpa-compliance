import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';

const Navbar = () => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, logout} = authContext;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const onLogout = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const authLinks = (
    <>
      <li className="px-3 py-2">
        <Link to="/dashboard" className="!text-white hover:underline transition-colors">
          Dashboard
        </Link>
      </li>
      <li className="px-3 py-2">
        <Link to="/assessment" className="!text-white hover:underline transition-colors">
          Assessment
        </Link>
      </li>
      <li className="px-3 py-2">
        <Link to="/resources" className="!text-white hover:underline transition-colors">
          Resources
        </Link>
      </li>
      <li className="px-3 py-2">
        <a 
          onClick={onLogout} 
          href="#!" 
          className="flex items-center !text-white hover:underline transition-colors"
        >
          <span className="px-3 py-2">Logout</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </a>
      </li>
    </>
  );

  const guestLinks = (
    <>
      <li className="px-3 py-2">
        <Link to="/register" className="!text-white hover:underline transition-colors">
          Register
        </Link>
      </li>
      <li className="px-3 py-2">
        <Link to="/login" className="!text-white hover:underline transition-colors">
          Login
        </Link>
      </li>
    </>
  );

  return (
    <nav style={{ background: 'var(--gradient-security)' }} className="text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="!text-white text-xl font-bold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            PhilDPA Compliance
          </Link>
          
          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center">
            {isAuthenticated ? authLinks : guestLinks}
          </ul>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="!text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mt-3 md:hidden">
            <ul className="flex flex-col">
              {isAuthenticated ? authLinks : guestLinks}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;