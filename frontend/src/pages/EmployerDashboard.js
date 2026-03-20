// ============================================
// pages/EmployerDashboard.js
// ============================================
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiBriefcase, FiUsers, FiEye, FiEdit, FiTrash2, FiPlusCircle, FiDownload } from 'react-icons/fi';
import { jobsAPI, applicationsAPI, formatDate, getStatusColor, timeAgo, BACKEND_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import './Dashboard.css';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [myJobs, setMyJobs]           = useState([]);
  const [activeTab, setActiveTab]     = useState('jobs');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);

  useEffect(() => { fetchMyJobs(); }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await jobsAPI.getMyJobs();
      setMyJobs(res.data.jobs || []);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job posting?')) return;
    try {
      await jobsAPI.delete(jobId);
      setMyJobs(p => p.filter(j => j._id !== jobId));
      toast.success('Job deleted');
    } catch { toast.error('Failed to delete job'); }
  };

  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    setActiveTab('applicants');
    setAppsLoading(true);
    try {
      const res = await applicationsAPI.getJobApplicants(job._id);
      setApplicants(res.data.applications || []);
    } catch { toast.error('Failed to load applicants'); }
    finally { setAppsLoading(false); }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      await applicationsAPI.updateStatus(appId, { status });
      setApplicants(p => p.map(a => a._id === appId ? { ...a, status } : a));
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const totalApplicants = myJobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0);
  const activeJobs      = myJobs.filter(j => j.status === 'active').length;

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-layout">
          <DashboardSidebar />
          <main className="dashboard-main">

            {/* Welcome */}
            <div className="dashboard-welcome">
              <div>
                <h1>Employer Dashboard 🏢</h1>
                <p>Manage your job postings and review applicants.</p>
              </div>
              <Link to="/employer/post-job" className="btn btn-primary">
                <FiPlusCircle /> Post a New Job
              </Link>
            </div>

            {/* Stats */}
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-card-icon blue"><FiBriefcase /></div>
                <div><div className="stat-card-value">{myJobs.length}</div><div className="stat-card-label">Total Jobs</div></div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon green"><FiEye /></div>
                <div><div className="stat-card-value">{activeJobs}</div><div className="stat-card-label">Active Jobs</div></div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon yellow"><FiUsers /></div>
                <div><div className="stat-card-value">{totalApplicants}</div><div className="stat-card-label">Total Applicants</div></div>
              </div>
            </div>

            {/* Tabs */}
            <div className="dashboard-tabs">
              <button className={`dashboard-tab ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
                My Jobs ({myJobs.length})
              </button>
              {selectedJob && (
                <button className={`dashboard-tab ${activeTab === 'applicants' ? 'active' : ''}`} onClick={() => setActiveTab('applicants')}>
                  Applicants — {selectedJob.title}
                </button>
              )}
            </div>

            {/* ===== MY JOBS TAB ===== */}
            {activeTab === 'jobs' && (
              <div className="dashboard-card">
                <div className="card-header-row">
                  <h2>My Job Postings</h2>
                  <Link to="/employer/post-job" className="btn btn-primary btn-sm"><FiPlusCircle /> Post Job</Link>
                </div>

                {myJobs.length === 0 ? (
                  <div className="empty-state">
                    <FiBriefcase size={40} />
                    <h3>No jobs posted yet</h3>
                    <p>Start attracting top candidates by posting your first job.</p>
                    <Link to="/employer/post-job" className="btn btn-primary" style={{ marginTop: '1rem' }}>Post a Job</Link>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Job Title</th>
                          <th>Posted</th>
                          <th>Status</th>
                          <th>Applicants</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myJobs.map(job => (
                          <tr key={job._id}>
                            <td>
                              <div>
                                <p style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{job.title}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{job.location} · {job.jobType}</p>
                              </div>
                            </td>
                            <td style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{timeAgo(job.createdAt)}</td>
                            <td>
                              <span className={`badge ${getStatusColor(job.status)}`} style={{ textTransform: 'capitalize' }}>
                                {job.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleViewApplicants(job)}
                              >
                                <FiUsers /> {job.applicationsCount || 0}
                              </button>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Link to={`/employer/edit-job/${job._id}`} className="btn btn-ghost btn-sm"><FiEdit /></Link>
                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
                                  onClick={() => handleDeleteJob(job._id)}><FiTrash2 /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ===== APPLICANTS TAB ===== */}
            {activeTab === 'applicants' && selectedJob && (
              <div className="dashboard-card">
                <div className="card-header-row">
                  <h2>Applicants for: {selectedJob.title}</h2>
                  <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('jobs')}>← Back to Jobs</button>
                </div>

                {appsLoading ? (
                  <div className="loading-container"><div className="spinner" /></div>
                ) : applicants.length === 0 ? (
                  <div className="empty-state">
                    <FiUsers size={40} />
                    <h3>No applicants yet</h3>
                    <p>Share your job posting to attract candidates.</p>
                  </div>
                ) : (
                  <div className="applicants-list">
                    {applicants.map(app => (
                      <div key={app._id} className="applicant-item">
                        <div className="applicant-avatar">
                          {app.applicant?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="applicant-info">
                          <p className="applicant-name">{app.applicant?.name}</p>
                          <p className="applicant-meta">
                            {app.applicant?.email} · {app.applicant?.experience || 'N/A'} experience
                          </p>
                          {app.applicant?.skills?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                              {app.applicant.skills.slice(0, 4).map(s => (
                                <span key={s} className="badge badge-gray" style={{ fontSize: '0.75rem' }}>{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                          <span className={`badge ${getStatusColor(app.status)}`} style={{ textTransform: 'capitalize' }}>
                            {app.status}
                          </span>
                          {/* Status updater */}
                          <select
                            className="form-control"
                            style={{ fontSize: '0.8125rem', padding: '0.25rem 0.5rem', width: 'auto' }}
                            value={app.status}
                            onChange={e => handleStatusChange(app._id, e.target.value)}
                          >
                            {['pending','reviewed','shortlisted','interview','offered','hired','rejected'].map(s => (
                              <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
                            ))}
                          </select>
                        </div>
                        {/* Resume download */}
                        {app.resume && (
                          <a
                            href={`${BACKEND_URL}/uploads/resumes/${app.resume}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                            title="Download resume"
                          >
                            <FiDownload />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
