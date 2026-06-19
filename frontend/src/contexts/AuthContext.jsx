import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const BACKEND_URL = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dashboard_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Set axios auth header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('dashboard_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('dashboard_token');
      setUser(null);
    }
  }, [token]);

  // Verify token and load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${BACKEND_URL}/profile`);
        setUser(response.data.user);
      } catch (error) {
        console.error('Failed to load user profile on mount:', error);
        // If token is invalid or expired, clear it
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/login`, { email, password });
      const { token: newToken, user: newUser } = response.data;
      setUser(newUser);
      setToken(newToken);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to login. Please try again.';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (fullName, email, password, confirmPassword) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/register`, {
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword
      });
      const { token: newToken, user: newUser } = response.data;
      setUser(newUser);
      setToken(newToken);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to register. Please try again.';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
