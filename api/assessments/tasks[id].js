// Copy the exact same code from taskbyId.js to this file
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const connectDB = require('../../utils/db');
const Task = require('../../models/taskModel');
const User = require('../../models/userModel');

// Helper function to verify JWT token
const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yourfallbacksecretkey');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (err) {
    throw new Error('Invalid token');
  }
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Connect to database first
    await connectDB();
    
    // Log all request details for debugging
    console.log('Task API called:', {
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      id: req.query.id || "Not found"
    });
    
    // For PUT requests to update task completion
    if (req.method === 'PUT') {
      // Get task ID from query parameters
      const id = req.query.id;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Task ID is required'
        });
      }
      
      // Authenticate user
      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = req.headers.authorization.split(' ')[1];
      }
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized'
        });
      }
      
      // Verify token
      const user = await verifyToken(token);
      
      // Update the task
      const task = await Task.findOneAndUpdate(
        { _id: id, user: user._id },
        req.body,
        { new: true }
      );
      
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
          taskId: id,
          userId: user._id
        });
      }
      
      return res.status(200).json({
        success: true,
        data: task
      });
    } else {
      // Method not allowed
      res.setHeader('Allow', ['PUT', 'OPTIONS']);
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`
      });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false, 
      error: 'Server error',
      message: error.message
    });
  }
};