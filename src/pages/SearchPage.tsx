import { Button, Container, Grid, Stack, Typography } from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { Link as RouterLink } from "react-router-dom";
import { PetGrid } from "@/entities/pet";
import { PhotoSearchForm, useSimilarSearch } from "@/features/search-by-photo";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/shared/ui/StateViews";

export function SearchPage() {
  const search = useSimilarSearch();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
      <PageHeader
        title="Поиск по фотографии"
        description="Загрузите фотографию животного — система сравнит её с объявлениями в базе и покажет наиболее похожих питомцев с оценкой совпадения."
      />

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <PhotoSearchForm loading={search.status === "loading"} onSearch={search.run} onChange={search.reset} />
        </Grid>

        <Grid item xs={12} md={7}>
          {search.status === "idle" && (
            <EmptyState
              icon={<AutoAwesomeOutlinedIcon fontSize="large" />}
              title="Результаты появятся здесь"
              text="Загрузите фото и нажмите «Найти похожих животных»."
            />
          )}

          {search.status === "loading" && <LoadingState text="Сравниваем с базой объявлений…" />}

          {search.status === "error" && (
            <ErrorState title="Поиск не удался" message={search.error ?? ""} onRetry={search.retry} />
          )}

          {search.status === "done" &&
            (search.results.length === 0 ? (
              <EmptyState
                title="Похожих животных не нашлось"
                text="Попробуйте другое фото или загляните в ленту объявлений."
                action={
                  <Button variant="outlined" component={RouterLink} to="/feed">
                    Открыть ленту
                  </Button>
                }
              />
            ) : (
              <Stack gap={2}>
                <Typography variant="h6">Найдено похожих: {search.results.length}</Typography>
                <PetGrid pets={search.results} twoColumns showMatchScore />
              </Stack>
            ))}
        </Grid>
      </Grid>
    </Container>
  );
}
