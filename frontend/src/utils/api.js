import axios from 'axios';

const API_BASE = 'https://jobnest-final-backend.onrender.com/api';

// Helper - har request mein token automatically add karo
const getHeaders = () => ({
  headers: {
    Authorization: 'Bearer ' + localStorage.getItem('jobportal_token')
  }
});

// ==================== AUTH ====================
export const authAPI = {
  register: (data) => axios.post(API_BASE + '/auth/register', data),
  registerEmployer: (data) => axios.post(API_BASE + '/auth/register/employer', data),
  login: (data) => axios.post(API_BASE + '/auth/login', data),
  getMe: () => axios.get(API_BASE + '/auth/me', getHeaders()),
  changePassword: (data) => axios.put(API_BASE + '/auth/change-password', data, getHeaders()),
};

// ==================== JOBS ====================
export const jobsAPI = {
  getAll: (params) => axios.get(API_BASE + '/jobs', { params }),
  getById: (id) => axios.get(API_BASE + '/jobs/' + id),
  create: (data) => axios.post(API_BASE + '/jobs', data, getHeaders()),
  update: (id, data) => axios.put(API_BASE + '/jobs/' + id, data, getHeaders()),
  delete: (id) => axios.delete(API_BASE + '/jobs/' + id, getHeaders()),
  getMyJobs: () => axios.get(API_BASE + '/jobs/my-jobs', getHeaders()),
};

// ==================== APPLICATIONS ====================
export const applicationsAPI = {
  apply: (jobId, formData) => axios.post(
    API_BASE + '/applications/apply/' + jobId,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + localStorage.getItem('jobportal_token')
      }
    }
  ),
  getMyApplications: () => axios.get(API_BASE + '/applications/my-applications', getHeaders()),
  getJobApplicants: (jobId) => axios.get(API_BASE + '/applications/job/' + jobId, getHeaders()),
  updateStatus: (id, data) => axios.put(API_BASE + '/applications/' + id + '/status', data, getHeaders()),
  withdraw: (id) => axios.delete(API_BASE + '/applications/' + id, getHeaders()),
};

// ==================== USERS ====================
export const usersAPI = {
  getProfile: () => axios.get(API_BASE + '/users/profile', getHeaders()),
  updateProfile: (data) => axios.put(API_BASE + '/users/profile', data, getHeaders()),
  uploadResume: (formData) => axios.put(
    API_BASE + '/users/resume',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + localStorage.getItem('jobportal_token')
      }
    }
  ),
  toggleSaveJob: (jobId) => axios.post(API_BASE + '/users/save-job/' + jobId, {}, getHeaders()),
  getSavedJobs: () => axios.get(API_BASE + '/users/saved-jobs', getHeaders()),
};

// ==================== COMPANIES ====================
export const companiesAPI = {
  getAll: () => axios.get(API_BASE + '/companies'),
  getById: (id) => axios.get(API_BASE + '/companies/' + id),
  getMyCompany: () => axios.get(API_BASE + '/companies/my-company', getHeaders()),
  update: (data) => axios.put(API_BASE + '/companies/my-company', data, getHeaders()),
};

// ==================== ADMIN ====================
export const adminAPI = {
  getStats: () => axios.get(API_BASE + '/admin/stats', getHeaders()),
  getAllUsers: (params) => axios.get(API_BASE + '/admin/users', { ...getHeaders(), params }),
  getAllJobs: (params) => axios.get(API_BASE + '/admin/jobs', { ...getHeaders(), params }),
  getAllApplications: (params) => axios.get(API_BASE + '/admin/applications', { ...getHeaders(), params }),
  toggleUserStatus: (id) => axios.put(API_BASE + '/admin/users/' + id + '/toggle-status', {}, getHeaders()),
  deleteJob: (id) => axios.delete(API_BASE + '/admin/jobs/' + id, getHeaders()),
  deleteUser: (id) => axios.delete(API_BASE + '/admin/users/' + id, getHeaders()),
};

// ==================== HELPERS ====================
export const BACKEND_URL = 'https://jobnest-final-backend.onrender.com';

export const formatSalary = (salary) => {
  if (!salary || (!salary.min && !salary.max)) return 'Not specified';
  const { min, max, currency = 'USD', period = 'yearly' } = salary;
  const fmt = (n) => n >= 1000 ? (n/1000).toFixed(0) + 'k' : n;
  const range = min && max
    ? fmt(min) + ' - ' + fmt(max)
    : min ? 'From ' + fmt(min) : 'Up to ' + fmt(max);
  return currency + ' ' + range + ' / ' + period;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

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
    if (count >= 1) return count + ' ' + label + (count > 1 ? 's' : '') + ' ago';
  }
  return 'Just now';
};

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

export const JOB_CATEGORIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
  'Sales', 'Design', 'Engineering', 'HR', 'Operations', 'Legal',
  'Customer Service', 'Manufacturing', 'Media', 'Other'
];

export const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote', 'freelance'];
export const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'lead', 'any'];
