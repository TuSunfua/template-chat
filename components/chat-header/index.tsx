"use client";

import { useState, useRef, useEffect } from "react";
import { SearchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { useConversation } from "@/hooks/use-conversation";
import { cn } from "@/lib/utils";

export default function ChatHeader() {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const conversationsQuery = useConversation();
  const conversations = conversationsQuery.data ?? [];
  const isConversationsLoading = conversationsQuery.isLoading;

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredConversations = normalizedSearchTerm
    ? conversations.filter((c) => {
        const title = c.title?.toLowerCase() ?? "";
        const last = c.lastMessage?.content.toLowerCase() ?? "";
        return title.includes(normalizedSearchTerm) || last.includes(normalizedSearchTerm);
      })
    : conversations;

  // focus input
  useEffect(() => {
    if (isSearchActive) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isSearchActive]);

  // click outside → close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsSearchActive(false);
        setSearchTerm("");
      }
    };

    if (isSearchActive) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchActive]);

  return (
    <div className="relative flex h-14 w-full items-center justify-between border-b px-12">
      {/* LEFT */}
      <Link href="/" className="relative h-6 w-32">
        <Image src="/full-logo.svg" alt="logo" fill className="object-contain" />
      </Link>

      {/* RIGHT SEARCH */}
      <div ref={containerRef} className="relative flex flex-1 items-center">
        {/* INPUT (absolute) */}
        <div
          className={cn(
            "absolute right-0 flex items-center transition-all duration-300 ease-in-out",
            isSearchActive ? "w-[calc(100%-48px)] opacity-100" : "pointer-events-none w-0 opacity-0",
          )}
        >
          <div className="flex w-full items-center gap-2 rounded-[20px] border border-[#4031ff] bg-[#f8faff] px-3 py-2 pr-8">
            <SearchIcon className="size-4 text-[#667085]" />

            <input
              ref={inputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        {/* ICON */}
        {!isSearchActive && (
          <button
            onClick={() => setIsSearchActive(true)}
            className={cn(
              "absolute right-0 z-10 flex size-9 items-center justify-center rounded-full transition-all duration-300",
              "hover:bg-[#f2f5fd]",
            )}
          >
            <SearchIcon className="size-4.5" />
          </button>
        )}

        {/* DROPDOWN */}
        <div
          className={cn(
            "absolute top-6 right-0 w-[calc(100%-48px)] rounded-xl border bg-white py-3 shadow-xl",
            "transition-all duration-200",
            isSearchActive
              ? "translate-y-0 opacity-100 delay-350"
              : "pointer-events-none translate-y-2 opacity-0 delay-0",
          )}
        >
          <div className="max-h-80 space-y-1 overflow-y-auto px-3">
            {isConversationsLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-lg border border-transparent px-3 py-2">
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                  <Skeleton className="mt-2 h-3 w-full rounded-md" />
                </div>
              ))
            ) : filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-sm text-gray-500">No conversations found.</p>
              </div>
            ) : (
              filteredConversations.map((c) => (
                <Link
                  key={c.id}
                  href={`/${c.id}`}
                  onClick={() => {
                    setIsSearchActive(false);
                    setSearchTerm("");
                  }}
                  className="block rounded-lg border border-transparent px-3 py-2 hover:border-[#d9e1f5] hover:bg-[#f2f5fd]"
                >
                  <p className="text-sm font-medium">{c.title || "Untitled"}</p>
                  <p className="line-clamp-2 text-xs text-gray-500">{c.lastMessage?.content}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
