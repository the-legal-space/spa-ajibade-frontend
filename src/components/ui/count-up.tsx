"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/**
 * Counts the number inside a stat ("59+ Years", "700+ Matters") up from 0 the first time it scrolls
 * into view. Text around the number is kept as written. The real value is always in the page for
 * screen readers and for visitors who prefer reduced motion, who see it without any counting.
 */
export function CountUp({ value, className, duration = 1.8 }: { value: string; className?: string; duration?: number }) {
  const match = /^(\D*?)(\d[\d,]*)(.*)$/s.exec(value);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  // null = show the final value (server render, reduced motion, finished); a number = mid-count.
  const [current, setCurrent] = useState<number | null>(null);

  const [, prefix = "", digits = "", suffix = ""] = match ?? [];
  const target = Number(digits.replace(/,/g, ""));
  const grouped = digits.includes(",");

  useEffect(() => {
    if (match && !reduceMotion) setCurrent(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!inView || !match || reduceMotion) return;
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setCurrent(Math.round(v)),
      onComplete: () => setCurrent(null),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  if (!match) return <span className={className}>{value}</span>;

  const shown = current === null ? digits : grouped ? current.toLocaleString("en-US") : String(current);
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden>
        {prefix}
        <span className="inline-block tabular-nums" style={{ minWidth: `${digits.length}ch` }}>
          {shown}
        </span>
        {suffix}
      </span>
    </span>
  );
}
