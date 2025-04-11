const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
// Fix the model import paths - only two levels up, not three
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // For PUT requests to update task completion
  if (req.method === 'PUT') {
    try {
      // Get task ID - could be in query or params
      const id = req.params?.id || req.query?.id;
      
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
          error: 'Task not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('Update task error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', ['PUT', 'OPTIONS']);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`
    });
  }
};