// ============================================
// routes/users.js - User Profile Routes
// ============================================
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadResume, handleUploadError } = require('../middleware/upload');
const {
  getProfile,
  updateProfile,
  uploadResume: uploadResumeController,
  toggleSaveJob,
  getSavedJobs
} = require('../controllers/userController');

// GET /api/users/profile - Get own profile
router.get('/profile', protect, getProfile);

// PUT /api/users/profile - Update own profile
router.put('/profile', protect, updateProfile);

// PUT /api/users/resume - Upload resume
router.put('/resume', protect, authorize('jobseeker'), uploadResume, handleUploadError, uploadResumeController);

// POST /api/users/save-job/:jobId - Save/unsave a job
router.post('/save-job/:jobId', protect, authorize('jobseeker'), toggleSaveJob);

// GET /api/users/saved-jobs - Get all saved jobs
router.get('/saved-jobs', protect, authorize('jobseeker'), getSavedJobs);

module.exports = router;
