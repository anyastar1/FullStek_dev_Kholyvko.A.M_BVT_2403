import type { ReactNode } from "react";
import { Box, Card, CardActionArea, CardActions, CardContent, CardMedia, Chip, Stack, Typography } from "@mui/material";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import { Link as RouterLink } from "react-router-dom";
import { formatDate } from "@/shared/lib/format";
import type { Pet } from "../model/types";
import { speciesLabel } from "../model/types";
import { StatusChip } from "./StatusChip";

interface PetCardProps {
  pet: Pet;
  showMatchScore?: boolean;
  actions?: ReactNode;
}

export function PetCard({ pet, showMatchScore = false, actions }: PetCardProps) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea
        component={RouterLink}
        to={`/pets/${pet.id}`}
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start" }}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia component="img" height="200" image={pet.photoUrl} alt={pet.name} />
          <StatusChip status={pet.status} />
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
        <CardContent sx={{ width: "100%" }}>
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
      {actions && <CardActions sx={{ px: 2, pb: 2 }}>{actions}</CardActions>}
    </Card>
  );
}
