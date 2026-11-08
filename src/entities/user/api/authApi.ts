import { request } from "@/shared/api/http";
import type { RegisterData } from "../model/types";
import type { ApiUser } from "./userApi";

export interface AuthResponseDto {
  access_token: string;
  refresh_token: string;
  user: ApiUser;
}

export const authApi = {
  register: (data: RegisterData) =>
    request<AuthResponseDto>("/auth/register", { method: "POST", body: data, auth: false }),

  login: (email: string, password: string) =>
    request<AuthResponseDto>("/auth/login", { method: "POST", body: { email, password }, auth: false }),

  /** Текущий пользователь по access token. */
  me: () => request<ApiUser>("/auth/me"),

  /** Завершает сессию на сервере: refresh token больше не обновляет access token. */
  logout: (refreshToken: string) =>
    request<void>("/auth/logout", { method: "POST", body: { refresh_token: refreshToken }, auth: false }),
};
