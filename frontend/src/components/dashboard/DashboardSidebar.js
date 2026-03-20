// ============================================
// components/dashboard/DashboardSidebar.js
// ============================================
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiUser, FiBriefcase, FiBookmark,
  FiPlusCircle, FiUsers, FiBarChart2, FiSettings
} from 'react-icons/fi';
import './DashboardSidebar.css';

const jobSeekerLinks = [
  { to: '/dashboard', icon: <FiHome />, label: 'Overview' },
  { to: '/profile', icon: <FiUser />, label: 'My Profile' },
  { to: '/dashboard?tab=applications', icon: <FiBriefcase />, label: 'My Applications' },
  { to: '/saved-jobs', icon: <FiBookmark />, label: 'Saved Jobs' },
];

const employerLinks = [
  { to: '/employer/dashboard', icon: <FiHome />, label: 'Overview' },
  { to: '/employer/post-job', icon: <FiPlusCircle />, label: 'Post a Job' },
  { to: '/employer/dashboard?tab=jobs', icon: <FiBriefcase />, label: 'My Jobs' },
  { to: '/employer/dashboard?tab=applicants', icon: <FiUsers />, label: 'Applicants' },
  { to: '/profile', icon: <FiUser />, label: 'Profile' },
];

const adminLinks = [
  { to: '/admin', icon: <FiBarChart2 />, label: 'Dashboard' },
  { to: '/admin?tab=users', icon: <FiUsers />, label: 'Users' },
  { to: '/admin?tab=jobs', icon: <FiBriefcase />, label: 'Jobs' },
  { to: '/admin?tab=applications', icon: <FiSettings />, label: 'Applications' },
];

const DashboardSidebar = () => {
  const { user, isEmployer, isAdmin } = useAuth();
  const links = isAdmin ? adminLinks : isEmployer ? employerLinks : jobSeekerLinks;

  return (
    <aside className="dashboard-sidebar">
      {/* User Info */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <p className="sidebar-user-name">{user?.name}</p>
          <p className="sidebar-user-role">{user?.role}</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            end
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
