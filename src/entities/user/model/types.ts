export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  avatarUrl: string;
  memberSince: string;
}

export type ProfileUpdate = Pick<User, "name" | "phone" | "city">;
