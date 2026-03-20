// ============================================
// pages/UserDashboard.js — Job Seeker Dashboard
// ============================================
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiBookmark, FiUser, FiClock, FiTrendingUp } from 'react-icons/fi';
import { applicationsAPI, usersAPI, formatDate, getStatusColor } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import './Dashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appsRes, savedRes] = await Promise.all([
        applicationsAPI.getMyApplications(),
        usersAPI.getSavedJobs()
      ]);
      setApplications(appsRes.data.applications || []);
      setSavedJobs(savedRes.data.savedJobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await applicationsAPI.withdraw(appId);
      setApplications(p => p.filter(a => a._id !== appId));
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot withdraw application');
    }
  };

  // Count applications by status
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-layout">
          <DashboardSidebar />

          <main className="dashboard-main">
            {/* Welcome banner */}
            <div className="dashboard-welcome">
              <div>
                <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                <p>Here's what's happening with your job search.</p>
              </div>
              <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
            </div>

            {/* Stats Cards */}
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-card-icon blue"><FiBriefcase /></div>
                <div>
                  <div className="stat-card-value">{applications.length}</div>
                  <div className="stat-card-label">Total Applied</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon green"><FiTrendingUp /></div>
                <div>
                  <div className="stat-card-value">{statusCounts.interview || 0}</div>
                  <div className="stat-card-label">Interviews</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon yellow"><FiClock /></div>
                <div>
                  <div className="stat-card-value">{statusCounts.pending || 0}</div>
                  <div className="stat-card-label">Pending</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon purple"><FiBookmark /></div>
                <div>
                  <div className="stat-card-value">{savedJobs.length}</div>
                  <div className="stat-card-label">Saved Jobs</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="dashboard-tabs">
              {[
                { key: 'overview', label: 'Recent Applications' },
                { key: 'saved', label: 'Saved Jobs' },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`dashboard-tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ===== APPLICATIONS TAB ===== */}
            {activeTab === 'overview' && (
              <div className="dashboard-card">
                <div className="card-header-row">
                  <h2>My Applications</h2>
                  {applications.length > 5 && (
                    <Link to="/dashboard?tab=applications" className="btn btn-ghost btn-sm">View all</Link>
                  )}
                </div>

                {applications.length === 0 ? (
                  <div className="empty-state">
                    <FiBriefcase size={40} />
                    <h3>No applications yet</h3>
                    <p>Start applying to jobs you like!</p>
                    <Link to="/jobs" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Jobs</Link>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Job Title</th>
                          <th>Company</th>
                          <th>Applied On</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.slice(0, 10).map(app => (
                          <tr key={app._id}>
                            <td>
                              <Link to={`/jobs/${app.job?._id}`} style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                {app.job?.title || 'N/A'}
                              </Link>
                            </td>
                            <td>{app.job?.company?.name || '—'}</td>
                            <td style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                              {formatDate(app.appliedAt)}
                            </td>
                            <td>
                              <span className={`badge ${getStatusColor(app.status)}`} style={{ textTransform: 'capitalize' }}>
                                {app.status}
                              </span>
                            </td>
                            <td>
                              {app.status === 'pending' && (
                                <button
                                  className="btn btn-ghost btn-sm"
                                  style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                  onClick={() => handleWithdraw(app._id)}
                                >
                                  Withdraw
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ===== SAVED JOBS TAB ===== */}
            {activeTab === 'saved' && (
              <div className="dashboard-card">
                <div className="card-header-row">
                  <h2>Saved Jobs</h2>
                  <Link to="/saved-jobs" className="btn btn-ghost btn-sm">View all</Link>
                </div>

                {savedJobs.length === 0 ? (
                  <div className="empty-state">
                    <FiBookmark size={40} />
                    <h3>No saved jobs</h3>
                    <p>Save jobs you're interested in to view them later.</p>
                    <Link to="/jobs" className="btn btn-primary" style={{ marginTop: '1rem' }}>Explore Jobs</Link>
                  </div>
                ) : (
                  <div className="saved-jobs-list">
                    {savedJobs.slice(0, 6).map(job => (
                      <div key={job._id} className="saved-job-item">
                        <div className="saved-job-logo">
                          {job.company?.name?.charAt(0)}
                        </div>
                        <div className="saved-job-info">
                          <Link to={`/jobs/${job._id}`} className="saved-job-title">{job.title}</Link>
                          <p className="saved-job-company">{job.company?.name} · {job.location}</p>
                        </div>
                        <span className={`badge ${getStatusColor(job.status)}`} style={{ textTransform: 'capitalize' }}>
                          {job.status}
                        </span>
                        <Link to={`/jobs/${job._id}`} className="btn btn-secondary btn-sm">Apply</Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile completeness reminder */}
            {!user?.resume && (
              <div className="alert alert-info" style={{ marginTop: '1.5rem' }}>
                📄 <strong>Upload your resume</strong> to apply faster! <Link to="/profile">Go to Profile →</Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
