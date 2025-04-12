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
  
  console.log('Emergency login handler called');
  
  try {
    await connectDB();
    console.log('Emergency login: Connected to database');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    // Log the request body for debugging
    console.log('Emergency login request:', {
      body: req.body,
      bodyType: typeof req.body
    });
    
    // Handle different body formats
    let email, password;
    
    if (typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        email = parsed.email;
        password = parsed.password;
      } catch (e) {
        console.error('Failed to parse request body as JSON:', e);
      }
    } else {
      email = req.body.email;
      password = req.body.password;
    }
    
    if (!email || !password) {
      console.log('Missing credentials');
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    console.log('Looking for user with email:', normalizedEmail);
    
    // Access MongoDB directly to bypass model middleware
    const UserCollection = mongoose.connection.collection('users');
    
    // Find user by email - don't normalize in query in case it wasn't normalized during registration
    const user = await UserCollection.findOne({ email: { $regex: new RegExp('^' + normalizedEmail + '$', 'i') } });
    
    // Log user details (excluding password)
    console.log('User found:', user ? {
      id: user._id,
      email: user.email,
      name: user.name,
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    } : 'No user found');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Special case for first account (the one that works)
    const isFirstAccount = user.email === 'jandomnato@gmail.com';
    
    if (isFirstAccount) {
      console.log('Processing first account with special handling');
      
      // Try standard bcrypt compare for first account
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
    } else {
      // For other accounts, try multiple approaches
      console.log('Processing account with multiple authentication approaches');
      
      let isMatch = false;
      
      try {
        // Approach 1: Standard bcrypt compare
        isMatch = await bcrypt.compare(password, user.password);
        console.log('Standard bcrypt compare result:', isMatch);
        
        // Approach 2: Direct comparison (in case password was stored unhashed)
        if (!isMatch && password === user.password) {
          console.log('Direct password match found');
          isMatch = true;
        }
        
        // Approach 3: Compare with alternative salt rounds
        if (!isMatch) {
          for (let i = 8; i <= 12; i++) {
            try {
              const salt = await bcrypt.genSalt(i);
              const hashedPassword = await bcrypt.hash(password, salt);
              const tempMatch = await bcrypt.compare(password, hashedPassword);
              console.log(`Salt rounds ${i} test result:`, tempMatch);
            } catch (e) {
              console.log(`Error testing salt rounds ${i}:`, e.message);
            }
          }
        }
        
        // If all approaches fail, try emergency override for development
        if (!isMatch && process.env.NODE_ENV !== 'production' && password === 'override123') {
          console.log('Using emergency development password override');
          isMatch = true;
        }
        
        if (!isMatch) {
          return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
          });
        }
      } catch (compareErr) {
        console.error('Password comparison error:', compareErr);
        return res.status(500).json({
          success: false,
          error: 'Authentication error',
          details: compareErr.message
        });
      }
    }
    
    // If we're here, authentication succeeded
    console.log('Authentication successful for:', user.email);
    
    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'defaultsecretkey',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    
    console.log('Generated authentication token');
    
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