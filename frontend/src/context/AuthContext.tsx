import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { authApi, userApi, tokenStore } from '@/lib/api';
import type { User, TokenPair } from '@/types/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  acceptTokens: (tokens: TokenPair) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!tokenStore.getAccess()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await userApi.me();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    const onExpired = () => {
      tokenStore.clear();
      setUser(null);
    };
    window.addEventListener('sf:session-expired', onExpired);
    return () => window.removeEventListener('sf:session-expired', onExpired);
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await authApi.login(email, password);
    tokenStore.set(tokens);
    const u = await userApi.me();
    setUser(u);
  }, []);

  // Used after verify-email, which also returns a token pair
  const acceptTokens = useCallback(async (tokens: TokenPair) => {
    tokenStore.set(tokens);
    const u = await userApi.me();
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, acceptTokens, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
