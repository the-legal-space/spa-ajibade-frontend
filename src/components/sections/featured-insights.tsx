"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { InsightCard } from "@/lib/api/schemas";
import { cn, formatMonthYear, initials } from "@/lib/utils";
import { Media } from "@/components/ui/media";
import { useAutoplay, useSwipe } from "@/components/home/scroll-rail";

/** Dark featured carousel at the top of Insights & News. */
export function FeaturedInsights({ items }: { items: InsightCard[] }) {
  const [i, setI] = useState(0);
  const autoplay = useAutoplay(() => setI((n) => (n + 1) % Math.max(1, items.length)), { enabled: items.length > 1 });
  const go = (n: number) => setI(((n % items.length) + items.length) % items.length);
  const swipe = useSwipe(
    () => go(i + 1),
    () => go(i - 1),
  );
  if (items.length === 0) return null;

  return (
    <section {...autoplay} className="relative -mt-[70px] overflow-hidden bg-ink pt-[70px] text-white" aria-roledescription="carousel" aria-label="Featured insights">
      <svg className="pointer-events-none absolute inset-0 size-full text-white/[0.06]" aria-hidden preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 600">
        <path d="M200 -60 L720 330 L1240 -60 M200 720 L720 330 L1240 720" fill="none" stroke="currentColor" strokeWidth="170" />
      </svg>
      <div className="container-site relative py-14 md:px-16 md:py-16">
        <div {...swipe} className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{ transform: `translateX(-${i * 100}%)` }}
          >
            {items.map((item, n) => {
              const date = formatMonthYear(item.publishedAt);
              return (
                <article
                  key={item.id}
                  className="grid w-full shrink-0 items-center gap-8 md:grid-cols-2"
                  aria-roledescription="slide"
                  aria-label={`${n + 1} of ${items.length}`}
                  aria-hidden={n !== i}
                >
                  <div>
                    {date ? <span className="inline-block rounded-[4px] border border-white/20 px-3 py-1.5 text-[11px]">{date}</span> : null}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.chips.slice(0, 2).map((c) => (
                        <span key={c} className="rounded-[4px] border border-white/20 px-3 py-1.5 text-[11px] underline underline-offset-2">
                          {c}
                        </span>
                      ))}
                    </div>
                    <h2 className="mt-5 font-serif text-2xl leading-snug md:text-[1.75rem]">
                      <Link href={`/insights/${item.slug}`} tabIndex={n === i ? undefined : -1} className="hover:underline">
                        {item.title}
                      </Link>
                    </h2>
                    {item.excerpt ? <p className="mt-3 line-clamp-3 text-[13px] leading-6 text-white/75">{item.excerpt}</p> : null}
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 text-xs">
                        <span className="grid size-7 place-items-center rounded-full bg-[#56697a] text-[10px]">
                          {item.author.type === "person" ? initials(item.author.person.displayName) : "SPA"}
                        </span>
                        <span className="leading-tight">
                          <span className="block">{item.author.type === "person" ? item.author.person.displayName : item.author.name}</span>
                          <span className="block text-[10px] text-white/60">{item.author.type === "person" ? item.author.person.roleLabel : item.author.label}</span>
                        </span>
                      </span>
                      <Link href={`/insights/${item.slug}`} tabIndex={n === i ? undefined : -1} className="inline-flex items-center gap-1 rounded-[4px] border border-white/20 px-3 py-2 text-xs hover:bg-white/10">
                        {item.format === "video" ? "Watch Video" : "Read More"} <ArrowUpRight className="size-3.5" aria-hidden />
                      </Link>
                    </div>
                  </div>
                  <div className="aspect-[513/306] overflow-hidden">
                    <Media image={item.coverImage} placeholder="dark" priority={n === 0} sizes="(min-width:768px) 50vw, 100vw" />
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {items.length > 1 ? (
          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-2">
              {items.map((it, n) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => go(n)}
                  aria-label={`Show featured item ${n + 1}`}
                  aria-current={n === i}
                  className={cn("grid size-8 place-items-center rounded-full text-sm", n === i ? "ring-2 ring-gold" : "bg-white/10 hover:bg-white/20")}
                >
                  {n + 1}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => go(i - 1)} className="grid size-8 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Previous">
                <ChevronLeft className="size-4" />
              </button>
              <button type="button" onClick={() => go(i + 1)} className="grid size-8 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Next">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
