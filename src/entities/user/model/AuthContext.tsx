import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError, onSessionExpired, refreshSession } from "@/shared/api/http";
import { tokenStore } from "@/shared/api/tokenStore";
import { authApi } from "../api/authApi";
import { toUser } from "../api/userApi";
import type { RegisterData, User } from "./types";

/** loading — проверяем сохранённую сессию при запуске; authenticated / anonymous — итог. */
export type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  /** Обновляет данные пользователя в состоянии (например, после редактирования профиля). */
  applyUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Хранит текущего пользователя и состояние входа для всего приложения. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStore.getRefresh() ? "loading" : "anonymous"));

  // refresh token истёк или отозван (в том числе в другой вкладке) — возвращаем приложение в «гостя»
  useEffect(
    () =>
      onSessionExpired(() => {
        setUser(null);
        setStatus("anonymous");
      }),
    [],
  );

  // восстановление сессии после перезагрузки страницы: refresh token → новый access token → профиль
  useEffect(() => {
    if (!tokenStore.getRefresh()) return;
    let cancelled = false;

    (async () => {
      try {
        if (!(await refreshSession())) throw new ApiError(401, "Сессия недействительна");
        const me = toUser(await authApi.me());
        if (!cancelled) {
          setUser(me);
          setStatus("authenticated");
        }
      } catch {
        if (!cancelled) setStatus("anonymous");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    tokenStore.set(res.access_token, res.refresh_token);
    setUser(toUser(res.user));
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await authApi.register(data);
    tokenStore.set(res.access_token, res.refresh_token);
    setUser(toUser(res.user));
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.getRefresh();
    // сначала очищаем состояние на клиенте — интерфейс «разлогинивается» сразу
    tokenStore.clear();
    setUser(null);
    setStatus("anonymous");
    // затем просим сервер отозвать refresh token сессии (если связи нет — локальный выход всё равно выполнен)
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // сервер недоступен: токен остался только на сервере и истечёт сам
      }
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout, applyUser: setUser }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth нужно вызывать внутри <AuthProvider>");
  return context;
}
