// ============================================
// middleware/auth.js - JWT Authentication Middleware
// ============================================
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================
// protect - Verifies JWT token
// Add this to any route that requires login
// Usage: router.get('/protected', protect, controller)
// ============================================
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  // Format: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token part (remove "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user from the token's id
      // We use .select('-password') to not include password in the result
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Token invalid.'
        });
      }

      // Check if user is still active
      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated'
        });
      }

      next(); // Proceed to the next middleware/controller
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Token invalid or expired.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.'
    });
  }
};

// ============================================
// authorize - Checks user role
// Usage: router.get('/admin-only', protect, authorize('admin'), controller)
// ============================================
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route is for ${roles.join(', ')} only.`
      });
    }
    next();
  };
};

// ============================================
// Helper: Generate JWT Token
// Call this after successful login/register
// ============================================
const generateToken = (id) => {
  return jwt.sign(
    { id }, // Payload: user's MongoDB _id
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = { protect, authorize, generateToken };
