import { useEffect, useRef } from "react";

const MIN_TEXTAREA_HEIGHT = 64;
const MAX_TEXTAREA_HEIGHT = 192;

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";

  const nextHeight = Math.min(Math.max(textarea.scrollHeight, MIN_TEXTAREA_HEIGHT), MAX_TEXTAREA_HEIGHT);

  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
}

export function useTextareaResize() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      resizeTextarea(textareaRef.current);
    }
  }, []);

  const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    resizeTextarea(event.currentTarget);
  };

  return {
    textareaRef,
    handleInput,
  };
}
