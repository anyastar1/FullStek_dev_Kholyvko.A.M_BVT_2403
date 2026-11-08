import {
  Button,
  Collapse,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import type { ListingFilters as Filters, SetFilter } from "../model/useListingFilters";

interface ListingFiltersProps {
  filters: Filters;
  cities: string[];
  activeCount: number;
  onChange: SetFilter;
  onReset: () => void;
}
export function ListingFilters({ filters, cities, activeCount, onChange, onReset }: ListingFiltersProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
      <Stack gap={2}>
        <TextField
          fullWidth
          size="small"
          label="Поиск по кличке, породе, окрасу и описанию"
          value={filters.query}
          onChange={(event) => onChange("query", event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: filters.query ? (
              <InputAdornment position="end">
                <IconButton size="small" aria-label="Очистить поиск" onClick={() => onChange("query", "")}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
        />

        <Stack direction={{ xs: "column", md: "row" }} gap={2} alignItems={{ md: "center" }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={filters.status}
            onChange={(_, value) => value && onChange("status", value)}
          >
            <ToggleButton value="all">Все</ToggleButton>
            <ToggleButton value="lost">Потеряны</ToggleButton>
            <ToggleButton value="found">Найдены</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            exclusive
            size="small"
            value={filters.species}
            onChange={(_, value) => value && onChange("species", value)}
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
            value={filters.city}
            onChange={(event) => onChange("city", event.target.value)}
            sx={{ minWidth: 200 }}
          >
            {cities.map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </TextField>

          <Collapse in={activeCount > 0} orientation="horizontal" unmountOnExit sx={{ ml: { md: "auto" } }}>
            <Button onClick={onReset} sx={{ whiteSpace: "nowrap" }}>
              Сбросить ({activeCount})
            </Button>
          </Collapse>
        </Stack>
      </Stack>
    </Paper>
  );
}
