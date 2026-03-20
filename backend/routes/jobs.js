// ============================================
// routes/jobs.js - Job Routes
// ============================================
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs
} = require('../controllers/jobController');

// GET /api/jobs - Get all jobs (public, with search/filter)
router.get('/', getJobs);

// GET /api/jobs/my-jobs - Get employer's own jobs (protected)
router.get('/my-jobs', protect, authorize('employer', 'admin'), getMyJobs);

// GET /api/jobs/:id - Get single job (public)
router.get('/:id', getJobById);

// POST /api/jobs - Create new job (employer only)
router.post('/', protect, authorize('employer', 'admin'), createJob);

// PUT /api/jobs/:id - Update job (employer only)
router.put('/:id', protect, authorize('employer', 'admin'), updateJob);

// DELETE /api/jobs/:id - Delete job (employer or admin)
router.delete('/:id', protect, authorize('employer', 'admin'), deleteJob);

module.exports = router;
