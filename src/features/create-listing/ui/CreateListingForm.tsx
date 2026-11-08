import { useState } from "react";
import {
  Alert,
  Box,
  Collapse,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createPet, type ListingStatus, type PetSpecies } from "@/entities/pet";
import { useAuth } from "@/entities/user";
import { useForm } from "@/shared/lib/useForm";
import { PhotoDropzone } from "@/shared/ui/PhotoDropzone";
import { SubmitButton } from "@/shared/ui/SubmitButton";
import { emptyListingForm, validateListing } from "../model/validateListing";

const statusHints: Record<ListingStatus, string> = {
  lost: "Укажите район, где видели животное в последний раз, и приметы: ошейник, шрамы, особенности поведения.",
  found: "Укажите район, где нашли животное, и приметы. Точный адрес своего дома публиковать не нужно.",
};

/** Форма создания объявления с клиентской валидацией. */
export function CreateListingForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // контакты подставляются из профиля автора, их можно изменить
  const { values, errors, field, setValue, touch, handleSubmit } = useForm(
    { ...emptyListingForm, contactName: user?.name ?? "", contactPhone: user?.phone ?? "" },
    validateListing,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = handleSubmit(async (form) => {
    if (!form.photo || !user) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const pet = await createPet(
        {
          status: form.status,
          species: form.species,
          name: form.name.trim(),
          breed: form.breed.trim() || "Порода не указана",
          color: form.color.trim() || "окрас не указан",
          city: form.city.trim(),
          district: form.district.trim() || undefined,
          date: form.date,
          description: form.description.trim(),
          // ссылка живёт, пока открыта вкладка; с backend здесь будет адрес загруженного файла
          photoUrl: URL.createObjectURL(form.photo),
          contactName: form.contactName.trim(),
          contactPhone: form.contactPhone.trim(),
        },
        user.id,
      );
      navigate(`/pets/${pet.id}`, { state: { created: true } });
    } catch {
      setSubmitError("Не удалось сохранить объявление. Попробуйте ещё раз.");
      setSubmitting(false);
    }
  });

  return (
    <Box component="form" noValidate onSubmit={submit}>
      <Stack gap={3}>
        <FormControl>
          <FormLabel id="listing-status-label">Что случилось?</FormLabel>
          <RadioGroup
            row
            aria-labelledby="listing-status-label"
            value={values.status}
            onChange={(event) => setValue("status", event.target.value as ListingStatus)}
          >
            <FormControlLabel value="lost" control={<Radio />} label="Питомец потерялся" />
            <FormControlLabel value="found" control={<Radio />} label="Я нашёл чужого питомца" />
          </RadioGroup>
        </FormControl>

        <Collapse key={values.status} in appear>
          <Alert severity="info" variant="outlined">
            {statusHints[values.status]}
          </Alert>
        </Collapse>

        <PhotoDropzone
          file={values.photo}
          error={errors.photo}
          onChange={(file) => {
            setValue("photo", file);
            touch("photo");
          }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Вид животного"
              value={values.species}
              onChange={(event) => setValue("species", event.target.value as PetSpecies)}
            >
              <MenuItem value="dog">Собака</MenuItem>
              <MenuItem value="cat">Кошка</MenuItem>
              <MenuItem value="other">Другое</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Кличка" placeholder="Например, Рыжик или «неизвестна»" {...field("name")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Порода" {...field("breed")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Окрас" {...field("color")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Город" {...field("city")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Район (необязательно)" {...field("district")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label={values.status === "lost" ? "Дата пропажи" : "Дата находки"}
              InputLabelProps={{ shrink: true }}
              {...field("date")}
            />
          </Grid>
        </Grid>

        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Описание"
          placeholder="Приметы, обстоятельства, особенности поведения"
          {...field("description")}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Ваше имя" autoComplete="name" {...field("contactName")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Телефон"
              placeholder="+7 900 000-00-00"
              autoComplete="tel"
              {...field("contactPhone")}
            />
          </Grid>
        </Grid>

        {submitError && <Alert severity="error">{submitError}</Alert>}

        <Alert severity="info" variant="outlined">
          Пока объявление сохраняется только в памяти браузера и исчезнет после перезагрузки страницы.
          Сохранение в базе данных подключится в ЛР №5.
        </Alert>

        <SubmitButton loading={submitting}>{submitting ? "Публикуем…" : "Опубликовать объявление"}</SubmitButton>
      </Stack>
    </Box>
  );
}
