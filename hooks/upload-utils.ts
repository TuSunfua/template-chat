export type UploadType = "image" | "pdf" | "text";

export const UPLOAD_TYPES: UploadType[] = ["image", "pdf", "text"];

export const TYPE_TO_ACCEPT_VALUE: Record<UploadType, string> = {
  image: "image/*",
  pdf: "application/pdf",
  text: "text/*",
};

export function getUploadTypeFromFile(file: File): UploadType | null {
  if (file.type.startsWith("image/")) {
    return "image";
  }

  if (file.type === "application/pdf") {
    return "pdf";
  }

  if (file.type.startsWith("text/")) {
    return "text";
  }

  return null;
}
