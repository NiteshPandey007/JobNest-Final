// ============================================
// pages/ProfilePage.js
// ============================================
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiMapPin, FiUpload, FiSave } from 'react-icons/fi';
import { usersAPI, BACKEND_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import './Dashboard.css';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser, isJobSeeker } = useAuth();
  const [loading, setLoading]     = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  const [formData, setFormData] = useState({
    name:       user?.name || '',
    phone:      user?.phone || '',
    location:   user?.location || '',
    bio:        user?.bio || '',
    skills:     user?.skills?.join(', ') || '',
    experience: user?.experience || 'fresher',
    education:  user?.education || '',
  });

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        skills: formData.skills
          ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      };
      const res = await usersAPI.updateProfile(payload);
      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) { toast.error('Please select a file first'); return; }
    setResumeLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const res = await usersAPI.uploadResume(formData);
      updateUser({ resume: res.data.resume, resumeOriginalName: res.data.resumeOriginalName });
      toast.success('Resume uploaded!');
      setResumeFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setResumeLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-layout">
          <DashboardSidebar />
          <main className="dashboard-main">

            {/* Profile Header */}
            <div className="profile-header-card">
              <div className="profile-avatar-large">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h1 className="profile-name">{user?.name}</h1>
                <p className="profile-email"><FiMail style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />{user?.email}</p>
                <span className="badge badge-primary" style={{ textTransform: 'capitalize', marginTop: '0.5rem' }}>
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleProfileUpdate} className="dashboard-card">
              <div className="card-header-row">
                <h2>Personal Information</h2>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-icon-wrapper">
                    <FiUser className="input-icon" />
                    <input type="text" name="name" className="form-control input-with-icon"
                      value={formData.name} onChange={handleChange} placeholder="Your name" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <div className="input-icon-wrapper">
                    <FiPhone className="input-icon" />
                    <input type="tel" name="phone" className="form-control input-with-icon"
                      value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <div className="input-icon-wrapper">
                  <FiMapPin className="input-icon" />
                  <input type="text" name="location" className="form-control input-with-icon"
                    value={formData.location} onChange={handleChange} placeholder="City, State" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea name="bio" className="form-control" rows="3"
                  value={formData.bio} onChange={handleChange}
                  placeholder="A short bio about yourself..." maxLength={500} />
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>{formData.bio.length}/500</p>
              </div>

              {isJobSeeker && (
                <>
                  <div className="form-group">
                    <label className="form-label">Skills</label>
                    <input type="text" name="skills" className="form-control"
                      value={formData.skills} onChange={handleChange}
                      placeholder="React, Node.js, Python... (comma-separated)" />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Experience Level</label>
                      <select name="experience" className="form-control" value={formData.experience} onChange={handleChange}>
                        {['fresher', '1-2 years', '3-5 years', '5+ years', '10+ years'].map(e => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Education</label>
                      <input type="text" name="education" className="form-control"
                        value={formData.education} onChange={handleChange}
                        placeholder="e.g. BS Computer Science" />
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner spinner-sm" /> Saving...</> : <><FiSave /> Save Changes</>}
                </button>
              </div>
            </form>

            {/* Resume Section — job seekers only */}
            {isJobSeeker && (
              <div className="dashboard-card">
                <div className="card-header-row">
                  <h2>Resume</h2>
                </div>

                {user?.resume && (
                  <div className="current-resume-display">
                    <div className="resume-file-icon">📄</div>
                    <div>
                      <p className="resume-file-name">{user.resumeOriginalName || 'My Resume'}</p>
                      <a
                        href={`${BACKEND_URL}/uploads/resumes/${user.resume}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resume-view-link"
                      >
                        View Current Resume →
                      </a>
                    </div>
                  </div>
                )}

                <div className="resume-upload-section">
                  <label className="file-upload-area-profile">
                    <FiUpload size={24} />
                    <span>{resumeFile ? resumeFile.name : 'Click to select resume (PDF, DOC, DOCX — max 5MB)'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      onChange={e => setResumeFile(e.target.files[0])}
                    />
                  </label>

                  {resumeFile && (
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setResumeFile(null)}>Cancel</button>
                      <button type="button" className="btn btn-primary" onClick={handleResumeUpload} disabled={resumeLoading}>
                        {resumeLoading ? <><span className="spinner spinner-sm" /> Uploading...</> : <><FiUpload /> Upload Resume</>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
