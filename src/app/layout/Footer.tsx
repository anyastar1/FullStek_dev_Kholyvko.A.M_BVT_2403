import { Box, Container, Stack, Typography } from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";

export function Footer() {
  return (
    <Box component="footer" sx={{ borderTop: "1px solid", borderColor: "divider", mt: 8, py: 4 }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" gap={2}>
          <Stack direction="row" alignItems="center" gap={1}>
            <PetsIcon fontSize="small" color="primary" />
            <Typography variant="body2" color="text.secondary">
              FindPetik — сервис поиска потерянных животных
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Cупер работа 3000 · 2026
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
