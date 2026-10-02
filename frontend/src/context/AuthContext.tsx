import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi, LoginPayload, RegisterPayload } from '../api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore user session from localStorage if available
    try {
      const storedUser = localStorage.getItem('diagno_user');
      const token = localStorage.getItem('diagno_access_token');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem('diagno_user');
      localStorage.removeItem('diagno_access_token');
    } finally {
      setLoading(false);
    }

    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  const login = async (payload: LoginPayload) => {
    const data = await authApi.login(payload);
    localStorage.setItem('diagno_access_token', data.access);
    localStorage.setItem('diagno_refresh_token', data.refresh);
    localStorage.setItem('diagno_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (payload: RegisterPayload) => {
    await authApi.register(payload);
    // After registration, automatically login or let user login
  };

  const logout = () => {
    localStorage.removeItem('diagno_access_token');
    localStorage.removeItem('diagno_refresh_token');
    localStorage.removeItem('diagno_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isStaff: !!user?.is_staff,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
