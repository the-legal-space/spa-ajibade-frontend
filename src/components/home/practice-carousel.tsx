"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import type { ApiLink, PracticeAreaCard } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { practiceImage } from "@/lib/figma-assets";
import { Media } from "@/components/ui/media";
import { SmartLink } from "@/components/ui/smart-link";
import { INTERACTION, TRANSITIONS } from "@/lib/motion";
import { useAutoplay, useSwipe } from "./scroll-rail";
import { CarouselArrow } from "./carousel-arrow";

const MotionLink = motion.create(Link);

/**
 * Home "Focused Practice Areas" (Figma component "Practice Areas"): a pill tab bar driving a
 * sliding track of 910px cards. The active card is centred, its neighbours peek in at 30%.
 * Pills, arrows, clicking a side card, swiping and autoplay all move the same track.
 */
export function PracticeCarousel({ areas, cta }: { areas: PracticeAreaCard[]; cta?: ApiLink | null }) {
  // Start on Dispute Resolution when it's in the list, as in the Figma.
  const [index, setIndex] = useState(() => {
    const i = areas.findIndex((a) => a.slug === "dispute-resolution-arbitration");
    return i >= 0 ? i : Math.min(2, Math.max(0, areas.length - 1));
  });
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
      <div
        ref={bar}
        role="tablist"
        aria-label="Practice areas"
        className="hide-scrollbar relative mx-auto flex h-12 w-max max-w-full items-center gap-2.5 overflow-x-auto rounded-[60px] bg-cream/16 py-0.5"
      >
        {areas.map((a, i) => (
          <motion.button
            key={a.slug}
            role="tab"
            type="button"
            id={`pa-tab-${a.slug}`}
            aria-selected={i === index}
            aria-controls={`pa-panel-${a.slug}`}
            onClick={() => go(i)}
            whileTap={{ scale: 0.95 }}
            transition={TRANSITIONS.hover}
            className={cn(
              "flex h-11 shrink-0 items-center whitespace-nowrap rounded-[32px] px-5 text-sm leading-7 text-cream transition-colors duration-300",
              i === index ? "bg-cream/16 font-semibold" : "hover:bg-cream/8",
            )}
          >
            {a.shortLabel}
          </motion.button>
        ))}
      </div>

      <div
        {...swipe}
        className="relative mt-11 overflow-hidden [--cw:calc(100vw_-_40px)] [--gap:16px] md:[--cw:min(910px,calc(100vw_-_64px))] lg:[--gap:68px]"
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
                  "flex w-(--cw) shrink-0 flex-col gap-2 rounded-[32px] bg-cream/8 p-2 transition-opacity duration-700 md:h-[500px] md:flex-row",
                  active ? "opacity-100" : "cursor-pointer opacity-30 hover:opacity-50",
                )}
              >
                <div className="aspect-[443/484] w-full shrink-0 overflow-hidden rounded-[24px] md:aspect-auto md:h-full md:w-[443px] md:max-w-[49%]">
                  <Media image={practiceImage(a.slug, a.image)} alt="" placeholder="dark" sizes="(min-width:768px) 443px, 100vw" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-8 p-5 md:p-8">
                  <div className="flex flex-col gap-3.5">
                    <h3 className="font-card text-[2rem] capitalize leading-[1.1] text-cream md:text-[40px] md:leading-[44px]">{a.title}</h3>
                    <p className="line-clamp-4 text-sm leading-7 text-cream/88">{a.summary}</p>
                  </div>
                  <MotionLink
                    href={`/practice-areas/${a.slug}`}
                    tabIndex={active ? undefined : -1}
                    whileHover={INTERACTION.button.whileHover}
                    whileTap={INTERACTION.button.whileTap}
                    transition={TRANSITIONS.hover}
                    className="inline-flex w-max items-center gap-2.5 rounded-[4px] border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium leading-none text-white backdrop-blur-[15px] hover:bg-white/15"
                  >
                    Learn More <ArrowRight className="size-5" strokeWidth={1.5} aria-hidden />
                  </MotionLink>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-11 flex flex-wrap items-center justify-between gap-4">
        {cta ? (
          <SmartLink
            link={cta}
            className="inline-flex items-center gap-2.5 rounded-[4px] border-2 border-ink bg-mist p-4 text-sm font-medium leading-none text-ink backdrop-blur-[15px] hover:bg-white"
          >
            {cta.label} <ArrowUpRight className="size-5" strokeWidth={1.5} aria-hidden />
          </SmartLink>
        ) : (
          <span />
        )}
        <div className="flex gap-4">
          <CarouselArrow dir="prev" onClick={() => go(index - 1)} label="Previous practice area" />
          <CarouselArrow dir="next" onClick={() => go(index + 1)} label="Next practice area" />
        </div>
      </div>
    </div>
  );
}
