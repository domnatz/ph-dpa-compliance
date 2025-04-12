const connectDB = require('../../utils/db');
const { verifyToken } = require('../../utils/auth');
const Assessment = require('../../models/assessmentModel');

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
    // Log request details for debugging
    console.log('Assessment API called:', {
      method: req.method,
      path: req.url,
      headers: {
        authorization: req.headers.authorization ? 'Bearer [hidden]' : 'None'
      }
    });
    
    await connectDB();
    
    // Get token from header
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
        error: 'No token provided, authorization denied'
      });
    }
    
    // Verify token
    const user = await verifyToken(token);
    
    // GET method - get latest assessment
    if (req.method === 'GET') {
      const assessment = await Assessment.findOne({ user: user._id }).sort('-completedAt');
      
      return res.status(200).json({
        success: true,
        data: assessment
      });
    }
    
    // POST method - create new assessment
    if (req.method === 'POST') {
      const { answers } = req.body;
      
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide answers array'
        });
      }
      
      // Calculate score (simplified version)
      let score = 0;
      answers.forEach(answer => {
        // Add points for "Yes" answers
        if (answer.answer === 'Yes') {
          score += 20;
        } else if (answer.answer === 'Partially' || answer.answer === 'In Progress') {
          score += 10;
        }
      });
      
      // Cap score at 100
      score = Math.min(score, 100);
      
      // Create assessment
      const assessment = await Assessment.create({
        user: user._id,
        answers,
        score
      });
      
      return res.status(201).json({
        success: true,
        data: assessment
      });
    }
    
    // If not GET or POST
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      method: req.method,
      allowedMethods: ['GET', 'POST', 'OPTIONS']
    });
    
  } catch (err) {
    console.error('Assessment API error:', err.message, err.stack);
    
    // Proper error handling for different types of errors
    if (err.message === 'Invalid token' || err.message === 'User not found') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message
    });
  }
};