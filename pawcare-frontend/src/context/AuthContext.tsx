import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; password_confirm: string; first_name?: string; last_name?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pawcare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pawcare_access_token');
    if (token) {
      authApi.getMe()
        .then((fetchedUser) => {
          setUser(fetchedUser);
          localStorage.setItem('pawcare_user', JSON.stringify(fetchedUser));
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem('pawcare_user');
          localStorage.removeItem('pawcare_access_token');
          localStorage.removeItem('pawcare_refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('pawcare_access_token', res.access);
    localStorage.setItem('pawcare_refresh_token', res.refresh);
    localStorage.setItem('pawcare_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const register = async (data: { email: string; password: string; password_confirm: string; first_name?: string; last_name?: string }) => {
    const res = await authApi.register(data);
    localStorage.setItem('pawcare_access_token', res.access);
    localStorage.setItem('pawcare_refresh_token', res.refresh);
    localStorage.setItem('pawcare_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = async () => {
    const refresh = localStorage.getItem('pawcare_refresh_token') || undefined;
    await authApi.logout(refresh);
    localStorage.removeItem('pawcare_access_token');
    localStorage.removeItem('pawcare_refresh_token');
    localStorage.removeItem('pawcare_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
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
