import { Container, Paper } from "@mui/material";
import { CreateListingForm } from "@/features/create-listing";
import { PageHeader } from "@/shared/ui/PageHeader";

export function CreateListingPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 7 } }}>
      <PageHeader
        title="Разместить объявление"
        description="Заполните карточку животного — чем подробнее описание, тем быстрее его узнают."
      />
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
        <CreateListingForm />
      </Paper>
    </Container>
  );
}
