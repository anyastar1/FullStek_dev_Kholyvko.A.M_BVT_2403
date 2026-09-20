import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import { useNavigate } from "react-router-dom";
import { PetCard } from "@/components/PetCard";
import { mockPets } from "@/entities/pet/mockPets";

const steps = [
  {
    icon: PhotoCameraOutlinedIcon,
    title: "Загрузите фото",
    text: "Снимок потерянного или найденного животного — с телефона или из галереи.",
  },
  {
    icon: TravelExploreOutlinedIcon,
    title: "ИИ найдёт похожих",
    text: "Система сравнит фото с базой объявлений и покажет наиболее похожих животных.",
  },
  {
    icon: CampaignOutlinedIcon,
    title: "Свяжитесь с автором",
    text: "Откройте карточку животного и напишите или позвоните тому, кто разместил объявление.",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const recentPets = mockPets.slice(0, 3);

  return (
    <Box>
      <Box sx={{ backgroundColor: "#F1ECE0", borderBottom: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h1" sx={{ fontSize: { xs: "2.4rem", md: "3.4rem" }, mb: 3, lineHeight: 1.15 }}>
                Питомец потерялся не один. Ищите его вместе с городом.
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 4, maxWidth: 560 }}>
                «Нашлись» сравнивает фотографию вашего животного с объявлениями о находках по всему городу
                и показывает наиболее похожих — без ручного пролистывания сотен карточек.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                <Button variant="contained" size="large" onClick={() => navigate("/search")}>
                  Начать поиск по фото
                </Button>
                <Button variant="outlined" size="large" onClick={() => navigate("/pets/new")}>
                  Разместить объявление
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                component="img"
                src="/images/megapuker.JPG"
                alt="Кошка, которую ищут хозяева"
                sx={{ width: "100%", borderRadius: 4, display: "block", boxShadow: "0 20px 40px -20px rgba(34,32,29,0.35)" }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
        <Typography variant="h3" sx={{ fontSize: { xs: "1.7rem", md: "2.1rem" }, mb: 5 }}>
          Что умеет наш сервис
        </Typography>
        <Grid container spacing={4}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Grid item xs={12} sm={4} key={step.title}>
                <Stack gap={1.5}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      backgroundColor: "rgba(62,92,70,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon color="primary" />
                  </Box>
                  <Typography variant="h6" component="h3">
                    {index + 1}. {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.text}
                  </Typography>
                </Stack>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      <Box sx={{ backgroundColor: "#F1ECE0", borderTop: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ fontSize: { xs: "1.7rem", md: "2.1rem" } }}>
              Свежие объявления
            </Typography>
            <Button onClick={() => navigate("/feed")}>Смотреть все</Button>
          </Stack>
          <Grid container spacing={3}>
            {recentPets.map((pet) => (
              <Grid item xs={12} sm={6} md={4} key={pet.id}>
                <PetCard pet={pet} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
