const User = require('../../models/userModel');
const connectDB = require('../../utils/db');

module.exports = async (req, res) => {
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
    console.log('Login attempt, body:', req.body);
    
    // Check if request body exists and is not empty
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('Empty request body');
      return res.status(400).json({ 
        success: false, 
        error: 'No request body provided' 
      });
    }
    
    // Connect to database
    await connectDB();
    
    // Only allow POST for this endpoint
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    const { email, password } = req.body;
    
    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }
    
    // Check for user (with try/catch)
    let user;
    try {
      user = await User.findOne({ email }).select('+password');
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: dbError.message
      });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Check if matchPassword method exists
    if (typeof user.matchPassword !== 'function') {
      console.error('matchPassword method not found on user model');
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
    
    // Check if password matches
    let isMatch;
    try {
      isMatch = await user.matchPassword(password);
    } catch (matchError) {
      console.error('Password match error:', matchError);
      return res.status(500).json({
        success: false,
        error: 'Password verification error',
        message: matchError.message
      });
    }
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = user.getSignedJwtToken();
    
    // Send back user data and token
    return res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message
    });
  }
};