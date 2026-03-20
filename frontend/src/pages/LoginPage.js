// ============================================
// pages/LoginPage.js
// ============================================
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const dest = user.role === 'admin' ? '/admin'
                 : user.role === 'employer' ? '/employer/dashboard'
                 : '/dashboard';
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email';
    if (!formData.password) errs.password = 'Password is required';
    return errs;
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${data.user.name}!`);
      const dest = data.user.role === 'admin' ? '/admin'
                 : data.user.role === 'employer' ? '/employer/dashboard'
                 : '/dashboard';
      navigate(dest);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-panel auth-left">
        <div className="auth-brand">
          <div className="auth-logo-icon"><FiBriefcase /></div>
          <span>Job<span>Nest</span></span>
        </div>
        <h2 className="auth-panel-title">Welcome back to your career journey</h2>
        <p className="auth-panel-subtitle">
          Thousands of jobs are waiting for you. Sign in to continue where you left off.
        </p>
        <div className="auth-panel-features">
          {['Search 10,000+ jobs', 'Track your applications', 'Get hired faster'].map(f => (
            <div key={f} className="auth-feature">
              <div className="auth-feature-dot" /> {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel – Form */}
      <div className="auth-panel auth-right">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h1>Sign In</h1>
            <p>Don't have an account? <Link to="/register">Sign up free</Link></p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address <span>*</span></label>
              <div className="input-icon-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  className={`form-control input-with-icon ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password <span>*</span></label>
              <div className="input-icon-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-control input-with-icon input-with-right-icon ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button type="button" className="input-right-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Signing In...</> : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="demo-accounts">
            <p className="demo-title">Demo Credentials</p>
            <div className="demo-grid">
              <div className="demo-item">
                <strong>Job Seeker</strong>
                <span>seeker@demo.com</span>
                <span>password123</span>
              </div>
              <div className="demo-item">
                <strong>Employer</strong>
                <span>employer@demo.com</span>
                <span>password123</span>
              </div>
            </div>
          </div>

          <p className="auth-switch-link">
            Are you an employer? <Link to="/register/employer">Register your company →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
