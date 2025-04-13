const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('../../utils/db');

module.exports = async (req, res) => {
  // Add more debugging

  
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
     
    } catch (dbConnectError) {
      
      return res.status(500).json({
        success: false,
        error: 'Database connection failed',
        details: dbConnectError.message
      });
    }
    
    // Process the request body
   
    
    // Only allow POST for this endpoint
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    // Check for request body
    if (!req.body) {
      
      return res.status(400).json({ 
        success: false, 
        error: 'Missing request body' 
      });
    }
    
   
    
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
    
    // Find user - make sure to normalize email
    let user;
    try {
      email = email.toLowerCase().trim();
      
      user = await User.findOne({ email }).select('+password');
     
    } catch (findError) {
     
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
     
      // Ensure password field was properly retrieved
      if (!user.password) {
        
        return res.status(500).json({
          success: false,
          error: 'User data is corrupt'
        });
      }
      
      isMatch = await bcrypt.compare(password, user.password);
     
    } catch (bcryptError) {
    
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
    
    // Update last login time
    try {
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
    } catch (updateError) {
      console.warn('Failed to update last login time:', updateError);
      // Continue anyway, this is not critical
    }
    
    // Generate token
    let token;
    try {
     
      const secret = process.env.JWT_SECRET || 'fallbacksecretkey';
      const expiry = process.env.JWT_EXPIRE || '30d';
      
     
      
      token = jwt.sign(
        { id: user._id },
        secret,
        { expiresIn: expiry }
      );
    } catch (jwtError) {

      return res.status(500).json({
        success: false,
        error: 'Token generation failed',
        details: jwtError.message
      });
    }
    
    // Success response
   
    return res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        company: user.company
      }
    });
  } catch (err) {

    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};