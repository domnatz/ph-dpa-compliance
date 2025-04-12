module.exports = (req, res) => {
  try {
    // Simple response
    res.status(200).json({
      message: "API test endpoint is working",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      error: "Server error",
      message: error.message
    });
  }
};