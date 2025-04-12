const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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
    console.log('Login attempt with body:', req.body);
    
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
    
    // Connect to database
    await connectDB();
    
    // Check for user but don't rely on methods (manual password check)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Check password manually with bcrypt
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (err) {
      console.error('Password comparison error:', err);
      // If bcrypt.compare fails, provide a clear error
      return res.status(500).json({
        success: false,
        error: 'Password comparison failed',
        debug: err.message
      });
    }
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Generate token manually
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'defaultsecretkey123456789',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    
    // Return success with token and user data
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