import type { FormErrors } from "@/shared/lib/useForm";
import { firstError, isEmail, minLength, required } from "@/shared/lib/validators";

export type LoginValues = { email: string; password: string };
export type RegisterValues = { name: string; email: string; password: string; confirmPassword: string };

export const emptyLogin: LoginValues = { email: "", password: "" };
export const emptyRegister: RegisterValues = { name: "", email: "", password: "", confirmPassword: "" };

export function validateLogin(values: LoginValues): FormErrors<LoginValues> {
  return {
    email: firstError(required(values.email, "Введите email"), isEmail(values.email)),
    password: required(values.password, "Введите пароль"),
  };
}

export function validateRegister(values: RegisterValues): FormErrors<RegisterValues> {
  let confirmError: string | undefined;
  if (!values.confirmPassword) confirmError = "Повторите пароль";
  else if (values.confirmPassword !== values.password) confirmError = "Пароли не совпадают";

  return {
    name: required(values.name, "Введите имя"),
    email: firstError(required(values.email, "Введите email"), isEmail(values.email)),
    password: firstError(
      required(values.password, "Придумайте пароль"),
      minLength(values.password, 8, "Пароль не короче 8 символов"),
    ),
    confirmPassword: confirmError,
  };
}
