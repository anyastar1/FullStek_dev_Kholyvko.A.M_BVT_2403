import { useState } from "react";
import { Alert, Box, Stack, TextField } from "@mui/material";
import { useAuth } from "@/entities/user";
import { useForm } from "@/shared/lib/useForm";
import { PasswordField } from "@/shared/ui/PasswordField";
import { SubmitButton } from "@/shared/ui/SubmitButton";
import { emptyRegister, validateRegister } from "../model/validateAuth";

/** Форма регистрации. После успеха пользователь сразу входит (backend выдаёт токены), переход делает GuestRoute. */
export function RegisterForm() {
  const { register } = useAuth();
  const { field, handleSubmit } = useForm(emptyRegister, validateRegister);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const submit = handleSubmit(async (values) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await register({ name: values.name.trim(), email: values.email.trim(), password: values.password });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Не удалось зарегистрироваться. Попробуйте ещё раз.");
      setSubmitting(false);
    }
  });

  return (
    <Box component="form" noValidate onSubmit={submit}>
      <Stack gap={2.5}>
        {serverError && <Alert severity="error">{serverError}</Alert>}
        <TextField fullWidth label="Имя" autoComplete="name" {...field("name")} />
        <TextField fullWidth label="Email" type="email" autoComplete="email" {...field("email")} />
        <PasswordField label="Пароль" autoComplete="new-password" {...field("password")} />
        <PasswordField label="Повторите пароль" autoComplete="new-password" {...field("confirmPassword")} />
        <SubmitButton loading={submitting} fullWidth>
          {submitting ? "Создаём аккаунт…" : "Создать аккаунт"}
        </SubmitButton>
      </Stack>
    </Box>
  );
}
