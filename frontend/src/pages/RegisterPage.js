// ============================================
// pages/RegisterPage.js — Job Seeker Registration
// ============================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiMapPin, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const RegisterPage = () => {
  const { registerJobSeeker } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', location: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!formData.name.trim())        e.name = 'Full name is required';
    if (!formData.email)              e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email';
    if (!formData.password)           e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await registerJobSeeker({
        name: formData.name, email: formData.email, password: formData.password,
        phone: formData.phone, location: formData.location
      });
      toast.success('Account created! Welcome to JobNest 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type, placeholder, icon, required = false) => (
    <div className="form-group">
      <label className="form-label">{label} {required && <span>*</span>}</label>
      <div className="input-icon-wrapper">
        <span className="input-icon">{icon}</span>
        <input
          type={type}
          name={name}
          className={`form-control input-with-icon ${errors[name] ? 'error' : ''}`}
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleChange}
          autoComplete="off"
        />
      </div>
      {errors[name] && <p className="form-error">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-panel auth-left">
        <div className="auth-brand">
          <div className="auth-logo-icon"><FiBriefcase /></div>
          <span>Job<span>Nest</span></span>
        </div>
        <h2 className="auth-panel-title">Start your career journey today</h2>
        <p className="auth-panel-subtitle">
          Create a free account and get access to thousands of jobs tailored to your skills.
        </p>
        <div className="auth-panel-features">
          {['Free forever — no credit card', 'Personalized job recommendations', 'One-click job applications', 'Track all your applications'].map(f => (
            <div key={f} className="auth-feature"><div className="auth-feature-dot" /> {f}</div>
          ))}
        </div>
      </div>

      <div className="auth-panel auth-right">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h1>Create Account</h1>
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              {field('name', 'Full Name', 'text', 'John Doe', <FiUser />, true)}
              {field('phone', 'Phone Number', 'tel', '+1 (555) 000-0000', <FiPhone />)}
            </div>
            {field('email', 'Email Address', 'email', 'you@example.com', <FiMail />, true)}
            {field('location', 'Location', 'text', 'New York, NY', <FiMapPin />)}

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password <span>*</span></label>
              <div className="input-icon-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-control input-with-icon input-with-right-icon ${errors.password ? 'error' : ''}`}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button type="button" className="input-right-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password <span>*</span></label>
              <div className="input-icon-wrapper">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  className={`form-control input-with-icon ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Creating Account...</> : 'Create Free Account'}
            </button>
          </form>

          <p className="auth-switch-link" style={{ marginTop: '1.5rem' }}>
            Are you an employer? <Link to="/register/employer">Register your company →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
