// ============================================
// controllers/companyController.js
// ============================================
const Company = require('../models/Company');
const User = require('../models/User');

const getMyCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.user.company);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCompany = async (req, res) => {
  try {
    const allowedFields = ['name', 'description', 'website', 'location', 'industry', 'size', 'foundedYear'];
    const updates = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const company = await Company.findByIdAndUpdate(req.user.company, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Company updated', company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate('createdBy', 'name email').sort('-createdAt');
    res.json({ success: true, companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyCompany, updateCompany, getAllCompanies, getCompanyById };
