import type { ReactNode } from "react";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PetsOutlinedIcon from "@mui/icons-material/PetsOutlined";

export function LoadingState({ text = "Загружаем…" }: { text?: string }) {
  return (
    <Stack alignItems="center" justifyContent="center" gap={2} sx={{ py: 8 }} role="status">
      <CircularProgress />
      <Typography color="text.secondary">{text}</Typography>
    </Stack>
  );
}

interface ErrorStateProps {
  message: string;
  title?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, title = "Не удалось загрузить данные", onRetry }: ErrorStateProps) {
  return (
    <Stack alignItems="center" gap={1.5} sx={{ py: 8, textAlign: "center" }} role="alert">
      <ErrorOutlineIcon color="error" fontSize="large" />
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          Повторить
        </Button>
      )}
    </Stack>
  );
}

interface EmptyStateProps {
  title: string;
  text?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, text, icon, action }: EmptyStateProps) {
  return (
    <Stack alignItems="center" gap={1.5} sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
      {icon ?? <PetsOutlinedIcon fontSize="large" />}
      <Typography variant="h6" color="text.primary">
        {title}
      </Typography>
      {text && (
        <Typography variant="body2" sx={{ maxWidth: 420 }}>
          {text}
        </Typography>
      )}
      {action}
    </Stack>
  );
}
