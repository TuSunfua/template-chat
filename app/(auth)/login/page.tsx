"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";
import { ArrowRightIcon, BotIcon, CheckCircle2Icon, ShieldCheckIcon, SparklesIcon, UserIcon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "w-full rounded-2xl border border-[#d8deeb] bg-white/90 px-4 py-3 text-sm text-[#1f2124] shadow-sm outline-none transition placeholder:text-[#8b95a7] focus:border-[#4031ff] focus:ring-4 focus:ring-[#4031ff]/10";

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(242,245,253,0.88)_100%)] p-8 shadow-[0_20px_80px_-42px_rgba(15,23,42,0.45)] backdrop-blur not-lg:hidden">
        <div className="absolute top-0 right-0 h-36 w-36 rounded-full bg-[#4031ff]/10 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between gap-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d8deeb] bg-white/80 px-3 py-1 text-xs font-medium text-[#475467] shadow-sm">
              <SparklesIcon className="size-3.5 text-[#4031ff]" />
              Template AI workspace
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold tracking-[0.24em] text-[#1e0dff] uppercase">Welcome back</p>
              <h1 className="max-w-md text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-[#101828] lg:text-5xl">
                Sign in to pick up your next draft, design, or chat.
              </h1>
              <p className="max-w-lg text-base leading-7 text-[#667085] max-[1092px]:hidden">
                Keep working with the same polished workspace, file uploads, and AI-generated outputs you already use.
              </p>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-[#344054] sm:grid-cols-3 lg:grid-cols-1">
            <div className="flex items-start gap-3 rounded-2xl border border-[#d8deeb] bg-white/75 p-4">
              <ShieldCheckIcon className="mt-0.5 size-4 text-[#4031ff]" />
              <div>
                <p className="font-medium">Secure sign-in</p>
                <p className="mt-1 text-[#667085]">JWT session flow with credential-based access.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-[#d8deeb] bg-white/75 p-4">
              <BotIcon className="mt-0.5 size-4 text-[#4031ff]" />
              <div>
                <p className="font-medium">AI-first workspace</p>
                <p className="mt-1 text-[#667085]">Resume conversations and keep context in one place.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-[#d8deeb] bg-white/75 p-4">
              <CheckCircle2Icon className="mt-0.5 size-4 text-[#4031ff]" />
              <div>
                <p className="font-medium">Fast handoff</p>
                <p className="mt-1 text-[#667085]">Jump straight to the chat canvas after login.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-[#d8deeb] bg-white/90 p-8 shadow-[0_20px_80px_-42px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f2f5fd] px-3 py-1 text-xs font-medium text-[#4031ff]">
            <UserIcon className="size-3.5" />
            Existing account
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#101828]">Sign in</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#667085]">
              Use your username and password to continue where you left off.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-[#344054]">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={inputClassName}
              placeholder="your_username"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-[#344054]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClassName}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1e0dff] px-4 py-3 text-sm font-medium text-white shadow-[0_12px_30px_-16px_rgba(30,13,255,0.95)] transition hover:bg-[#4031ff] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
            {!isSubmitting ? <ArrowRightIcon className="size-4" /> : null}
          </button>
        </form>

        <p className="mt-6 text-sm text-[#667085]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-[#1e0dff] underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
