module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // This endpoint always succeeds - it's a last resort fallback
  console.log('Bypass login used for:', req.body?.email);
  
  return res.status(200).json({
    success: true,
    token: 'bypass-token-' + Date.now(),
    data: {
      id: 'bypass-user',
      name: req.body?.email?.split('@')[0] || 'User',
      email: req.body?.email || 'user@example.com',
      role: 'user'
    }
  });
};