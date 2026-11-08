import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/entities/user";
import { LoadingState } from "@/shared/ui/StateViews";

interface FromState {
  from?: { pathname: string; search?: string };
}

/**
 * Страницы входа и регистрации только для гостей. Вошедшего пользователя отправляет туда,
 * откуда его перенаправили на /login (или в профиль). Поэтому после успешного входа
 * форма сама никуда не переходит: меняется состояние, и этот компонент делает редирект.
 */
export function GuestRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <LoadingState text="Проверяем вход…" />;
  if (status === "authenticated") {
    const from = (location.state as FromState | null)?.from;
    return <Navigate to={from ? `${from.pathname}${from.search ?? ""}` : "/profile"} replace />;
  }
  return <Outlet />;
}
