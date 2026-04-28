import { CircularProgressIcon } from "./circular-progress-icon";

interface PendingUploadsProps {
  files: string[];
  progress: number;
}

export function PendingUploads({ files, progress }: PendingUploadsProps) {
  if (!files.length) {
    return null;
  }

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {files.map((fileName) => (
        <div
          key={fileName}
          className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#dce2f3] bg-[#f5f8ff] px-3 py-1.5"
        >
          <CircularProgressIcon progress={progress} />
          <span className="truncate text-xs font-medium text-[#0f172a]">{fileName}</span>
          <span className="shrink-0 text-[11px] text-[#667085]">{progress}%</span>
        </div>
      ))}
    </div>
  );
}
