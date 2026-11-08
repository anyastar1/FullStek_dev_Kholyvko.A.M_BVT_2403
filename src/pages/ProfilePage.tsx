import { useState } from "react";
import { Avatar, Box, Button, Container, Divider, Grid, Paper, Skeleton, Snackbar, Stack, Typography } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { PetGrid, PetGridSkeleton, usePetsByAuthor, type Pet } from "@/entities/pet";
import { fetchCurrentUser, type User } from "@/entities/user";
import { DeleteListingDialog } from "@/features/delete-listing";
import { EditProfileDialog } from "@/features/edit-profile";
import { CURRENT_USER_ID } from "@/shared/config/demoUser";
import { useAsync } from "@/shared/lib/useAsync";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { EmptyState } from "@/shared/ui/StateViews";

function UserCard({ user, onEdit }: { user: User; onEdit: () => void }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
      <Avatar src={user.avatarUrl} alt={user.name} sx={{ width: 96, height: 96, mx: "auto", mb: 2 }} />
      <Typography variant="h6">{user.name}</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        На сервисе с {user.memberSince}
      </Typography>
      <Button variant="outlined" startIcon={<EditOutlinedIcon />} sx={{ mt: 2 }} onClick={onEdit}>
        Редактировать профиль
      </Button>

      <Divider sx={{ my: 3 }} />

      <Stack gap={1.5} sx={{ textAlign: "left" }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Email
          </Typography>
          <Typography variant="body2">{user.email}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Телефон
          </Typography>
          <Typography variant="body2">{user.phone || "не указан"}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Город
          </Typography>
          <Typography variant="body2">{user.city || "не указан"}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useAsync(fetchCurrentUser);
  const myPets = usePetsByAuthor(CURRENT_USER_ID);
  const [editOpen, setEditOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
      <Grid container spacing={5}>
        <Grid item xs={12} md={4}>
          <AsyncBoundary
            data={user.data}
            loading={user.loading}
            error={user.error}
            onRetry={user.reload}
            skeleton={<Skeleton variant="rectangular" height={380} sx={{ borderRadius: 3 }} />}
            empty={null}
          >
            {(current) => <UserCard user={current} onEdit={() => setEditOpen(true)} />}
          </AsyncBoundary>
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

          <AsyncBoundary
            data={myPets.data}
            loading={myPets.loading}
            error={myPets.error}
            onRetry={myPets.retry}
            skeleton={<PetGridSkeleton count={2} twoColumns />}
            isEmpty={(pets) => pets.length === 0}
            empty={
              <EmptyState
                title="У вас пока нет объявлений"
                text="Разместите объявление о потерянном или найденном животном."
                action={
                  <Button variant="contained" component={RouterLink} to="/pets/new">
                    Создать объявление
                  </Button>
                }
              />
            }
          >
            {(pets) => (
              <PetGrid
                pets={pets}
                twoColumns
                renderActions={(pet) => (
                  <Button size="small" color="error" startIcon={<DeleteOutlineIcon />} onClick={() => setPetToDelete(pet)}>
                    Удалить
                  </Button>
                )}
              />
            )}
          </AsyncBoundary>
        </Grid>
      </Grid>

      {user.data && (
        <EditProfileDialog
          open={editOpen}
          user={user.data}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            user.reload();
            setNotice("Профиль обновлён");
          }}
        />
      )}

      <DeleteListingDialog
        pet={petToDelete}
        onClose={() => setPetToDelete(null)}
        onDeleted={(pet) => {
          setPetToDelete(null);
          myPets.reload();
          setNotice(`Объявление «${pet.name}» удалено`);
        }}
      />

      <Snackbar open={notice !== null} autoHideDuration={3500} onClose={() => setNotice(null)} message={notice ?? ""} />
    </Container>
  );
}
