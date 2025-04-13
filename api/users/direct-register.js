const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
  

  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  try {
    await connectDB();

    
    // Get the working email from first account to compare hashing
    const UserCollection = mongoose.connection.collection('users');
    const existingUser = await UserCollection.findOne({ email: 'jandomnato@gmail.com' });
    
   
    // Extract registration data
    const { name, email, password, company } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and password'
      });
    }
    
    // Make sure email doesn't already exist
    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await UserCollection.findOne({ email: normalizedEmail });
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // Hash password using same logic as the first account
    let hashedPassword;
    
    // If we have a working account, try to match its hash pattern
    if (existingUser && existingUser.password) {
      // Try to use standard bcrypt approach with same salt rounds
      try {
        // Use salt rounds of 10 which is standard
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
       
      } catch (e) {

        return res.status(500).json({
          success: false,
          error: 'Error hashing password',
          details: e.message
        });
      }
    } else {
      // No reference account found, use standard approach
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }
    
  
    
    // Create user document directly with MongoDB
    const newUser = {
      name,
      email: normalizedEmail,
      password: hashedPassword,
      company: company || 'Not specified',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await UserCollection.insertOne(newUser);
    
    
    
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.insertedId,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (err) {

    return res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message
    });
  }
};