"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PracticeAreaCard } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { Media } from "@/components/ui/media";
import { useAutoplay } from "./scroll-rail";

/**
 * Home "Focused Practice Areas": a tab bar of short labels driving a centred card,
 * with the neighbouring cards peeking in at the sides (desktop).
 */
export function PracticeCarousel({ areas }: { areas: PracticeAreaCard[] }) {
  const [index, setIndex] = useState(Math.min(2, Math.max(0, areas.length - 1)));
  const autoplay = useAutoplay(() => setIndex((i) => (i + 1) % Math.max(1, areas.length)), { enabled: areas.length > 1 });
  if (areas.length === 0) return null;
  const go = (i: number) => setIndex((i + areas.length) % areas.length);
  const prev = areas[(index - 1 + areas.length) % areas.length]!;
  const next = areas[(index + 1) % areas.length]!;
  const current = areas[index]!;

  return (
    <div {...autoplay}>
      <div role="tablist" aria-label="Practice areas" className="hide-scrollbar mx-auto flex w-max max-w-full overflow-x-auto rounded-full bg-ink-700 p-1">
        {areas.map((a, i) => (
          <button
            key={a.slug}
            role="tab"
            type="button"
            id={`pa-tab-${a.slug}`}
            aria-selected={i === index}
            aria-controls="pa-panel"
            onClick={() => go(i)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-[13px] transition-colors",
              i === index ? "bg-white/20 font-medium text-white" : "text-white/75 hover:text-white",
            )}
          >
            {a.shortLabel}
          </button>
        ))}
      </div>

      <div className="relative mt-12">
        <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,744px)_minmax(0,1fr)] lg:gap-14">
          <GhostCard area={prev} side="left" onClick={() => go(index - 1)} />
          <article
            id="pa-panel"
            role="tabpanel"
            aria-labelledby={`pa-tab-${current.slug}`}
            key={current.slug}
            className="grid animate-fade-in gap-6 rounded-[20px] bg-ink-800 p-2 md:grid-cols-[362px_1fr] md:p-1.5"
          >
            <div className="aspect-[362/394] overflow-hidden rounded-2xl">
              <Media image={current.image} alt="" placeholder="dark" />
            </div>
            <div className="flex flex-col px-3 pb-4 md:px-2 md:py-7 md:pr-8">
              <h3 className="font-serif text-3xl leading-tight text-white md:text-[2.25rem]">{current.title}</h3>
              <p className="mt-5 flex-1 text-[13px] leading-6 text-white/85">{current.summary}</p>
              <Link
                href={`/practice-areas/${current.slug}`}
                className="mt-6 inline-flex w-max items-center gap-2 rounded-[4px] border border-white/25 px-4 py-2.5 text-[13px] text-white hover:bg-white/10"
              >
                Learn More <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </article>
          <GhostCard area={next} side="right" onClick={() => go(index + 1)} />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button type="button" onClick={() => go(index - 1)} className="grid size-10 place-items-center rounded-full bg-ink-700 text-white hover:bg-ink-800" aria-label="Previous practice area">
          <ArrowLeft className="size-4" />
        </button>
        <button type="button" onClick={() => go(index + 1)} className="grid size-10 place-items-center rounded-full bg-ink-700 text-white hover:bg-ink-800" aria-label="Next practice area">
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function GhostCard({ area, side, onClick }: { area: PracticeAreaCard; side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={-1}
      aria-hidden
      className={cn(
        "hidden overflow-hidden rounded-[20px] bg-ink-800 p-6 text-left opacity-40 transition hover:opacity-60 lg:block",
        side === "left" ? "-ml-[120px]" : "-mr-[120px]",
      )}
    >
      <p className={cn("font-serif text-3xl text-white", side === "left" ? "text-right" : "")}>{area.title}</p>
      <p className="mt-4 line-clamp-4 text-[13px] leading-6 text-white/70">{area.summary}</p>
    </button>
  );
}
