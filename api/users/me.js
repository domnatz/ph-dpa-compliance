const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');

// Helper function to verify JWT token
const verifyToken = async (token) => {
  if (!token) {
    throw new Error('No token provided');
  }
  
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
  try {
    let token;
    
    // Check if token exists in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided, authorization denied'
      });
    }
    
    // Verify token
    const user = await verifyToken(token);
    
    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};