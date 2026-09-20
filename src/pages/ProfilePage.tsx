import { Avatar, Box, Button, Container, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useNavigate } from "react-router-dom";
import { PetCard } from "@/components/PetCard";
import { currentUserPets } from "@/entities/pet/mockPets";
import { demoUser } from "@/entities/user/mockUser";

export function ProfilePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
      <Grid container spacing={5}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
            <Avatar src={demoUser.avatarUrl} alt={demoUser.name} sx={{ width: 96, height: 96, mx: "auto", mb: 2 }} />
            <Typography variant="h6">{demoUser.name}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              На сервисе с {demoUser.memberSince}
            </Typography>
            <Button variant="outlined" startIcon={<EditOutlinedIcon />} sx={{ mt: 2 }} disabled>
              Редактировать профиль
            </Button>

            <Divider sx={{ my: 3 }} />

            <Stack gap={1.5} sx={{ textAlign: "left" }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body2">{demoUser.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Телефон
                </Typography>
                <Typography variant="body2">{demoUser.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Город
                </Typography>
                <Typography variant="body2">{demoUser.city}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 3 }}>
            <Typography variant="h1" sx={{ fontSize: { xs: "1.7rem", md: "2.1rem" } }}>
              Мои объявления
            </Typography>
            <Button variant="contained" onClick={() => navigate("/pets/new")}>
              Новое объявление
            </Button>
          </Stack>

          {currentUserPets.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 5, textAlign: "center" }}>
              <Typography color="text.secondary">У вас пока нет объявлений</Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {currentUserPets.map((pet) => (
                <Grid item xs={12} sm={6} key={pet.id}>
                  <PetCard pet={pet} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
