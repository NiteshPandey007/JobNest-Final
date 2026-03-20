// ============================================
// models/Job.js - Job Database Model
// ============================================
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  // Job basic details
  title: {
    type: String,
    required: [true, 'Please provide a job title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a job description'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  requirements: {
    type: String,
    maxlength: [3000, 'Requirements cannot exceed 3000 characters']
  },
  responsibilities: {
    type: String,
    maxlength: [3000, 'Responsibilities cannot exceed 3000 characters']
  },

  // Job type and category
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'remote', 'freelance'],
    required: [true, 'Please specify job type'],
    default: 'full-time'
  },
  category: {
    type: String,
    required: [true, 'Please provide a job category'],
    enum: [
      'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
      'Sales', 'Design', 'Engineering', 'HR', 'Operations', 'Legal',
      'Customer Service', 'Manufacturing', 'Media', 'Other'
    ]
  },

  // Location
  location: {
    type: String,
    required: [true, 'Please provide job location'],
    trim: true
  },
  isRemote: {
    type: Boolean,
    default: false
  },

  // Salary
  salary: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },

  // Skills required for the job
  skillsRequired: [{
    type: String,
    trim: true
  }],

  // Experience level required
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'any'],
    default: 'any'
  },

  // Number of openings
  openings: {
    type: Number,
    default: 1,
    min: 1
  },

  // Application deadline
  deadline: {
    type: Date
  },

  // Status of the job posting
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },

  // Who posted this job (Employer/User reference)
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Which company posted this
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },

  // How many people have applied
  applicationsCount: {
    type: Number,
    default: 0
  },

  // Views counter
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create text index for search functionality
// This allows searching by title, description, location, category
JobSchema.index({ title: 'text', description: 'text', location: 'text' });

// Index for faster queries
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ category: 1 });
JobSchema.index({ location: 1 });

module.exports = mongoose.model('Job', JobSchema);
