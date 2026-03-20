// ============================================
// pages/HomePage.js
// ============================================
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch, FiMapPin, FiBriefcase, FiUsers,
  FiTrendingUp, FiArrowRight, FiCheck
} from 'react-icons/fi';
import { jobsAPI, JOB_CATEGORIES } from '../utils/api';
import JobCard from '../components/jobs/JobCard';
import './HomePage.css';

const STATS = [
  { icon: <FiBriefcase />, value: '10,000+', label: 'Active Jobs' },
  { icon: <FiUsers />,     value: '50,000+', label: 'Job Seekers' },
  { icon: <FiBriefcase />, value: '5,000+',  label: 'Companies' },
  { icon: <FiTrendingUp />, value: '95%',    label: 'Success Rate' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword]   = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs]   = useState(true);

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      const res = await jobsAPI.getAll({ limit: 6, sort: 'newest' });
      setFeaturedJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Failed to load featured jobs', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword)  params.set('keyword', keyword);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="home-page">

      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <span>🚀</span> Over 10,000 jobs available today
          </div>
          <h1 className="hero-title">
            Find Your <span className="hero-highlight">Dream Job</span><br />
            & Build Your Career
          </h1>
          <p className="hero-subtitle">
            Connect with top companies. Discover opportunities that match your
            skills, experience, and ambitions — all in one place.
          </p>

          {/* Search Bar */}
          <form className="hero-search-form" onSubmit={handleSearch}>
            <div className="search-field">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <FiMapPin className="search-icon" />
              <input
                type="text"
                placeholder="City, state, or remote..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary search-btn">
              <FiSearch /> Search Jobs
            </button>
          </form>

          {/* Popular searches */}
          <div className="popular-searches">
            <span>Popular:</span>
            {['Remote', 'React Developer', 'Data Analyst', 'Product Manager', 'UX Designer'].map(term => (
              <button
                key={term}
                className="popular-tag"
                onClick={() => navigate(`/jobs?keyword=${term}`)}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map((stat, i) => (
              <div className="stat-item" key={i}>
                <div className="stat-icon">{stat.icon}</div>
                <div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Browse by Category</h2>
          <p className="section-subtitle">Explore jobs across every industry and field</p>
          <div className="categories-grid">
            {JOB_CATEGORIES.slice(0, 12).map((cat) => (
              <button
                key={cat}
                className="category-card"
                onClick={() => navigate(`/jobs?category=${cat}`)}
              >
                <span className="category-icon">{getCategoryIcon(cat)}</span>
                <span className="category-name">{cat}</span>
                <FiArrowRight className="category-arrow" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED JOBS ===== */}
      <section className="featured-jobs-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Latest Job Openings</h2>
              <p className="section-subtitle">Fresh opportunities posted in the last 24 hours</p>
            </div>
            <Link to="/jobs" className="btn btn-secondary">
              View All Jobs <FiArrowRight />
            </Link>
          </div>

          {loadingJobs ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : featuredJobs.length > 0 ? (
            <div className="jobs-grid">
              {featuredJobs.map(job => (
                <JobCard key={job._id} job={job} showSave={false} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No jobs posted yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>How It Works</h2>
          <p className="section-subtitle" style={{ textAlign: 'center' }}>
            Get hired in 3 simple steps
          </p>
          <div className="steps-grid">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up for free and build your professional profile with your skills and experience.' },
              { step: '02', title: 'Explore Jobs',   desc: 'Browse thousands of jobs, filter by your preferences, and find the perfect match.' },
              { step: '03', title: 'Apply & Get Hired', desc: 'Submit your resume, track your applications, and land your dream job.' },
            ].map((item) => (
              <div className="step-card" key={item.step}>
                <div className="step-number">{item.step}</div>
                <h3 className="step-title">{item.title}</h3>
                <p className="step-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-grid">
            {/* Job Seeker CTA */}
            <div className="cta-card cta-seeker">
              <h3>Looking for a Job?</h3>
              <p>Join thousands of job seekers who found their dream career through JobNest.</p>
              <ul className="cta-benefits">
                {['Free to sign up', 'Upload your resume', 'Apply with one click'].map(b => (
                  <li key={b}><FiCheck /> {b}</li>
                ))}
              </ul>
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
            </div>
            {/* Employer CTA */}
            <div className="cta-card cta-employer">
              <h3>Hiring Talent?</h3>
              <p>Post your job and reach thousands of qualified candidates today.</p>
              <ul className="cta-benefits">
                {['Post jobs instantly', 'Manage applicants easily', 'Find top talent fast'].map(b => (
                  <li key={b}><FiCheck /> {b}</li>
                ))}
              </ul>
              <Link to="/register/employer" className="btn btn-primary btn-lg">Post a Job</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Map category names to emoji icons
const getCategoryIcon = (cat) => {
  const icons = {
    Technology: '💻', Healthcare: '🏥', Finance: '💰', Education: '📚',
    Marketing: '📣', Sales: '📈', Design: '🎨', Engineering: '⚙️',
    HR: '👥', Operations: '🔧', Legal: '⚖️', 'Customer Service': '🎧',
    Manufacturing: '🏭', Media: '📺', Other: '💼',
  };
  return icons[cat] || '💼';
};

export default HomePage;
