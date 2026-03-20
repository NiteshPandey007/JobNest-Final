// ============================================
// pages/JobDetailPage.js
// ============================================
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiMapPin, FiClock, FiBriefcase, FiDollarSign, FiCalendar,
  FiUsers, FiArrowLeft, FiBookmark, FiUpload, FiX, FiCheck
} from 'react-icons/fi';
import { jobsAPI, applicationsAPI, usersAPI, formatSalary, formatDate, timeAgo, getStatusColor, BACKEND_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './JobDetailPage.css';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isJobSeeker, user } = useAuth();

  const [job, setJob]               = useState(null);
  const [loading, setLoading]       = useState(true);
  const [isSaved, setIsSaved]       = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    fetchJob();
    if (isAuthenticated && isJobSeeker) checkSavedAndApplied();
    // eslint-disable-next-line
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await jobsAPI.getById(id);
      setJob(res.data.job);
    } catch {
      toast.error('Job not found');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const checkSavedAndApplied = async () => {
    try {
      const [savedRes, appsRes] = await Promise.all([
        usersAPI.getSavedJobs(),
        applicationsAPI.getMyApplications()
      ]);
      const savedIds = savedRes.data.savedJobs?.map(j => j._id) || [];
      setIsSaved(savedIds.includes(id));
      const applied = appsRes.data.applications?.some(a => a.job?._id === id || a.job === id);
      setHasApplied(applied);
    } catch {}
  };

  const handleSave = async () => {
    if (!isAuthenticated) { toast.info('Please login to save jobs'); return; }
    try {
      const res = await usersAPI.toggleSaveJob(id);
      setIsSaved(res.data.isSaved);
      toast.success(res.data.isSaved ? 'Job saved!' : 'Job removed from saved');
    } catch { toast.error('Failed to save job'); }
  };

  if (loading) return <div className="loading-container" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  if (!job) return null;

  const { title, company, location, jobType, salary, category, experienceLevel,
          description, requirements, responsibilities, skillsRequired,
          openings, deadline, applicationsCount, views, createdAt, status } = job;

  return (
    <div className="job-detail-page">
      <div className="container">
        {/* Back button */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back to Jobs
        </button>

        <div className="job-detail-layout">
          {/* ===== MAIN CONTENT ===== */}
          <div className="job-detail-main">
            {/* Header Card */}
            <div className="job-detail-header-card">
              <div className="job-detail-company-row">
                <div className="job-detail-logo">
                  {company?.logo
                    ? <img src={`${BACKEND_URL}/uploads/${company.logo}`} alt={company.name} />
                    : <span>{company?.name?.charAt(0)}</span>
                  }
                </div>
                <div className="job-detail-company-info">
                  <h3 className="job-detail-company-name">{company?.name}</h3>
                  <p className="job-detail-posted">Posted {timeAgo(createdAt)}</p>
                </div>
                {status !== 'active' && (
                  <span className={`badge ${getStatusColor(status)}`} style={{ textTransform: 'capitalize' }}>
                    {status}
                  </span>
                )}
              </div>

              <h1 className="job-detail-title">{title}</h1>

              {/* Meta pills */}
              <div className="job-detail-meta-row">
                <div className="job-detail-meta-pill"><FiMapPin /> {location}</div>
                <div className="job-detail-meta-pill"><FiBriefcase /> {jobType?.replace('-', ' ')}</div>
                <div className="job-detail-meta-pill"><FiDollarSign /> {formatSalary(salary)}</div>
                {experienceLevel && <div className="job-detail-meta-pill" style={{ textTransform: 'capitalize' }}><FiUsers /> {experienceLevel} level</div>}
              </div>

              {/* Badges */}
              <div className="job-detail-badges">
                <span className="badge badge-primary">{category}</span>
                <span className="badge badge-gray">{openings} opening{openings !== 1 ? 's' : ''}</span>
                {deadline && <span className="badge badge-warning"><FiCalendar /> Deadline: {formatDate(deadline)}</span>}
              </div>
            </div>

            {/* Description */}
            <div className="job-detail-section">
              <h2>Job Description</h2>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{description}</p>
            </div>

            {/* Responsibilities */}
            {responsibilities && (
              <div className="job-detail-section">
                <h2>Key Responsibilities</h2>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{responsibilities}</p>
              </div>
            )}

            {/* Requirements */}
            {requirements && (
              <div className="job-detail-section">
                <h2>Requirements</h2>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{requirements}</p>
              </div>
            )}

            {/* Skills Required */}
            {skillsRequired?.length > 0 && (
              <div className="job-detail-section">
                <h2>Skills Required</h2>
                <div className="skills-list">
                  {skillsRequired.map(s => (
                    <span key={s} className="skill-tag">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ===== SIDEBAR ===== */}
          <aside className="job-detail-sidebar">
            {/* Apply Card */}
            <div className="apply-card">
              <div className="apply-card-stats">
                <div className="apply-stat"><span className="apply-stat-value">{applicationsCount || 0}</span><span>Applicants</span></div>
                <div className="apply-stat"><span className="apply-stat-value">{views || 0}</span><span>Views</span></div>
              </div>

              {hasApplied ? (
                <div className="already-applied">
                  <FiCheck /> You have already applied
                </div>
              ) : status !== 'active' ? (
                <div className="alert alert-danger">This job is no longer accepting applications.</div>
              ) : (
                <>
                  {isAuthenticated && isJobSeeker ? (
                    <button className="btn btn-primary btn-full btn-lg" onClick={() => setShowApplyModal(true)}>
                      Apply Now
                    </button>
                  ) : !isAuthenticated ? (
                    <Link to="/login" className="btn btn-primary btn-full btn-lg" style={{ justifyContent: 'center' }}>
                      Login to Apply
                    </Link>
                  ) : null}
                </>
              )}

              {isJobSeeker && (
                <button
                  className={`btn btn-full ${isSaved ? 'btn-ghost' : 'btn-secondary'}`}
                  style={{ marginTop: '0.75rem' }}
                  onClick={handleSave}
                >
                  <FiBookmark /> {isSaved ? 'Saved' : 'Save Job'}
                </button>
              )}
            </div>

            {/* Company Info Card */}
            <div className="company-info-card">
              <h3>About {company?.name}</h3>
              {company?.description && <p>{company.description}</p>}
              <div className="company-details-list">
                {company?.location && <div className="company-detail-item"><FiMapPin /><span>{company.location}</span></div>}
                {company?.industry && <div className="company-detail-item"><FiBriefcase /><span>{company.industry}</span></div>}
                {company?.size && <div className="company-detail-item"><FiUsers /><span>{company.size} employees</span></div>}
                {company?.website && (
                  <div className="company-detail-item">
                    🌐 <a href={company.website} target="_blank" rel="noopener noreferrer">{company.website}</a>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          jobId={id}
          jobTitle={title}
          userResume={user?.resume}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => { setShowApplyModal(false); setHasApplied(true); }}
        />
      )}
    </div>
  );
};

// ============================================
// Apply Modal Component
// ============================================
const ApplyModal = ({ jobId, jobTitle, userResume, onClose, onSuccess }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile]   = useState(null);
  const [loading, setLoading]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile && !userResume) {
      toast.error('Please upload a resume');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (resumeFile) formData.append('resume', resumeFile);
      if (coverLetter) formData.append('coverLetter', coverLetter);

      await applicationsAPI.apply(jobId, formData);
      toast.success('Application submitted successfully! 🎉');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>Apply for {jobTitle}</h2>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Resume Upload */}
          <div className="form-group">
            <label className="form-label">Resume</label>
            {userResume && !resumeFile && (
              <div className="current-resume">
                <FiCheck style={{ color: 'var(--success)' }} />
                <span>Using your saved resume. Upload a new one to override.</span>
              </div>
            )}
            <label className="file-upload-area">
              <FiUpload />
              <span>{resumeFile ? resumeFile.name : 'Click to upload resume (PDF, DOC, DOCX — max 5MB)'}</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={e => setResumeFile(e.target.files[0])}
              />
            </label>
          </div>

          {/* Cover Letter */}
          <div className="form-group">
            <label className="form-label">Cover Letter <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              className="form-control"
              rows="5"
              placeholder="Write a brief cover letter explaining why you're a great fit for this role..."
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              maxLength={2000}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>
              {coverLetter.length}/2000
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Submitting...</> : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobDetailPage;
