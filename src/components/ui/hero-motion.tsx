"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { EASINGS } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { SplitWords } from "@/components/ui/motion-heading";

/**
 * Hero background: a slow "Ken Burns" settle on load (CSS), plus a gentle zoom while the page scrolls.
 * Scale only, from the centre, so the photo can never show a gap at the edges.
 */
export function HeroBackdrop({ children, className }: { children: ReactNode; className?: string }) {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const scale = useTransform(scrollY, [0, 700], [1, reduce ? 1 : 1.1]);
  return (
    <motion.div className={cn("will-change-transform", className)} style={{ scale }}>
      <div className="hero-kenburns size-full">{children}</div>
    </motion.div>
  );
}

/**
 * Hero copy: staggers its `HeroItem`s in on load, then drifts down and fades slightly as the page
 * scrolls away (the photo lags behind the text, which gives depth).
 */
export function HeroContent({ children, className }: { children: ReactNode; className?: string }) {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const y = useTransform(scrollY, [0, 500], [0, reduce ? 0 : 56]);
  const opacity = useTransform(scrollY, [0, 450], [1, 0.3]);
  return (
    <motion.div style={{ y, opacity }} className={className}>
      <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.13, delayChildren: 0.1 } } }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

/** One staggered piece of the hero copy. */
export function HeroItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 32 },
        show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASINGS.easeOut } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** The hero title: words rise out of a mask, in step with the rest of the hero copy. */
export function HeroTitle({ text }: { text: string }) {
  // Its own animation root, so the words use their own delays instead of joining the stagger above.
  return (
    <motion.span initial="hidden" animate="show" variants={{ hidden: {}, show: {} }}>
      <SplitWords text={text} delay={0.15} />
    </motion.span>
  );
}
