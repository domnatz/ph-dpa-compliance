const connectDB = require('../../utils/db');
const { verifyToken } = require('../../utils/auth');
const Task = require('../../models/taskModel');
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
    
    // GET method - get tasks
    if (req.method === 'GET') {
      const tasks = await Task.find({ user: user._id }).sort('createdAt');
      
      return res.status(200).json({
        success: true,
        data: tasks
      });
    }
    
    // POST method - generate tasks based on assessment
    if (req.method === 'POST') {
      // Get latest assessment
      const assessment = await Assessment.findOne({ user: user._id }).sort('-completedAt');
      
      if (!assessment) {
        return res.status(400).json({
          success: false,
          error: 'Complete an assessment first'
        });
      }
      
      // Delete existing tasks
      await Task.deleteMany({ user: user._id });
      
      // Define tasks based on assessment answers
      const tasks = [];
      
      assessment.answers.forEach(answer => {
        if (answer.questionId === 1 && answer.answer !== 'Yes') {
          tasks.push({
            user: user._id,
            text: 'Appoint a Data Protection Officer (DPO)',
            description: 'Designate a person within your organization responsible for ensuring compliance with the DPA.'
          });
        }
        
        if (answer.questionId === 2 && answer.answer !== 'Yes') {
          tasks.push({
            user: user._id,
            text: 'Create a Privacy Notice',
            description: 'Develop a comprehensive privacy notice that informs users about how their data is collected and used.'
          });
        }
        
        if (answer.questionId === 3 && answer.answer !== 'Yes') {
          tasks.push({
            user: user._id,
            text: 'Register with the National Privacy Commission',
            description: 'Register your data processing systems with the NPC as required by the DPA.'
          });
        }
        
        if (answer.questionId === 4 && answer.answer !== 'Yes') {
          tasks.push({
            user: user._id,
            text: 'Establish Data Breach Notification Procedures',
            description: 'Create protocols for notifying affected individuals and the NPC within 72 hours of discovering a breach.'
          });
        }
        
        if (answer.questionId === 5 && answer.answer !== 'Yes') {
          tasks.push({
            user: user._id,
            text: 'Implement Consent Mechanisms',
            description: 'Develop methods to obtain specific, informed consent before collecting personal data.'
          });
        }
      });
      
      // Create tasks in database
      const createdTasks = await Task.create(tasks);
      
      return res.status(201).json({
        success: true,
        data: createdTasks
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