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

  // Rest of your code...
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
      const res = await api.post('/users/register', formData);
  
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data
      });
  
      loadUser();
    } catch (err) {
      console.error('Register error:', err.response?.data || err.message);
      
      // Same fix here - use a string error message
      const errorMessage = err.response?.data?.error || 
                           err.message || 
                           'Registration failed';
      
      dispatch({
        type: 'REGISTER_FAIL',
        payload: errorMessage  // Send string, not object
      });
    }
  };

    // Login User
    const login = async formData => {
      try {
        const res = await api.post('/users/login', formData);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: res.data
        });
    
        loadUser();
      } catch (err) {
        console.error('Login error:', err);
        
        // IMPORTANT: Create a string error message, not an object
        const errorMessage = err.response?.data?.error || 
                             err.message || 
                             'Authentication failed';
                             
        dispatch({
          type: 'LOGIN_FAIL',
          payload: errorMessage // String, not object!
        });
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