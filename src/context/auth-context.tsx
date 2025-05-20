'use client';

import type { User } from '@/types';
import { login as apiLogin, logout as apiLogout, getAuthToken, getStoredUser } from '@/lib/auth';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuthStatus = useCallback(() => {
    setIsLoading(true);
    const token = getAuthToken();
    const storedUser = getStoredUser();
    if (token && storedUser) {
      setUser(storedUser);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuthStatus();
    // Listen to storage changes to sync across tabs
    window.addEventListener('storage', checkAuthStatus);
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, [checkAuthStatus]);

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    const loggedInUser = await apiLogin(email);
    if (loggedInUser) {
      setUser(loggedInUser);
      setIsLoading(false);
      return true;
    }
    setUser(null);
    setIsLoading(false);
    return false;
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    await apiLogout();
    setUser(null);
    setIsLoading(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
