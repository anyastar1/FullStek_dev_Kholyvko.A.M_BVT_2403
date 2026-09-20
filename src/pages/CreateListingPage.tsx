import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import type { ListingStatus, PetSpecies } from "@/entities/pet/types";

interface FormState {
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
}

const initialState: FormState = {
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
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export function CreateListingPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) nextErrors.name = "Укажите кличку или «неизвестна»";
    if (!form.city.trim()) nextErrors.city = "Укажите город";
    if (!form.date) nextErrors.date = "Укажите дату";
    if (!form.description.trim()) nextErrors.description = "Опишите животное подробнее";
    if (!form.contactName.trim()) nextErrors.contactName = "Укажите имя для связи";
    if (!/^[+0-9()\- ]{6,}$/.test(form.contactPhone.trim())) nextErrors.contactPhone = "Укажите корректный телефон";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
    setForm(initialState);
    setPreviewUrl(null);
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 7 } }}>
      <Stack gap={1} sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
          Разместить объявление
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Заполните карточку животного — чем подробнее описание, тем быстрее его узнают.
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack gap={3}>
            <FormControl>
              <FormLabel id="status-label">Статус</FormLabel>
              <RadioGroup
                row
                aria-labelledby="status-label"
                value={form.status}
                onChange={(event) => update("status", event.target.value as ListingStatus)}
              >
                <FormControlLabel value="lost" control={<Radio />} label="Потерялся" />
                <FormControlLabel value="found" control={<Radio />} label="Нашёлся" />
              </RadioGroup>
            </FormControl>

            <Box
              onClick={() => inputRef.current?.click()}
              sx={{
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 3,
                p: previewUrl ? 1 : 4,
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: "#F1ECE0",
              }}
            >
              {previewUrl ? (
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Предпросмотр фото животного"
                  sx={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 2, display: "block" }}
                />
              ) : (
                <Stack alignItems="center" gap={1}>
                  <UploadFileOutlinedIcon color="action" />
                  <Typography variant="body2">Добавить фотографию</Typography>
                </Stack>
              )}
            </Box>
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={handlePhoto} aria-label="Фотография животного" />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Вид животного"
                  value={form.species}
                  onChange={(event) => update("species", event.target.value as PetSpecies)}
                >
                  <MenuItem value="dog">Собака</MenuItem>
                  <MenuItem value="cat">Кошка</MenuItem>
                  <MenuItem value="other">Другое</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Кличка"
                  placeholder="Например, Рыжик или «неизвестна»"
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Порода"
                  value={form.breed}
                  onChange={(event) => update("breed", event.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Окрас"
                  value={form.color}
                  onChange={(event) => update("color", event.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Город"
                  value={form.city}
                  onChange={(event) => update("city", event.target.value)}
                  error={Boolean(errors.city)}
                  helperText={errors.city}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Район (необязательно)"
                  value={form.district}
                  onChange={(event) => update("district", event.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={form.status === "lost" ? "Дата пропажи" : "Дата находки"}
                  InputLabelProps={{ shrink: true }}
                  value={form.date}
                  onChange={(event) => update("date", event.target.value)}
                  error={Boolean(errors.date)}
                  helperText={errors.date}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Описание"
              placeholder="Приметы, обстоятельства пропажи или находки, особенности поведения"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              error={Boolean(errors.description)}
              helperText={errors.description}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ваше имя"
                  value={form.contactName}
                  onChange={(event) => update("contactName", event.target.value)}
                  error={Boolean(errors.contactName)}
                  helperText={errors.contactName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Телефон"
                  placeholder="+7 900 000-00-00"
                  value={form.contactPhone}
                  onChange={(event) => update("contactPhone", event.target.value)}
                  error={Boolean(errors.contactPhone)}
                  helperText={errors.contactPhone}
                />
              </Grid>
            </Grid>

            <Button type="submit" variant="contained" size="large">
              Опубликовать объявление
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Snackbar
        open={submitted}
        autoHideDuration={4000}
        onClose={() => setSubmitted(false)}
        message="Объявление сохранено (демо-режим, без backend)"
      />
    </Container>
  );
}
