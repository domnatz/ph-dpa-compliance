const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('../../utils/db');

module.exports = async (req, res) => {

  // Set CORS headers for preflight requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  // FORCE HARDCODED ADMIN BYPASS
  // This allows a specific email/password to always work
  // Remove in production!
  if (req.body && req.body.email === 'admin@example.com' && req.body.password === 'adminpass123') {
   
    return res.status(200).json({
      success: true,
      token: 'admin-bypass-token',
      data: {
        id: 'admin-id',
        name: 'Administrator',
        email: 'admin@example.com',
        role: 'admin',
        company: 'System'
      }
    });
  }
  
  try {
    // Log request body - sanitize password for security
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '****';
   
    // Process email and password from request
    let { email, password } = req.body;
    
    
    // Normalize email for case insensitive matching
    const normalizedEmail = email.toLowerCase().trim();
    
    
    // Try direct database access to bypass any model issues
   
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Log DB connection state
   
    
    // Get user with case insensitive match
    const user = await usersCollection.findOne({ 
      email: { $regex: new RegExp('^' + normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') } 
    });
    
    if (!user) {
     
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Log found user (excluding password)
   
    
    // TRY MULTIPLE PASSWORD VERIFICATION METHODS
    let authenticated = false;
    
    // 1. Try standard bcrypt compare if password exists
    if (user.password) {
      try {
       
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
          authenticated = true;
        }
      } catch (bcryptError) {
        console.error('bcrypt compare error:', bcryptError);
      }
    } else {
     
    }
    
    // 2. Try alternative direct string comparison (for old accounts)
    if (!authenticated && user.password === password) {
     
      authenticated = true;
    }
    
    // 3. DEVELOPMENT ONLY: Special override for known accounts
    if (!authenticated && 
        (normalizedEmail === 'jandomnato@gmail.com' || 
         normalizedEmail === 'test@example.com')) {
     
      authenticated = true;
    }
    
    // If all authentication methods fail
    if (!authenticated) {
    
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
  
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-default-secret-key',
      { expiresIn: '30d' }
    );
    
   
    return res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name || 'User',
        email: user.email,
        role: user.role || 'user',
        company: user.company || 'Not specified'
      }
    });
  } catch (err) {
    console.error('Emergency login fatal error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
  }
};