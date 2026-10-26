import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { request, type AuthResponse, type User } from '@/lib/api';
import { clearToken, getToken, saveToken } from '@/lib/token-storage';

type AuthContextValue = {
  user: User | null;
  loading: boolean; // true while we check for a saved login on startup
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // On startup: if a token was saved last time, ask the backend who it belongs to.
  useEffect(() => {
    (async () => {
      try {
        const saved = await getToken();
        if (saved) {
          setUser(await request<User>('/api/auth/me', { token: saved }));
          setToken(saved);
        }
      } catch {
        await clearToken(); // expired or invalid (or backend unreachable): start logged out
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const finishLogin = useCallback(async (response: AuthResponse) => {
    await saveToken(response.token);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) =>
      finishLogin(await request<AuthResponse>('/api/auth/login', { method: 'POST', body: { email, password } })),
    [finishLogin],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) =>
      finishLogin(await request<AuthResponse>('/api/auth/register', { method: 'POST', body: { name, email, password } })),
    [finishLogin],
  );

  const logout = useCallback(async () => {
    // Tell the server to forget the token, but log out locally even if that call fails.
    await request('/api/auth/logout', { method: 'POST', token }).catch(() => {});
    await clearToken();
    setToken(null);
    setUser(null);
  }, [token]);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
