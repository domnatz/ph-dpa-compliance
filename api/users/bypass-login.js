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
  
  console.log('Bypass login used for:', req.body?.email);

  // Generate a proper JWT token
  const userId = 'bypass-' + (req.body?.email || 'user').replace(/[^a-z0-9]/gi, '');
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-default-secret-key',
    { expiresIn: '30d' }
  );

  console.log('Bypass login successful, generated token:', token);

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