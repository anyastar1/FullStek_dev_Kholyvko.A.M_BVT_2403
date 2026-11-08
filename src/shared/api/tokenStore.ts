/**
 * Хранилище токенов.
 * - access token живёт только в памяти: его не украсть из localStorage, а срок у него короткий;
 * - refresh token лежит в localStorage, чтобы вход сохранялся после перезагрузки страницы
 *   (компромисс: при XSS его можно прочитать, поэтому на сервере он одноразовый и отзываемый).
 */
const REFRESH_KEY = "nashlis.refreshToken";

let accessToken: string | null = null;
let refreshFallback: string | null = null; // если localStorage недоступен (приватный режим)

function readRefresh(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY) ?? refreshFallback;
  } catch {
    return refreshFallback;
  }
}

function writeRefresh(token: string | null): void {
  refreshFallback = token;
  try {
    if (token) localStorage.setItem(REFRESH_KEY, token);
    else localStorage.removeItem(REFRESH_KEY);
  } catch {
    // хранилище недоступно — токен останется только в памяти
  }
}

export const tokenStore = {
  getAccess: (): string | null => accessToken,
  getRefresh: readRefresh,
  set(access: string, refresh: string): void {
    accessToken = access;
    writeRefresh(refresh);
  },
  clear(): void {
    accessToken = null;
    writeRefresh(null);
  },
};
