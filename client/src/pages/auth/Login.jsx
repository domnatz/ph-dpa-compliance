import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { login, loginSuccess, error, clearErrors, isAuthenticated } = authContext;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  // Fix the same infinite loop issue
  useEffect(() => {
    // Only clear errors once when component mounts
    clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Separate effect for navigation after authentication
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const [user, setUser] = useState({
    email: '',
    password: ''
  });

  const { email, password } = user;

  const onChange = e => setUser({ ...user, [e.target.name]: e.target.value });

  // Try emergency login if regular login fails
  const tryEmergencyLogin = async () => {
    try {
      console.log('Attempting emergency login');
      const res = await axios.post('/api/users/emergency-login', {
        email,
        password
      });
      
      if (res.data.success) {
        console.log('Emergency login successful');
        // Use the loginSuccess action from context
        if (loginSuccess) {
          loginSuccess(res.data);
        } else {
          console.warn('loginSuccess action not available, using workaround');
          // Fallback if loginSuccess isn't available in your context
          localStorage.setItem('token', res.data.token);
          window.location.href = '/dashboard';
        }
        return true;
      }
    } catch (err) {
      console.error('Emergency login failed:', err);
      setLocalError('Login failed. Please check your credentials and try again.');
      return false;
    }
    return false;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (email === '' || password === '') {
      setLocalError('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First try regular login
      await login({
        email,
        password
      });
      
      // If we're still here and not authenticated, try emergency login
      setTimeout(async () => {
        if (!isAuthenticated) {
          console.log('Regular login did not redirect, trying emergency login');
          const emergencyLoginSucceeded = await tryEmergencyLogin();
          
          if (!emergencyLoginSucceeded) {
            setLocalError('Login failed with both methods. Please check your credentials.');
          }
        }
        setIsSubmitting(false);
      }, 1000);
      
    } catch (err) {
      console.error('Login submission error:', err);
      setLocalError('An error occurred during login');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="privacy-card-security max-w-md w-full">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
              create a new account
            </Link>
          </p>
        </div>
      
        {(error || localError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
            <span className="block sm:inline">{localError || (typeof error === 'string' ? error : 'Authentication failed')}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="rounded-md -space-y-px">
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
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className="btn-security w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;