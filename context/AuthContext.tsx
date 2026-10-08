"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  avatarName: string;
  trophies: number;
  level: number;
  role: string;
  isOnline: boolean;
  bannerPattern?: string;
  description?: string;
  token?: string;
  isGroup?: boolean;
  clan?: any;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  signup: (userData: any) => Promise<void>;
  login: (credentials: any) => Promise<void>;
  updateUser: (updatedUser: Partial<UserProfile>) => void;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('coc_token');
      const storedUser = localStorage.getItem('coc_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
          // Validate with server
          const me = await authApi.getMe();
          setUser(me);
          localStorage.setItem('coc_user', JSON.stringify(me));
        } catch (err) {
          console.warn('[Auth Check Warning] Token expired or invalid, logging out.');
          localStorage.removeItem('coc_token');
          localStorage.removeItem('coc_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signup = async (userData: any) => {
    setError(null);
    try {
      const data = await authApi.signup(userData);
      setUser(data);
      setToken(data.token);
      localStorage.setItem('coc_token', data.token);
      localStorage.setItem('coc_user', JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const login = async (credentials: any) => {
    setError(null);
    try {
      const data = await authApi.login(credentials);
      setUser(data);
      setToken(data.token);
      localStorage.setItem('coc_token', data.token);
      localStorage.setItem('coc_user', JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const updateUser = (updatedData: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const newProfile = { ...prev, ...updatedData };
      localStorage.setItem('coc_user', JSON.stringify(newProfile));
      return newProfile;
    });
  };

  const logout = () => {
    localStorage.removeItem('coc_token');
    localStorage.removeItem('coc_user');
    setUser(null);
    setToken(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        signup,
        login,
        updateUser,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
