import { request } from "@/shared/api/http";
import { formatMemberSince } from "@/shared/lib/format";
import type { ProfileUpdate, User } from "../model/types";

/** Пользователь в том виде, в каком его отдаёт backend (UserRead). */
export interface ApiUser {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  city: string | null;
  created_at: string;
}

/** Приводит ответ backend к модели интерфейса (null → пустая строка, дата → «март 2026»). */
export function toUser(api: ApiUser): User {
  return {
    id: String(api.id),
    name: api.name,
    email: api.email,
    phone: api.phone ?? "",
    city: api.city ?? "",
    memberSince: formatMemberSince(api.created_at),
  };
}

/** Изменяет профиль. Маршрут приватный: backend разрешает менять только свой профиль. */
export async function updateUser(id: string, update: ProfileUpdate): Promise<User> {
  const api = await request<ApiUser>(`/users/${id}`, {
    method: "PATCH",
    body: {
      name: update.name.trim(),
      phone: update.phone.trim() || null,
      city: update.city.trim() || null,
    },
  });
  return toUser(api);
}
