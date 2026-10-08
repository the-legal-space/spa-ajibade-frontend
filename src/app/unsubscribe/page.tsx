import type { Metadata } from "next";
import { UnsubscribeForm } from "@/components/layout/unsubscribe-form";
import { Section, Heading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Stop receiving legal insights from SPA Ajibade & Co.",
  alternates: { canonical: "/unsubscribe" },
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <>
      <div className="-mt-[var(--header-h)] h-[var(--header-h)] bg-ink" aria-hidden />
      <Section tone="mist" labelledBy="unsubscribe-heading">
        <div className="mx-auto max-w-xl">
          <Heading as="h1" reveal={false}>
            <span id="unsubscribe-heading">Unsubscribe</span>
          </Heading>
          <p className="mt-4 text-sm leading-7 text-ink-800 md:text-base">
            Enter the email address you subscribed with and we will take it off the legal insights list.
          </p>
          <UnsubscribeForm />
        </div>
      </Section>
    </>
  );
}
