"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Thin bar across the top of the window showing how far down an article the reader is. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-white mix-blend-difference"
    />
  );
}
