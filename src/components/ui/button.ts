import { cn } from "@/lib/utils";

export type ButtonVariant = "light" | "dark" | "ghostDark" | "outline" | "pill" | "pillDark";

const base =
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap text-sm font-medium leading-none transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  // White button on dark surfaces ("Discuss a Mandate" in the hero).
  light: "rounded-[4px] bg-white p-4 text-ink hover:bg-mist",
  // Solid black ("Learn More" on cards).
  dark: "rounded-[4px] bg-ink p-4 text-white hover:bg-ink-700",
  // Translucent on dark imagery ("Explore Our Practice Areas" in the hero).
  ghostDark: "rounded-[4px] border border-white/20 bg-white/5 p-4 text-white backdrop-blur-[15px] hover:bg-white/15",
  // Thin outline on light surfaces ("View full directory", "Read More").
  outline: "h-[46px] rounded-[4px] border-[0.5px] border-gray bg-transparent px-4 text-ink transition-colors hover:border-ink hover:bg-mist/40",
  // Rounded pills in the "Still have questions?" card.
  pill: "rounded-full bg-mist px-4 py-2.5 text-ink hover:bg-white",
  pillDark: "rounded-full bg-ink px-5 py-3 text-white hover:bg-ink-700",
};

export function buttonClass(variant: ButtonVariant = "dark", className?: string) {
  // Full width on phones unless the caller sets its own width (e.g. an inline "View Awards" button).
  const ownWidth = /(^|\s)(max-md:)?w-/.test(className ?? "");
  return cn(base, variants[variant], !ownWidth && "max-md:w-full", className);
}
