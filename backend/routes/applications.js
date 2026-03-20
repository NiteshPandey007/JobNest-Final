// ============================================
// routes/applications.js - Application Routes
// ============================================
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadResume, handleUploadError } = require('../middleware/upload');
const {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  withdrawApplication
} = require('../controllers/applicationController');

// POST /api/applications/apply/:jobId - Apply for a job (job seeker)
router.post('/apply/:jobId', protect, authorize('jobseeker'), uploadResume, handleUploadError, applyForJob);

// GET /api/applications/my-applications - Get all my applications (job seeker)
router.get('/my-applications', protect, authorize('jobseeker'), getMyApplications);

// GET /api/applications/job/:jobId - Get applicants for a job (employer)
router.get('/job/:jobId', protect, authorize('employer', 'admin'), getJobApplicants);

// PUT /api/applications/:id/status - Update application status (employer)
router.put('/:id/status', protect, authorize('employer', 'admin'), updateApplicationStatus);

// DELETE /api/applications/:id - Withdraw application (job seeker)
router.delete('/:id', protect, authorize('jobseeker'), withdrawApplication);

module.exports = router;
