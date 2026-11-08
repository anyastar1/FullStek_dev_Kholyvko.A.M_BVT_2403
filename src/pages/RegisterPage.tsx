import { Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { AuthShell, RegisterForm } from "@/features/auth";

export function RegisterPage() {
  return (
    <AuthShell
      title="Регистрация"
      subtitle="Создайте аккаунт, чтобы размещать объявления о питомцах"
      footer={
        <>
          Уже есть аккаунт?{" "}
          <Link component={RouterLink} to="/login">
            Войти
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
