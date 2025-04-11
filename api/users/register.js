const User = require('../../models/userModel');
const connectDB = require('../../utils/db');

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
  
  // Only allow POST for this endpoint
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  try {
    await connectDB();
    
    const { name, email, password, company } = req.body;
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      company
    });
    
    // Generate token
    const token = user.getSignedJwtToken();
    
    return res.status(200).json({
      success: true,
      token
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
};