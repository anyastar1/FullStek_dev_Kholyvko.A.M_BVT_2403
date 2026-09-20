import { Button, Container, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 12, textAlign: "center" }}>
      <Stack gap={2} alignItems="center">
        <Typography variant="h1" sx={{ fontSize: "3rem" }}>
          404
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Такой страницы не существует
        </Typography>
        <Button variant="contained" component={RouterLink} to="/">
          На главную
        </Button>
      </Stack>
    </Container>
  );
}
