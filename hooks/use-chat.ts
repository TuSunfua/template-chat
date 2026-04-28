import { useMutation, useQueryClient } from "@tanstack/react-query";

import { UploadedAttachment } from "./use-uploaded-files";
import { Message } from "./use-message";
import { Conversation } from "./use-conversation";

type StreamHandlers = {
  onChunk?: (chunk: string) => void;
  onDone?: (message: Message) => void;
  onConversationData?: (data: Conversation) => void;
};

async function streamSSE(reader: ReadableStreamDefaultReader<Uint8Array>, handlers: StreamHandlers) {
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;

      try {
        const json = JSON.parse(line.slice(6));

        if (json.conversation) {
          handlers.onConversationData?.(json.conversation);
        }

        if (json.chunk) {
          handlers.onChunk?.(json.chunk);
        }

        if (json.done && json.assistantMessage) {
          handlers.onDone?.({
            id: json.assistantMessage.id,
            content: json.assistantMessage.content,
            role: json.assistantMessage.role,
            createdAt: json.assistantMessage.createdAt,
            attachments: [],
          });
        }
      } catch {
        // ignore
      }
    }
  }
}

async function sendChatRequest(payload: {
  message: string;
  attachments: UploadedAttachment[];
  conversationId?: string;
}) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: payload.message,
      attachments: payload.attachments,
      conversationId: payload.conversationId,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to send message");
  }

  if (!res.body) {
    throw new Error("No response body");
  }

  return res.body.getReader() as ReadableStreamDefaultReader<Uint8Array>;
}

export function useChat() {
  const queryClient = useQueryClient();

  const appendMessage = (conversationId: string, message: Message) => {
    queryClient.setQueryData<Message[]>(["messages", conversationId], (old) => {
      if (!old) return [message];
      return [...old, message];
    });
  };

  const sendFirstMessage = useMutation({
    mutationFn: async ({
      message,
      attachments,
      onChunk,
      initialMessages,
    }: {
      message: string;
      attachments: UploadedAttachment[];
      onChunk?: (chunk: string) => void;
      initialMessages: Message[];
    }) => {
      const reader = await sendChatRequest({ message, attachments });

      let conversationId = "";
      let assistantMessage: Message | null = null;

      await streamSSE(reader, {
        onConversationData: (conversationData) => {
          // Set conversation cache
          conversationId = conversationData.id;
          queryClient.setQueryData(["conversation", conversationId], conversationData);
        },
        onChunk,
        onDone: (msg) => {
          if (!conversationId) return;
          assistantMessage = msg;

          // Update messages cache
          const allMessages = [...initialMessages, msg];
          queryClient.setQueryData(["messages", conversationId], allMessages);
        },
      });

      return { conversationId, assistantMessage };
    },
    onSuccess: ({ conversationId }) => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    },
  });

  const sendMessage = useMutation({
    onMutate: ({ conversationId, message, attachments }) => {
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        content: message,
        role: "USER",
        createdAt: new Date().toISOString(),
        attachments: attachments.map((f) => ({
          id: `temp-${Date.now()}`,
          url: f.url,
          fileName: f.name,
          fileType: f.type,
          fileSize: f.size,
        })),
      };

      appendMessage(conversationId, tempMessage);
    },

    mutationFn: async ({
      message,
      attachments,
      conversationId,
      onChunk,
    }: {
      message: string;
      attachments: UploadedAttachment[];
      conversationId: string;
      onChunk?: (chunk: string) => void;
    }) => {
      const reader = await sendChatRequest({
        message,
        attachments,
        conversationId,
      });

      await streamSSE(reader, {
        onChunk,
        onDone: (msg) => {
          appendMessage(conversationId, msg);
        },
      });
    },
  });

  return {
    sendFirstMessage,
    sendMessage,
  };
}
