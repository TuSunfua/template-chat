import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect("/");
  }

  return (
    <main className="relative flex w-full flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(64,49,255,0.12),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(30,13,255,0.08),transparent_24%),linear-gradient(180deg,#f9fafe_0%,#f4f7ff_100%)]" />
      <div className="pointer-events-none absolute top-12 left-10 h-36 w-36 rounded-full bg-[#4031ff]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-10 bottom-12 h-44 w-44 rounded-full bg-[#1e0dff]/10 blur-3xl" />
      <div className="relative w-full max-w-6xl">{children}</div>
    </main>
  );
}
