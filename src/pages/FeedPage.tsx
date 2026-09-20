import { useMemo, useState } from "react";
import {
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import PetsOutlinedIcon from "@mui/icons-material/PetsOutlined";
import { PetCard } from "@/components/PetCard";
import { mockPets } from "@/entities/pet/mockPets";
import type { ListingStatus, PetSpecies } from "@/entities/pet/types";

type StatusFilter = ListingStatus | "all";
type SpeciesFilter = PetSpecies | "all";

const cities = ["Все города", ...Array.from(new Set(mockPets.map((pet) => pet.city)))];

export function FeedPage() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [species, setSpecies] = useState<SpeciesFilter>("all");
  const [city, setCity] = useState("Все города");

  const filtered = useMemo(() => {
    return mockPets.filter((pet) => {
      if (status !== "all" && pet.status !== status) return false;
      if (species !== "all" && pet.species !== species) return false;
      if (city !== "Все города" && pet.city !== city) return false;
      return true;
    });
  }, [status, species, city]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
      <Stack gap={1} sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
          Лента объявлений
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Потерянные и найденные животные — отфильтруйте список по виду, статусу и городу.
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 4 }}>
        <Stack direction={{ xs: "column", md: "row" }} gap={2} alignItems={{ md: "center" }}>
          <ToggleButtonGroup
            exclusive
            value={status}
            onChange={(_, value) => value && setStatus(value)}
            size="small"
          >
            <ToggleButton value="all">Все</ToggleButton>
            <ToggleButton value="lost">Потеряны</ToggleButton>
            <ToggleButton value="found">Найдены</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            exclusive
            value={species}
            onChange={(_, value) => value && setSpecies(value)}
            size="small"
          >
            <ToggleButton value="all">Любой вид</ToggleButton>
            <ToggleButton value="dog">Собаки</ToggleButton>
            <ToggleButton value="cat">Кошки</ToggleButton>
            <ToggleButton value="other">Другое</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            select
            size="small"
            label="Город"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            sx={{ minWidth: 200, ml: { md: "auto" } }}
          >
            {cities.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {filtered.length === 0 ? (
        <Stack alignItems="center" gap={1.5} sx={{ py: 8, color: "text.secondary" }}>
          <PetsOutlinedIcon fontSize="large" />
          <Typography variant="h6" color="text.primary">
            По этим фильтрам ничего не нашлось
          </Typography>
          <Typography variant="body2">Попробуйте изменить город, вид животного или статус.</Typography>
        </Stack>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((pet) => (
            <Grid item xs={12} sm={6} md={4} key={pet.id}>
              <PetCard pet={pet} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
