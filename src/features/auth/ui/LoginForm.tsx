import { useState } from "react";
import { Alert, Box, Stack, TextField } from "@mui/material";
import { useAuth } from "@/entities/user";
import { useForm } from "@/shared/lib/useForm";
import { PasswordField } from "@/shared/ui/PasswordField";
import { SubmitButton } from "@/shared/ui/SubmitButton";
import { emptyLogin, validateLogin } from "../model/validateAuth";

/**
 * Форма входа. После успеха переход выполняет GuestRoute: состояние входа меняется,
 * и пользователя возвращают на страницу, с которой его отправили на /login.
 */
export function LoginForm() {
  const { login } = useAuth();
  const { field, handleSubmit } = useForm(emptyLogin, validateLogin);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const submit = handleSubmit(async (values) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await login(values.email.trim(), values.password);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Не удалось войти. Попробуйте ещё раз.");
      setSubmitting(false);
    }
  });

  return (
    <Box component="form" noValidate onSubmit={submit}>
      <Stack gap={2.5}>
        {serverError && <Alert severity="error">{serverError}</Alert>}
        <TextField fullWidth label="Email" type="email" autoComplete="email" {...field("email")} />
        <PasswordField label="Пароль" autoComplete="current-password" {...field("password")} />
        <SubmitButton loading={submitting} fullWidth>
          {submitting ? "Входим…" : "Войти"}
        </SubmitButton>
      </Stack>
    </Box>
  );
}
