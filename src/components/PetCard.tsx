import { Box, Card, CardActionArea, CardContent, CardMedia, Chip, Stack, Typography } from "@mui/material";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import { useNavigate } from "react-router-dom";
import type { Pet } from "@/entities/pet/types";
import { speciesLabel, statusLabel } from "@/entities/pet/types";

interface PetCardProps {
  pet: Pet;
  showMatchScore?: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export function PetCard({ pet, showMatchScore = false }: PetCardProps) {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea
        onClick={() => navigate(`/pets/${pet.id}`)}
        sx={{ display: "flex", flexDirection: "column", alignItems: "stretch", height: "100%" }}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia component="img" height="200" image={pet.photoUrl} alt={pet.name} />
          <Chip
            label={statusLabel[pet.status]}
            color={pet.status}
            size="small"
            sx={{ position: "absolute", top: 12, left: 12 }}
          />
          {showMatchScore && pet.matchScore !== undefined && (
            <Chip
              label={`Совпадение ${pet.matchScore}%`}
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                backgroundColor: "rgba(34,32,29,0.85)",
                color: "#FAF7F2",
                fontWeight: 700,
              }}
            />
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, width: "100%" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={1}>
            <Typography variant="h6" component="h3" sx={{ fontSize: "1.15rem" }}>
              {pet.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(pet.date)}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {speciesLabel[pet.species]} · {pet.breed}
          </Typography>
          <Stack direction="row" alignItems="center" gap={0.5} color="text.secondary">
            <RoomOutlinedIcon fontSize="small" />
            <Typography variant="body2">
              {pet.city}
              {pet.district ? `, ${pet.district}` : ""}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
