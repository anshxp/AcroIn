import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, StudentRegisterData, FacultyRegisterData } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials, userType: 'student' | 'faculty' | 'admin') => Promise<void>;
  register: (data: StudentRegisterData | FacultyRegisterData, userType: 'student' | 'faculty') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
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

  const login = async (credentials: LoginCredentials, userType: 'student' | 'faculty' | 'admin') => {
    setIsLoading(true);
    try {
      // For admin, use faculty login endpoint
      const loginType = userType === 'admin' ? 'faculty' : userType;
      const response = loginType === 'student' 
        ? await authAPI.studentLogin(credentials)
        : await authAPI.facultyLogin(credentials);

      if (response.success && response.token && response.user) {
        const userData: User = {
          id: response.user._id,
          email: response.user.email,
          name: loginType === 'student' 
            ? (response.user as any).name 
            : `${(response.user as any).firstname} ${(response.user as any).lastName}`,
          userType,
          role: loginType === 'faculty' ? (response.user as any).role : undefined,
          firstname: loginType === 'faculty' ? (response.user as any).firstname : undefined,
          lastName: loginType === 'faculty' ? (response.user as any).lastName : undefined,
          department: (response.user as any).department,
          designation: loginType === 'faculty' ? (response.user as any).designation : undefined,
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

  const register = async (data: StudentRegisterData | FacultyRegisterData, userType: 'student' | 'faculty') => {
    setIsLoading(true);
    try {
      const response = userType === 'student'
        ? await authAPI.studentRegister(data as StudentRegisterData)
        : await authAPI.facultyRegister(data as FacultyRegisterData);

      if (response.success && response.token && response.user) {
        const userData: User = {
          id: response.user._id,
          email: response.user.email,
          name: userType === 'student'
            ? (response.user as any).name
            : `${(response.user as any).firstname} ${(response.user as any).lastName}`,
          userType,
          role: userType === 'faculty' ? (response.user as any).role : undefined,
        };

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear all auth data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Also call API logout
    try {
      authAPI.logout();
    } catch (e) {
      // ignore
    }

    // Reset user state
    setUser(null);

    // Force navigation to landing page
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
