"use client";

import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";
import { CarouselArrow } from "./carousel-arrow";

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

/** Touch swipe for the sliding carousels: a horizontal drag of 40px or more moves one slide. */
export function useSwipe(onNext: () => void, onPrev: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) start.current = { x: t.clientX, y: t.clientY };
    },
    onTouchEnd: (e: TouchEvent) => {
      const s = start.current;
      const t = e.changedTouches[0];
      start.current = null;
      if (!s || !t) return;
      const dx = t.clientX - s.x;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(t.clientY - s.y)) return;
      if (dx < 0) onNext();
      else onPrev();
    },
  };
}

/** Horizontal, snap-scrolling row with previous/next controls (Recent Publications). Auto-advances. */
export function ScrollRail({ children, label, footerStart }: { children: ReactNode; label: string; footerStart?: ReactNode }) {
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
      {/* Proximity snapping and contained overscroll: a trackpad or wheel gesture scrolls the row
          smoothly instead of fighting the snap points or bouncing the page sideways. */}
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="hide-scrollbar -mx-5 flex snap-x snap-proximity gap-5 overflow-x-auto overscroll-x-contain scroll-smooth scroll-px-5 px-5 md:mx-0 md:scroll-px-0 md:px-0"
      >
        {children}
      </div>
      <div className="mt-2 flex flex-col items-end gap-4 md:mt-11">
        {footerStart ? <div className="min-w-0 w-full md:hidden">{footerStart}</div> : null}
        <div className="flex w-full shrink-0 justify-between gap-4 md:w-auto md:justify-end">
          <CarouselArrow dir="prev" tone="light" onClick={() => scroll(-1)} label="Scroll back" />
          <CarouselArrow dir="next" tone="light" onClick={() => scroll(1)} label="Scroll forward" />
        </div>
      </div>
    </div>
  );
}
