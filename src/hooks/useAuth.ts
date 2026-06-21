import { useState, useEffect, useCallback, useRef } from 'react';
import { authApi, getAccessToken, clearAccessToken } from '@/services/api';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkAuth = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await authApi.me();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const onLogout = () => {
      setUser(null);
      clearAccessToken();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    window.addEventListener('auth:logout', onLogout);

    return () => {
      window.removeEventListener('auth:logout', onLogout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    authApi.setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const data = await authApi.register(email, password);
    authApi.setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearAccessToken();
    setUser(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
    window.dispatchEvent(new Event('auth:logout'));
  }, []);

  return { user, isLoading, isLoggedIn: !!user, login, register, logout, checkAuth };
}
