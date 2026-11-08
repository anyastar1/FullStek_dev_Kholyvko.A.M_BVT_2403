import { Stack, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <Stack gap={1} sx={{ mb: 4, maxWidth: 680 }}>
      <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      )}
    </Stack>
  );
}
