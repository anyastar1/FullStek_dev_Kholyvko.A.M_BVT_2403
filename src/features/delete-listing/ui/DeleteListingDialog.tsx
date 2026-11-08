import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { deletePet, type Pet } from "@/entities/pet";

interface DeleteListingDialogProps {
  pet: Pet | null;
  onClose: () => void;
  onDeleted: (pet: Pet) => void;
}
export function DeleteListingDialog({ pet, onClose, onDeleted }: DeleteListingDialogProps) {
  const [shown, setShown] = useState<Pet | null>(pet);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pet) {
      setShown(pet);
      setError(null);
    }
  }, [pet]);

  async function confirm() {
    if (!pet) return;
    setLoading(true);
    setError(null);
    try {
      await deletePet(pet.id);
      onDeleted(pet);
    } catch {
      setError("Не удалось удалить объявление. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={Boolean(pet)} onClose={loading ? undefined : onClose} aria-labelledby="delete-listing-title">
      <DialogTitle id="delete-listing-title">Удалить объявление?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Объявление «{shown?.name}» будет удалено без возможности восстановления.
        </DialogContentText>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={confirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
