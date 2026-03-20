// ============================================
// routes/companies.js - Company Routes
// ============================================
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getMyCompany, updateCompany, getAllCompanies, getCompanyById } = require('../controllers/companyController');

// GET /api/companies - Get all companies (public)
router.get('/', getAllCompanies);

// GET /api/companies/my-company - Get own company (employer)
router.get('/my-company', protect, authorize('employer', 'admin'), getMyCompany);

// GET /api/companies/:id - Get company by ID (public)
router.get('/:id', getCompanyById);

// PUT /api/companies/my-company - Update own company (employer)
router.put('/my-company', protect, authorize('employer', 'admin'), updateCompany);

module.exports = router;
