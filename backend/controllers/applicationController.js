// ============================================
// controllers/applicationController.js
// ============================================
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const path = require('path');

// ============================================
// @desc    Apply for a job
// @route   POST /api/applications/apply/:jobId
// @access  Private (Job Seeker)
// ============================================
const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (job.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });
    }

    // Check deadline
    if (job.deadline && new Date() > job.deadline) {
      return res.status(400).json({ success: false, message: 'Application deadline has passed' });
    }

    // Check if already applied
    const existingApp = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existingApp) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    // Determine resume to use
    let resumePath = '';
    let resumeOriginalName = '';

    if (req.file) {
      // New resume uploaded
      resumePath = req.file.filename;
      resumeOriginalName = req.file.originalname;

      // Update user's resume on profile too
      await User.findByIdAndUpdate(req.user._id, {
        resume: req.file.filename,
        resumeOriginalName: req.file.originalname
      });
    } else if (req.user.resume) {
      // Use existing resume from profile
      resumePath = req.user.resume;
      resumeOriginalName = req.user.resumeOriginalName || 'resume';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume to apply'
      });
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      resume: resumePath,
      resumeOriginalName,
      coverLetter
    });

    // Increment job's application count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

    await application.populate([
      { path: 'job', select: 'title company location' },
      { path: 'applicant', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Get all applications of the logged-in job seeker
// @route   GET /api/applications/my-applications
// @access  Private (Job Seeker)
// ============================================
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: 'job',
        select: 'title location jobType salary status deadline',
        populate: { path: 'company', select: 'name logo' }
      })
      .sort('-appliedAt');

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Get all applicants for a specific job (for employer)
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer)
// ============================================
const getJobApplicants = async (req, res) => {
  try {
    // Verify employer owns the job
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email phone location skills experience education resume resumeOriginalName')
      .sort('-appliedAt');

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Update application status (employer action)
// @route   PUT /api/applications/:id/status
// @access  Private (Employer)
// ============================================
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, employerNotes } = req.body;

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Verify employer owns the job
    if (application.job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = status;
    if (employerNotes) application.employerNotes = employerNotes;
    await application.save();

    res.json({ success: true, message: 'Application status updated', application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Withdraw an application (job seeker)
// @route   DELETE /api/applications/:id
// @access  Private (Job Seeker)
// ============================================
const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Only allow withdrawal if status is 'pending'
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only withdraw pending applications'
      });
    }

    await application.deleteOne();

    // Decrease job application count
    await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });

    res.json({ success: true, message: 'Application withdrawn successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  withdrawApplication
};
