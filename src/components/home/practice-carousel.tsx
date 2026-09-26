"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PracticeAreaCard } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { Media } from "@/components/ui/media";
import { useAutoplay, useSwipe } from "./scroll-rail";

/**
 * Home "Focused Practice Areas": a tab bar of short labels driving a sliding track of cards.
 * The active card sits in the centre and the neighbouring cards peek in, dimmed, at the sides.
 * Pills, arrows, clicking a side card, swiping and autoplay all move the same track.
 */
export function PracticeCarousel({ areas }: { areas: PracticeAreaCard[] }) {
  const [index, setIndex] = useState(Math.min(2, Math.max(0, areas.length - 1)));
  const count = Math.max(1, areas.length);
  const go = (i: number) => setIndex(((i % count) + count) % count);
  const autoplay = useAutoplay(() => setIndex((i) => (i + 1) % count), { enabled: areas.length > 1 });
  const swipe = useSwipe(
    () => go(index + 1),
    () => go(index - 1),
  );
  // Keep the active pill visible when the tab bar scrolls sideways (mobile), without moving the page.
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = bar.current;
    const pill = el?.children[index] as HTMLElement | undefined;
    if (!el || !pill || el.scrollWidth <= el.clientWidth) return;
    el.scrollTo({ left: pill.offsetLeft - (el.clientWidth - pill.offsetWidth) / 2, behavior: "smooth" });
  }, [index]);
  if (areas.length === 0) return null;

  // Card width and gap live in CSS variables so the track is positioned correctly on the
  // server-rendered HTML too (no measuring, no jump on hydration).
  const trackStyle = {
    transform: `translateX(calc(-1 * (${index} * (var(--cw) + var(--gap))) - var(--cw) / 2))`,
  } as CSSProperties;

  return (
    <div {...autoplay}>
      <div ref={bar} role="tablist" aria-label="Practice areas" className="hide-scrollbar relative mx-auto flex w-max max-w-full overflow-x-auto rounded-full bg-ink-700 p-1">
        {areas.map((a, i) => (
          <button
            key={a.slug}
            role="tab"
            type="button"
            id={`pa-tab-${a.slug}`}
            aria-selected={i === index}
            aria-controls={`pa-panel-${a.slug}`}
            onClick={() => go(i)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-[13px] transition-colors duration-300",
              i === index ? "bg-white/20 font-medium text-white" : "text-white/75 hover:text-white",
            )}
          >
            {a.shortLabel}
          </button>
        ))}
      </div>

      <div
        {...swipe}
        className="relative mt-12 overflow-hidden [--cw:calc(100vw_-_40px)] [--gap:16px] md:[--cw:min(744px,calc(100vw_-_64px))] lg:[--gap:56px]"
      >
        <div
          className="relative left-1/2 flex w-max gap-(--gap) transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={trackStyle}
        >
          {areas.map((a, i) => {
            const active = i === index;
            return (
              <article
                key={a.slug}
                id={`pa-panel-${a.slug}`}
                role="tabpanel"
                aria-labelledby={`pa-tab-${a.slug}`}
                aria-hidden={!active}
                onClick={active ? undefined : () => go(i)}
                className={cn(
                  "grid w-(--cw) shrink-0 gap-6 rounded-[20px] bg-ink-800 p-2 transition-[opacity,transform] duration-700 md:grid-cols-[362px_1fr] md:p-1.5",
                  active ? "opacity-100" : "scale-[0.96] cursor-pointer opacity-40 hover:opacity-60",
                )}
              >
                <div className="aspect-[362/394] overflow-hidden rounded-2xl">
                  <Media image={a.image} alt="" placeholder="dark" />
                </div>
                <div className="flex flex-col px-3 pb-4 md:px-2 md:py-7 md:pr-8">
                  <h3 className="font-serif text-3xl leading-tight text-white md:text-[2.25rem]">{a.title}</h3>
                  <p className="mt-5 flex-1 text-[13px] leading-6 text-white/85">{a.summary}</p>
                  <Link
                    href={`/practice-areas/${a.slug}`}
                    tabIndex={active ? undefined : -1}
                    className="mt-6 inline-flex w-max items-center gap-2 rounded-[4px] border border-white/25 px-4 py-2.5 text-[13px] text-white hover:bg-white/10"
                  >
                    Learn More <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button type="button" onClick={() => go(index - 1)} className="grid size-10 place-items-center rounded-full bg-ink-700 text-white transition hover:bg-ink-800 active:scale-95" aria-label="Previous practice area">
          <ArrowLeft className="size-4" />
        </button>
        <button type="button" onClick={() => go(index + 1)} className="grid size-10 place-items-center rounded-full bg-ink-700 text-white transition hover:bg-ink-800 active:scale-95" aria-label="Next practice area">
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
