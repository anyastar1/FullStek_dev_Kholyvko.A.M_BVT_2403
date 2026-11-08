import { Alert, Box, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import type { PetSpecies } from "@/entities/pet";
import { useForm, type FormErrors } from "@/shared/lib/useForm";
import { PhotoDropzone } from "@/shared/ui/PhotoDropzone";
import { SubmitButton } from "@/shared/ui/SubmitButton";

type SearchFormValues = { file: File | null; species: PetSpecies };

const initialValues: SearchFormValues = { file: null, species: "dog" };

function validate(values: SearchFormValues): FormErrors<SearchFormValues> {
  return { file: values.file ? undefined : "Загрузите фотографию, по которой нужно искать" };
}

interface PhotoSearchFormProps {
  loading: boolean;
  onSearch: (file: File, species: PetSpecies) => void;
  onChange: () => void;
}
export function PhotoSearchForm({ loading, onSearch, onChange }: PhotoSearchFormProps) {
  const { values, errors, setValue, handleSubmit } = useForm(initialValues, validate);

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit((submitted) => {
          if (submitted.file) onSearch(submitted.file, submitted.species);
        })}
      >
        <Stack gap={2.5}>
          <PhotoDropzone
            file={values.file}
            error={errors.file}
            onChange={(file) => {
              setValue("file", file);
              onChange();
            }}
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Кто на фото?
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={values.species}
              onChange={(_, value: PetSpecies | null) => {
                if (!value) return;
                setValue("species", value);
                onChange();
              }}
            >
              <ToggleButton value="dog">Собака</ToggleButton>
              <ToggleButton value="cat">Кошка</ToggleButton>
              <ToggleButton value="other">Другое</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <SubmitButton loading={loading} icon={<AutoAwesomeOutlinedIcon />}>
            {loading ? "Ищем похожих…" : "Найти похожих животных"}
          </SubmitButton>

          <Alert severity="info" variant="outlined">
            Результаты демонстрационные: сравнение фотографий появится после подключения backend.
          </Alert>
        </Stack>
      </Box>
    </Paper>
  );
}
