import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import ChatHeader from "@/components/chat-header";

export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="flex h-full w-full flex-1 flex-col items-center justify-center">
      <ChatHeader />
      {children}
    </main>
  );
}
