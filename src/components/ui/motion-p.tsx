"use client";

import { motion, type HTMLMotionProps } from "motion/react";

/** Fade-up paragraph. Drop-in for `<p>` — same classes and children, plus Motion. */
export function MotionP({ children, ...props }: HTMLMotionProps<"p">) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.p>
  );
}
