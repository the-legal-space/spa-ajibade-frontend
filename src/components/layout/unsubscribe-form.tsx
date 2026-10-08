"use client";

import { useState, type FormEvent } from "react";
import { Check, Loader2 } from "lucide-react";
import { submitForm } from "@/lib/submit";

/** POST /newsletter/unsubscribe. The API answers the same whether or not the address was on the list. */
export function UnsubscribeForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setSending(true);
    const result = await submitForm("/newsletter/unsubscribe", { email: value });
    setSending(false);
    if (result.ok) {
      setDone(true);
      return;
    }
    setError(
      result.kind === "validation"
        ? "Please enter a valid email address."
        : result.kind === "rate_limited"
          ? "Please try again shortly."
          : result.message,
    );
  }

  if (done) {
    return (
      <div role="status" className="mt-8 flex items-center gap-3 rounded-xl bg-white p-5 text-ink">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-white">
          <Check className="size-4" strokeWidth={2.5} aria-hidden />
        </span>
        You&apos;ve been unsubscribed.
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mt-8">
      <label htmlFor="unsubscribe-email" className="block text-sm text-ink-800">
        Email address
      </label>
      <input
        id="unsubscribe-email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError(null);
        }}
        aria-invalid={!!error}
        aria-describedby={error ? "unsubscribe-error" : undefined}
        className="mt-2 h-12 w-full rounded-lg border border-mist-300 bg-white px-4 text-base text-ink outline-none transition-colors focus:border-ink"
      />
      {error ? (
        <p id="unsubscribe-error" role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={sending}
        className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-[4px] bg-ink px-6 text-sm font-medium text-white transition-colors hover:bg-ink-700 disabled:opacity-60 max-md:w-full"
      >
        {sending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        Unsubscribe
      </button>
    </form>
  );
}
