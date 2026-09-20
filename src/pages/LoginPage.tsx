import type { FormEvent } from "react";
import { Box, Button, Container, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    navigate("/profile");
  }

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack gap={1} sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h1" sx={{ fontSize: "2rem" }}>
          Вход
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Войдите, чтобы разместить объявление и следить за откликами
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack gap={2.5}>
            <TextField label="Email" type="email" required fullWidth />
            <TextField label="Пароль" type="password" required fullWidth />
            <Button type="submit" variant="contained" size="large">
              Войти
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: "center" }}>
        Нет аккаунта?{" "}
        <Link component={RouterLink} to="/register">
          Зарегистрироваться
        </Link>
      </Typography>
    </Container>
  );
}
