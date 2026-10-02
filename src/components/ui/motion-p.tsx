"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { REVEAL } from "@/lib/motion";

/** Fade-up paragraph. Drop-in for `<p>` — same classes and children, plus Motion. */
export function MotionP({ children, ...props }: HTMLMotionProps<"p">) {
  return (
    <motion.p
      initial={{ opacity: 0, y: REVEAL.distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={REVEAL.viewport}
      transition={REVEAL.transition}
      {...props}
    >
      {children}
    </motion.p>
  );
}
