import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE = 'https://jobnest-final-backend.onrender.com/api';

axios.defaults.baseURL = API_BASE;
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('jobportal_token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jobportal_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
      axios.defaults.baseURL = API_BASE;
      localStorage.setItem('jobportal_token', token);
      fetchCurrentUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('jobportal_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      axios.defaults.baseURL = API_BASE;
      const res = await axios.get('/auth/me');
      setUser(res.data.user);
    } catch (error) {
      console.error('Token validation failed:', error);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const registerJobSeeker = async (formData) => {
    axios.defaults.baseURL = API_BASE;
    const res = await axios.post('/auth/register', formData);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const registerEmployer = async (formData) => {
    axios.defaults.baseURL = API_BASE;
    const res = await axios.post('/auth/register/employer', formData);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const login = async (email, password) => {
    axios.defaults.baseURL = API_BASE;
    const res = await axios.post('/auth/login', { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jobportal_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedUser) => {
    setUser(function(prev) { return Object.assign({}, prev, updatedUser); });
  };

  return (
    <AuthContext.Provider value={{
      user: user,
      token: token,
      loading: loading,
      isAuthenticated: !!user,
      isJobSeeker: user ? user.role === 'jobseeker' : false,
      isEmployer: user ? user.role === 'employer' : false,
      isAdmin: user ? user.role === 'admin' : false,
      registerJobSeeker: registerJobSeeker,
      registerEmployer: registerEmployer,
      login: login,
      logout: logout,
      updateUser: updateUser,
      fetchCurrentUser: fetchCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
