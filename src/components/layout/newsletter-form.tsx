"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { CONSENT_TEXT_VERSION } from "@/lib/env";
import { submitForm } from "@/lib/submit";
import { Honeypot } from "@/components/forms/fields";
import { useTurnstile } from "@/components/forms/turnstile";

/**
 * Footer newsletter field (underlined email input with an arrow). Posts to POST /newsletter/subscriptions;
 * the address is on the list as soon as it returns (nothing is emailed). Subscribing an address that is
 * already on the list succeeds with the same response.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const turnstile = useTurnstile();

  function sendToBackend(address: string) {
    return submitForm("/newsletter/subscriptions", {
      email: address,
      consent: true, // submitting the form counts as consent
      consentTextVersion: CONSENT_TEXT_VERSION,
      turnstileToken: turnstile.token,
      website,
    });
  }

  async function subscribe(e: FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!turnstile.ready) {
      setError("Please complete the security check.");
      return;
    }
    setError(null);
    setSending(true);
    const result = await sendToBackend(value);
    setSending(false);
    if (result.ok) {
      setDone(true);
      setEmail("");
      return;
    }
    turnstile.reset();
    setError(
      result.kind === "validation"
        ? result.fieldErrors.email
          ? "Please enter a valid email address."
          : "Please try again."
        : result.kind === "rate_limited"
          ? "Too many attempts, please try again shortly."
          : result.message,
    );
  }

  if (done) {
    return (
      <div role="status" className="flex items-center gap-3 border-b border-white/25 py-3 text-base leading-9 text-white">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-black">
          <Check className="size-4" strokeWidth={2.5} aria-hidden />
        </span>
        You&apos;re subscribed.
      </div>
    );
  }

  return (
    <form onSubmit={subscribe} noValidate className="relative w-full">
      <div className="flex items-center gap-2 border-b border-white/25 transition-colors duration-200 focus-within:border-white">
        <label htmlFor="newsletter-email" className="sr-only">
          Email
        </label>
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Email"
          aria-invalid={!!error}
          aria-describedby={error ? "newsletter-error" : undefined}
          className="min-w-0 flex-1 bg-transparent py-3 text-base leading-9 text-white outline-none placeholder:text-gray"
        />
        <button
          type="submit"
          disabled={sending}
          className="mb-1.5 grid size-9 shrink-0 place-items-center rounded-full border border-white/30 text-white transition-colors duration-200 hover:border-white hover:bg-white hover:text-black focus-visible:border-white focus-visible:bg-white focus-visible:text-black disabled:opacity-60"
          aria-label="Subscribe"
        >
          {sending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ArrowRight className="size-4" strokeWidth={1.75} />}
        </button>
      </div>
      <Honeypot value={website} onChange={setWebsite} />
      {turnstile.widget}
      {error ? (
        <p id="newsletter-error" role="alert" className="mt-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </form>
  );
}
