import React, { createContext, useContext, useState } from 'react';

interface User {
  userId: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  apiFetch: (path: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const API_BASE_URL = 'http://43.200.59.30';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [user, setUser] = useState<User | null>(
    localStorage.getItem('admin_user') ? JSON.parse(localStorage.getItem('admin_user')!) : null
  );

  const isAuthenticated = !!token;

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('admin_token', newToken);
    localStorage.setItem('admin_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  };

  const apiFetch = async (path: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 403 || response.status === 401) {
      logout();
      throw new Error('인증이 만료되었습니다. 다시 로그인해 주세요.');
    }

    const data = await response.json();
    if (!data.isSuccess) {
      throw new Error(data.message || '요청이 실패하였습니다.');
    }
    return data.result;
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout, apiFetch }}>
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
