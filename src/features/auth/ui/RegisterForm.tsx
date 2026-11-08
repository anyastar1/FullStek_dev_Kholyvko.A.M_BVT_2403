import { useState } from "react";
import { Alert, Box, Stack, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { delay } from "@/shared/lib/delay";
import { useForm } from "@/shared/lib/useForm";
import { PasswordField } from "@/shared/ui/PasswordField";
import { SubmitButton } from "@/shared/ui/SubmitButton";
import { emptyRegister, validateRegister } from "../model/validateAuth";

export function RegisterForm() {
  const navigate = useNavigate();
  const { field, handleSubmit } = useForm(emptyRegister, validateRegister);
  const [submitting, setSubmitting] = useState(false);

  const submit = handleSubmit(async () => {
    setSubmitting(true);
    await delay(600);
    navigate("/profile");
  });

  return (
    <Box component="form" noValidate onSubmit={submit}>
      <Stack gap={2.5}>
        <TextField fullWidth label="Имя" autoComplete="name" {...field("name")} />
        <TextField fullWidth label="Email" type="email" autoComplete="email" {...field("email")} />
        <PasswordField label="Пароль" autoComplete="new-password" {...field("password")} />
        <PasswordField label="Повторите пароль" autoComplete="new-password" {...field("confirmPassword")} />
        <SubmitButton loading={submitting} fullWidth>
          {submitting ? "Создаём аккаунт…" : "Создать аккаунт"}
        </SubmitButton>
        <Alert severity="info" variant="outlined" sx={{ fontSize: "0.8rem" }}>
          пользователь пока не сохраняется
        </Alert>
      </Stack>
    </Box>
  );
}
