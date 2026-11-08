import { CURRENT_USER_ID } from "@/shared/config/demoUser";
import { delay } from "@/shared/lib/delay";
import type { ProfileUpdate, User } from "../model/types";

export const demoAvatarUrl = "public/images/anya.jpeg";

let currentUser: User = {
  id: CURRENT_USER_ID,
  name: "Анна Холявко",
  email: "anna.kholyavko@example.com",
  phone: "+7 983 395 71 80",
  city: "Москва",
  avatarUrl: demoAvatarUrl,
  memberSince: "март 2026",
};

export async function fetchCurrentUser(): Promise<User> {
  await delay(400);
  return { ...currentUser };
}

export async function updateCurrentUser(update: ProfileUpdate): Promise<User> {
  await delay(600);
  currentUser = {
    ...currentUser,
    name: update.name.trim(),
    phone: update.phone.trim(),
    city: update.city.trim(),
  };
  return { ...currentUser };
}
