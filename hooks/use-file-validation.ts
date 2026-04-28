import { useCallback } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { getUploadTypeFromFile, UploadType, UPLOAD_TYPES, TYPE_TO_ACCEPT_VALUE } from "./upload-utils";
import { useMemo } from "react";

interface UseFileValidationProps {
  onSetError: (error: string) => void;
  onSetPendingFiles: (files: string[]) => void;
  onStartUpload: (files: File[]) => Promise<unknown>;
}

export function useFileValidation({ onSetError, onSetPendingFiles, onStartUpload }: UseFileValidationProps) {
  const { routeConfig } = useUploadThing("chatAttachment");

  const acceptedFileTypes = useMemo(() => {
    if (!routeConfig) {
      return "image/*,application/pdf,text/*";
    }

    const accepted = UPLOAD_TYPES.filter((type) => Boolean(routeConfig[type])).map(
      (type) => TYPE_TO_ACCEPT_VALUE[type],
    );

    return accepted.join(",") || "image/*,application/pdf,text/*";
  }, [routeConfig]);

  const validateFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) {
        return;
      }

      if (routeConfig) {
        const counter: Record<UploadType, number> = {
          image: 0,
          pdf: 0,
          text: 0,
        };

        for (const file of files) {
          const fileType = getUploadTypeFromFile(file);

          if (!fileType || !routeConfig[fileType]) {
            onSetError(`File type is not supported: ${file.name}`);
            return;
          }

          counter[fileType] += 1;
        }

        for (const type of Object.keys(counter) as UploadType[]) {
          const amount = counter[type];
          if (!amount) {
            continue;
          }

          const maxFileCount = routeConfig[type]?.maxFileCount;
          if (maxFileCount && amount > maxFileCount) {
            onSetError(`You can upload at most ${maxFileCount} ${type} file(s) per upload.`);
            return;
          }
        }
      }

      onSetPendingFiles(files.map((file) => file.name));

      try {
        await onStartUpload(files);
      } catch {
        // UploadThing callbacks already handle error state.
      }
    },
    [routeConfig, onSetError, onSetPendingFiles, onStartUpload],
  );

  return {
    acceptedFileTypes,
    validateFiles,
  };
}
