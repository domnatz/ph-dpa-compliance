const User = require('../../models/userModel');
const connectDB = require('../../utils/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    // Connect to database
    await connectDB();
    
    // Only allow POST for this endpoint
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    console.log('Register request body:', req.body);
    
    const { name, email, password, company } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and password'
      });
    }
    
    // Check if user already exists - with proper error handling
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }
    } catch (dbError) {
      console.error('Database search error:', dbError);
      return res.status(500).json({
        success: false, 
        error: 'Database error during user lookup',
        details: dbError.message
      });
    }
    
    // Create user directly without relying on model methods
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user document
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      company: company || 'Not specified'
    });
    
    // Generate token manually
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'defaultsecretkey',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    
    // Return success response
    return res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message
    });
  }
};