import { useState } from "react";

export type UploadedAttachment = {
  name: string;
  size: number;
  type: string;
  url: string;
};

export function useUploadedFiles() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedAttachment[]>([]);

  const addFiles = (files: UploadedAttachment[]) => {
    setUploadedFiles((prev) => [...files, ...prev].slice(0, 8));
  };

  const removeFile = (url: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.url !== url));
  };

  const clearFiles = () => {
    setUploadedFiles([]);
  };

  return {
    uploadedFiles,
    addFiles,
    removeFile,
    clearFiles,
  };
}
