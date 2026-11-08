import type { ListingStatus, PetSpecies } from "@/entities/pet";
import { todayIso } from "@/shared/lib/format";
import type { FormErrors } from "@/shared/lib/useForm";
import { firstError, isPhone, maxLength, minLength, required } from "@/shared/lib/validators";

export type ListingFormValues = {
  status: ListingStatus;
  species: PetSpecies;
  name: string;
  breed: string;
  color: string;
  city: string;
  district: string;
  date: string;
  description: string;
  contactName: string;
  contactPhone: string;
  photo: File | null;
};

export const emptyListingForm: ListingFormValues = {
  status: "lost",
  species: "dog",
  name: "",
  breed: "",
  color: "",
  city: "",
  district: "",
  date: "",
  description: "",
  contactName: "",
  contactPhone: "",
  photo: null,
};


export function validateListing(values: ListingFormValues): FormErrors<ListingFormValues> {
  let dateError: string | undefined;
  if (!values.date) dateError = "Укажите дату";
  else if (values.date > todayIso()) dateError = "Дата не может быть в будущем";

  return {
    name: firstError(
      required(values.name, "Укажите кличку или «неизвестна»"),
      maxLength(values.name, 100, "Не длиннее 100 символов"),
    ),
    city: required(values.city, "Укажите город"),
    date: dateError,
    description: firstError(
      required(values.description, "Опишите животное"),
      minLength(values.description, 10, "Опишите подробнее — хотя бы 10 символов"),
    ),
    contactName: required(values.contactName, "Укажите имя для связи"),
    contactPhone: firstError(required(values.contactPhone, "Укажите телефон"), isPhone(values.contactPhone)),
    photo: values.photo ? undefined : "Добавьте фотографию — по ней животное смогут узнать",
  };
}
