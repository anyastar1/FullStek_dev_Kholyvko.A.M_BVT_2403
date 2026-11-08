import type { ReactNode } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/entities/user";
import { theme } from "@/shared/theme/theme";

/** Подключает тему MUI, маршрутизацию и состояние входа пользователя ко всему приложению. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
