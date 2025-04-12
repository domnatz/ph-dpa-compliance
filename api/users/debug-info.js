const mongoose = require('mongoose');
const connectDB = require('../../utils/db');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    await connectDB();
    console.log('Debug info: Connected to database');
    
    // Only allow GET
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    // Access MongoDB directly
    const UserCollection = mongoose.connection.collection('users');
    
    // Get count of users
    const userCount = await UserCollection.countDocuments();
    console.log(`Found ${userCount} users in database`);
    
    // Get all users with SAFE info only (no passwords)
    const users = await UserCollection.find({}).project({
      _id: 1,
      email: 1,
      name: 1,
      role: 1,
      company: 1,
      createdAt: 1,
      hasPassword: { $cond: [{ $ifNull: ["$password", false] }, true, false] },
      passwordLength: { $strLenCP: { $ifNull: ["$password", ""] } }
    }).toArray();
    
    console.log(`Retrieved ${users.length} user records for debugging`);
    
    return res.status(200).json({
      success: true,
      stats: {
        userCount,
        users
      }
    });
  } catch (err) {
    console.error('Debug info error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message
    });
  }
};