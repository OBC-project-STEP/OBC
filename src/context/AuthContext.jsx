import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, getStoredToken, setStoredToken } from "../api/client";

const AuthContext = createContext(null);

const AUTH_RETRY_ATTEMPTS = 8;
const AUTH_RETRY_DELAY_MS = 750;

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    for (let attempt = 0; attempt < AUTH_RETRY_ATTEMPTS; attempt += 1) {
      try {
        const data = await apiGet("/auth/me");
        setUser(data.user);
        setLoading(false);
        return;
      } catch (err) {
        if (err?.status === 401) {
          setStoredToken(null);
          setUser(null);
          setLoading(false);
          return;
        }

        const canRetry =
          err?.isNetworkError && attempt < AUTH_RETRY_ATTEMPTS - 1;
        if (!canRetry) {
          // Токен зберігаємо — після перезапуску бекенду сесія відновиться
          setLoading(false);
          return;
        }
        await wait(AUTH_RETRY_DELAY_MS);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email, password) => {
    const data = await apiPost("/auth/login", { email, password }, { useAuth: false });
    setStoredToken(data.access_token);
    try {
      const me = await apiGet("/auth/me");
      setUser(me.user);
    } catch {
      setUser(data.user);
    }
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await apiPost("/auth/register", payload, { useAuth: false });
    setStoredToken(data.access_token);
    try {
      const me = await apiGet("/auth/me");
      setUser(me.user);
    } catch {
      setUser(data.user);
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
