// ============================================
// controllers/jobController.js - Job CRUD Operations
// ============================================
const Job = require('../models/Job');
const Application = require('../models/Application');

// ============================================
// @desc    Get all jobs with search & filters
// @route   GET /api/jobs
// @access  Public
// ============================================
const getJobs = async (req, res) => {
  try {
    // Build query object from request parameters
    let query = { status: 'active' }; // Only show active jobs

    // --- SEARCH: by keyword in title or description ---
    if (req.query.keyword) {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: 'i' } }, // Case-insensitive
        { description: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }

    // --- FILTER: by location ---
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }

    // --- FILTER: by job category ---
    if (req.query.category) {
      query.category = req.query.category;
    }

    // --- FILTER: by job type (full-time, part-time, etc.) ---
    if (req.query.jobType) {
      query.jobType = req.query.jobType;
    }

    // --- FILTER: by experience level ---
    if (req.query.experienceLevel) {
      query.experienceLevel = req.query.experienceLevel;
    }

    // --- FILTER: by salary range ---
    if (req.query.minSalary) {
      query['salary.min'] = { $gte: Number(req.query.minSalary) };
    }
    if (req.query.maxSalary) {
      query['salary.max'] = { $lte: Number(req.query.maxSalary) };
    }

    // --- PAGINATION ---
    const page = parseInt(req.query.page) || 1; // Default page 1
    const limit = parseInt(req.query.limit) || 10; // Default 10 per page
    const skip = (page - 1) * limit; // How many to skip

    // --- SORTING ---
    let sortBy = '-createdAt'; // Default: newest first
    if (req.query.sort === 'salary') sortBy = '-salary.max';
    if (req.query.sort === 'oldest') sortBy = 'createdAt';

    // Execute the query
    const jobs = await Job.find(query)
      .populate('company', 'name logo location industry') // Include company info
      .populate('postedBy', 'name email') // Include poster info
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    // Count total matching documents for pagination
    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      jobs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Get a single job by ID
// @route   GET /api/jobs/:id
// @access  Public
// ============================================
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name logo location industry website description size')
      .populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Increment view counter
    job.views += 1;
    await job.save();

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Employer only)
// ============================================
const createJob = async (req, res) => {
  try {
    // Add the logged-in user and their company to the job data
    req.body.postedBy = req.user._id;
    req.body.company = req.user.company;

    if (!req.user.company) {
      return res.status(400).json({
        success: false,
        message: 'You must have a company profile to post jobs'
      });
    }

    const job = await Job.create(req.body);

    // Populate company info before returning
    await job.populate('company', 'name logo location industry');

    res.status(201).json({
      success: true,
      message: 'Job posted successfully!',
      job
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Employer who posted it)
// ============================================
const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check that the user owns this job
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    // Update the job
    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return updated document
      runValidators: true // Run schema validators
    }).populate('company', 'name logo');

    res.json({ success: true, message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer or Admin)
// ============================================
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check ownership or admin
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await job.deleteOne();

    // Also delete all applications for this job
    await Application.deleteMany({ job: req.params.id });

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// @desc    Get jobs posted by the logged-in employer
// @route   GET /api/jobs/my-jobs
// @access  Private (Employer)
// ============================================
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .populate('company', 'name logo')
      .sort('-createdAt');

    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs };
