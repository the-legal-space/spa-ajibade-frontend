import { cn } from "@/lib/utils";

/**
 * Text wordmark with a simple crossed mark, matching the Figma header.
 * Replace with the firm's official SVG (public/brand/logo.svg) once supplied;
 * this is a stand-in, not the approved logo artwork.
 */
export function Logo({
  firmName,
  descriptor,
  className,
  tone = "light",
}: {
  firmName: string;
  descriptor?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", tone === "light" ? "text-white" : "text-ink", className)}>
      <svg viewBox="0 0 32 32" className="size-7 shrink-0" aria-hidden>
        <path d="M4 5 L16 16 L4 27" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
        <path d="M28 5 L16 16 L28 27" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[1.3rem] tracking-[-0.01em]">{firmName}</span>
        {descriptor ? <span className="mt-0.5 self-end text-[6.5px] tracking-wide opacity-80">{descriptor}</span> : null}
      </span>
    </span>
  );
}
