export const MAX_IMAGE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImageFile(file: File): string | undefined {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Допустимы изображения JPG, PNG или WebP";
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return `Файл больше ${MAX_IMAGE_MB} МБ — выберите фото поменьше`;
  }
  return undefined;
}
