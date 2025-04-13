const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  


  // Generate a proper JWT token with a bypass flag
  const userId = 'bypass-' + (req.body?.email || 'user').replace(/[^a-z0-9]/gi, '');
  const token = jwt.sign(
    { id: userId, isBypassUser: true }, // Add `isBypassUser` flag
    process.env.JWT_SECRET || 'your-default-secret-key',
    { expiresIn: '30d' }
  );

  

  return res.status(200).json({
    success: true,
    token,
    data: {
      id: userId,
      name: req.body?.email?.split('@')[0] || 'User',
      email: req.body?.email || 'user@example.com',
      role: 'user'
    }
  });
};