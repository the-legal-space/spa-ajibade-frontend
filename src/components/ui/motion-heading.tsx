"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { REVEAL } from "@/lib/motion";

/** Heading that fades up once as it enters the viewport. Used by `Heading` in primitives. */
export function MotionHeading({
  as: Tag = "h2",
  className,
  children,
}: {
  as?: "h1" | "h2" | "h3";
  className?: string;
  children: ReactNode;
}) {
  const Component = motion[Tag];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: REVEAL.distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={REVEAL.viewport}
      transition={REVEAL.transition}
    >
      {children}
    </Component>
  );
}
