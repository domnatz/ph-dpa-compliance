const connectDB = require('../../utils/db');
const { verifyToken } = require('../../utils/auth');
const Assessment = require('../../models/assessmentModel');
const mongoose = require('mongoose');

// Initialize global storage for bypass users if it doesn't exist
if (!global.bypassUserAssessments) {
  global.bypassUserAssessments = {};
}

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
      query: req.query, // Log query params
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
    
    // Use the actual ID instead of creating a new ObjectId for bypass users
    const userIdForQuery = user.isBypassUser 
      ? user.id // Use the actual ID for bypass users
      : user._id;
    
    console.log(`User accessing assessments: ${user.id || user._id}, isBypass: ${!!user.isBypassUser}`);
    
    // Handle GET method - get the latest assessment or return mock data for bypass
    if (req.method === 'GET') {
      // Check if we should force a new assessment (for "Take Assessment" button)
      if (req.query.new === 'true') {
        console.log('New assessment requested - returning 404 to trigger assessment flow');
        return res.status(404).json({
          success: false,
          error: 'No assessments found for this user',
          shouldStartNew: true
        });
      }
      
      if (user.isBypassUser) {
        // Check if user has already submitted an assessment (stored in memory/session)
        const hasSubmittedAssessment = global.bypassUserAssessments && 
                                      global.bypassUserAssessments[user.id];
        
        if (!hasSubmittedAssessment) {
          // No previous assessment - trigger new assessment flow
          console.log('No previous assessment for bypass user - triggering new assessment');
          return res.status(404).json({
            success: false,
            error: 'No assessments found for this user',
            shouldStartNew: true
          });
        }
        
        // Return previously submitted assessment for bypass user
        console.log('Returning previously submitted assessment for bypass user');
        return res.status(200).json({
          success: true,
          data: global.bypassUserAssessments[user.id]
        });
      }
      
      // Regular user flow - fetch from database
      const assessment = await Assessment.findOne({ user: userIdForQuery }).sort('-completedAt');
      
      if (!assessment) {
        return res.status(404).json({
          success: false,
          error: 'No assessments found for this user',
          shouldStartNew: true
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
      
      // Log received answers to debug
      console.log('Received answers for scoring:', JSON.stringify(answers));
      
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid answers array'
        });
      }
      
      // Calculate score correctly - start at 0 and calculate percentage
      let score = 0;
      const possiblePoints = answers.length * 20; // Maximum possible points
      
      // Log each answer and its contribution to score
      answers.forEach((answer, index) => {
        console.log(`Processing answer ${index + 1}: ${answer.questionId} - ${answer.answer}`);
        
        if (answer.answer === 'Yes') {
          score += 20; // Full points
          console.log(`  Added 20 points for 'Yes', total now: ${score}`);
        } else if (answer.answer === 'Partially' || answer.answer === 'In Progress') {
          score += 10; // Half points
          console.log(`  Added 10 points for '${answer.answer}', total now: ${score}`);
        } else {
          // No points for other answers
          console.log(`  Added 0 points for '${answer.answer}', total still: ${score}`);
        }
      });
      
      // Calculate score as percentage of possible points
      const finalScore = Math.round((score / possiblePoints) * 100);
      
      console.log(`Final assessment score calculation: ${score}/${possiblePoints} = ${finalScore}%`);
      
      if (user.isBypassUser) {
        // For bypass users, store the assessment in memory and return it
        const bypassAssessment = {
          _id: 'mock-assessment-' + Date.now(),
          user: user.id,
          answers: answers,
          score: finalScore,
          completedAt: new Date(),
          isBypassData: true
        };
        
        // Store assessment for future GET requests
        if (!global.bypassUserAssessments) {
          global.bypassUserAssessments = {};
        }
        global.bypassUserAssessments[user.id] = bypassAssessment;
        
        console.log('Stored bypass user assessment in memory');
        
        return res.status(201).json({
          success: true,
          data: bypassAssessment
        });
      }
      
      // Create a new assessment for regular users
      const assessment = await Assessment.create({
        user: userIdForQuery,
        answers,
        score: finalScore
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