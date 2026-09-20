export interface DemoUser {
  name: string;
  email: string;
  phone: string;
  city: string;
  avatarUrl: string;
  memberSince: string;
}

export const demoUser: DemoUser = {
  name: "Анна Холявко",
  email: "anna.kholyavko@example.com",
  phone: "+7 983 395 71 80",
  city: "Москва",
  avatarUrl: "/images/anya.jpeg",
  memberSince: "март 2026",
};
