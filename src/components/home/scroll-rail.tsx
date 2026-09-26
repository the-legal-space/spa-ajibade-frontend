"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * Advances a carousel on a timer. Pauses while the visitor hovers or focuses inside it,
 * while the browser tab is hidden, and never runs for visitors who ask for reduced motion.
 */
export function useAutoplay(advance: () => void, { delay = 6000, enabled = true }: { delay?: number; enabled?: boolean } = {}) {
  const [paused, setPaused] = useState(false);
  const saved = useRef(advance);
  useEffect(() => {
    saved.current = advance;
  });

  useEffect(() => {
    if (!enabled || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") saved.current();
    }, delay);
    return () => window.clearInterval(id);
  }, [enabled, paused, delay]);

  return {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
  };
}

/** Horizontal, snap-scrolling row with previous/next controls (Recent Publications). Auto-advances. */
export function ScrollRail({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    const atStart = el.scrollLeft <= 8;
    if (dir === 1 && atEnd) return el.scrollTo({ left: 0, behavior: "smooth" });
    if (dir === -1 && atStart) return el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    el.scrollBy({ left: dir * Math.max(320, el.clientWidth * 0.8), behavior: "smooth" });
  };
  const autoplay = useAutoplay(() => {
    const el = ref.current;
    if (el && el.scrollWidth > el.clientWidth + 8) scroll(1);
  });

  return (
    <div {...autoplay}>
      <div ref={ref} role="region" aria-label={label} tabIndex={0} className="hide-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:mx-0 md:px-0">
        {children}
      </div>
      <div className="mt-10 flex justify-end gap-3">
        <button type="button" onClick={() => scroll(-1)} className="grid size-10 place-items-center rounded-full border border-mist-300 bg-white hover:border-ink" aria-label="Scroll back">
          <ArrowLeft className="size-4" />
        </button>
        <button type="button" onClick={() => scroll(1)} className="grid size-10 place-items-center rounded-full border border-mist-300 bg-white hover:border-ink" aria-label="Scroll forward">
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
