const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/userModel');

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key');

    // Check if the user is a bypass user
    if (decoded.isBypassUser) {
    
      req.user = {
        id: decoded.id,
        name: decoded.id.replace('bypass-', ''),
        email: `${decoded.id.replace('bypass-', '')}@example.com`,
        role: 'user',
        isBypassUser: true
      };
      return req.user; // Return the user object for further use
    }

    // For regular users, fetch the user from the database
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    req.user = user;
    return req.user; // Return the user object for further use
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// Create a middleware for protected routes
exports.protect = async (req, res, next) => {
  try {
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
        error: 'Not authorized to access this route'
      });
    }
    
    const user = await this.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error.message
    });
  }
};

// Admin middleware
exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};