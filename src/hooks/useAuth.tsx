import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await api.me();
      setUser(data.user);
    } catch (err) {
      setUser(null);
      api.clearToken();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (api.getToken()) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: any) => {
    const data = await api.login(credentials);
    setUser(data.user);
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
