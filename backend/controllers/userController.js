// ============================================
// controllers/userController.js - User Profile Management
// ============================================
const User = require('../models/User');
const Job = require('../models/Job');

// ============================================
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
// ============================================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('company', 'name logo location industry website')
      .populate('savedJobs', 'title location jobType salary company status');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
// ============================================
const updateProfile = async (req, res) => {
  try {
    // Fields that are allowed to be updated
    const allowedFields = ['name', 'phone', 'location', 'bio', 'skills', 'experience', 'education'];

    // Build update object with only allowed fields
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).populate('company');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Upload or update resume
// @route   PUT /api/users/resume
// @access  Private (Job Seeker)
// ============================================
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        resume: req.file.filename,
        resumeOriginalName: req.file.originalname
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resume: user.resume,
      resumeOriginalName: user.resumeOriginalName
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Save or unsave a job (toggle)
// @route   POST /api/users/save-job/:jobId
// @access  Private (Job Seeker)
// ============================================
const toggleSaveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const jobId = req.params.jobId;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const isSaved = user.savedJobs.includes(jobId);

    if (isSaved) {
      // Unsave: remove from array
      user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
      await user.save();
      return res.json({ success: true, message: 'Job removed from saved list', isSaved: false });
    } else {
      // Save: add to array
      user.savedJobs.push(jobId);
      await user.save();
      return res.json({ success: true, message: 'Job saved successfully', isSaved: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Get saved jobs
// @route   GET /api/users/saved-jobs
// @access  Private (Job Seeker)
// ============================================
const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedJobs',
      populate: { path: 'company', select: 'name logo' }
    });

    res.json({ success: true, savedJobs: user.savedJobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile, uploadResume, toggleSaveJob, getSavedJobs };
