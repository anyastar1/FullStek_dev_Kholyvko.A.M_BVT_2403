import { Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { AuthShell, LoginForm } from "@/features/auth";

export function LoginPage() {
  return (
    <AuthShell
      title="Вход"
      subtitle="Войдите, чтобы разместить объявление и следить за откликами"
      footer={
        <>
          Нет аккаунта?{" "}
          <Link component={RouterLink} to="/register">
            Зарегистрироваться
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
