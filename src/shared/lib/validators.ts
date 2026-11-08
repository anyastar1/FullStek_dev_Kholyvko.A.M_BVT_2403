const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9()\-\s]{6,20}$/;

export function required(value: string, message: string): string | undefined {
  return value.trim() ? undefined : message;
}

export function isEmail(value: string): string | undefined {
  return EMAIL_RE.test(value.trim()) ? undefined : "Введите email в формате name@example.com";
}

export function isPhone(value: string): string | undefined {
  return PHONE_RE.test(value.trim()) ? undefined : "Телефон: цифры, пробелы, +, - и скобки (6–20 символов)";
}

export function minLength(value: string, min: number, message: string): string | undefined {
  return value.trim().length >= min ? undefined : message;
}

export function maxLength(value: string, max: number, message: string): string | undefined {
  return value.trim().length <= max ? undefined : message;
}

export function firstError(...checks: Array<string | undefined>): string | undefined {
  return checks.find((check) => Boolean(check));
}
