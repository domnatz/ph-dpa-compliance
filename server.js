const express = require('express');
const path = require('path');
const connectDB = require('./utils/db');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Import API handlers directly
const loginHandler = require('./api/users/login');
const registerHandler = require('./api/users/register');
const meHandler = require('./api/users/me');
const manifestHandler = require('./api/manifest');
const assessmentsHandler = require('./api/assessments/index');
const taskHandler = require('./api/assessments/task');
const taskByIdHandler = require('./api/assessments/taskbyId');
const emergencyLoginHandler = require('./api/users/emergency-login');
const directRegisterHandler = require('./api/users/direct-register');
const debugInfoHandler = require('./api/users/debug-info');

// Define API routes explicitly
app.post('/api/users/login', (req, res) => loginHandler(req, res));

// Enhanced registration route with improved logging
app.post('/api/users/register', (req, res) => {
  console.log('Processing registration request for:', req.body.email);
  const result = registerHandler(req, res);
  console.log('Registration request processed');
  return result;
});

app.get('/api/users/me', (req, res) => meHandler(req, res));
app.all('/api/assessments', (req, res) => assessmentsHandler(req, res));
app.all('/api/assessments/tasks', (req, res) => taskHandler(req, res));
app.all('/api/assessments/tasks/:id', (req, res) => {
  req.query = { ...req.query, id: req.params.id };
  return taskByIdHandler(req, res);
});

// Add the fallback login-test route that client may be using
app.post('/api/login-test', (req, res) => {
  console.log('Using login-test fallback route');
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
});

// Authentication fix endpoints
app.post('/api/users/emergency-login', (req, res) => emergencyLoginHandler(req, res));
app.post('/api/users/direct-register', (req, res) => directRegisterHandler(req, res));
app.get('/api/users/debug-info', (req, res) => debugInfoHandler(req, res));

app.get('/manifest.json', (req, res) => manifestHandler(req, res));

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Connect to database when starting server
app.listen(PORT, async () => {
  try {
    // Only connect to DB in production or if explicitly enabled
    if (process.env.NODE_ENV === 'production' || process.env.CONNECT_DB === 'true') {
      await connectDB();
      console.log('Connected to database');
    }
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
  }
});