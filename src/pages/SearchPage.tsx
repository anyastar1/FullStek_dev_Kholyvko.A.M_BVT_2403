import { useRef, useState, type ChangeEvent } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { PetCard } from "@/components/PetCard";
import { getMockSearchResults } from "@/entities/pet/mockPets";
import type { Pet, PetSpecies } from "@/entities/pet/types";

type SearchStage = "idle" | "loading" | "done";

export function SearchPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [species, setSpecies] = useState<PetSpecies>("dog");
  const [stage, setStage] = useState<SearchStage>("idle");
  const [results, setResults] = useState<Pet[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setStage("idle");
    setResults([]);
  }

  function handleSearch() {
    setStage("loading");
    setTimeout(() => {
      setResults(getMockSearchResults());
      setStage("done");
    }, 1400);
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
      <Stack gap={1} sx={{ mb: 5, maxWidth: 680 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
          Поиск по фотографии
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Загрузите фотографию животного — система сравнит её с объявлениями в базе и покажет наиболее
          похожих питомцев с оценкой совпадения.
        </Typography>
      </Stack>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack gap={2.5}>
              <Box
                onClick={() => inputRef.current?.click()}
                sx={{
                  border: "2px dashed",
                  borderColor: "divider",
                  borderRadius: 3,
                  p: previewUrl ? 1 : 5,
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: "#F1ECE0",
                  transition: "border-color 0.2s ease",
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                {previewUrl ? (
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Предпросмотр загруженного фото"
                    sx={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 2, display: "block" }}
                  />
                ) : (
                  <Stack alignItems="center" gap={1.5}>
                    <UploadFileOutlinedIcon fontSize="large" color="action" />
                    <Typography variant="body1">Нажмите, чтобы выбрать фото</Typography>
                    <Typography variant="body2" color="text.secondary">
                      JPG или PNG, до 10 МБ
                    </Typography>
                  </Stack>
                )}
              </Box>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
                aria-label="Загрузить фотографию животного"
              />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Кто на фото?
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={species}
                  onChange={(_, value) => value && setSpecies(value)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="dog">Собака</ToggleButton>
                  <ToggleButton value="cat">Кошка</ToggleButton>
                  <ToggleButton value="other">Другое</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={stage === "loading" ? undefined : <AutoAwesomeOutlinedIcon />}
                disabled={!previewUrl || stage === "loading"}
                onClick={handleSearch}
              >
                {stage === "loading" ? (
                  <Stack direction="row" gap={1.5} alignItems="center">
                    <CircularProgress size={18} color="inherit" />
                    <span>Ищем похожих...</span>
                  </Stack>
                ) : (
                  "Найти похожих животных"
                )}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          {stage === "idle" && (
            <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", minHeight: 240, color: "text.secondary" }} gap={1}>
              <AutoAwesomeOutlinedIcon fontSize="large" />
              <Typography>Результаты появятся здесь после загрузки фото</Typography>
            </Stack>
          )}

          {stage === "loading" && (
            <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", minHeight: 240 }} gap={2}>
              <CircularProgress />
              <Typography color="text.secondary">Сравниваем с базой объявлений...</Typography>
            </Stack>
          )}

          {stage === "done" && (
            <Stack gap={2}>
              <Typography variant="h6">Похоже, это может быть один из этих питомцев:</Typography>
              <Grid container spacing={3}>
                {results.map((pet) => (
                  <Grid item xs={12} sm={6} key={pet.id}>
                    <PetCard pet={pet} showMatchScore />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
