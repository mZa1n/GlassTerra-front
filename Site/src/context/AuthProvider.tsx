import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, messageFor, type Credentials, type RegisterInput } from "@/api";
import { getToken, onTokenExpired, setToken } from "@/api/tokens";
import type { User } from "@/lib/types";

export type AuthResult = { ok: true } | { ok: false; error: string };

interface AuthContextValue {
  user: User | null;
  /** True while the stored token is being exchanged for a profile on boot. */
  isRestoring: boolean;
  login: (credentials: Credentials) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<Omit<User, "id" | "email">>) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setRestoring] = useState(() => getToken() !== null);

  // Restore the session from the stored token on first mount.
  useEffect(() => {
    if (!getToken()) return;

    const controller = new AbortController();
    let cancelled = false;

    api.auth
      .me(controller.signal)
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch(() => {
        if (!cancelled) setToken(null);
      })
      .finally(() => {
        if (!cancelled) setRestoring(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // A 401 anywhere in the app drops the session here.
  useEffect(() => {
    onTokenExpired(() => setUser(null));
    return () => onTokenExpired(null);
  }, []);

  const login = useCallback(async (credentials: Credentials): Promise<AuthResult> => {
    try {
      const session = await api.auth.login(credentials);
      setToken(session.token);
      setUser(session.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: messageFor(error) };
    }
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<AuthResult> => {
    try {
      const session = await api.auth.register(input);
      setToken(session.token);
      setUser(session.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: messageFor(error) };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  const updateUser = useCallback(
    async (patch: Partial<Omit<User, "id" | "email">>): Promise<AuthResult> => {
      try {
        setUser(await api.auth.updateProfile(patch));
        return { ok: true };
      } catch (error) {
        return { ok: false, error: messageFor(error) };
      }
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, isRestoring, login, register, logout, updateUser }),
    [user, isRestoring, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within <AuthProvider>");
  return context;
}
