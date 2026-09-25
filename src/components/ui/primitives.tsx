import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, tone = "dark", className }: { children: ReactNode; tone?: "dark" | "light"; className?: string }) {
  return (
    <p className={cn("flex items-center gap-1.5 text-xs", tone === "dark" ? "text-ink" : "text-white/80", className)}>
      <span aria-hidden className={cn("inline-block size-2 rounded-[1px]", tone === "dark" ? "bg-ink" : "bg-white")} />
      {children}
    </p>
  );
}

export function Heading({
  as: Tag = "h2",
  children,
  className,
  size = "h2",
}: {
  as?: "h1" | "h2" | "h3";
  children: ReactNode;
  className?: string;
  size?: "display" | "h2" | "h3";
}) {
  const sizes = {
    display: "text-[2.5rem] leading-[1.15] md:text-[3.25rem] md:leading-[1.19]",
    h2: "text-[2rem] leading-[1.2] md:text-[2.75rem]",
    h3: "text-2xl leading-tight md:text-[1.75rem]",
  };
  return <Tag className={cn("font-serif font-normal tracking-[-0.01em] text-balance", sizes[size], className)}>{children}</Tag>;
}

export function Section({
  children,
  tone = "mist",
  className,
  id,
  labelledBy,
}: {
  children: ReactNode;
  tone?: "mist" | "white" | "black";
  className?: string;
  id?: string;
  labelledBy?: string;
}) {
  const tones = { mist: "bg-mist text-ink", white: "bg-white text-ink", black: "bg-ink text-white" };
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn(tones[tone], "py-16 md:py-[68px]", className)}>
      <div className="container-site">{children}</div>
    </section>
  );
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-[4px] border border-mist-300 bg-white px-2.5 py-1 text-[11px] leading-none text-ink", className)}>
      {children}
    </span>
  );
}

export function PendingNote({ className }: { className?: string }) {
  return <p className={cn("text-sm italic text-stone", className)}>Content coming soon.</p>;
}
