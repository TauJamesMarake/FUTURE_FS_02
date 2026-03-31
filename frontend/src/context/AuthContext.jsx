import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Default value matches the shape of the real value so destructuring
// never throws even if a component calls useAuth() outside the provider.
const AuthContext = createContext({
  admin:   null,
  loading: true,
  login:   async () => {},
  logout:  () => {},
});

export const AuthProvider = ({ children }) => {
  const [admin,   setAdmin]   = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    const saved = localStorage.getItem('crm_admin');
    if (token && saved) {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setAdmin(JSON.parse(saved));
      } catch {
        // Corrupted storage, clear and start fresh
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_admin');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token, admin: adminData } = data;

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

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};