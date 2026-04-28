import { useQuery } from "@tanstack/react-query";

export interface Message {
  id: string;
  content: string | null;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  createdAt: string;
  attachments: Array<{
    id: string;
    url: string;
    fileName: string;
    fileType: string;
    fileSize?: number;
  }>;
}

export function useMessage(conversationId: string) {
  const messageQuery = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      return data.messages as Message[];
    },
  });

  return {
    ...messageQuery,
    data: messageQuery.data || [],
  };
}
