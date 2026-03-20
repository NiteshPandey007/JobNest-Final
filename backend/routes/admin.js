// ============================================
// routes/admin.js - Admin Panel Routes
// ============================================
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllUsers,
  getAllJobs,
  getAllApplications,
  toggleUserStatus,
  deleteJobAdmin,
  deleteUserAdmin
} = require('../controllers/adminController');

// All admin routes require authentication AND admin role
router.use(protect);
router.use(authorize('admin'));

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', getDashboardStats);

// GET /api/admin/users - Get all users
router.get('/users', getAllUsers);

// GET /api/admin/jobs - Get all jobs
router.get('/jobs', getAllJobs);

// GET /api/admin/applications - Get all applications
router.get('/applications', getAllApplications);

// PUT /api/admin/users/:id/toggle-status - Activate/deactivate user
router.put('/users/:id/toggle-status', toggleUserStatus);

// DELETE /api/admin/jobs/:id - Delete any job
router.delete('/jobs/:id', deleteJobAdmin);

// DELETE /api/admin/users/:id - Delete any user
router.delete('/users/:id', deleteUserAdmin);

module.exports = router;
