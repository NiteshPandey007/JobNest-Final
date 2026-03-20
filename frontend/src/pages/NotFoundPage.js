// ============================================
// pages/NotFoundPage.js
// ============================================
import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => (
  <div className="notfound-page">
    <div className="notfound-content">
      <div className="notfound-number">404</div>
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <div className="notfound-actions">
        <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
        <Link to="/jobs" className="btn btn-secondary btn-lg">Browse Jobs</Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
