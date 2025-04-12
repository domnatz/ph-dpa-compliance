const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('../../utils/db');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    await connectDB();
    console.log('Emergency login: Connected to database');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }
    
    // Access MongoDB directly to bypass model middleware
    const UserCollection = mongoose.connection.collection('users');
    
    // Find user by email
    const user = await UserCollection.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Check password directly
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'defaultsecretkey',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    
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
    console.error('Emergency login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message
    });
  }
};