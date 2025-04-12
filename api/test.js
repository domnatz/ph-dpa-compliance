module.exports = async (req, res) => {
    try {
      // Show environment variables (without revealing secrets)
      const envInfo = {
        NODE_ENV: process.env.NODE_ENV,
        mongoDBConfigured: !!process.env.MONGODB_URI,
        jwtConfigured: !!process.env.JWT_SECRET,
        mongoUriPrefix: process.env.MONGODB_URI?.substring(0, 15) + '...',
      };
  
      return res.status(200).json({
        success: true,
        message: 'API is working',
        environment: envInfo,
        headers: req.headers,
        method: req.method,
        query: req.query,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Test endpoint error',
        message: error.message
      });
    }
  };