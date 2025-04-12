import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';

const Register = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { register, error, clearErrors, isAuthenticated } = authContext;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  // Clear errors when component mounts
  useEffect(() => {
    clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Navigate when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    company: ''
  });

  const { name, email, password, password2, company } = user;

  const onChange = e => setUser({ ...user, [e.target.name]: e.target.value });
  
  const onSubmit = e => {
    e.preventDefault();
    setLocalError('');
    console.log('Submitting registration form:', { name, email, company });
    
    if (name === '' || email === '' || password === '' || company === '') {
      setLocalError('Please enter all fields');
    } else if (password !== password2) {
      setLocalError('Passwords do not match');
    } else {
      setIsSubmitting(true);
      console.log('Calling register with data');
      
      // Call register and handle response manually
      register({
        name,
        email,
        password,
        company
      });
      
      // Set a timeout to check if we've redirected
      setTimeout(() => {
        if (!isAuthenticated) {
          setIsSubmitting(false);
          console.log('Registration may have succeeded but no redirect occurred');
          alert('Registration successful! Please log in.');
          navigate('/login');
        }
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="privacy-card max-w-md w-full">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              sign in to your existing account
            </Link>
          </p>
        </div>
      
        {(error || localError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
            <span className="block sm:inline">{localError || (typeof error === 'string' ? error : 'Authentication failed')}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          {/* Form fields remain the same */}
          <div className="rounded-md -space-y-px">
            {/* Name field */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="privacy-form-control"
                placeholder="Full Name"
                value={name}
                onChange={onChange}
                disabled={isSubmitting}
              />
            </div>
            {/* Email field */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="privacy-form-control"
                placeholder="Email address"
                value={email}
                onChange={onChange}
                disabled={isSubmitting}
              />
            </div>
            {/* Company field */}
            <div className="mb-4">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                id="company"
                name="company"
                type="text"
                required                                       
                className="privacy-form-control"
                placeholder="Company Name"
                value={company}
                onChange={onChange}
                disabled={isSubmitting}
              />
            </div>
            {/* Password field */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="privacy-form-control"
                placeholder="Password"
                value={password}
                onChange={onChange}
                minLength="6"
                disabled={isSubmitting}
              />
            </div>
            {/* Confirm password field */}
            <div className="mb-4">
              <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                id="password2"
                name="password2"
                type="password"
                required
                className="privacy-form-control"
                placeholder="Confirm Password"
                value={password2}
                onChange={onChange}
                minLength="6"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className="btn-compliance w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;