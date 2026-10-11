"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { REVEAL } from "@/lib/motion";

type RevealVariant = "up" | "left" | "right" | "scale" | "wipe";

const FROM: Record<RevealVariant, (y: number) => Record<string, number | string>> = {
  up: (y) => ({ opacity: 0, y }),
  left: () => ({ opacity: 0, x: -64 }),
  right: () => ({ opacity: 0, x: 64 }),
  scale: () => ({ opacity: 0, scale: 0.92, y: 24 }),
  // Photos: a curtain that lifts from the top edge (clip-path, no layout work).
  wipe: () => ({ clipPath: "inset(0 0 100% 0)", opacity: 1 }),
};
const TO: Record<RevealVariant, Record<string, number | string>> = {
  up: { opacity: 1, y: 0 },
  left: { opacity: 1, x: 0 },
  right: { opacity: 1, x: 0 },
  scale: { opacity: 1, scale: 1, y: 0 },
  wipe: { clipPath: "inset(0 0 0% 0)", opacity: 1 },
};

/**
 * Fades a block into place the first time it scrolls into view, then leaves it alone.
 * Only opacity, transform and clip-path are animated (no layout work), and the viewport observer is
 * `once`, so scrolling back up or down never replays it.
 * Drop-in wrapper: put the block's layout classes on `className` so the DOM stays flat.
 * `variant` picks the entrance: "up" (default), "left", "right", "scale" or "wipe" (for photos).
 */
export function Reveal({
  children,
  delay = 0,
  y = REVEAL.distance,
  variant = "up",
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number; variant?: RevealVariant }) {
  return (
    <motion.div
      initial={FROM[variant](y)}
      whileInView={TO[variant]}
      viewport={REVEAL.viewport}
      transition={{ ...REVEAL.transition, delay, ...(variant === "wipe" ? { duration: 1.3 } : {}) }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
