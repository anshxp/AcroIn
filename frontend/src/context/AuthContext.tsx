import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, StudentRegisterData, FacultyRegisterData } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: StudentRegisterData | FacultyRegisterData, userType: 'student' | 'faculty') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

interface AuthProviderProps { children: ReactNode; }

// Recover the authenticated User._id from an existing JWT so older localStorage
// sessions can use chat/notification APIs without forcing a fresh login.
const getAuthUserIdFromToken = (token: string): string | undefined => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return undefined;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(window.atob(normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '=')));
    return typeof decoded?.id === 'string' ? decoded.id : undefined;
  } catch {
    return undefined;
  }
};

const buildUserData = (responseUser: any, fallbackUserType?: User['userType']): User => {
  const resolvedUserType = (responseUser?.userType || fallbackUserType) as User['userType'];
  const resolvedName = responseUser?.name
    || `${responseUser?.firstname || ''} ${responseUser?.lastName || ''}`.trim()
    || 'User';

  return {
    // Keep the profile id for student/faculty profile routes.
    id: responseUser?._id,
    // Keep the auth User._id separately for chats, notifications and JWT-owned APIs.
    authUserId: responseUser?.authUserId || responseUser?._id,
    email: responseUser?.email,
    name: resolvedName,
    userType: resolvedUserType,
    role: responseUser?.role,
    firstname: responseUser?.firstname,
    lastName: responseUser?.lastName,
    department: responseUser?.department,
    designation: responseUser?.designation,
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        // Migrate sessions created before authUserId was stored.
        if (!parsedUser.authUserId) {
          const authUserId = getAuthUserIdFromToken(token);
          if (authUserId) {
            parsedUser.authUserId = authUserId;
            localStorage.setItem('user', JSON.stringify(parsedUser));
          }
        }
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(credentials);
      if (!response.success || !response.token || !response.user) {
        throw new Error(response.message || 'Login failed');
      }
      const userData = buildUserData(response.user);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
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

      if (!response.success || !response.token || !response.user) {
        throw new Error(response.message || 'Registration failed');
      }

      const userData = buildUserData(response.user, userType);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    try { authAPI.logout(); } catch { /* ignore */ }
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
