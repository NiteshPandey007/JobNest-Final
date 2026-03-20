// ============================================
// components/common/Navbar.js
// ============================================
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  FiBriefcase, FiMenu, FiX, FiUser, FiLogOut,
  FiHome, FiSearch, FiBookmark, FiSettings, FiLayout
} from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isEmployer, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isEmployer) return '/employer/dashboard';
    return '/dashboard';
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
          <div className="logo-icon"><FiBriefcase /></div>
          <span className="logo-text">Job<span className="logo-accent">Nest</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="nav-links">
          <li><Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link></li>
          <li><Link to="/jobs" className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}>Find Jobs</Link></li>
          {isEmployer && (
            <li><Link to="/employer/post-job" className={`nav-link ${isActive('/employer/post-job') ? 'active' : ''}`}>Post a Job</Link></li>
          )}
        </ul>

        {/* Desktop Auth Buttons */}
        <div className="nav-auth">
          {isAuthenticated ? (
            <div className="user-menu">
              <button
                className="user-avatar-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
              >
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user?.name?.split(' ')[0]}</span>
                <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>▾</span>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user?.name}</p>
                    <p className="dropdown-role">{user?.role}</p>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to={getDashboardLink()} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FiLayout /> Dashboard
                  </Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FiUser /> Profile
                  </Link>
                  {!isEmployer && !isAdmin && (
                    <Link to="/saved-jobs" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <FiBookmark /> Saved Jobs
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link" onClick={() => setMenuOpen(false)}>
            <FiHome /> Home
          </Link>
          <Link to="/jobs" className="mobile-link" onClick={() => setMenuOpen(false)}>
            <FiSearch /> Find Jobs
          </Link>
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} className="mobile-link" onClick={() => setMenuOpen(false)}>
                <FiLayout /> Dashboard
              </Link>
              <Link to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>
                <FiUser /> Profile
              </Link>
              {isEmployer && (
                <Link to="/employer/post-job" className="mobile-link" onClick={() => setMenuOpen(false)}>
                  <FiBriefcase /> Post Job
                </Link>
              )}
              {!isEmployer && !isAdmin && (
                <Link to="/saved-jobs" className="mobile-link" onClick={() => setMenuOpen(false)}>
                  <FiBookmark /> Saved Jobs
                </Link>
              )}
              <button className="mobile-link mobile-logout" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-full" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {dropdownOpen && <div className="dropdown-backdrop" onClick={() => setDropdownOpen(false)} />}
    </nav>
  );
};

export default Navbar;
