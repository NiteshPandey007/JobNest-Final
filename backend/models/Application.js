// ============================================
// models/Application.js - Job Application Model
// ============================================
const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  // Which job is being applied to
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },

  // Who is applying (job seeker)
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Resume file path at time of application
  resume: {
    type: String,
    required: [true, 'Resume is required to apply']
  },
  resumeOriginalName: {
    type: String
  },

  // Cover letter (optional)
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },

  // Application status tracked by employer
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'interview', 'offered', 'rejected', 'hired'],
    default: 'pending'
  },

  // Notes from the employer (internal)
  employerNotes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  // When the application was submitted
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Prevent duplicate applications: one user can only apply once per job
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
