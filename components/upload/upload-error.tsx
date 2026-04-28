import { CircleAlertIcon } from "lucide-react";

interface UploadErrorProps {
  error: string | null;
}

export function UploadError({ error }: UploadErrorProps) {
  if (!error) {
    return null;
  }

  return (
    <p className="mb-2 flex items-center gap-1.5 text-xs text-red-600">
      <CircleAlertIcon className="size-3.5" />
      {error}
    </p>
  );
}
