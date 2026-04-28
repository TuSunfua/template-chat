import { useRef, useState } from "react";
import { SparklesIcon } from "lucide-react";

import { useUploadThing } from "@/lib/uploadthing";
import { UploadedAttachment, useFileValidation, useTextareaResize, useUploadedFiles, useUploadState } from "@/hooks";
import { FileUploadButton, PendingUploads, UploadedFiles, UploadError } from "../upload";
import { Button } from "../ui/button";

export default function InputArea({
  onSendMessage,
}: {
  onSendMessage: (message: string, attachments: UploadedAttachment[]) => Promise<void>;
}) {
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Upload state management
  const { pendingUploadFiles, setPendingUploadFiles, uploadError, setUploadError, uploadProgress, setUploadProgress } =
    useUploadState();
  const { uploadedFiles, addFiles, removeFile, clearFiles } = useUploadedFiles();
  const { textareaRef, handleInput } = useTextareaResize();

  // Upload hook
  const { startUpload, isUploading } = useUploadThing("chatAttachment", {
    onBeforeUploadBegin: (files) => {
      setUploadError(null);
      setUploadProgress(0);
      return files;
    },
    uploadProgressGranularity: "fine",
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    onClientUploadComplete: (res) => {
      const nextFiles = res.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.ufsUrl,
      }));

      addFiles(nextFiles);
      setPendingUploadFiles([]);
      setUploadProgress(100);
    },
    onUploadError: (error) => {
      setUploadError(error.message);
      setPendingUploadFiles([]);
      setUploadProgress(0);
    },
  });

  // File validation
  const { acceptedFileTypes, validateFiles } = useFileValidation({
    onSetError: setUploadError,
    onSetPendingFiles: setPendingUploadFiles,
    onStartUpload: startUpload,
  });

  const handleNativeFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    await validateFiles(files);
    event.target.value = "";
  };

  const handleSendMessage = async () => {
    if (sending || isUploading) return;
    setSending(true);

    const message = textareaRef.current?.value.trim() || "";
    if (message || uploadedFiles.length > 0) {
      if (textareaRef.current) {
        textareaRef.current.value = "";
        textareaRef.current.rows = 1;
      }

      clearFiles();

      await onSendMessage(message, uploadedFiles);
    }

    setSending(false);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSendMessage();
    }
  };

  return (
    <div className="mx-auto mt-3 w-full max-w-4xl">
      <div className="rounded-3xl border border-[#d8deeb] px-3 py-3 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.45)]">
        <PendingUploads files={pendingUploadFiles} progress={uploadProgress} />

        <UploadedFiles files={uploadedFiles} onRemove={removeFile} />

        <UploadError error={uploadError} />

        <textarea
          ref={textareaRef}
          rows={1}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="max-h-48 min-h-16 w-full resize-none overflow-y-auto bg-transparent text-sm leading-6 ring-0 outline-none placeholder:text-[#667085] focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Ask template.net"
          disabled={sending}
        />

        <div className="mt-1 flex items-center justify-between">
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleNativeFileChange}
              accept={acceptedFileTypes}
              className="hidden"
            />

            <FileUploadButton onOpen={() => fileInputRef.current?.click()} disabled={sending || isUploading} />
          </>

          <Button
            variant="ghost"
            onClick={handleSendMessage}
            disabled={sending || isUploading}
            className="cursor-pointer rounded-[3.40282e38px] bg-[#1e0dff] px-3 py-1.5 text-white hover:bg-[#4031ff] hover:text-white"
          >
            <SparklesIcon className="size-4" />
            <p className="text-[12px]">Generate Free</p>
          </Button>
        </div>
      </div>
    </div>
  );
}
