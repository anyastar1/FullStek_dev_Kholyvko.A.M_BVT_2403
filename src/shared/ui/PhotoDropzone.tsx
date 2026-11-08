import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Box, Button, FormHelperText, Stack, Typography } from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { validateImageFile } from "@/shared/lib/image";
import { useObjectUrl } from "@/shared/lib/useObjectUrl";

interface PhotoDropzoneProps {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  previewHeight?: number;
}

export function PhotoDropzone({ file, onChange, error, previewHeight = 240 }: PhotoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | undefined>();
  const previewUrl = useObjectUrl(file);
  const shownError = fileError ?? error;

  function accept(selected: File | undefined) {
    if (!selected) return;
    const problem = validateImageFile(selected);
    if (problem) {
      setFileError(problem);
      return;
    }
    setFileError(undefined);
    onChange(selected);
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    accept(event.target.files?.[0]);
    event.target.value = ""; // позволяет выбрать тот же файл повторно
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  return (
    <Box>
      <Box
        role="button"
        tabIndex={0}
        aria-label="Выбрать фотографию животного"
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          accept(event.dataTransfer.files?.[0]);
        }}
        sx={{
          border: "2px dashed",
          borderColor: shownError ? "error.main" : dragging ? "primary.main" : "divider",
          borderRadius: 3,
          p: previewUrl ? 1 : 4,
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: dragging ? "rgba(62,92,70,0.08)" : "#F1ECE0",
          transition: "border-color 0.2s ease, background-color 0.2s ease",
          "&:hover, &:focus-visible": { borderColor: "primary.main", outline: "none" },
        }}
      >
        {previewUrl ? (
          <Box
            component="img"
            src={previewUrl}
            alt="Предпросмотр выбранного фото"
            sx={{ width: "100%", height: previewHeight, objectFit: "cover", borderRadius: 2, display: "block" }}
          />
        ) : (
          <Stack alignItems="center" gap={1}>
            <UploadFileOutlinedIcon color="action" fontSize="large" />
            <Typography variant="body1">Нажмите или перетащите фото сюда</Typography>
            <Typography variant="body2" color="text.secondary">
              JPG, PNG или WebP, до 5 МБ
            </Typography>
          </Stack>
        )}
      </Box>
      {file && (
        <Button
          size="small"
          startIcon={<CloseIcon />}
          onClick={() => {
            setFileError(undefined);
            onChange(null);
          }}
          sx={{ mt: 1 }}
        >
          Убрать фото
        </Button>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleInput} />
      {shownError && <FormHelperText error>{shownError}</FormHelperText>}
    </Box>
  );
}
