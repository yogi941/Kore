import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('kct_user')); } catch { return null; }
  })();

  const [user, setUser] = useState(storedUser);
  const [token, setToken] = useState(() => localStorage.getItem('kct_token') || null);
  const [loading, setLoading] = useState(!!localStorage.getItem('kct_token'));

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('kct_user');
    localStorage.removeItem('kct_token');
  }, []);

  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('kct_user', JSON.stringify(userData));
    localStorage.setItem('kct_token', authToken);
  }, []);

  useEffect(() => {
    // Only verify if we have a token
    const storedToken = localStorage.getItem('kct_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    axiosInstance.get('/auth/me')
      .then(({ data }) => {
        setUser(data.data);
        localStorage.setItem('kct_user', JSON.stringify(data.data));
      })
      .catch(() => {
        // Token invalid or expired — clear everything
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
