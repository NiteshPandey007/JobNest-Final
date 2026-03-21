// ============================================
// context/AuthContext.js
// ============================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// ✅ Render Backend URL - Hardcoded
const API_BASE = 'https://jobnest-final-backend.onrender.com/api';

axios.defaults.baseURL = API_BASE;

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('jobportal_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isAuthenticated: !!user,
      isJobSeeker: user?.role === 'jobseeker',
      isEmployer:  user?.role === 'employer',
      isAdmin:     user?.role === 'admin',
      registerJobSeeker, registerEmployer,
      login, logout, updateUser, fetchCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
```

---

## Commit Karo:
```
Commit message: "Fix API URL to Render backend"
→ Commit changes ✅
```

---

## Phir Redeploy Karo:
```
Render/Firebase/Vercel
→ Redeploy
→ 2-3 minute wait
→ Login karo ✅
