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

// Import API handlers
const apiHandler = require('./api/index');
const manifestHandler = require('./api/manifest');

// API routes
app.use('/api', (req, res) => {
  // Simulate the URL structure expected by your handler
  const originalUrl = req.originalUrl;
  req.url = originalUrl.replace('/api', '');
  return apiHandler(req, res);
});

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