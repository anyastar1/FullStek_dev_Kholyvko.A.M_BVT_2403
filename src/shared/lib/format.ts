export function formatDate(iso: string, withYear = false): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

/** Сегодняшняя дата в формате YYYY-MM-DD по локальному времени пользователя. */
export function todayIso(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** «2026-03-05T10:00:00Z» → «март 2026» (для «На сервисе с …»). */
export function formatMemberSince(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("ru-RU", { month: "long", year: "numeric", timeZone: "UTC" })
    .replace(/\s?г\.$/, "");
}

/** «Анна Холявко» → «АХ» (для аватара без фото). */
export function getInitials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}
