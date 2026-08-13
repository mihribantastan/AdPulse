import { useEffect, useState, type ReactNode } from 'react';
import { AuthContext, type AuthUser } from './auth-context';
import { authApi, clearToken, getToken, setToken } from '../lib/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    authApi.me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { user, token } = await authApi.login(email, password);
    setToken(token);
    setUser(user);
  };

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    const { user, token } = await authApi.register(name, email, password, passwordConfirmation);
    setToken(token);
    setUser(user);
  };

  const loginWithGoogle = () => {
    window.location.href = authApi.googleLoginUrl();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearToken();
      setUser(null);
    }
  };

  const refresh = async () => {
    const me = await authApi.me();
    setUser(me);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
