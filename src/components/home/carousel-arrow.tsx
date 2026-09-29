"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { INTERACTION, TRANSITIONS } from "@/lib/motion";

/** Figma 48px round arrow button. `tone="dark"` sits on black, `"light"` on off-white sections. */
export function CarouselArrow({
  dir,
  onClick,
  label,
  tone = "dark",
}: {
  dir: "prev" | "next";
  onClick: () => void;
  label: string;
  tone?: "dark" | "light";
}) {
  const Icon = dir === "prev" ? ArrowLeft : ArrowRight;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={INTERACTION.iconButton.whileHover}
      whileTap={INTERACTION.iconButton.whileTap}
      transition={TRANSITIONS.hover}
      className={cn(
        "grid size-12 place-items-center rounded-full transition-colors",
        tone === "dark" ? "bg-white/10 text-mist hover:bg-white/20" : "border border-gray/50 bg-transparent text-ink hover:border-ink",
      )}
      aria-label={label}
    >
      <Icon className="size-5" strokeWidth={2} />
    </motion.button>
  );
}
