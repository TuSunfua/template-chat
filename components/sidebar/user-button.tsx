"use client";

import { LogInIcon, LogOutIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function UserButton() {
  const { data } = useSession();

  if (!data?.user) {
    return (
      <Link href="/login" className="flex w-full flex-col items-center px-2">
        <span className="mb-1.5 flex size-8 w-full items-center justify-center rounded-[99px] hover:bg-[#e7edfc]">
          <LogInIcon className="size-4.5" />
        </span>
        <p className="text-[10px]">Sign in</p>
      </Link>
    );
  }

  const fallback = data.user?.name
    ? data.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : data.user.username.slice(0, 2).toUpperCase();

  return (
    <div className="flex w-full cursor-pointer flex-col items-center px-2">
      <span className="mb-1.5 flex size-8 items-center justify-center rounded-full">
        <Popover>
          <PopoverTrigger asChild>
            <Avatar>
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
          </PopoverTrigger>

          <PopoverContent
            className="relative w-40 px-0! pt-2! pb-3!"
            align="center"
            side="right"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <PopoverArrow stroke="2" />
            <div className="px-4">
              <p className="truncate text-sm font-medium text-[#111111]">{data.user.name ?? data.user.username}</p>
              <p className="truncate text-xs font-normal text-[#787878]">@{data.user.username}</p>
            </div>

            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="hover:bg-accent flex h-8 cursor-pointer items-center justify-start gap-2 rounded-none px-4! py-1 text-sm font-normal"
            >
              <LogOutIcon size={16} />
              Logout
            </Button>
          </PopoverContent>
        </Popover>
      </span>
      <p className="text-[10px]">Account</p>
    </div>
  );
}
