"use client";

import {
  ClockFadingIcon,
  CrownIcon,
  EllipsisIcon,
  FileTextIcon,
  FolderOpenIcon,
  HomeIcon,
  IdCardIcon,
  ImageIcon,
  LayoutTemplateIcon,
  PresentationIcon,
  SquarePlayIcon,
  WallpaperIcon,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import UserButton from "./user-button";

const items = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Document", href: "#", icon: FileTextIcon },
  { label: "Design", href: "#", icon: WallpaperIcon },
  { label: "Presentation", href: "#", icon: PresentationIcon },
  { label: "Image", href: "#", icon: ImageIcon },
  { label: "Video", href: "#", icon: SquarePlayIcon },
  { label: "More", href: "#", icon: EllipsisIcon },
  { label: "Templates", href: "#", icon: LayoutTemplateIcon },
  { label: "Brand", href: "#", icon: IdCardIcon },
  { label: "Projects", href: "#", icon: FolderOpenIcon },
  { label: "Recent", href: "#", icon: ClockFadingIcon },
];

export default function Sidebar() {
  return (
    <nav className="flex h-screen w-18 flex-col bg-[#f2f5fd] py-4">
      <ul className="flex flex-1 flex-col items-center space-y-2 overflow-y-auto">
        {items.map((item) => (
          <li key={item.label} className="w-full">
            <Link href={item.href} className="flex w-full flex-col items-center px-2">
              <span
                className={cn(
                  "mb-px flex h-7.5 w-full items-center justify-center rounded-[99px] hover:bg-[#e7edfc]",
                  item.label === "Home" && "bg-[#e7edfc]",
                )}
              >
                <item.icon className="size-4.5" />
              </span>
              <p className="-mx-2 text-[10px]">{item.label}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="h-38 pt-4">
        <UserButton />

        <a href="#" className="mt-4 flex w-full flex-col items-center px-2">
          <span className="mb-1.5 flex size-8 items-center justify-center rounded-full bg-[#4031ff]">
            <CrownIcon className="size-4.5 text-white" />
          </span>
          <p className="text-[10px]">Upgrade</p>
        </a>
      </div>
    </nav>
  );
}
