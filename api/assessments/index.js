const connectDB = require('../../utils/db');
const { verifyToken } = require('../../utils/auth');
const Assessment = require('../../models/assessmentModel');
const mongoose = require('mongoose');

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
    
    // Connect to the database
    await connectDB();
    
    // Verify token and get user
    const user = await verifyToken(req, res, () => {});
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized access' });
    }
    
    // Special handling for bypass users - convert their custom ID to valid ObjectId
    const userIdForQuery = user.isBypassUser 
      ? new mongoose.Types.ObjectId() // Fixed with 'new' keyword
      : user._id;
    
    console.log(`User accessing assessments: ${user.id || user._id}, isBypass: ${!!user.isBypassUser}`);
    
    // Handle GET method - get the latest assessment or return mock data for bypass
    if (req.method === 'GET') {
      if (user.isBypassUser) {
        // Return mock assessment data for bypass users
        return res.status(200).json({
          success: true,
          data: {
            _id: 'mock-assessment-123',
            user: user.id || user._id,
            title: 'Sample Assessment',
            score: 85,
            completedAt: new Date(),
            answers: [
              { question: 'Data Protection Policy', answer: 'Yes', comments: 'Implemented fully' },
              { question: 'Data Breach Response', answer: 'Partially', comments: 'In progress' },
              { question: 'User Consent Mechanisms', answer: 'Yes', comments: 'Deployed across all systems' }
            ],
            isBypassData: true
          }
        });
      }
      
      // Regular user flow - fetch from database
      const assessment = await Assessment.findOne({ user: userIdForQuery }).sort('-completedAt');
      
      if (!assessment) {
        return res.status(404).json({
          success: false,
          error: 'No assessments found for this user'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: assessment
      });
    }
    
    // Handle POST method - create a new assessment
    if (req.method === 'POST') {
      const { answers } = req.body;
      
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid answers array'
        });
      }
      
      // Calculate score (simplified version)
      let score = 0;
      answers.forEach(answer => {
        if (answer.answer === 'Yes') {
          score += 20;
        } else if (answer.answer === 'Partially' || answer.answer === 'In Progress') {
          score += 10;
        }
      });
      
      // Cap score at 100
      score = Math.min(score, 100);
      
      if (user.isBypassUser) {
        // For bypass users, return a mock created assessment without DB insertion
        return res.status(201).json({
          success: true,
          data: {
            _id: 'mock-assessment-' + Date.now(),
            user: user.id || user._id,
            answers: answers,
            score: score,
            completedAt: new Date(),
            isBypassData: true
          }
        });
      }
      
      // Create a new assessment for regular users
      const assessment = await Assessment.create({
        user: userIdForQuery,
        answers,
        score
      });
      
      return res.status(201).json({
        success: true,
        data: assessment
      });
    }
    
    // If the method is not GET or POST
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      method: req.method,
      allowedMethods: ['GET', 'POST', 'OPTIONS']
    });
    
  } catch (err) {
    console.error('Assessment API error:', err.message, err.stack);
    
    // Handle specific errors
    if (err.message === 'Invalid token' || err.message === 'User not found') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
    
    // Handle server errors
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message
    });
  }
};