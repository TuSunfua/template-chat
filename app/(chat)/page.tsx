"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import { useChat } from "@/hooks/use-chat";
import { Message } from "@/hooks/use-message";
import { UploadedAttachment } from "@/hooks";
import InputArea from "@/components/input-area";
import { Button } from "@/components/ui/button";

export default function Chat() {
  const router = useRouter();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isResponding, setIsResponding] = useState(false);

  const displayMessages: Message[] = [
    ...messages,
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

  const { sendFirstMessage } = useChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [messages, streamingContent]);

  const handleSendMessage = async (message: string, attachments: UploadedAttachment[]) => {
    // Add optimistic user message
    const userMessage: Message = {
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

    setMessages((prev) => [...prev, userMessage]);

    setIsResponding(true);
    setStreamingContent("");

    try {
      const { conversationId, assistantMessage } = await sendFirstMessage.mutateAsync({
        message,
        attachments,
        initialMessages: [userMessage],
        onChunk: (chunk) => {
          setStreamingContent((prev) => prev + chunk);
        },
      });

      if (assistantMessage) {
        setMessages((prev) => [...prev, assistantMessage]);
      }

      // Redirect without resetting scroll so the destination can mount cleanly first
      setTimeout(() => {
        router.push(`/${conversationId}`, { scroll: false });
      }, 500);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsResponding(false);
      setStreamingContent("");
    }
  };

  return (
    <section className="flex h-[calc(100vh-56px)] w-full flex-col px-4 pb-8">
      <div className={`invisible flex items-center px-9 py-3 ${displayMessages.length > 0 ? "visible" : ""}`}>
        <Button variant="ghost" className="cursor-not-allowed px-0 text-sm hover:bg-transparent">
          <ArrowLeftIcon className="size-4" /> <p className="">Back</p>
        </Button>
        <h1 className="flex flex-1 justify-center text-lg font-semibold">Untitled Conversation</h1>
      </div>

      {displayMessages.length === 0 ? (
        <div className="mx-auto w-full max-w-4xl px-4 py-10 text-center">
          <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.02em]">Generate Fully Editable Assets</h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-[16px] leading-8">
            Prompt to free production-ready designs, documents, presentations, diagrams, charts and web assets in an all
            in one ai powered editor. Editable outputs with native exports.
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl p-1">
            <div className="space-y-6">
              {displayMessages.map((message) => (
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
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <InputArea onSendMessage={handleSendMessage} />
    </section>
  );
}
