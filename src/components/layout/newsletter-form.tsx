"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

/**
 * Figma footer newsletter field (underlined email input with an arrow).
 * The content API has no subscription endpoint yet, so a valid address opens a pre-filled
 * email to the firm asking to be added. Swap `subscribe` for an API call once one exists.
 */
export function NewsletterForm({ firmEmail }: { firmEmail: string | null }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function subscribe(e: FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    if (!firmEmail) return;
    const subject = encodeURIComponent("Subscribe me to legal insights");
    const body = encodeURIComponent(`Please add ${value} to the SPA Ajibade & Co. legal insights mailing list.`);
    window.location.href = `mailto:${firmEmail}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={subscribe} noValidate className="w-full">
      <div className="flex items-center border-b border-[#4c4c44]">
        <label htmlFor="newsletter-email" className="sr-only">
          Email
        </label>
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          aria-invalid={!!error}
          aria-describedby={error ? "newsletter-error" : undefined}
          className="min-w-0 flex-1 bg-transparent py-3 pr-3 text-base leading-9 text-white outline-none placeholder:text-gray"
        />
        <button type="submit" className="py-3 pl-3 text-white transition-transform hover:translate-x-0.5" aria-label="Subscribe">
          <ArrowRight className="size-5" strokeWidth={1.5} />
        </button>
      </div>
      {error ? (
        <p id="newsletter-error" className="mt-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </form>
  );
}
