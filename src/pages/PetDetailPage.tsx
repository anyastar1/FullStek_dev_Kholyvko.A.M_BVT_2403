import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, Collapse, Container, Divider, Grid, Paper, Skeleton, Stack, Typography } from "@mui/material";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { speciesLabel, StatusChip, usePet, type Pet } from "@/entities/pet";
import { formatDate } from "@/shared/lib/format";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { EmptyState } from "@/shared/ui/StateViews";

function PetDetailSkeleton() {
  return (
    <Grid container spacing={5} aria-busy="true" aria-label="Загрузка объявления">
      <Grid item xs={12} md={7}>
        <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 3 }} />
      </Grid>
      <Grid item xs={12} md={5}>
        <Skeleton width="60%" height={48} />
        <Skeleton width="80%" />
        <Skeleton width="40%" sx={{ mb: 3 }} />
        <Card>
          <CardContent>
            <Skeleton height={24} />
            <Skeleton height={24} />
            <Skeleton height={24} width="70%" />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function PetDetail({ pet, justCreated }: { pet: Pet; justCreated: boolean }) {
  const [phoneShown, setPhoneShown] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(justCreated);

  return (
    <>
      <Collapse in={noticeOpen} appear>
        <Alert severity="success" onClose={() => setNoticeOpen(false)} sx={{ mb: 3 }}>
          Объявление опубликовано. Оно появилось в ленте и в вашем личном кабинете.
        </Alert>
      </Collapse>

      <Grid container spacing={5}>
        <Grid item xs={12} md={7}>
          <Box sx={{ position: "relative" }}>
            <Box
              component="img"
              src={pet.photoUrl}
              alt={pet.name}
              sx={{ width: "100%", borderRadius: 3, display: "block", maxHeight: 480, objectFit: "cover" }}
            />
            <StatusChip status={pet.status} />
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
                  {pet.status === "lost" ? "Потерян" : "Найден"} {formatDate(pet.date, true)}
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
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => setPhoneShown((prev) => !prev)}
                aria-expanded={phoneShown}
              >
                {phoneShown ? "Скрыть телефон" : "Показать телефон"}
              </Button>
              <Collapse in={phoneShown}>
                <Stack direction="row" gap={1} alignItems="center" sx={{ mt: 2 }}>
                  <PhoneOutlinedIcon fontSize="small" color="primary" />
                  <Typography variant="body1" fontWeight={600}>
                    {pet.contactPhone}
                  </Typography>
                </Stack>
                <Button variant="contained" fullWidth sx={{ mt: 2 }} href={`tel:${pet.contactPhone.replace(/\s|-/g, "")}`}>
                  Позвонить
                </Button>
              </Collapse>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

export function PetDetailPage() {
  const { petId } = useParams<{ petId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { data, loading, error, retry } = usePet(petId);
  const justCreated = Boolean((location.state as { created?: boolean } | null)?.created);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 3, pl: 0 }}>
        ← Назад
      </Button>
      <AsyncBoundary
        data={data}
        loading={loading}
        error={error}
        onRetry={retry}
        skeleton={<PetDetailSkeleton />}
        empty={
          <EmptyState
            title="Объявление не найдено"
            text="Возможно, оно было удалено или ссылка указана неверно."
            action={
              <Button variant="contained" component={RouterLink} to="/feed">
                Вернуться к ленте
              </Button>
            }
          />
        }
      >
        {(pet) => <PetDetail pet={pet} justCreated={justCreated} />}
      </AsyncBoundary>
    </Container>
  );
}
