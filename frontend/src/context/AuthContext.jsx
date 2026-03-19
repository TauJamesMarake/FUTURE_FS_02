import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    const saved = localStorage.getItem('crm_admin');
    if (token && saved) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAdmin(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token, admin: adminData } = data;

    // Persist session
    localStorage.setItem('crm_token', token);
    localStorage.setItem('crm_admin', JSON.stringify(adminData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAdmin(adminData);
    return adminData;
  };

  const logout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_admin');
    delete api.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
