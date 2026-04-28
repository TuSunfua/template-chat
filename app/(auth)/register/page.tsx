"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";
import { ArrowRightIcon, BotIcon, CheckCircle2Icon, SparklesIcon, UserRoundPlusIcon } from "lucide-react";

type RegisterPayload = {
  name: string;
  username: string;
  password: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterPayload>({
    name: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setError(payload?.message ?? "Registration failed");
        return;
      }

      router.push("/login");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "w-full rounded-2xl border border-[#d8deeb] bg-white/90 px-4 py-3 text-sm text-[#1f2124] shadow-sm outline-none transition placeholder:text-[#8b95a7] focus:border-[#4031ff] focus:ring-4 focus:ring-[#4031ff]/10";

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[32px] border border-[#d8deeb] bg-white/90 p-8 shadow-[0_20px_80px_-42px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f2f5fd] px-3 py-1 text-xs font-medium text-[#4031ff]">
            <UserRoundPlusIcon className="size-3.5" />
            New account
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#101828]">Create account</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#667085]">
              Set up your workspace once and use it across chat, uploads, and generated assets.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-[#344054]">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              className={inputClassName}
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-[#344054]">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, username: event.target.value.toLowerCase().trim() }))
              }
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
              value={formData.password}
              onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
              className={inputClassName}
              placeholder="Create a strong password"
              autoComplete="new-password"
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
            {isSubmitting ? "Creating account..." : "Create account"}
            {!isSubmitting ? <ArrowRightIcon className="size-4" /> : null}
          </button>
        </form>

        <p className="mt-6 text-sm text-[#667085]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#1e0dff] underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </section>

      <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(242,245,253,0.88)_100%)] p-8 shadow-[0_20px_80px_-42px_rgba(15,23,42,0.45)] backdrop-blur not-lg:hidden">
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#1e0dff]/10 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between gap-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d8deeb] bg-white/80 px-3 py-1 text-xs font-medium text-[#475467] shadow-sm">
              <SparklesIcon className="size-3.5 text-[#4031ff]" />
              Start clean, stay in flow
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold tracking-[0.24em] text-[#1e0dff] uppercase">Join the workspace</p>
              <h1 className="max-w-md text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-[#101828] lg:text-5xl">
                Build your account for chat, uploads, and generation.
              </h1>
              <p className="max-w-lg text-base leading-7 text-[#667085] max-[1128px]:hidden">
                Registration takes a minute and gives you the same clean experience across every route.
              </p>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-[#344054] sm:grid-cols-3 lg:grid-cols-1">
            <div className="flex items-start gap-3 rounded-2xl border border-[#d8deeb] bg-white/75 p-4">
              <CheckCircle2Icon className="mt-0.5 size-4 text-[#4031ff]" />
              <div>
                <p className="font-medium">One profile</p>
                <p className="mt-1 text-[#667085]">Use the same login across all app sections.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-[#d8deeb] bg-white/75 p-4">
              <BotIcon className="mt-0.5 size-4 text-[#4031ff]" />
              <div>
                <p className="font-medium">Ready for AI</p>
                <p className="mt-1 text-[#667085]">Your account is wired for conversations and exports.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-[#d8deeb] bg-white/75 p-4">
              <SparklesIcon className="mt-0.5 size-4 text-[#4031ff]" />
              <div>
                <p className="font-medium">Polished by default</p>
                <p className="mt-1 text-[#667085]">The interface stays consistent with the rest of the app.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
