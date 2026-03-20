// ============================================
// pages/SavedJobsPage.js
// ============================================
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiBookmark } from 'react-icons/fi';
import { usersAPI } from '../utils/api';
import JobCard from '../components/jobs/JobCard';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import './Dashboard.css';

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { fetchSavedJobs(); }, []);

  const fetchSavedJobs = async () => {
    try {
      const res = await usersAPI.getSavedJobs();
      setSavedJobs(res.data.savedJobs || []);
    } catch { toast.error('Failed to load saved jobs'); }
    finally { setLoading(false); }
  };

  const handleUnsave = async (jobId) => {
    try {
      await usersAPI.toggleSaveJob(jobId);
      setSavedJobs(p => p.filter(j => j._id !== jobId));
      toast.success('Job removed from saved list');
    } catch { toast.error('Failed to remove job'); }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-layout">
          <DashboardSidebar />
          <main className="dashboard-main">
            <div className="dashboard-welcome">
              <div>
                <h1>Saved Jobs 🔖</h1>
                <p>Jobs you've bookmarked for later.</p>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header-row">
                <h2>{savedJobs.length} Saved Job{savedJobs.length !== 1 ? 's' : ''}</h2>
              </div>

              {loading ? (
                <div className="loading-container"><div className="spinner" /></div>
              ) : savedJobs.length === 0 ? (
                <div className="empty-state">
                  <FiBookmark size={40} />
                  <h3>No saved jobs yet</h3>
                  <p>Bookmark jobs you're interested in and find them here.</p>
                </div>
              ) : (
                <div className="jobs-grid" style={{ marginTop: '0.5rem' }}>
                  {savedJobs.map(job => (
                    <JobCard
                      key={job._id}
                      job={job}
                      isSaved={true}
                      onSave={handleUnsave}
                      showSave={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SavedJobsPage;
