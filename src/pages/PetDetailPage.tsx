import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { mockPets } from "@/entities/pet/mockPets";
import { speciesLabel, statusLabel } from "@/entities/pet/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export function PetDetailPage() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const pet = mockPets.find((item) => item.id === petId);

  if (!pet) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Объявление не найдено
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Возможно, оно было удалено или ссылка указана неверно.
        </Typography>
        <Button variant="contained" component={RouterLink} to="/feed">
          Вернуться к ленте
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 3, pl: 0 }}>
        ← Назад
      </Button>

      <Grid container spacing={5}>
        <Grid item xs={12} md={7}>
          <Box sx={{ position: "relative" }}>
            <Box
              component="img"
              src={pet.photoUrl}
              alt={pet.name}
              sx={{ width: "100%", borderRadius: 3, display: "block", maxHeight: 480, objectFit: "cover" }}
            />
            <Chip
              label={statusLabel[pet.status]}
              color={pet.status}
              sx={{ position: "absolute", top: 16, left: 16 }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack gap={2.5}>
            <Box>
              <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.4rem" } }}>
                {pet.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {speciesLabel[pet.species]} · {pet.breed} · {pet.color}
              </Typography>
            </Box>

            <Stack gap={1}>
              <Stack direction="row" gap={1} alignItems="center" color="text.secondary">
                <RoomOutlinedIcon fontSize="small" />
                <Typography variant="body2">
                  {pet.city}
                  {pet.district ? `, ${pet.district}` : ""}
                </Typography>
              </Stack>
              <Stack direction="row" gap={1} alignItems="center" color="text.secondary">
                <EventOutlinedIcon fontSize="small" />
                <Typography variant="body2">
                  {pet.status === "lost" ? "Потерян" : "Найден"} {formatDate(pet.date)}
                </Typography>
              </Stack>
            </Stack>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Описание
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {pet.description}
              </Typography>
            </Box>

            <Divider />

            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" gutterBottom>
                Контакт для связи
              </Typography>
              <Typography variant="body1">{pet.contactName}</Typography>
              <Stack direction="row" gap={1} alignItems="center" sx={{ mt: 1 }}>
                <PhoneOutlinedIcon fontSize="small" color="primary" />
                <Typography variant="body1" fontWeight={600}>
                  {pet.contactPhone}
                </Typography>
              </Stack>
              <Button variant="contained" fullWidth sx={{ mt: 2 }} href={`tel:${pet.contactPhone.replace(/\s|-/g, "")}`}>
                Позвонить
              </Button>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
