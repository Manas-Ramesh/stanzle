import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  apiFetch,
  AUTH_TOKEN_KEY,
  getAuthToken,
  USER_STORAGE_KEY,
} from "@/lib/api";

export type AuthUser = {
  username: string;
  email: string;
  created_at?: string;
  games_played?: number;
  total_score?: number;
  best_score?: number;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setLocalUser: (u: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function persistSession(token: string, user: AuthUser) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const res = await apiFetch<{ success: boolean; user?: AuthUser }>("/api/auth/verify", {
        method: "GET",
      });
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      } else {
        clearSession();
        setUser(null);
      }
    } catch {
      clearSession();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw) as AuthUser);
      } catch {
        /* ignore */
      }
    }
    void refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiFetch<{
      success: boolean;
      token?: string;
      user?: AuthUser;
      message?: string;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (!res.success || !res.token || !res.user) {
      throw new Error(res.message || "Login failed");
    }
    persistSession(res.token, res.user);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const reg = await apiFetch<{ success: boolean; message?: string }>(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({ username, email, password }),
        },
      );
      if (!reg.success) {
        throw new Error(reg.message || "Registration failed");
      }
      await login(username, password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    const token = getAuthToken();
    if (token) {
      try {
        await apiFetch("/api/auth/logout", { method: "POST" });
      } catch {
        /* still clear locally */
      }
    }
    clearSession();
    setUser(null);
  }, []);

  const setLocalUser = useCallback((u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      refreshUser,
      login,
      register,
      logout,
      setLocalUser,
    }),
    [user, loading, refreshUser, login, register, logout, setLocalUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
