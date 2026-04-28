"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import { useConversationById } from "@/hooks/use-conversation";
import { useMessage, Message } from "@/hooks/use-message";
import { useChat } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import InputArea from "@/components/input-area";

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [isResponding, setIsResponding] = useState(false);

  const conversationQuery = useConversationById(conversationId);
  const messagesQuery = useMessage(conversationId);
  const { sendMessage } = useChat();

  // Keep viewport at the latest message without delayed smooth animation.
  useLayoutEffect(() => {
    if (conversationQuery.isLoading || messagesQuery.isLoading) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [conversationQuery.isLoading, messagesQuery.isLoading, messagesQuery.data, streamingContent, isResponding]);

  useEffect(() => {
    if (!conversationQuery.isLoading && !conversationQuery.data) {
      router.replace("/");
    }
  }, [conversationQuery.isLoading, conversationQuery.data, router]);

  const displayMessages: Message[] = [
    ...messagesQuery.data,
    ...(isResponding
      ? [
          {
            id: "streaming",
            content: streamingContent || "Responding...",
            role: "ASSISTANT" as const,
            createdAt: new Date().toISOString(),
            attachments: [],
          },
        ]
      : []),
  ];

  if (conversationQuery.isLoading || messagesQuery.isLoading) {
    return (
      <section className="flex h-[calc(100vh-56px)] w-full flex-col px-4 pb-8">
        <div className="flex items-center px-9 py-3">
          <Skeleton className="h-8 w-24 rounded-full" />

          <div className="flex flex-1 justify-center">
            <Skeleton className="h-8 w-48" />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-start">
                <div className="max-w-2xl space-y-3">
                  <Skeleton className="h-6 w-24 rounded-md" />
                  <Skeleton className="h-6 w-[min(32rem,75vw)] rounded-md" />
                  <Skeleton className="h-6 w-[min(28rem,65vw)] rounded-md" />
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-2xl space-y-3">
                  <Skeleton className="ml-auto h-6 w-32 rounded-md" />
                  <Skeleton className="ml-auto h-6 w-[min(24rem,60vw)] rounded-md" />
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-2xl space-y-3">
                  <Skeleton className="h-6 w-24 rounded-md" />
                  <Skeleton className="h-6 w-[min(32rem,75vw)] rounded-md" />
                  <Skeleton className="h-6 w-[min(28rem,65vw)] rounded-md" />
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-2xl space-y-3">
                  <Skeleton className="ml-auto h-6 w-32 rounded-md" />
                  <Skeleton className="ml-auto h-6 w-[min(24rem,60vw)] rounded-md" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Skeleton className="h-33 w-full rounded-3xl" />
          </div>
        </div>
      </section>
    );
  }

  if (!conversationQuery.data) {
    return null;
  }

  return (
    <section className="flex h-[calc(100vh-56px)] w-full flex-col px-4 pb-8">
      <div className="flex items-center px-9 py-3">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="px-0 text-sm hover:bg-transparent hover:text-[#1e0dff]"
        >
          <ArrowLeftIcon className="size-4" /> <p className="">Back</p>
        </Button>
        <h1 className="flex flex-1 justify-center text-lg font-semibold">
          {conversationQuery.data.title || "Untitled Conversation"}
        </h1>
      </div>

      {/* Messages Container */}
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl p-1">
          <div className="space-y-6">
            {displayMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center py-8 text-center">
                <p className="text-[#667085]">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              displayMessages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "USER" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-2xl space-y-4 text-[14px] ${
                      message.role === "USER" ? "rounded-[26px] bg-[#f2f5fd] px-4 py-2 text-[#2b3653]" : ""
                    }`}
                  >
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-1 space-y-2">
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center gap-2">
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate text-xs underline hover:no-underline"
                            >
                              {attachment.fileName}
                            </a>
                            {attachment.fileSize && (
                              <span className="text-xs opacity-70">({(attachment.fileSize / 1024).toFixed(2)} KB)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {message.id === "streaming" && streamingContent === "" ? (
                      <div className="text-[#667085]">Responding...</div>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          pre: ({ children }) => (
                            <pre className="overflow-x-auto rounded-xl bg-[#f6f8fa] p-4">{children}</pre>
                          ),
                          code: ({ className, children }) => {
                            const isBlock = className?.includes("language-");

                            if (isBlock) {
                              return <code className="font-mono text-sm text-[#1f2937]">{children}</code>;
                            }

                            // inline code
                            return (
                              <code className="rounded-md bg-[#eef2f7] px-1.5 py-0.5 font-mono text-[13px]">
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {message.content
                          ?.replace(/\\\((.*?)\\\)/g, "$$$1$")
                          .replace(/\\\[([\s\S]*?)\\\]/g, (_, eq) => `$$${eq.trim()}$$`) || "No content"}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <InputArea
        onSendMessage={async (message, attachments) => {
          setIsResponding(true);
          setStreamingContent("");

          try {
            await sendMessage.mutateAsync({
              message,
              attachments,
              conversationId,
              onChunk: (chunk) => {
                setStreamingContent((prev) => prev + chunk);
              },
            });
          } catch (error) {
            console.error("Error sending message:", error);
          } finally {
            setIsResponding(false);
            setStreamingContent("");
          }
        }}
      />
    </section>
  );
}
