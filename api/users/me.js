const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key');
    const isBypassUser = decoded.id && decoded.id.startsWith('bypass-');

    if (isBypassUser) {
    
      return res.status(200).json({
        success: true,
        data: {
          id: decoded.id,
          name: decoded.id.replace('bypass-', ''),
          email: `${decoded.id.replace('bypass-', '')}@example.com`,
          role: 'user',
          isBypassUser: true
        }
      });
    }

    // Handle regular users (fetch from database)
    const User = mongoose.model('User');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error verifying token:', err);
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};