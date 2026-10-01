"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { REVEAL } from "@/lib/motion";

/**
 * Fades a block up into place the first time it scrolls into view, then leaves it alone.
 * Only opacity and transform are animated (compositor-only, no layout work), and the
 * viewport observer is `once`, so scrolling back up or down never replays it.
 * Drop-in wrapper: put the block's layout classes on `className` so the DOM stays flat.
 */
export function Reveal({
  children,
  delay = 0,
  y = REVEAL.distance,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={REVEAL.viewport}
      transition={{ ...REVEAL.transition, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
