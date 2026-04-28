import { useEffect, useState } from "react";

export function useUploadState() {
  const [pendingUploadFiles, setPendingUploadFiles] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (uploadError) {
      const timer = setTimeout(() => {
        setUploadError(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [uploadError]);

  return {
    pendingUploadFiles,
    setPendingUploadFiles,
    uploadError,
    setUploadError,
    uploadProgress,
    setUploadProgress,
  };
}
