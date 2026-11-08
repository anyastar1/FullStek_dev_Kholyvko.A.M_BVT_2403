import type { FormErrors } from "@/shared/lib/useForm";
import { isPhone, maxLength, required } from "@/shared/lib/validators";

export type ProfileFormValues = { name: string; phone: string; city: string };

export const emptyProfile: ProfileFormValues = { name: "", phone: "", city: "" };

export function validateProfile(values: ProfileFormValues): FormErrors<ProfileFormValues> {
  return {
    name: required(values.name, "Введите имя"),
    phone: values.phone.trim() ? isPhone(values.phone) : undefined,
    city: maxLength(values.city, 100, "Не длиннее 100 символов"),
  };
}
