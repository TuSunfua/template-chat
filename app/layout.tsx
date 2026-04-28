import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";

import Providers from "@/app/providers";
import Sidebar from "@/components/sidebar";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: { icon: "/logo.svg" },
  title: "AI Generator | Template.net",
  description: "Chat with an intelligent AI assistant and get instant answers, ideas, and support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", inter.className, "font-sans", geist.variable)}>
      <body className="flex min-h-full bg-[#f9fafe]">
        <Providers>
          <Sidebar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
