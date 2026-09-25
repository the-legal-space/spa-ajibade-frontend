"use client";

import { useEffect } from "react";
import { buttonClass } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="relative -mt-[70px] bg-ink pt-[70px] text-white">
      <div className="container-site flex min-h-[60vh] flex-col items-start justify-center py-24">
        <h1 className="font-serif text-4xl md:text-[3.25rem]">This page didn&apos;t load.</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-white/80">
          Our content service may be waking up. Please try again in a few seconds.
        </p>
        <button type="button" onClick={reset} className={buttonClass("light", "mt-8")}>
          Try again
        </button>
      </div>
    </section>
  );
}
