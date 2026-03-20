// ============================================
// controllers/authController.js - Authentication Logic
// ============================================
const User = require('../models/User');
const Company = require('../models/Company');
const { generateToken } = require('../middleware/auth');

// ============================================
// @desc    Register a new Job Seeker
// @route   POST /api/auth/register
// @access  Public
// ============================================
const registerJobSeeker = async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login or use a different email.'
      });
    }

    // Create new user (password is hashed automatically by User model pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      phone,
      location,
      role: 'jobseeker'
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Send success response (don't send password)
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

// ============================================
// @desc    Register a new Employer
// @route   POST /api/auth/register/employer
// @access  Public
// ============================================
const registerEmployer = async (req, res) => {
  try {
    const { name, email, password, phone, companyName, companyWebsite, companyLocation, industry, companySize } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({ name: companyName });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'A company with this name already exists.'
      });
    }

    // First create the user with employer role
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'employer'
    });

    // Then create the company and link it to the user
    const company = await Company.create({
      name: companyName,
      website: companyWebsite,
      location: companyLocation,
      industry,
      size: companySize || '1-10',
      createdBy: user._id
    });

    // Link the company to the user
    user.company = company._id;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Employer registration successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: company
      }
    });
  } catch (error) {
    console.error('Employer register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Employer registration failed'
    });
  }
};

// ============================================
// @desc    Login user (any role)
// @route   POST /api/auth/login
// @access  Public
// ============================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate that both fields are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email, explicitly select password (it's hidden by default)
    const user = await User.findOne({ email }).select('+password').populate('company');

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Contact support.'
      });
    }

    // Compare entered password with hashed password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate new JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        skills: user.skills,
        resume: user.resume,
        company: user.company,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// ============================================
// @desc    Get currently logged-in user
// @route   GET /api/auth/me
// @access  Private (requires JWT token)
// ============================================
const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id).populate('company').populate('savedJobs');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
// ============================================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { registerJobSeeker, registerEmployer, login, getMe, changePassword };
