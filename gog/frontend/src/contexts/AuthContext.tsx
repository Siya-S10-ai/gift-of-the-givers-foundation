import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../types';
import { authAPI } from '../services/api';

const OFFLINE_TOKEN_PREFIX = 'FAKE-';
const OFFLINE_USER_TEMPLATE: User = {
  userId: 'offline-user',
  name: 'Siyabonga',
  surname: 'Nhlapo',
  username: 'Siya',
  email: 'offline@example.com',
  phone: '0712345678',
  role: 'Volunteer',
};

const createOfflineUser = (): User => ({ ...OFFLINE_USER_TEMPLATE });
const isOfflineToken = (token?: string | null): boolean =>
  (token ?? '').startsWith(OFFLINE_TOKEN_PREFIX);

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        if (isOfflineToken(storedToken)) {
          setUser(createOfflineUser());
          setToken(storedToken);
          return;
        }

        const userData = await authAPI.getProfile();
        setUser(userData);
        setToken(storedToken);
      } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response: AuthResponse = await authAPI.login(data);
      localStorage.setItem('token', response.token);
      setToken(response.token);

      if (isOfflineToken(response.token)) {
        setUser(createOfflineUser());
        return;
      }

      const userData = await authAPI.getProfile();
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response: AuthResponse = await authAPI.register(data);
      localStorage.setItem('token', response.token);
      setToken(response.token);
      
      // Fetch user profile
      const userData = await authAPI.getProfile();
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authAPI.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
