const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('../../utils/db');

module.exports = async (req, res) => {
  // Log every call for troubleshooting
  console.log('----- EMERGENCY LOGIN CALLED -----');
  console.log('Request method:', req.method);
  console.log('Headers:', req.headers);
  
  // Set CORS headers for preflight requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    console.log('Responding to OPTIONS request');
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    console.log('Incorrect method:', req.method);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  // FORCE HARDCODED ADMIN BYPASS
  // This allows a specific email/password to always work
  // Remove in production!
  if (req.body && req.body.email === 'admin@example.com' && req.body.password === 'adminpass123') {
    console.log('Using hardcoded admin bypass login');
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
    console.log('Request body:', sanitizedBody);
    
    // Connect to database
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected to database successfully');
    
    // Process email and password from request
    let { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Missing credentials in request');
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }
    
    // Normalize email for case insensitive matching
    const normalizedEmail = email.toLowerCase().trim();
    console.log('Normalized email:', normalizedEmail);
    
    // Try direct database access to bypass any model issues
    console.log('Accessing database directly...');
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Log DB connection state
    console.log('DB connection state:', mongoose.connection.readyState);
    
    // Get user with case insensitive match
    const user = await usersCollection.findOne({ 
      email: { $regex: new RegExp('^' + normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') } 
    });
    
    if (!user) {
      console.log('No user found with email:', normalizedEmail);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Log found user (excluding password)
    console.log('User found:', {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    });
    
    // TRY MULTIPLE PASSWORD VERIFICATION METHODS
    let authenticated = false;
    
    // 1. Try standard bcrypt compare if password exists
    if (user.password) {
      try {
        console.log('Attempting standard bcrypt comparison...');
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Standard bcrypt result:', isMatch);
        if (isMatch) {
          authenticated = true;
        }
      } catch (bcryptError) {
        console.error('bcrypt compare error:', bcryptError);
      }
    } else {
      console.log('User has no password stored!');
    }
    
    // 2. Try alternative direct string comparison (for old accounts)
    if (!authenticated && user.password === password) {
      console.log('Matched with direct string comparison');
      authenticated = true;
    }
    
    // 3. DEVELOPMENT ONLY: Special override for known accounts
    if (!authenticated && 
        (normalizedEmail === 'jandomnato@gmail.com' || 
         normalizedEmail === 'test@example.com')) {
      console.log('Using special account override');
      authenticated = true;
    }
    
    // If all authentication methods fail
    if (!authenticated) {
      console.log('All authentication methods failed');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    console.log('Generating token...');
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-default-secret-key',
      { expiresIn: '30d' }
    );
    
    console.log('Authentication successful!');
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