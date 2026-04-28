import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadButtonProps {
  onOpen: () => void;
  disabled: boolean;
}

export function FileUploadButton({ onOpen, disabled }: FileUploadButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onOpen}
      disabled={disabled}
      className="rounded-full p-1.5 hover:bg-[#f2f5fd]"
    >
      <PlusIcon className="size-5" />
    </Button>
  );
}
