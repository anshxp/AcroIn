import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials, userType) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(credentials);
      if (response.success && response.token && response.user) {
        const inferredType = response.user.userType || userType;
        const userData = {
          id: response.user._id,
          email: response.user.email,
          name: response.user.name || `${response.user.firstname || ''} ${response.user.lastName || ''}`.trim(),
          userType: inferredType,
          role: response.user.role,
          firstname: response.user.firstname,
          lastName: response.user.lastName,
          department: response.user.department,
          designation: response.user.designation,
        };
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data, userType) => {
    setIsLoading(true);
    try {
      const response = userType === 'student'
        ? await authAPI.studentRegister(data)
        : await authAPI.facultyRegister(data);
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }

      // Backend register endpoints return success/message only, so login immediately.
      await login({ email: data.email, password: data.password }, userType);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    try {
      authAPI.logout();
    } catch (e) {}
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
