// ============================================
// controllers/adminController.js - Admin Panel
// ============================================
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');

// ============================================
// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
// ============================================
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalJobs, totalApplications, totalCompanies, activeJobs, jobSeekers, employers] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      Company.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'employer' })
    ]);

    // Recent activity
    const recentJobs = await Job.find().sort('-createdAt').limit(5).populate('company', 'name');
    const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email role createdAt');
    const recentApplications = await Application.find()
      .sort('-appliedAt').limit(5)
      .populate('job', 'title').populate('applicant', 'name email');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalCompanies,
        activeJobs,
        jobSeekers,
        employers
      },
      recentJobs,
      recentUsers,
      recentApplications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
// ============================================
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('company', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({ success: true, users, total, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Get all jobs for admin
// @route   GET /api/admin/jobs
// @access  Private (Admin)
// ============================================
const getAllJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const jobs = await Job.find()
      .populate('company', 'name')
      .populate('postedBy', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments();
    res.json({ success: true, jobs, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Get all applications
// @route   GET /api/admin/applications
// @access  Private (Admin)
// ============================================
const getAllApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const applications = await Application.find()
      .populate('job', 'title location')
      .populate('applicant', 'name email')
      .sort('-appliedAt')
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments();
    res.json({ success: true, applications, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Toggle user account status (activate/deactivate)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
// ============================================
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deactivating other admins
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot modify admin accounts' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Delete a job (admin)
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin)
// ============================================
const deleteJobAdmin = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    await job.deleteOne();
    await Application.deleteMany({ job: req.params.id });

    res.json({ success: true, message: 'Job deleted by admin' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Delete a user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
// ============================================
const deleteUserAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin accounts' });
    }

    // Delete their applications too
    await Application.deleteMany({ applicant: req.params.id });

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllJobs,
  getAllApplications,
  toggleUserStatus,
  deleteJobAdmin,
  deleteUserAdmin
};
