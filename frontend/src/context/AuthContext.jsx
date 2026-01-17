import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = AuthService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await AuthService.login(email, password);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password) => {
    // Note: Register usually doesn't auto-login if verification is needed, 
    // but if it does return a token/user, we set it.
    // Based on controller, it returns success message, not token immediately if verification needed.
    const data = await AuthService.register({ name, email, password });
    // If API ever changes to return token on register (optional)
    if (data.token && data.user) {
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);