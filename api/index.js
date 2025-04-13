const connectDB = require('../utils/db');

// Import only essential handler functions
const loginHandler = require('./users/login');
const registerHandler = require('./users/register');
const meHandler = require('./users/me');
const manifestHandler = require('./manifest');
const assessmentsHandler = require('./assessments/index');
const taskHandler = require('./assessments/task');
const taskByIdHandler = require('./assessments/taskbyId');

// Test handlers removed

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
  

  const startTime = Date.now();

  try {
    // Connect to the database for routes that need it
    if (path !== '/manifest.json') {
      await connectDB();
    }

    // Route to the appropriate handler based on the path
    if (path === '/api/users/login') {
      return loginHandler(req, res);
    } else if (path === '/api/users/register') {
      return registerHandler(req, res);
    } else if (path === '/api/users/me') {
      return meHandler(req, res);
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
    } 
    
    // Add a fallback login-test route for backward compatibility
    else if (path === '/api/login-test') {

      return res.status(200).json({
        success: true,
        token: 'test-token-123',
        data: {
          id: 'test-id',
          name: 'Test User',
          email: req.body?.email || 'test@example.com',
          role: 'user'
        }
      });
    } 
    
    // Default response for unmatched routes
    else {
    
      return res.status(404).json({ 
        error: 'Not Found',
        message: `Route ${path} not found`
      });
    }
  } catch (error) {
  
    return res.status(500).json({ 
      error: 'Server Error', 
      message: error.message 
    });
  } finally {

  }
};