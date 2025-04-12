const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('../../utils/db');

module.exports = async (req, res) => {
  // Add more debugging
  console.log('Login handler called');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Connect to database first - move this up
    try {
      await connectDB();
      console.log('Connected to database');
    } catch (dbConnectError) {
      console.error('Database connection error:', dbConnectError);
      return res.status(500).json({
        success: false,
        error: 'Database connection failed',
        details: dbConnectError.message
      });
    }
    
    // Process the request body
    console.log('Login request received', { method: req.method });
    
    // Only allow POST for this endpoint
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    // Check for request body
    if (!req.body) {
      console.error('No request body');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing request body' 
      });
    }
    
    console.log('Request body type:', typeof req.body);
    
    let email, password;
    
    try {
      // Extract credentials from body
      if (typeof req.body === 'string') {
        const parsedBody = JSON.parse(req.body);
        email = parsedBody.email;
        password = parsedBody.password;
      } else {
        email = req.body.email;
        password = req.body.password;
      }
    } catch (parseError) {
      console.error('Body parsing error:', parseError);
      return res.status(400).json({
        success: false,
        error: 'Invalid request body format'
      });
    }
    
    // Validate credentials
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }
    
    // Find user
    let user;
    try {
      user = await User.findOne({ email }).select('+password');
      console.log('User found:', user ? 'Yes' : 'No');
    } catch (findError) {
      console.error('User lookup error:', findError);
      return res.status(500).json({
        success: false,
        error: 'Database error during user lookup',
        details: findError.message
      });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Verify password
    let isMatch = false;
    try {
      console.log('Comparing passwords');
      isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch);
    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError);
      return res.status(500).json({
        success: false,
        error: 'Password verification failed',
        details: bcryptError.message
      });
    }
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Generate token
    let token;
    try {
      console.log('Generating token');
      token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'fallbacksecretkey',
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
      );
    } catch (jwtError) {
      console.error('Token generation error:', jwtError);
      return res.status(500).json({
        success: false,
        error: 'Token generation failed',
        details: jwtError.message
      });
    }
    
    // Success response
    console.log('Login successful');
    return res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user'
      }
    });
  } catch (err) {
    console.error('Main login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};