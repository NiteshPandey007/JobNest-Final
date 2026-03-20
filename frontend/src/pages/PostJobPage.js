// ============================================
// pages/PostJobPage.js
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiBriefcase } from 'react-icons/fi';
import { jobsAPI, JOB_CATEGORIES, JOB_TYPES, EXPERIENCE_LEVELS } from '../utils/api';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import './Dashboard.css';
import './PostJobPage.css';

const PostJobPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const [formData, setFormData] = useState({
    title: '', description: '', requirements: '', responsibilities: '',
    jobType: 'full-time', category: '', location: '', isRemote: false,
    salaryMin: '', salaryMax: '', salaryCurrency: 'USD', salaryPeriod: 'yearly',
    experienceLevel: 'any', openings: 1, deadline: '',
    skillsRequired: '',
  });

  const validate = () => {
    const e = {};
    if (!formData.title.trim())       e.title = 'Job title is required';
    if (!formData.description.trim()) e.description = 'Job description is required';
    if (!formData.category)           e.category = 'Please select a category';
    if (!formData.location.trim())    e.location = 'Location is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix the errors'); return; }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        jobType: formData.jobType,
        category: formData.category,
        location: formData.location,
        isRemote: formData.isRemote,
        salary: {
          min: formData.salaryMin ? Number(formData.salaryMin) : 0,
          max: formData.salaryMax ? Number(formData.salaryMax) : 0,
          currency: formData.salaryCurrency,
          period: formData.salaryPeriod,
        },
        experienceLevel: formData.experienceLevel,
        openings: Number(formData.openings) || 1,
        deadline: formData.deadline || undefined,
        skillsRequired: formData.skillsRequired
          ? formData.skillsRequired.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      };

      await jobsAPI.create(payload);
      toast.success('Job posted successfully! 🎉');
      navigate('/employer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const F = ({ label, name, required, error, children }) => (
    <div className="form-group">
      <label className="form-label">{label} {required && <span>*</span>}</label>
      {children}
      {error && <p className="form-error">{error}</p>}
    </div>
  );

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-layout">
          <DashboardSidebar />
          <main className="dashboard-main">
            <div className="post-job-header">
              <div className="post-job-icon"><FiBriefcase /></div>
              <div>
                <h1>Post a New Job</h1>
                <p>Fill in the details below to attract the best candidates.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="post-job-form">

              {/* ===== BASIC INFO ===== */}
              <div className="form-section">
                <h2 className="form-section-title">Basic Information</h2>
                <F label="Job Title" name="title" required error={errors.title}>
                  <input type="text" name="title" className={`form-control ${errors.title ? 'error' : ''}`}
                    placeholder="e.g. Senior React Developer" value={formData.title} onChange={handleChange} />
                </F>

                <div className="form-row">
                  <F label="Job Category" name="category" required error={errors.category}>
                    <select name="category" className={`form-control ${errors.category ? 'error' : ''}`}
                      value={formData.category} onChange={handleChange}>
                      <option value="">Select a category</option>
                      {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </F>
                  <F label="Job Type" name="jobType">
                    <select name="jobType" className="form-control" value={formData.jobType} onChange={handleChange}>
                      {JOB_TYPES.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.replace('-', ' ')}</option>)}
                    </select>
                  </F>
                </div>

                <div className="form-row">
                  <F label="Location" name="location" required error={errors.location}>
                    <input type="text" name="location" className={`form-control ${errors.location ? 'error' : ''}`}
                      placeholder="e.g. New York, NY" value={formData.location} onChange={handleChange} />
                  </F>
                  <F label="Experience Level" name="experienceLevel">
                    <select name="experienceLevel" className="form-control" value={formData.experienceLevel} onChange={handleChange}>
                      {EXPERIENCE_LEVELS.map(l => <option key={l} value={l} style={{ textTransform: 'capitalize' }}>{l}</option>)}
                    </select>
                  </F>
                </div>

                <label className="checkbox-label">
                  <input type="checkbox" name="isRemote" checked={formData.isRemote} onChange={handleChange} />
                  <span>This is a fully remote position</span>
                </label>
              </div>

              {/* ===== SALARY ===== */}
              <div className="form-section">
                <h2 className="form-section-title">Salary (Optional)</h2>
                <div className="form-row form-row-4">
                  <div className="form-group">
                    <label className="form-label">Min Salary</label>
                    <input type="number" name="salaryMin" className="form-control" placeholder="e.g. 50000"
                      value={formData.salaryMin} onChange={handleChange} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Salary</label>
                    <input type="number" name="salaryMax" className="form-control" placeholder="e.g. 100000"
                      value={formData.salaryMax} onChange={handleChange} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select name="salaryCurrency" className="form-control" value={formData.salaryCurrency} onChange={handleChange}>
                      {['USD','EUR','GBP','INR','CAD','AUD'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Period</label>
                    <select name="salaryPeriod" className="form-control" value={formData.salaryPeriod} onChange={handleChange}>
                      <option value="hourly">Hourly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ===== DETAILS ===== */}
              <div className="form-section">
                <h2 className="form-section-title">Job Details</h2>
                <F label="Job Description" name="description" required error={errors.description}>
                  <textarea name="description" className={`form-control ${errors.description ? 'error' : ''}`}
                    rows="6" placeholder="Describe the role, company, and what you're looking for..."
                    value={formData.description} onChange={handleChange} />
                </F>
                <F label="Key Responsibilities">
                  <textarea name="responsibilities" className="form-control" rows="5"
                    placeholder="List the main responsibilities of this role..."
                    value={formData.responsibilities} onChange={handleChange} />
                </F>
                <F label="Requirements">
                  <textarea name="requirements" className="form-control" rows="5"
                    placeholder="List required qualifications, skills, and experience..."
                    value={formData.requirements} onChange={handleChange} />
                </F>
                <F label="Required Skills">
                  <input type="text" name="skillsRequired" className="form-control"
                    placeholder="e.g. React, Node.js, MongoDB (comma-separated)"
                    value={formData.skillsRequired} onChange={handleChange} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>Separate skills with commas</p>
                </F>
              </div>

              {/* ===== EXTRA ===== */}
              <div className="form-section">
                <h2 className="form-section-title">Additional Info</h2>
                <div className="form-row">
                  <F label="Number of Openings">
                    <input type="number" name="openings" className="form-control"
                      min="1" value={formData.openings} onChange={handleChange} />
                  </F>
                  <F label="Application Deadline">
                    <input type="date" name="deadline" className="form-control"
                      value={formData.deadline} onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]} />
                  </F>
                </div>
              </div>

              {/* Submit */}
              <div className="post-job-actions">
                <button type="button" className="btn btn-ghost" onClick={() => navigate('/employer/dashboard')}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? <><span className="spinner spinner-sm" /> Posting...</> : '🚀 Post Job'}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PostJobPage;
