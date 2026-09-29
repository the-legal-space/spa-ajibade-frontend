import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MotionP } from "@/components/ui/motion-p";

export function Eyebrow({ children, tone = "dark", className }: { children: ReactNode; tone?: "dark" | "light"; className?: string }) {
  return (
    <MotionP className={cn("flex items-center gap-1 text-xs leading-none", tone === "dark" ? "text-ink" : "text-white", className)}>
      <span aria-hidden className={cn("inline-block size-2.5 rounded-[2px]", tone === "dark" ? "bg-ink" : "bg-white")} />
      {children}
    </MotionP>
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
    display: "capitalize text-[2.25rem] leading-[1.15] md:text-[3.25rem] md:leading-[62px]",
    h2: "capitalize text-[2.25rem] leading-[1.15] md:text-[3.25rem] md:leading-[62px]",
    h3: "text-2xl leading-tight md:text-[1.75rem]",
  };
  return <Tag className={cn("font-serif font-normal text-balance", sizes[size], className)}>{children}</Tag>;
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
  const tones = { mist: "bg-mist text-ink", white: "bg-white text-ink", black: "site-dark-surface text-white" };
  const attrs = tone === "black" ? { "data-header-theme": "dark" } : {};
  return (
    <section id={id} aria-labelledby={labelledBy} {...attrs} className={cn(tones[tone], "py-16 md:py-[68px]", className)}>
      <div className="container-site">{children}</div>
    </section>
  );
}

/** Figma "Sub Container" tag: white, 0.5px grey border, 10px text. Stays on one line and truncates. */
export function Chip({
  children,
  className,
  title,
  compact = false,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  compact?: boolean;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-block min-w-0 truncate whitespace-nowrap rounded-[4px] border-[0.5px] border-gray bg-white py-2 text-[10px] leading-none text-ink",
        compact ? "px-3" : "px-4",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PendingNote({ className }: { className?: string }) {
  return <p className={cn("text-sm italic text-stone", className)}>Content coming soon.</p>;
}
