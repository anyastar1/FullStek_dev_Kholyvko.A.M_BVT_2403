/** Адрес backend. Меняется через переменную VITE_API_URL в файле .env (см. .env.example). */
export const API_URL: string = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
