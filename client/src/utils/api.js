import axios from 'axios';
import storage from './storage';

// Create axios instance with environment-aware base configuration
const baseURL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api'  // Development 
  : '/api';                      // Production (Vercel)

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
api.interceptors.request.use(
  config => {
    const token = storage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Sending request with token:', token.substring(0, 10) + '...');
    } else {
      console.log('No token found in storage');
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;