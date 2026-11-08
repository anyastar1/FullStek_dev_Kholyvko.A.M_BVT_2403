import { API_URL } from "@/shared/config/env";
import { tokenStore } from "./tokenStore";

/** Ошибка запроса к API: status = 0, если сервер недоступен. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** false — запрос без токена (вход, регистрация, выход) */
  auth?: boolean;
}

interface TokenPairDto {
  access_token: string;
  refresh_token: string;
}

// ---------- Уведомление приложения о потере сессии ----------

const expiredListeners = new Set<() => void>();

/** Подписка на «сессия закончилась» (refresh token истёк или отозван). Возвращает функцию отписки. */
export function onSessionExpired(listener: () => void): () => void {
  expiredListeners.add(listener);
  return () => {
    expiredListeners.delete(listener);
  };
}

function expireSession(): void {
  tokenStore.clear();
  expiredListeners.forEach((listener) => listener());
}

// ---------- Низкий уровень ----------

async function errorFromResponse(res: Response): Promise<ApiError> {
  let message = `Ошибка сервера (${res.status})`;
  try {
    const data: unknown = await res.json();
    const detail = (data as { detail?: unknown }).detail;
    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail)) {
      // ошибки валидации FastAPI: [{ msg: "Value error, ..." }, ...]
      const texts = detail
        .map((item) => String((item as { msg?: unknown }).msg ?? "").replace(/^Value error, /, ""))
        .filter(Boolean);
      message = texts.join("; ") || "Некорректные данные";
    }
  } catch {
    // тело ответа не JSON — оставляем сообщение по умолчанию
  }
  return new ApiError(res.status, message);
}

async function send(path: string, method: string, body: unknown, accessToken: string | null): Promise<Response> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  try {
    return await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Не удалось связаться с сервером. Проверьте, что backend запущен.");
  }
}

// ---------- Обновление access token ----------

let refreshing: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;

  const res = await send("/auth/refresh", "POST", { refresh_token: refreshToken }, null);
  if (res.ok) {
    const pair = (await res.json()) as TokenPairDto;
    tokenStore.set(pair.access_token, pair.refresh_token);
    return true;
  }
  if (res.status === 401 || res.status === 422) {
    expireSession(); // токен просрочен, отозван или повреждён — нужно войти заново
    return false;
  }
  throw await errorFromResponse(res); // сбой сервера: сессию не трогаем, можно повторить позже
}

/**
 * Меняет refresh token на новую пару токенов. Одновременные вызовы делят один запрос:
 * refresh token одноразовый, и второй параллельный запрос с ним был бы отклонён.
 */
export function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

// ---------- Основной метод ----------

/** Запрос к API. При 401 один раз обновляет access token и повторяет запрос. */
export async function request<T>(path: string, { method = "GET", body, auth = true }: RequestOptions = {}): Promise<T> {
  let res = await send(path, method, body, auth ? tokenStore.getAccess() : null);

  if (auth && res.status === 401 && tokenStore.getRefresh()) {
    if (await refreshSession()) {
      res = await send(path, method, body, tokenStore.getAccess());
    }
  }
  if (auth && res.status === 401) {
    expireSession();
  }
  if (!res.ok) throw await errorFromResponse(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
