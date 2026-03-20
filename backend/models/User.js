// ============================================
// models/User.js - User Database Model
// ============================================
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Basic user info
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },

  // User role: jobseeker, employer, or admin
  role: {
    type: String,
    enum: ['jobseeker', 'employer', 'admin'],
    default: 'jobseeker'
  },

  // Profile information
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    enum: ['fresher', '1-2 years', '3-5 years', '5+ years', '10+ years'],
    default: 'fresher'
  },
  education: {
    type: String,
    trim: true
  },

  // Resume file path (stored after upload)
  resume: {
    type: String,
    default: null
  },
  resumeOriginalName: {
    type: String,
    default: null
  },

  // Profile picture
  avatar: {
    type: String,
    default: null
  },

  // For employers: which company they belong to
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },

  // Saved jobs (bookmarks)
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],

  // Account status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// ============================================
// MIDDLEWARE: Hash password before saving
// This runs automatically before .save()
// ============================================
UserSchema.pre('save', async function(next) {
  // Only hash password if it was modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  // Generate salt (10 rounds = good security vs speed balance)
  const salt = await bcrypt.genSalt(10);

  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ============================================
// METHOD: Compare entered password with hashed
// Usage: user.matchPassword('enteredPassword')
// ============================================
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
