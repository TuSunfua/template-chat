import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Conversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    id: string;
    role: string;
    content: string;
    createdAt: string;
  } | null;
}

export function useConversation() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await fetch("/api/conversations");

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = (await response.json()) as { conversations: Conversation[] };

      for (const conversation of data.conversations) {
        queryClient.setQueryData(["conversation", conversation.id], conversation);
      }

      return data.conversations;
    },
  });
}

export function useConversationById(conversationId: string) {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      const response = await fetch(`/api/conversations/${conversationId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch conversation");
      }

      const data = await response.json();
      return data.conversation as Conversation;
    },
  });
}
