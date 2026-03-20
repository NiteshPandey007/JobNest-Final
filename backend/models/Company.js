// ============================================
// models/Company.js - Company Database Model
// ============================================
const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  // Company name
  name: {
    type: String,
    required: [true, 'Please provide a company name'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },

  // Website URL
  website: {
    type: String,
    trim: true
  },

  // Company location
  location: {
    type: String,
    trim: true
  },

  // Company industry
  industry: {
    type: String,
    trim: true
  },

  // Company size
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    default: '1-10'
  },

  // Company logo file path
  logo: {
    type: String,
    default: null
  },

  // Company founded year
  foundedYear: {
    type: Number
  },

  // Who created/owns this company profile (employer)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Is the company profile verified by admin
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', CompanySchema);
