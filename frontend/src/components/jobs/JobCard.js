// ============================================
// components/jobs/JobCard.js
// ============================================
import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiBriefcase, FiDollarSign, FiBookmark } from 'react-icons/fi';
import { formatSalary, timeAgo, getStatusColor, BACKEND_URL } from '../../utils/api';
import './JobCard.css';

const JobCard = ({ job, onSave, isSaved = false, showSave = true }) => {
  const {
    _id, title, company, location, jobType, salary,
    category, experienceLevel, createdAt, applicationsCount
  } = job;

  // Capitalize first letter of jobType
  const formatJobType = (type) => type?.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="job-card">
      {/* Header: Company Logo + Name */}
      <div className="job-card-header">
        <div className="company-logo">
          {company?.logo
            ? <img src={`${BACKEND_URL}/uploads/${company.logo}`} alt={company.name} />
            : <span>{company?.name?.charAt(0)?.toUpperCase()}</span>
          }
        </div>
        <div className="company-info">
          <p className="company-name">{company?.name || 'Company'}</p>
          <p className="posted-time">{timeAgo(createdAt)}</p>
        </div>
        {showSave && (
          <button
            className={`save-btn ${isSaved ? 'saved' : ''}`}
            onClick={(e) => { e.preventDefault(); onSave && onSave(_id); }}
            title={isSaved ? 'Remove from saved' : 'Save job'}
            aria-label="Save job"
          >
            <FiBookmark />
          </button>
        )}
      </div>

      {/* Job Title */}
      <Link to={`/jobs/${_id}`} className="job-title">{title}</Link>

      {/* Badges */}
      <div className="job-badges">
        <span className="badge badge-primary">{formatJobType(jobType)}</span>
        <span className="badge badge-gray">{category}</span>
        {experienceLevel && experienceLevel !== 'any' && (
          <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{experienceLevel}</span>
        )}
      </div>

      {/* Job Meta Details */}
      <div className="job-meta">
        <div className="job-meta-item">
          <FiMapPin size={14} />
          <span>{location}</span>
        </div>
        <div className="job-meta-item">
          <FiDollarSign size={14} />
          <span>{formatSalary(salary)}</span>
        </div>
        <div className="job-meta-item">
          <FiBriefcase size={14} />
          <span>{applicationsCount || 0} applicant{applicationsCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Action */}
      <div className="job-card-footer">
        <Link to={`/jobs/${_id}`} className="btn btn-primary btn-sm">View Details</Link>
      </div>
    </div>
  );
};

export default JobCard;
