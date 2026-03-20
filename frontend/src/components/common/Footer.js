// ============================================
// components/common/Footer.js
// ============================================
import React from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiMail, FiLinkedin, FiTwitter, FiGithub } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon"><FiBriefcase /></div>
              <span>Job<span>Nest</span></span>
            </div>
            <p className="footer-tagline">
              Connecting talented professionals with companies that value their skills.
            </p>
            <div className="footer-socials">
              <a href="#" aria-label="Twitter"><FiTwitter /></a>
              <a href="#" aria-label="LinkedIn"><FiLinkedin /></a>
              <a href="#" aria-label="GitHub"><FiGithub /></a>
              <a href="mailto:hello@jobnest.com" aria-label="Email"><FiMail /></a>
            </div>
          </div>

          {/* For Job Seekers */}
          <div className="footer-col">
            <h4>For Job Seekers</h4>
            <ul>
              <li><Link to="/jobs">Browse Jobs</Link></li>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/dashboard">My Dashboard</Link></li>
              <li><Link to="/saved-jobs">Saved Jobs</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="footer-col">
            <h4>For Employers</h4>
            <ul>
              <li><Link to="/register/employer">Post a Job</Link></li>
              <li><Link to="/employer/dashboard">Employer Dashboard</Link></li>
              <li><Link to="/register/employer">Create Company</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/">About Us</Link></li>
              <li><Link to="/">Privacy Policy</Link></li>
              <li><Link to="/">Terms of Service</Link></li>
              <li><Link to="/">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} JobNest. All rights reserved.</p>
          <p>Built with ❤️ for job seekers and employers worldwide.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
