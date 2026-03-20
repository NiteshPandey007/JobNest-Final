// ============================================
// utils/api.js - Axios API Helper Functions
// ============================================
import axios from 'axios';

// Backend base URL for static files (images, resumes)
export const BACKEND_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

// All API calls go through these functions.
// They automatically include the JWT token via axios defaults set in AuthContext.

// ==================== AUTH ====================
export const authAPI = {
  register: (data) => axios.post('/auth/register', data),
  registerEmployer: (data) => axios.post('/auth/register/employer', data),
  login: (data) => axios.post('/auth/login', data),
  getMe: () => axios.get('/auth/me'),
  changePassword: (data) => axios.put('/auth/change-password', data),
};

// ==================== JOBS ====================
export const jobsAPI = {
  getAll: (params) => axios.get('/jobs', { params }),
  getById: (id) => axios.get(`/jobs/${id}`),
  create: (data) => axios.post('/jobs', data),
  update: (id, data) => axios.put(`/jobs/${id}`, data),
  delete: (id) => axios.delete(`/jobs/${id}`),
  getMyJobs: () => axios.get('/jobs/my-jobs'),
};

// ==================== APPLICATIONS ====================
export const applicationsAPI = {
  apply: (jobId, formData) => axios.post(`/applications/apply/${jobId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyApplications: () => axios.get('/applications/my-applications'),
  getJobApplicants: (jobId) => axios.get(`/applications/job/${jobId}`),
  updateStatus: (id, data) => axios.put(`/applications/${id}/status`, data),
  withdraw: (id) => axios.delete(`/applications/${id}`),
};

// ==================== USERS ====================
export const usersAPI = {
  getProfile: () => axios.get('/users/profile'),
  updateProfile: (data) => axios.put('/users/profile', data),
  uploadResume: (formData) => axios.put('/users/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  toggleSaveJob: (jobId) => axios.post(`/users/save-job/${jobId}`),
  getSavedJobs: () => axios.get('/users/saved-jobs'),
};

// ==================== COMPANIES ====================
export const companiesAPI = {
  getAll: () => axios.get('/companies'),
  getById: (id) => axios.get(`/companies/${id}`),
  getMyCompany: () => axios.get('/companies/my-company'),
  update: (data) => axios.put('/companies/my-company', data),
};

// ==================== ADMIN ====================
export const adminAPI = {
  getStats: () => axios.get('/admin/stats'),
  getAllUsers: (params) => axios.get('/admin/users', { params }),
  getAllJobs: (params) => axios.get('/admin/jobs', { params }),
  getAllApplications: (params) => axios.get('/admin/applications', { params }),
  toggleUserStatus: (id) => axios.put(`/admin/users/${id}/toggle-status`),
  deleteJob: (id) => axios.delete(`/admin/jobs/${id}`),
  deleteUser: (id) => axios.delete(`/admin/users/${id}`),
};

// ==================== HELPERS ====================

// Format salary for display
export const formatSalary = (salary) => {
  if (!salary || (!salary.min && !salary.max)) return 'Not specified';
  const { min, max, currency = 'USD', period = 'yearly' } = salary;
  const fmt = (n) => n >= 1000 ? `${(n/1000).toFixed(0)}k` : n;
  const range = min && max ? `${fmt(min)} - ${fmt(max)}` : min ? `From ${fmt(min)}` : `Up to ${fmt(max)}`;
  return `${currency} ${range} / ${period}`;
};

// Format date
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Time ago
export const timeAgo = (dateStr) => {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  const intervals = [
    { label: 'year', secs: 31536000 },
    { label: 'month', secs: 2592000 },
    { label: 'week', secs: 604800 },
    { label: 'day', secs: 86400 },
    { label: 'hour', secs: 3600 },
    { label: 'minute', secs: 60 },
  ];
  for (const { label, secs } of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
};

// Status badge color mapping
export const getStatusColor = (status) => {
  const map = {
    pending: 'badge-warning',
    reviewed: 'badge-primary',
    shortlisted: 'badge-primary',
    interview: 'badge-primary',
    offered: 'badge-success',
    hired: 'badge-success',
    rejected: 'badge-danger',
    active: 'badge-success',
    closed: 'badge-danger',
    draft: 'badge-gray',
  };
  return map[status] || 'badge-gray';
};

// Job categories list (used across forms and filters)
export const JOB_CATEGORIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
  'Sales', 'Design', 'Engineering', 'HR', 'Operations', 'Legal',
  'Customer Service', 'Manufacturing', 'Media', 'Other'
];

export const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote', 'freelance'];
export const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'lead', 'any'];
