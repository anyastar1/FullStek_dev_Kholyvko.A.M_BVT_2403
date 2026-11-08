import type { ReactNode } from "react";
import { Button, CircularProgress } from "@mui/material";

interface SubmitButtonProps {
  loading: boolean;
  children: ReactNode;
  icon?: ReactNode;
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  form?: string;
}
export function SubmitButton({ loading, children, icon, size = "large", fullWidth, form }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      form={form}
      variant="contained"
      size={size}
      fullWidth={fullWidth}
      disabled={loading}
      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : icon}
    >
      {children}
    </Button>
  );
}
