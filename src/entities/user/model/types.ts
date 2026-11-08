export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  memberSince: string;
}

/** Поля профиля, которые пользователь может изменить */
export type ProfileUpdate = Pick<User, "name" | "phone" | "city">;

/** Данные для регистрации */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}
