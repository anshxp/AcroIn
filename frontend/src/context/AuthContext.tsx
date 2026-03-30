import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, StudentRegisterData, FacultyRegisterData } from '../types';

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

// eslint-disable-next-line react-refresh/only-export-components
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

  // Apollo Client-based login mutation placeholder
  const login = async (credentials: LoginCredentials, userType: 'student' | 'faculty' | 'admin') => {
    setIsLoading(true);
    try {
      // TODO: Replace with Apollo Client mutation for login
      // Example: const { data } = await apolloClient.mutate({ mutation: LOGIN_MUTATION, variables: { ... } });
      // Create a mock User object with required fields
      const mockUser: User = {
        id: 'mock-id',
        name: credentials.email.split('@')[0],
        email: credentials.email,
        userType,
        // Add other required User fields as needed
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock-token');
    } finally {
      setIsLoading(false);
    }
  };

  // Apollo Client-based register mutation placeholder
  const register = async (data: StudentRegisterData | FacultyRegisterData, userType: 'student' | 'faculty') => {
    console.log('Register attempt:', data, userType);
    setIsLoading(true);
    try {
      // TODO: Replace with Apollo Client mutation for register
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
      // TODO: Replace with Apollo Client logout logic
      // Example: await apolloClient.mutate({ mutation: LOGOUT_MUTATION });
    } catch {
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
