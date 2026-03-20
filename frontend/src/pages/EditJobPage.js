// ============================================
// pages/EditJobPage.js
// ============================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jobsAPI, JOB_CATEGORIES, JOB_TYPES, EXPERIENCE_LEVELS } from '../utils/api';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import './Dashboard.css';
import './PostJobPage.css';

const EditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading]       = useState(false);
  const [fetching, setFetching]     = useState(true);
  const [errors, setErrors]         = useState({});
  const [formData, setFormData]     = useState({
    title: '', description: '', requirements: '', responsibilities: '',
    jobType: 'full-time', category: '', location: '', isRemote: false,
    salaryMin: '', salaryMax: '', salaryCurrency: 'USD', salaryPeriod: 'yearly',
    experienceLevel: 'any', openings: 1, deadline: '', status: 'active',
    skillsRequired: '',
  });

  useEffect(() => {
    fetchJob();
    // eslint-disable-next-line
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await jobsAPI.getById(id);
      const job = res.data.job;
      setFormData({
        title: job.title || '',
        description: job.description || '',
        requirements: job.requirements || '',
        responsibilities: job.responsibilities || '',
        jobType: job.jobType || 'full-time',
        category: job.category || '',
        location: job.location || '',
        isRemote: job.isRemote || false,
        salaryMin: job.salary?.min || '',
        salaryMax: job.salary?.max || '',
        salaryCurrency: job.salary?.currency || 'USD',
        salaryPeriod: job.salary?.period || 'yearly',
        experienceLevel: job.experienceLevel || 'any',
        openings: job.openings || 1,
        deadline: job.deadline ? job.deadline.split('T')[0] : '',
        status: job.status || 'active',
        skillsRequired: job.skillsRequired?.join(', ') || '',
      });
    } catch {
      toast.error('Failed to load job');
      navigate('/employer/dashboard');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.title.trim())       e.title = 'Job title is required';
    if (!formData.description.trim()) e.description = 'Description is required';
    if (!formData.category)           e.category = 'Category is required';
    if (!formData.location.trim())    e.location = 'Location is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        title: formData.title, description: formData.description,
        requirements: formData.requirements, responsibilities: formData.responsibilities,
        jobType: formData.jobType, category: formData.category,
        location: formData.location, isRemote: formData.isRemote,
        status: formData.status,
        salary: {
          min: formData.salaryMin ? Number(formData.salaryMin) : 0,
          max: formData.salaryMax ? Number(formData.salaryMax) : 0,
          currency: formData.salaryCurrency, period: formData.salaryPeriod,
        },
        experienceLevel: formData.experienceLevel,
        openings: Number(formData.openings) || 1,
        deadline: formData.deadline || undefined,
        skillsRequired: formData.skillsRequired
          ? formData.skillsRequired.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      };

      await jobsAPI.update(id, payload);
      toast.success('Job updated successfully!');
      navigate('/employer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-layout">
          <DashboardSidebar />
          <main className="dashboard-main">
            <div className="post-job-header">
              <div className="post-job-icon">✏️</div>
              <div>
                <h1>Edit Job Posting</h1>
                <p>Update your job listing details below.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="post-job-form">
              <div className="form-section">
                <h2 className="form-section-title">Basic Information</h2>

                <div className="form-group">
                  <label className="form-label">Job Title <span>*</span></label>
                  <input type="text" name="title" className={`form-control ${errors.title ? 'error' : ''}`}
                    value={formData.title} onChange={handleChange} />
                  {errors.title && <p className="form-error">{errors.title}</p>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category <span>*</span></label>
                    <select name="category" className={`form-control ${errors.category ? 'error' : ''}`}
                      value={formData.category} onChange={handleChange}>
                      <option value="">Select category</option>
                      {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <p className="form-error">{errors.category}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Job Type</label>
                    <select name="jobType" className="form-control" value={formData.jobType} onChange={handleChange}>
                      {JOB_TYPES.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.replace('-', ' ')}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Location <span>*</span></label>
                    <input type="text" name="location" className={`form-control ${errors.location ? 'error' : ''}`}
                      value={formData.location} onChange={handleChange} />
                    {errors.location && <p className="form-error">{errors.location}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select name="status" className="form-control" value={formData.status} onChange={handleChange}>
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <label className="checkbox-label">
                  <input type="checkbox" name="isRemote" checked={formData.isRemote} onChange={handleChange} />
                  <span>Remote position</span>
                </label>
              </div>

              <div className="form-section">
                <h2 className="form-section-title">Salary</h2>
                <div className="form-row form-row-4">
                  <div className="form-group">
                    <label className="form-label">Min</label>
                    <input type="number" name="salaryMin" className="form-control" value={formData.salaryMin} onChange={handleChange} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max</label>
                    <input type="number" name="salaryMax" className="form-control" value={formData.salaryMax} onChange={handleChange} min="0" />
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

              <div className="form-section">
                <h2 className="form-section-title">Job Details</h2>
                <div className="form-group">
                  <label className="form-label">Description <span>*</span></label>
                  <textarea name="description" className={`form-control ${errors.description ? 'error' : ''}`}
                    rows="6" value={formData.description} onChange={handleChange} />
                  {errors.description && <p className="form-error">{errors.description}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Responsibilities</label>
                  <textarea name="responsibilities" className="form-control" rows="4" value={formData.responsibilities} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Requirements</label>
                  <textarea name="requirements" className="form-control" rows="4" value={formData.requirements} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Required Skills</label>
                  <input type="text" name="skillsRequired" className="form-control"
                    placeholder="React, Node.js, ... (comma-separated)"
                    value={formData.skillsRequired} onChange={handleChange} />
                </div>
              </div>

              <div className="form-section">
                <h2 className="form-section-title">Additional Info</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Experience Level</label>
                    <select name="experienceLevel" className="form-control" value={formData.experienceLevel} onChange={handleChange}>
                      {EXPERIENCE_LEVELS.map(l => <option key={l} value={l} style={{ textTransform: 'capitalize' }}>{l}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Openings</label>
                    <input type="number" name="openings" className="form-control" min="1" value={formData.openings} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deadline</label>
                    <input type="date" name="deadline" className="form-control" value={formData.deadline} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="post-job-actions">
                <button type="button" className="btn btn-ghost" onClick={() => navigate('/employer/dashboard')}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? <><span className="spinner spinner-sm" /> Saving...</> : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default EditJobPage;
