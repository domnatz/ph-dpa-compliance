import React, { useReducer } from 'react';
import AuthContext from './authContext';
import authReducer from './authReducer';
import api from '../../utils/api';
import storage from '../../utils/storage';

const AuthState = props => {
  const initialState = {
    token: storage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
    error: null
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load User
  const loadUser = async () => {
    // Get token directly from localStorage for this call
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('loadUser: No token in localStorage');
      dispatch({ type: 'AUTH_ERROR' });
      return;
    }
    
    console.log('loadUser: Using token', token.substring(0, 10) + '...');
    
    try {
      // Force Authorization header for this specific request
      const res = await api.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('User loaded successfully:', res.data);
      
      dispatch({
        type: 'USER_LOADED',
        payload: res.data.data
      });
    } catch (err) {
      console.error('Error loading user:', err.response?.data || err.message);
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  // Register User
  const register = async formData => {
    try {
      dispatch({ type: 'SET_LOADING' });
      
      // Log the request to help with debugging
      console.log('Registering user:', { ...formData, password: '***' });
      
      const res = await api.post('/users/register', formData);
      
      console.log('Registration response:', res.data);
      
      // Don't automatically authenticate after registration
      // Instead, return the response data so the component can handle redirect
      return res.data;
    } catch (err) {
      console.error('Register error:', err);
      
      // Make sure to extract a STRING error message, not pass an object
      const errorMessage = err.response?.data?.error || 
                          err.message || 
                          'Registration failed';
      
      dispatch({
        type: 'REGISTER_FAIL',
        payload: errorMessage // This must be a string
      });
      
      // Re-throw so the component can handle it
      throw err;
    }
  };

  // Add loginSuccess function
  const loginSuccess = (data) => {
    if (data && data.token) {
      localStorage.setItem('token', data.token);
    }
    
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: data
    });
    
    loadUser();
  };

  // Login User - Updated with emergency login capability
  const login = async formData => {
    try {
      dispatch({ type: 'SET_LOADING' });
      
      try {
        // Try main login first
        const res = await api.post('/users/login', formData);
        
        if (res.data && res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: res.data
        });
        
        loadUser();
        return res.data;
      } catch (loginError) {
        console.error('Main login failed, trying emergency endpoint:', loginError);
        
        // If main login fails, try emergency endpoint
        try {
          const emergencyRes = await api.post('/users/emergency-login', formData);
          
          if (emergencyRes.data && emergencyRes.data.token) {
            localStorage.setItem('token', emergencyRes.data.token);
          }
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: emergencyRes.data
          });
          
          loadUser();
          return emergencyRes.data;
        } catch (emergencyError) {
          console.error('Emergency login failed:', emergencyError);
          throw emergencyError; // Propagate error to outer catch
        }
      }
    } catch (err) {
      console.error('All login attempts failed:', err);
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response?.data?.error || err.message || 'Login failed'
      });
      throw err; // Re-throw for component handling
    }
  };

  // Logout
  const logout = () => dispatch({ type: 'LOGOUT' });

  // Clear Errors
  const clearErrors = () => dispatch({ type: 'CLEAR_ERRORS' });

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        login,
        loginSuccess, // Add loginSuccess to the context
        logout,
        loadUser,
        clearErrors
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState;