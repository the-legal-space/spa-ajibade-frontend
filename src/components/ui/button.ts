import { cn } from "@/lib/utils";

export type ButtonVariant = "light" | "dark" | "ghostDark" | "outline" | "pill" | "pillDark";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  // White button on dark surfaces ("Discuss a Mandate" in the hero).
  light: "rounded-[4px] bg-white px-4 py-3 text-ink hover:bg-mist",
  // Solid black ("Learn More" on cards).
  dark: "rounded-[4px] bg-ink px-4 py-3 text-white hover:bg-ink-700",
  // Translucent on dark imagery ("Explore Our Practice Areas" in the hero).
  ghostDark: "rounded-[4px] border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm hover:bg-white/20",
  // Thin outline on light surfaces ("View full directory", "Read More").
  outline: "rounded-[4px] border border-mist-300 bg-white/60 px-4 py-2.5 text-ink hover:border-ink",
  // Rounded pills in the "Still have questions?" card.
  pill: "rounded-full bg-mist px-4 py-2.5 text-ink hover:bg-white",
  pillDark: "rounded-full bg-ink px-5 py-3 text-white hover:bg-ink-700",
};

export function buttonClass(variant: ButtonVariant = "dark", className?: string) {
  return cn(base, variants[variant], className);
}
