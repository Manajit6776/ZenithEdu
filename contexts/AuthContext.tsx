import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userService } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  isTeacher: () => boolean;
  isStudent: () => boolean;
  isLoading: boolean;
  updateUser: (data: Partial<User>) => void;
  loginWithSSO: (provider: 'Google' | 'Microsoft' | 'Institution') => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
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
    // Check for existing session on mount
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // For demo purposes, we'll use a simple authentication
      // In production, you'd have a proper authentication endpoint
      const users = await userService.getAllUsers();
      const foundUser = users.find(u => u.email === email);

      console.log('Login attempt:', { email, password, foundUser: foundUser?.email, role: foundUser?.role });

      if (foundUser) {
        // Simple password check (in production, use proper hashing)
        if ((password === 'admin123' && foundUser.role === 'Admin') ||
          (password === 'student123' && foundUser.role === 'Student') ||
          (password === 'teacher123' && foundUser.role === 'Teacher')) {
          setUser(foundUser);
          localStorage.setItem('currentUser', JSON.stringify(foundUser));
          console.log('Login successful for:', foundUser.email);
          return true;
        } else {
          console.log('Password mismatch for role:', foundUser.role);
        }
      } else {
        console.log('User not found:', email);
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const loginWithSSO = async (provider: 'Google' | 'Microsoft' | 'Institution'): Promise<boolean> => {
    try {
      // In a real app, this would redirect to OAuth provider
      // For demo, we auto-select a user based on the selected role
      const users = await userService.getAllUsers();
      let foundUser = null;

      if (provider === 'Google') {
        foundUser = users.find(u => u.role === 'Student');
      } else if (provider === 'Microsoft') {
        foundUser = users.find(u => u.role === 'Teacher');
      } else if (provider === 'Institution') {
        foundUser = users.find(u => u.role === 'Admin');
      }

      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('SSO Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const isAdmin = (): boolean => {
    return user?.role === 'Admin';
  };

  const isTeacher = (): boolean => {
    return user?.role === 'Teacher';
  };

  const isStudent = (): boolean => {
    return user?.role === 'Student';
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAdmin,
    isTeacher,
    isStudent,
    isLoading,
    updateUser: (data: Partial<User>) => {
      if (user) {
        const updated = { ...user, ...data };
        setUser(updated);
        localStorage.setItem('currentUser', JSON.stringify(updated));
      }
    },
    loginWithSSO
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
