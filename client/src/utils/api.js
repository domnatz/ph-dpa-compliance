import axios from 'axios';
import storage from './storage';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
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