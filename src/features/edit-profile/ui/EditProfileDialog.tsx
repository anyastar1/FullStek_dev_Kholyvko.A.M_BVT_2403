import { useEffect, useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Button, Stack, TextField } from "@mui/material";
import { updateCurrentUser, type User } from "@/entities/user";
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
export function EditProfileDialog({ open, user, onClose, onSaved }: EditProfileDialogProps) {
  const { field, handleSubmit, reset } = useForm(emptyProfile, validateProfile);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) reset({ name: user.name, phone: user.phone, city: user.city });
  }, [open, user, reset]);

  const submit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await updateCurrentUser(values);
      onSaved();
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
