const mongoose = require('mongoose');
const connectDB = require('../utils/db');

module.exports = async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    
    // Try connecting to MongoDB
    await connectDB();
    
    // Check connection status
    const connectionState = mongoose.connection.readyState;
    const connectionStateStr = 
      connectionState === 0 ? 'disconnected' :
      connectionState === 1 ? 'connected' :
      connectionState === 2 ? 'connecting' :
      connectionState === 3 ? 'disconnecting' : 'unknown';
    
    // Return connection info
    return res.status(200).json({
      success: true,
      connection: {
        state: connectionState,
        stateString: connectionStateStr,
        uri: process.env.MONGODB_URI ? `${process.env.MONGODB_URI.substring(0, 20)}...` : 'not set'
      },
      message: 'Database connection info',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Database connection test failed',
      message: error.message
    });
  }
};