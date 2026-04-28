import { FileTextIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type UploadedAttachment = {
  name: string;
  size: number;
  type: string;
  url: string;
};

interface UploadedFilesProps {
  files: UploadedAttachment[];
  onRemove: (url: string) => void;
}

export function UploadedFiles({ files, onRemove }: UploadedFilesProps) {
  if (!files.length) {
    return null;
  }

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {files.map((file) => (
        <div
          key={file.url}
          className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#e6eaf2] bg-[#f8faff] px-3 py-1.5"
        >
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-w-0 items-center gap-2 text-left transition-colors hover:opacity-80"
          >
            <FileTextIcon className="size-3.5 shrink-0 text-[#1e0dff]" />
            <span className="truncate text-xs font-medium text-[#0f172a]">{file.name}</span>
            <span className="shrink-0 text-[11px] text-[#667085]">{Math.round(file.size / 1024)} KB</span>
          </a>

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onRemove(file.url)}
            className="size-4 rounded-full p-0 text-[#667085] hover:bg-[#eef3ff] hover:text-[#1f2937]"
            aria-label={`Remove ${file.name}`}
          >
            <XIcon className="size-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
