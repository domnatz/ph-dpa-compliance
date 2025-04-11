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
    await connectDB();
    
    // Get token from header
    let token;
    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
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
    return res.status(405).json({ success: false, error: 'Method not allowed' });
    
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};