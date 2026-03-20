// ============================================
// App.js - Main App with All Routes
// ============================================
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';

// Layout components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterEmployerPage from './pages/RegisterEmployerPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import UserDashboard from './pages/UserDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import PostJobPage from './pages/PostJobPage';
import EditJobPage from './pages/EditJobPage';
import SavedJobsPage from './pages/SavedJobsPage';
import NotFoundPage from './pages/NotFoundPage';

// ============================================
// Protected Route — redirects if not authenticated
// ============================================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check them
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ============================================
// App Routes
// ============================================
const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* === PUBLIC ROUTES === */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/employer" element={<RegisterEmployerPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />

          {/* === JOB SEEKER ROUTES === */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['jobseeker']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['jobseeker', 'employer', 'admin']}>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/saved-jobs" element={
            <ProtectedRoute allowedRoles={['jobseeker']}>
              <SavedJobsPage />
            </ProtectedRoute>
          } />

          {/* === EMPLOYER ROUTES === */}
          <Route path="/employer/dashboard" element={
            <ProtectedRoute allowedRoles={['employer']}>
              <EmployerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/employer/post-job" element={
            <ProtectedRoute allowedRoles={['employer']}>
              <PostJobPage />
            </ProtectedRoute>
          } />
          <Route path="/employer/edit-job/:id" element={
            <ProtectedRoute allowedRoles={['employer']}>
              <EditJobPage />
            </ProtectedRoute>
          } />

          {/* === ADMIN ROUTES === */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* === 404 === */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

// ============================================
// Root App component
// ============================================
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        {/* Toast notification container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
