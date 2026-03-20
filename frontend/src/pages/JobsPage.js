// ============================================
// pages/JobsPage.js — Job Listings with Search & Filter
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiMapPin, FiGrid, FiList, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { jobsAPI } from '../utils/api';
import { usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import JobCard from '../components/jobs/JobCard';
import FilterSidebar from '../components/jobs/FilterSidebar';
import './JobsPage.css';

const JobsPage = () => {
  const { isAuthenticated, isJobSeeker } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [keyword, setKeyword]       = useState(searchParams.get('keyword') || '');
  const [locationQ, setLocationQ]   = useState(searchParams.get('location') || '');
  const [filters, setFilters]       = useState({
    category:        searchParams.get('category') || '',
    jobType:         searchParams.get('jobType') || '',
    experienceLevel: '',
    minSalary:       '',
  });
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [savedJobs, setSavedJobs]   = useState([]);
  const [viewMode, setViewMode]     = useState('grid'); // 'grid' | 'list'

  // Fetch jobs whenever search params change
  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line
  }, [keyword, locationQ, filters, page]);

  // Load saved jobs if authenticated
  useEffect(() => {
    if (isAuthenticated && isJobSeeker) {
      usersAPI.getSavedJobs()
        .then(res => setSavedJobs(res.data.savedJobs?.map(j => j._id) || []))
        .catch(() => {});
    }
  }, [isAuthenticated, isJobSeeker]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (keyword)             params.keyword = keyword;
      if (locationQ)           params.location = locationQ;
      if (filters.category)    params.category = filters.category;
      if (filters.jobType)     params.jobType = filters.jobType;
      if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
      if (filters.minSalary)   params.minSalary = filters.minSalary;

      const res = await jobsAPI.getAll(params);
      setJobs(res.data.jobs || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ category: '', jobType: '', experienceLevel: '', minSalary: '' });
    setKeyword('');
    setLocationQ('');
    setPage(1);
  };

  const handleSaveJob = async (jobId) => {
    if (!isAuthenticated) { toast.info('Please login to save jobs'); return; }
    if (!isJobSeeker) { toast.info('Only job seekers can save jobs'); return; }
    try {
      const res = await usersAPI.toggleSaveJob(jobId);
      if (res.data.isSaved) {
        setSavedJobs(p => [...p, jobId]);
        toast.success('Job saved!');
      } else {
        setSavedJobs(p => p.filter(id => id !== jobId));
        toast.success('Job removed from saved list');
      }
    } catch {
      toast.error('Failed to save job');
    }
  };

  return (
    <div className="jobs-page">
      <div className="container">
        {/* Page Header */}
        <div className="jobs-page-header">
          <h1>Find Your Next Opportunity</h1>
          <p>{total.toLocaleString()} jobs available</p>
        </div>

        {/* Search Bar */}
        <form className="jobs-search-bar" onSubmit={handleSearch}>
          <div className="jobs-search-field">
            <FiSearch className="jobs-search-icon" />
            <input
              type="text"
              placeholder="Job title, keywords, or company..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="jobs-search-input"
            />
          </div>
          <div className="jobs-search-divider" />
          <div className="jobs-search-field">
            <FiMapPin className="jobs-search-icon" />
            <input
              type="text"
              placeholder="Location..."
              value={locationQ}
              onChange={e => setLocationQ(e.target.value)}
              className="jobs-search-input"
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        {/* Main Content */}
        <div className="jobs-layout">
          {/* Filter Sidebar */}
          <aside className="jobs-sidebar">
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </aside>

          {/* Job Results */}
          <div className="jobs-results">
            {/* Results header */}
            <div className="jobs-results-header">
              <p className="results-count">
                {loading ? 'Loading...' : `Showing ${jobs.length} of ${total} jobs`}
              </p>
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <FiGrid />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <FiList />
                </button>
              </div>
            </div>

            {/* Job Cards */}
            {loading ? (
              <div className="loading-container"><div className="spinner" /><p>Finding jobs...</p></div>
            ) : jobs.length === 0 ? (
              <div className="empty-state">
                <FiSearch size={48} />
                <h3>No jobs found</h3>
                <p>Try adjusting your search terms or clearing filters</p>
                <button className="btn btn-secondary" onClick={handleClearFilters}>Clear All Filters</button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'jobs-grid' : 'jobs-list'}>
                {jobs.map(job => (
                  <JobCard
                    key={job._id}
                    job={job}
                    isSaved={savedJobs.includes(job._id)}
                    onSave={handleSaveJob}
                    showSave={isJobSeeker || !isAuthenticated}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <FiChevronLeft />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && arr[i - 1] !== p - 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) => p === '...'
                    ? <span key={`ellipsis-${i}`} className="page-btn" style={{ cursor: 'default' }}>…</span>
                    : <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  )}
                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
