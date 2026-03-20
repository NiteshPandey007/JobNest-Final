// ============================================
// pages/AdminDashboard.js
// ============================================
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FiUsers, FiBriefcase, FiFileText, FiBarChart2,
  FiTrash2, FiToggleLeft, FiToggleRight, FiSearch
} from 'react-icons/fi';
import { formatDate, getStatusColor, timeAgo } from '../utils/api';
import axios from 'axios';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import './Dashboard.css';
import './AdminDashboard.css';

// Render Backend URL
const BASE = 'https://jobnest-final-backend.onrender.com/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab]       = useState('overview');
  const [stats, setStats]               = useState(null);
  const [users, setUsers]               = useState([]);
  const [jobs, setJobs]                 = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    if (activeTab === 'users')        fetchUsers();
    if (activeTab === 'jobs')         fetchJobs();
    if (activeTab === 'applications') fetchApplications();
  }, [activeTab]);

  // Helper - token header
  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('jobportal_token')}`
    }
  });

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BASE}/admin/stats`, authHeader());
      setStats(res.data);
    } catch (err) {
      console.error('Stats error:', err.message);
      toast.error('Stats load nahi hui');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/admin/users`, authHeader());
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Users error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/admin/jobs`, authHeader());
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Jobs error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/admin/applications`, authHeader());
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error('Applications error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      const res = await axios.put(`${BASE}/admin/users/${userId}/toggle-status`, {}, authHeader());
      setUsers(p => p.map(u => u._id === userId ? { ...u, isActive: res.data.isActive } : u));
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try {
      await axios.delete(`${BASE}/admin/users/${userId}`, authHeader());
      setUsers(p => p.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Permanently delete this job?')) return;
    try {
      await axios.delete(`${BASE}/admin/jobs/${jobId}`, authHeader());
      setJobs(p => p.filter(j => j._id !== jobId));
      toast.success('Job deleted');
    } catch {
      toast.error('Failed to delete job');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const TABS = [
    { key: 'overview',     label: 'Overview' },
    { key: 'users',        label: 'Users' },
    { key: 'jobs',         label: 'Jobs' },
    { key: 'applications', label: 'Applications' },
  ];

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-layout">
          <DashboardSidebar />
          <main className="dashboard-main">

            <div className="dashboard-welcome">
              <div>
                <h1>Admin Panel 🛡️</h1>
                <p>Manage users, jobs, and monitor platform activity.</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="dashboard-tabs">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`dashboard-tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <>
                {loading ? (
                  <div className="loading-container"><div className="spinner" /></div>
                ) : stats ? (
                  <>
                    <div className="stats-cards">
                      {[
                        { label: 'Total Users',   value: stats.stats?.totalUsers,        color: 'blue',   icon: <FiUsers /> },
                        { label: 'Total Jobs',    value: stats.stats?.totalJobs,          color: 'green',  icon: <FiBriefcase /> },
                        { label: 'Applications',  value: stats.stats?.totalApplications,  color: 'yellow', icon: <FiFileText /> },
                        { label: 'Active Jobs',   value: stats.stats?.activeJobs,         color: 'purple', icon: <FiBarChart2 /> },
                        { label: 'Job Seekers',   value: stats.stats?.jobSeekers,         color: 'blue',   icon: <FiUsers /> },
                        { label: 'Employers',     value: stats.stats?.employers,          color: 'green',  icon: <FiBriefcase /> },
                        { label: 'Companies',     value: stats.stats?.totalCompanies,     color: 'yellow', icon: <FiBarChart2 /> },
                      ].map(s => (
                        <div className="stat-card" key={s.label}>
                          <div className={`stat-card-icon ${s.color}`}>{s.icon}</div>
                          <div>
                            <div className="stat-card-value">{s.value || 0}</div>
                            <div className="stat-card-label">{s.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="admin-overview-grid">
                      {/* Recent Users */}
                      <div className="dashboard-card">
                        <div className="card-header-row"><h2>Recent Users</h2></div>
                        <div className="table-wrapper">
                          <table>
                            <thead><tr><th>Name</th><th>Role</th><th>Joined</th></tr></thead>
                            <tbody>
                              {stats.recentUsers?.map(u => (
                                <tr key={u._id}>
                                  <td>
                                    <p style={{ fontWeight: 600 }}>{u.name}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{u.email}</p>
                                  </td>
                                  <td><span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                                  <td style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{timeAgo(u.createdAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Recent Jobs */}
                      <div className="dashboard-card">
                        <div className="card-header-row"><h2>Recent Jobs</h2></div>
                        <div className="table-wrapper">
                          <table>
                            <thead><tr><th>Title</th><th>Company</th><th>Posted</th></tr></thead>
                            <tbody>
                              {stats.recentJobs?.map(j => (
                                <tr key={j._id}>
                                  <td style={{ fontWeight: 600 }}>{j.title}</td>
                                  <td style={{ color: 'var(--gray-500)' }}>{j.company?.name}</td>
                                  <td style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{timeAgo(j.createdAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="empty-state"><p>Stats load nahi hui</p></div>
                )}
              </>
            )}

            {/* USERS */}
            {activeTab === 'users' && (
              <div className="dashboard-card">
                <div className="card-header-row">
                  <h2>All Users ({filteredUsers.length})</h2>
                  <div className="admin-search">
                    <FiSearch />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="admin-search-input"
                    />
                  </div>
                </div>
                {loading ? (
                  <div className="loading-container"><div className="spinner" /></div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr><th>User</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(u => (
                          <tr key={u._id}>
                            <td>
                              <p style={{ fontWeight: 600 }}>{u.name}</p>
                              <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{u.email}</p>
                            </td>
                            <td><span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                            <td style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{formatDate(u.createdAt)}</td>
                            <td>
                              <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                                {u.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              {u.role !== 'admin' && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button className="btn btn-ghost btn-sm" onClick={() => handleToggleUser(u._id)}>
                                    {u.isActive ? <FiToggleRight style={{ color: 'var(--success)' }} /> : <FiToggleLeft />}
                                  </button>
                                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteUser(u._id)}>
                                    <FiTrash2 />
                                  </button>
                                </div>
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

            {/* JOBS */}
            {activeTab === 'jobs' && (
              <div className="dashboard-card">
                <div className="card-header-row"><h2>All Jobs ({jobs.length})</h2></div>
                {loading ? (
                  <div className="loading-container"><div className="spinner" /></div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr><th>Job Title</th><th>Company</th><th>Posted By</th><th>Status</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {jobs.map(j => (
                          <tr key={j._id}>
                            <td style={{ fontWeight: 600 }}>{j.title}</td>
                            <td style={{ color: 'var(--gray-600)' }}>{j.company?.name}</td>
                            <td style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{j.postedBy?.name}</td>
                            <td>
                              <span className={`badge ${getStatusColor(j.status)}`} style={{ textTransform: 'capitalize' }}>
                                {j.status}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteJob(j._id)}>
                                <FiTrash2 />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* APPLICATIONS */}
            {activeTab === 'applications' && (
              <div className="dashboard-card">
                <div className="card-header-row"><h2>All Applications ({applications.length})</h2></div>
                {loading ? (
                  <div className="loading-container"><div className="spinner" /></div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr><th>Applicant</th><th>Job</th><th>Applied</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {applications.map(app => (
                          <tr key={app._id}>
                            <td>
                              <p style={{ fontWeight: 600 }}>{app.applicant?.name}</p>
                              <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{app.applicant?.email}</p>
                            </td>
                            <td style={{ color: 'var(--gray-700)' }}>{app.job?.title}</td>
                            <td style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{formatDate(app.appliedAt)}</td>
                            <td>
                              <span className={`badge ${getStatusColor(app.status)}`} style={{ textTransform: 'capitalize' }}>
                                {app.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default AdminDashboard;
