import { useState } from "react";
import { Alert, Box, Stack, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { delay } from "@/shared/lib/delay";
import { useForm } from "@/shared/lib/useForm";
import { PasswordField } from "@/shared/ui/PasswordField";
import { SubmitButton } from "@/shared/ui/SubmitButton";
import { emptyLogin, validateLogin } from "../model/validateAuth";

export function LoginForm() {
  const navigate = useNavigate();
  const { field, handleSubmit } = useForm(emptyLogin, validateLogin);
  const [submitting, setSubmitting] = useState(false);

  const submit = handleSubmit(async () => {
    setSubmitting(true);
    await delay(600);
    navigate("/profile");
  });

  return (
    <Box component="form" noValidate onSubmit={submit}>
      <Stack gap={2.5}>
        <TextField fullWidth label="Email" type="email" autoComplete="email" {...field("email")} />
        <PasswordField label="Пароль" autoComplete="current-password" {...field("password")} />
        <SubmitButton loading={submitting} fullWidth>
          {submitting ? "Входим…" : "Войти"}
        </SubmitButton>
        <Alert severity="info" variant="outlined" sx={{ fontSize: "0.8rem" }}>
         пароль пока не проверяется.
        </Alert>
      </Stack>
    </Box>
  );
}
