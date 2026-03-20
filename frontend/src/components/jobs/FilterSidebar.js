// ============================================
// components/jobs/FilterSidebar.js
// ============================================
import React from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import { JOB_CATEGORIES, JOB_TYPES, EXPERIENCE_LEVELS } from '../../utils/api';
import './FilterSidebar.css';

const FilterSidebar = ({ filters, onChange, onClear }) => {
  const handleChange = (name, value) => {
    onChange({ ...filters, [name]: value });
  };

  const hasFilters = Object.values(filters).some(v => v && v !== '');

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <div className="filter-title">
          <FiFilter size={18} />
          <span>Filters</span>
        </div>
        {hasFilters && (
          <button className="clear-filters-btn" onClick={onClear}>
            <FiX size={14} /> Clear all
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="filter-section">
        <h4 className="filter-section-title">Category</h4>
        <div className="filter-options">
          {JOB_CATEGORIES.map(cat => (
            <label key={cat} className="filter-option">
              <input
                type="radio"
                name="category"
                value={cat}
                checked={filters.category === cat}
                onChange={() => handleChange('category', filters.category === cat ? '' : cat)}
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Type Filter */}
      <div className="filter-section">
        <h4 className="filter-section-title">Job Type</h4>
        <div className="filter-options">
          {JOB_TYPES.map(type => (
            <label key={type} className="filter-option">
              <input
                type="radio"
                name="jobType"
                value={type}
                checked={filters.jobType === type}
                onChange={() => handleChange('jobType', filters.jobType === type ? '' : type)}
              />
              <span style={{ textTransform: 'capitalize' }}>{type.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="filter-section">
        <h4 className="filter-section-title">Experience Level</h4>
        <div className="filter-options">
          {EXPERIENCE_LEVELS.map(level => (
            <label key={level} className="filter-option">
              <input
                type="radio"
                name="experienceLevel"
                value={level}
                checked={filters.experienceLevel === level}
                onChange={() => handleChange('experienceLevel', filters.experienceLevel === level ? '' : level)}
              />
              <span style={{ textTransform: 'capitalize' }}>{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="filter-section">
        <h4 className="filter-section-title">Min Salary (USD/yr)</h4>
        <select
          className="form-control"
          value={filters.minSalary || ''}
          onChange={(e) => handleChange('minSalary', e.target.value)}
        >
          <option value="">Any</option>
          <option value="30000">$30,000+</option>
          <option value="50000">$50,000+</option>
          <option value="75000">$75,000+</option>
          <option value="100000">$100,000+</option>
          <option value="150000">$150,000+</option>
        </select>
      </div>
    </div>
  );
};

export default FilterSidebar;
