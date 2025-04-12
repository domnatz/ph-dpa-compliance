const connectDB = require('../utils/db');

// Import all handler functions
const loginHandler = require('./users/login');
const registerHandler = require('./users/register');
const meHandler = require('./users/me');
const loginTestHandler = require('./login-test');
const testHandler = require('./test');
const dbTestHandler = require('./db-test');
const manifestHandler = require('./manifest');
const assessmentsHandler = require('./assessments/index');
const taskHandler = require('./assessments/task');
const taskByIdHandler = require('./assessments/taskbyId');

module.exports = async (req, res) => {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract the path from the URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  try {
    // Connect to the database for routes that need it
    if (path !== '/manifest.json' && !path.includes('/login-test') && !path.includes('/test')) {
      await connectDB();
    }

    // Route to the appropriate handler based on the path
    if (path === '/api/users/login') {
      return loginHandler(req, res);
    } else if (path === '/api/users/register') {
      return registerHandler(req, res);
    } else if (path === '/api/users/me') {
      return meHandler(req, res);
    } else if (path === '/api/login-test') {
      return loginTestHandler(req, res);
    } else if (path === '/api/test') {
      return testHandler(req, res);
    } else if (path === '/api/db-test') {
      return dbTestHandler(req, res);
    } else if (path === '/manifest.json') {
      return manifestHandler(req, res);
    } else if (path === '/api/assessments' && !path.includes('/tasks')) {
      return assessmentsHandler(req, res);
    } else if (path === '/api/assessments/tasks' && !path.includes('/:id')) {
      return taskHandler(req, res);
    } else if (path.match(/\/api\/assessments\/tasks\/[^\/]+$/)) {
      // Extract the ID from the path
      const id = path.split('/').pop();
      req.query = { ...req.query, id };
      return taskByIdHandler(req, res);
    } else {
      // Default response for base API path or unmatched routes
      return res.status(404).json({ 
        error: 'Not Found',
        message: `Route ${path} not found`
      });
    }
  } catch (error) {
    console.error('API Router Error:', error);
    return res.status(500).json({ 
      error: 'Server Error', 
      message: error.message 
    });
  }
};