// ============================================
// routes/auth.js - Authentication Routes
// ============================================
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  registerJobSeeker,
  registerEmployer,
  login,
  getMe,
  changePassword
} = require('../controllers/authController');

// POST /api/auth/register - Register job seeker
router.post('/register', registerJobSeeker);

// POST /api/auth/register/employer - Register employer
router.post('/register/employer', registerEmployer);

// POST /api/auth/login - Login (any user)
router.post('/login', login);

// GET /api/auth/me - Get current logged-in user (protected)
router.get('/me', protect, getMe);

// PUT /api/auth/change-password - Change password (protected)
router.put('/change-password', protect, changePassword);

module.exports = router;
