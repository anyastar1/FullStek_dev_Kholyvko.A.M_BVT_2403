import { useEffect, useState } from "react";
import { Alert, Box, Dialog, DialogActions, DialogContent, DialogTitle, Button, Stack, TextField } from "@mui/material";
import { updateUser, useAuth, type User } from "@/entities/user";
import { useForm } from "@/shared/lib/useForm";
import { SubmitButton } from "@/shared/ui/SubmitButton";
import { emptyProfile, validateProfile } from "../model/validateProfile";

interface EditProfileDialogProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onSaved: () => void;
}

const FORM_ID = "edit-profile-form";

/** Окно редактирования профиля с валидацией полей. */
export function EditProfileDialog({ open, user, onClose, onSaved }: EditProfileDialogProps) {
  const { field, handleSubmit, reset } = useForm(emptyProfile, validateProfile);
  const { applyUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // при каждом открытии подставляем актуальные данные и очищаем ошибки
  useEffect(() => {
    if (open) {
      reset({ name: user.name, phone: user.phone, city: user.city });
      setServerError(null);
    }
  }, [open, user, reset]);

  const submit = handleSubmit(async (values) => {
    setSaving(true);
    setServerError(null);
    try {
      applyUser(await updateUser(user.id, values));
      onSaved();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Не удалось сохранить профиль");
    } finally {
      setSaving(false);
    }
  });

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="xs" aria-labelledby="edit-profile-title">
      <DialogTitle id="edit-profile-title">Редактировать профиль</DialogTitle>
      <DialogContent>
        <Box component="form" id={FORM_ID} noValidate onSubmit={submit} sx={{ pt: 1 }}>
          <Stack gap={2.5}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <TextField fullWidth label="Имя" autoComplete="name" {...field("name")} />
            <TextField fullWidth label="Телефон" autoComplete="tel" {...field("phone")} />
            <TextField fullWidth label="Город" {...field("city")} />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Отмена
        </Button>
        <SubmitButton form={FORM_ID} size="medium" loading={saving}>
          {saving ? "Сохраняем…" : "Сохранить"}
        </SubmitButton>
      </DialogActions>
    </Dialog>
  );
}
