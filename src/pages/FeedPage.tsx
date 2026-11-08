import { Button, Container, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PetGrid, PetGridSkeleton, usePets, type Pet } from "@/entities/pet";
import { ListingFilters, useListingFilters } from "@/features/filter-listings";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/StateViews";

function FeedContent({ pets }: { pets: Pet[] }) {
  const { filters, setFilter, reset, cities, filtered, activeCount } = useListingFilters(pets);

  return (
    <>
      <ListingFilters filters={filters} cities={cities} activeCount={activeCount} onChange={setFilter} onReset={reset} />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} aria-live="polite">
        Найдено объявлений: {filtered.length}
      </Typography>
      {filtered.length === 0 ? (
        <EmptyState
          title="По этим фильтрам ничего не нашлось"
          text="Попробуйте изменить город, вид животного или текст поиска."
          action={
            <Button variant="outlined" onClick={reset}>
              Сбросить фильтры
            </Button>
          }
        />
      ) : (
        <PetGrid pets={filtered} />
      )}
    </>
  );
}

export function FeedPage() {
  const { data, loading, error, retry } = usePets();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
      <PageHeader
        title="Лента объявлений"
        description="Потерянные и найденные животные — отфильтруйте список по виду, статусу и городу."
      />
      <AsyncBoundary
        data={data}
        loading={loading}
        error={error}
        onRetry={retry}
        skeleton={<PetGridSkeleton count={6} />}
        isEmpty={(pets) => pets.length === 0}
        empty={
          <EmptyState
            title="Пока нет ни одного объявления"
            text="Разместите первое — его сразу увидят в ленте."
            action={
              <Button variant="contained" component={RouterLink} to="/pets/new">
                Разместить объявление
              </Button>
            }
          />
        }
      >
        {(pets) => <FeedContent pets={pets} />}
      </AsyncBoundary>
    </Container>
  );
}
