const connectDB = require('../../utils/db');
const { verifyToken } = require('../../utils/auth');
const Task = require('../../models/taskModel');
const mongoose = require('mongoose');

// Initialize storage for bypass user tasks if it doesn't exist
if (!global.bypassUserTasks) {
  global.bypassUserTasks = {};
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
    
   
    
    // Handle GET method - get tasks
    if (req.method === 'GET') {
      if (user.isBypassUser) {
        // Return mock tasks for bypass users from global storage
        const userTasks = global.bypassUserTasks && global.bypassUserTasks[user.id] 
          ? global.bypassUserTasks[user.id] 
          : [];
        
       
        
        return res.status(200).json({
          success: true,
          data: userTasks
        });
      }
      
      // Regular user flow - fetch tasks from database
      const tasks = await Task.find({ user: userIdForQuery }).sort('-createdAt');
      
      return res.status(200).json({
        success: true,
        data: tasks
      });
    }
    
    // Handle POST method - toggle task completion
    if (req.method === 'POST') {
      const { taskId, completed } = req.body;
      
    
      
      if (!taskId) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a taskId'
        });
      }
      
      if (user.isBypassUser) {
        // Update mock task for bypass users
        if (!global.bypassUserTasks || !global.bypassUserTasks[user.id]) {
        
          return res.status(404).json({
            success: false,
            error: 'No tasks found for this user'
          });
        }
        
      
        
        // Find and update the bypass user task in memory - using string comparison for IDs
        const taskIndex = global.bypassUserTasks[user.id].findIndex(task => 
          String(task._id) === String(taskId)
        );
        
        if (taskIndex === -1) {
         
          return res.status(404).json({
            success: false,
            error: 'Task not found'
          });
        }
        
        // Update the task completion status
        const newCompleted = completed !== false;
      
        global.bypassUserTasks[user.id][taskIndex].completed = newCompleted;
        
        // Return the updated task
        return res.status(200).json({
          success: true,
          data: global.bypassUserTasks[user.id][taskIndex]
        });
      }
      
      // Regular user flow - update task in database
      const task = await Task.findOneAndUpdate(
        { _id: taskId, user: userIdForQuery },
        { completed: completed !== false },
        { new: true }
      );
      
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found or not authorized to update'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: task
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