import type { ReactNode } from "react";
import { Container, Paper, Stack, Typography } from "@mui/material";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <Container maxWidth="xs" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack gap={1} sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h1" sx={{ fontSize: "2rem" }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Stack>
      <Paper variant="outlined" sx={{ p: 4 }}>
        {children}
      </Paper>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: "center" }}>
        {footer}
      </Typography>
    </Container>
  );
}
