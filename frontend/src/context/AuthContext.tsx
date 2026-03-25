import React, { createContext, useContext, useState, useCallback } from 'react';
import { STATIC_USER } from '@/lib/staticData';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  labId?: string;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

function getInitialUser(): User | null {
  const loggedOut = sessionStorage.getItem('logged_out');
  if (loggedOut === 'true') return null;
  return STATIC_USER as User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);

  const login = useCallback(async (_email: string, _password: string) => {
    sessionStorage.removeItem('logged_out');
    setUser(STATIC_USER as User);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.setItem('logged_out', 'true');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading: false, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
