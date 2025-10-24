
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, carbonAPI } from '../services/api';


const AuthContext = createContext();


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // Enhanced error handler
  const handleSecurityError = (error) => {
    console.error('Auth error:', error);
    
    if (error.message?.includes('Too many attempts') || error.message?.includes('429')) {
      throw new Error('Too many attempts. Please wait 15 minutes and try again.');
    }
    
    if (error.message?.includes('Password does not meet security requirements')) {
      if (error.details) {
        throw new Error(`Password requirements: ${error.details.join(', ')}`);
      }
      throw new Error('Password must be at least 8 characters with uppercase, lowercase letters and numbers');
    }
    
    if (error.message?.includes('too common')) {
      throw new Error('This password is too common. Please choose a stronger password.');
    }
    
    if (error.message?.includes('Token expired')) {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    if (error.message?.includes('Invalid token') || error.message?.includes('401') || error.message?.includes('403')) {
      throw new Error('Please log in again.');
    }
    
    throw new Error(error.message || 'An error occurred. Please try again.');
  };

  // Function to verify if token is still valid
  const verifyToken = async (token) => {
    try {
      await carbonAPI.getSummary();
      setTokenValid(true);
      return true;
    } catch (error) {
      console.log('Token verification failed:', error.message);
      if (error.message.includes('Invalid token') || error.message.includes('403') || error.message.includes('401') || error.message.includes('Token expired')) {
        logout();
      }
      setTokenValid(false);
      return false;
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('ecotrack_token');
      const userData = localStorage.getItem('ecotrack_user');
      
      if (token && userData) {
        const isValid = await verifyToken(token);
        if (isValid) {
          setUser({ ...JSON.parse(userData), token });
        } else {
          localStorage.removeItem('ecotrack_token');
          localStorage.removeItem('ecotrack_user');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    const handleFocus = async () => {
      const token = localStorage.getItem('ecotrack_token');
      if (token && user) {
        await verifyToken(token);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      localStorage.setItem('ecotrack_token', data.token);
      localStorage.setItem('ecotrack_user', JSON.stringify(data.user));
      setUser({ ...data.user, token: data.token });
      setTokenValid(true);
      return data;
    } catch (error) {
      handleSecurityError(error);
    }
  };

  const login = async (credentials) => {
    try {
      const data = await authAPI.login(credentials);
      localStorage.setItem('ecotrack_token', data.token);
      localStorage.setItem('ecotrack_user', JSON.stringify(data.user));
      setUser({ ...data.user, token: data.token });
      setTokenValid(true);
      return data;
    } catch (error) {
      handleSecurityError(error);
    }
  };

  const logout = () => {
    localStorage.removeItem('ecotrack_token');
    localStorage.removeItem('ecotrack_user');
    setUser(null);
    setTokenValid(false);
  };

  const checkTokenValidity = async () => {
    const token = localStorage.getItem('ecotrack_token');
    if (token) {
      return await verifyToken(token);
    }
    return false;
  };

  const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    const isValid = password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
    
    const feedback = [];
    if (password.length < minLength) feedback.push('at least 8 characters');
    if (!hasUpperCase) feedback.push('one uppercase letter');
    if (!hasLowerCase) feedback.push('one lowercase letter');
    if (!hasNumbers) feedback.push('one number');
    
    return {
      isValid,
      feedback: feedback.length > 0 ? `Must contain: ${feedback.join(', ')}` : ''
    };
  };

  const isCommonPassword = (password) => {
    const commonPasswords = [
      'password', '12345678', 'qwerty', 'letmein', 'welcome',
      'admin', 'password1', '123456789', '1234567', '123123'
    ];
    return commonPasswords.includes(password.toLowerCase());
  };

  const value = {
    user,
    register,
    login,
    logout,
    loading,
    isAuthenticated: !!user && tokenValid,
    tokenValid,
    checkTokenValidity,
    validatePasswordStrength,
    isCommonPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


export default AuthContext;