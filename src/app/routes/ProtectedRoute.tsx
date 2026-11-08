import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/entities/user";
import { LoadingState } from "@/shared/ui/StateViews";

/**
 * Охрана приватных страниц. Пока проверяется сохранённая сессия — показывает загрузку,
 * гостя отправляет на /login и запоминает, куда он шёл, чтобы вернуть после входа.
 */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <LoadingState text="Проверяем вход…" />;
  if (status === "anonymous") return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
