"use client";

import { useRef, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

/** Horizontal, snap-scrolling row with previous/next controls (Recent Publications). */
export function ScrollRail({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(320, el.clientWidth * 0.8), behavior: "smooth" });
  };
  return (
    <div>
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
