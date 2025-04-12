
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
    // Return a dummy success response without DB interaction
    return res.status(200).json({
      success: true,
      token: 'test-token-123',
      data: {
        id: 'test-id',
        name: 'Test User',
        email: req.body?.email || 'test@example.com',
        role: 'user'
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Test endpoint error',
      message: err.message
    });
  }
};