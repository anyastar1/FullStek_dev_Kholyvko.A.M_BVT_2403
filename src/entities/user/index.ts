// Публичный интерфейс сущности «пользователь» (профиль и сессия входа)
export type { ProfileUpdate, RegisterData, User } from "./model/types";
export { AuthProvider, useAuth } from "./model/AuthContext";
export type { AuthStatus } from "./model/AuthContext";
export { updateUser } from "./api/userApi";
