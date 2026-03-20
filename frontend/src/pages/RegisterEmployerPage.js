// ============================================
// pages/RegisterEmployerPage.js
// ============================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiGlobe, FiBriefcase, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';
import './StepIndicator.css';

const RegisterEmployerPage = () => {
  const { registerEmployer } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
    companyName: '', companyWebsite: '', companyLocation: '', industry: '', companySize: '1-10'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // Multi-step form

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!formData.name.trim())    e.name = 'Name is required';
      if (!formData.email)          e.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email';
      if (!formData.password)       e.password = 'Password is required';
      else if (formData.password.length < 6) e.password = 'Min 6 characters';
      if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    if (s === 2) {
      if (!formData.companyName.trim()) e.companyName = 'Company name is required';
    }
    return e;
  };

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleNext = () => {
    const errs = validate(1);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(2);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await registerEmployer(formData);
      toast.success('Employer account created! Welcome to JobNest 🎉');
      navigate('/employer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel auth-left">
        <div className="auth-brand">
          <div className="auth-logo-icon"><FiBriefcase /></div>
          <span>Job<span>Nest</span></span>
        </div>
        <h2 className="auth-panel-title">Hire top talent with JobNest</h2>
        <p className="auth-panel-subtitle">
          Post jobs, manage applicants, and build your dream team — all from one dashboard.
        </p>
        <div className="auth-panel-features">
          {['Post unlimited jobs', 'Review applicants easily', 'Manage your company profile', 'Get notified instantly'].map(f => (
            <div key={f} className="auth-feature"><div className="auth-feature-dot" /> {f}</div>
          ))}
        </div>
      </div>

      <div className="auth-panel auth-right">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h1>Employer Registration</h1>
            <p>Already registered? <Link to="/login">Sign in</Link></p>
          </div>

          {/* Step indicator */}
          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className="step-line" />
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          </div>
          <div className="step-labels">
            <span>Your Details</span>
            <span>Company Info</span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {step === 1 && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name <span>*</span></label>
                    <div className="input-icon-wrapper">
                      <FiUser className="input-icon" />
                      <input type="text" name="name" className={`form-control input-with-icon ${errors.name ? 'error' : ''}`}
                        placeholder="Your full name" value={formData.name} onChange={handleChange} />
                    </div>
                    {errors.name && <p className="form-error">{errors.name}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <div className="input-icon-wrapper">
                      <FiPhone className="input-icon" />
                      <input type="tel" name="phone" className="form-control input-with-icon"
                        placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address <span>*</span></label>
                  <div className="input-icon-wrapper">
                    <FiMail className="input-icon" />
                    <input type="email" name="email" className={`form-control input-with-icon ${errors.email ? 'error' : ''}`}
                      placeholder="you@company.com" value={formData.email} onChange={handleChange} />
                  </div>
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Password <span>*</span></label>
                    <div className="input-icon-wrapper">
                      <FiLock className="input-icon" />
                      <input type={showPassword ? 'text' : 'password'} name="password"
                        className={`form-control input-with-icon input-with-right-icon ${errors.password ? 'error' : ''}`}
                        placeholder="Min 6 chars" value={formData.password} onChange={handleChange} />
                      <button type="button" className="input-right-icon" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {errors.password && <p className="form-error">{errors.password}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password <span>*</span></label>
                    <div className="input-icon-wrapper">
                      <FiLock className="input-icon" />
                      <input type="password" name="confirmPassword"
                        className={`form-control input-with-icon ${errors.confirmPassword ? 'error' : ''}`}
                        placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} />
                    </div>
                    {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <button type="button" className="btn btn-primary btn-full btn-lg" onClick={handleNext}>
                  Continue to Company Info →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Company Name <span>*</span></label>
                    <div className="input-icon-wrapper">
                      <FiBriefcase className="input-icon" />
                      <input type="text" name="companyName" className={`form-control input-with-icon ${errors.companyName ? 'error' : ''}`}
                        placeholder="Acme Corp" value={formData.companyName} onChange={handleChange} />
                    </div>
                    {errors.companyName && <p className="form-error">{errors.companyName}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <input type="text" name="industry" className="form-control"
                      placeholder="e.g. Technology" value={formData.industry} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Company Website</label>
                  <div className="input-icon-wrapper">
                    <FiGlobe className="input-icon" />
                    <input type="url" name="companyWebsite" className="form-control input-with-icon"
                      placeholder="https://yourcompany.com" value={formData.companyWebsite} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Company Location</label>
                    <div className="input-icon-wrapper">
                      <FiMapPin className="input-icon" />
                      <input type="text" name="companyLocation" className="form-control input-with-icon"
                        placeholder="New York, NY" value={formData.companyLocation} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Size</label>
                    <select name="companySize" className="form-control" value={formData.companySize} onChange={handleChange}>
                      {['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'].map(s => (
                        <option key={s} value={s}>{s} employees</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <button type="button" className="btn btn-ghost btn-lg" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
                    {loading ? <><span className="spinner spinner-sm" /> Creating...</> : 'Create Employer Account'}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="auth-switch-link" style={{ marginTop: '1.5rem' }}>
            Looking for a job instead? <Link to="/register">Job seeker registration →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterEmployerPage;
