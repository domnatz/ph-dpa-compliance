const connectDB = require('../../utils/db');
const { verifyToken } = require('../../utils/auth');
const Assessment = require('../../models/assessmentModel');
const mongoose = require('mongoose');

// Initialize global storage for bypass users if it doesn't exist
if (!global.bypassUserAssessments) {
  global.bypassUserAssessments = {};
}

// Initialize storage for bypass user tasks
if (!global.bypassUserTasks) {
  global.bypassUserTasks = {};
}

// Function to convert question text to actionable task
const convertQuestionToTask = (questionText) => {
  // Remove question phrasing
  questionText = questionText.replace(/^Do you have /i, '')
    .replace(/^Have you /i, '')
    .replace(/^Are you /i, '')
    .replace(/^Is there /i, '')
    .replace(/\?$/, '');
  
  // Map common question topics to specific action items
  if (questionText.toLowerCase().includes('privacy notice')) {
    return {
      text: 'Create a Privacy Notice for your users',
      description: 'Draft and implement a comprehensive Privacy Notice that informs users about how their data is collected, used, and protected.'
    };
  } 
  else if (questionText.toLowerCase().includes('data breach')) {
    return {
      text: 'Establish data breach notification procedures',
      description: 'Develop and implement a protocol for identifying, reporting, and responding to data breaches within required timeframes.'
    };
  }
  else if (questionText.toLowerCase().includes('data protection officer')) {
    return {
      text: 'Appoint a Data Protection Officer',
      description: 'Designate a qualified individual to oversee data protection compliance within your organization.'
    };
  }
  else if (questionText.toLowerCase().includes('consent')) {
    return {
      text: 'Implement proper consent mechanisms',
      description: 'Design and deploy systems to obtain, record, and manage valid user consent for all data processing activities.'
    };
  }
  else if (questionText.toLowerCase().includes('rights') || questionText.toLowerCase().includes('access request')) {
    return {
      text: 'Create a data subject rights procedure',
      description: 'Establish a process to handle data subject requests including access, deletion, and portability rights.'
    };
  }
  else {
    // For any other questions, create a generic action item
    return {
      text: `Implement a ${questionText} process`,
      description: 'Create and document the necessary procedures to address this compliance requirement.'
    };
  }
};

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
    
   
    
    // Handle GET method - get the latest assessment or return mock data for bypass
    if (req.method === 'GET') {
      // Check if we should force a new assessment (for "Take Assessment" button)
      if (req.query.new === 'true') {
       
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
        
          return res.status(404).json({
            success: false,
            error: 'No assessments found for this user',
            shouldStartNew: true
          });
        }
        
        // Return previously submitted assessment for bypass user
       
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
       
        
        if (answer.answer === 'Yes') {
          score += 20; // Full points
         
        } else if (answer.answer === 'Partially' || answer.answer === 'In Progress') {
          score += 10; // Half points
        
        } else {
       
         
        }
      });
      
      // Calculate score as percentage of possible points
      const finalScore = Math.round((score / possiblePoints) * 100);
      
      
      
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
        
        // Generate tasks based on answers
        const tasks = [];
        
        // Generate tasks based on answers with improved phrasing
        answers.forEach((answer, index) => {
          // Use the question text from the answer object if available
          const questionText = answer.question || `Question ${answer.questionId || (index + 1)}`;
          
          if (answer.answer === 'No') {
            // Convert the question to an actionable task
            const actionTask = convertQuestionToTask(questionText);
            
            tasks.push({
              _id: 'mock-task-no-' + Date.now() + '-' + index,
              user: user.id,
              text: actionTask.text,
              description: actionTask.description,
              completed: false,
              priority: 'high',
              createdAt: new Date()
            });
          }
          
          if (answer.answer === 'Partially' || answer.answer === 'In Progress') {
            // Convert the question to a "complete" task
            const actionTask = convertQuestionToTask(questionText);
            
            tasks.push({
              _id: 'mock-task-partial-' + Date.now() + '-' + index,
              user: user.id,
              text: `Complete ${actionTask.text}`,
              description: `You've started this compliance task but need to fully implement it.`,
              completed: false,
              priority: 'medium',
              createdAt: new Date()
            });
          }
        });
        
        // Store the tasks
        global.bypassUserTasks[user.id] = tasks;
        
    
        
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