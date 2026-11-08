
export type DemoMode = "error" | "empty" | null;

let disabled = false;

export function getDemoMode(): DemoMode {
  if (disabled) return null;
  const value = new URLSearchParams(window.location.search).get("demo");
  return value === "error" || value === "empty" ? value : null;
}

export function disableDemoMode(): void {
  disabled = true;
}
