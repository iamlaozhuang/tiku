import { professionValues, type Profession } from "../models/paper";

export const MAX_CONTENT_IMAGE_SIZE_BYTE = 5 * 1024 * 1024;

const allowedContentImageTypes = new Map([
  ["image/jpeg", new Set(["jpg", "jpeg"])],
  ["image/png", new Set(["png"])],
  ["image/gif", new Set(["gif"])],
  ["image/webp", new Set(["webp"])],
]);

export type NormalizedContentImageUploadInput = {
  commandPublicId: string;
  profession: Profession;
  file: File;
};

type ValidationResult =
  | { success: true; value: NormalizedContentImageUploadInput }
  | { success: false; message: "Invalid content_image input." };

function invalidInput(): ValidationResult {
  return { success: false, message: "Invalid content_image input." };
}

export function normalizeContentImageUploadInput(
  input: unknown,
): ValidationResult {
  if (typeof input !== "object" || input === null) {
    return invalidInput();
  }

  const value = input as Record<string, unknown>;
  const commandPublicId =
    typeof value.commandPublicId === "string"
      ? value.commandPublicId.trim()
      : "";
  const profession = value.profession;
  const file = value.file;

  if (
    commandPublicId.length === 0 ||
    commandPublicId.length > 200 ||
    typeof profession !== "string" ||
    !professionValues.includes(profession as Profession) ||
    !(file instanceof File) ||
    file.size <= 0 ||
    file.size > MAX_CONTENT_IMAGE_SIZE_BYTE
  ) {
    return invalidInput();
  }

  const allowedExtensions = allowedContentImageTypes.get(file.type);
  const extension = file.name.split(".").at(-1)?.toLowerCase() ?? "";

  if (allowedExtensions === undefined || !allowedExtensions.has(extension)) {
    return invalidInput();
  }

  return {
    success: true,
    value: { commandPublicId, profession: profession as Profession, file },
  };
}
