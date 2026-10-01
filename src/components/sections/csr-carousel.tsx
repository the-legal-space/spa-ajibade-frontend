"use client";

import Link from "next/link";
import { useState } from "react";
import type { ApiImage } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { Media } from "@/components/ui/media";
import { useAutoplay } from "@/components/home/scroll-rail";

export type CsrSlide = { slug: string; title: string; date: string | null; image: ApiImage | null };

/**
 * Responsible Business carousel: cross-fades through the latest stories. Hovering (or focusing)
 * the banner slides the story's date and title up from the bottom, as in the design; on touch
 * screens, where there is no hover, the details stay visible.
 */
export function CsrCarousel({ slides }: { slides: CsrSlide[] }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;
  const pause = useAutoplay(() => setIndex((i) => (i + 1) % Math.max(1, count)), { delay: 5000, enabled: count > 1 });
  if (count === 0) return <div className="mt-6 aspect-[1352/540] bg-mist-200" aria-hidden />;

  return (
    <div className="mt-6">
      <div {...pause} className="group relative aspect-[1352/540] overflow-hidden bg-mist-200">
        {slides.map((s, i) => (
          <Link
            key={s.slug}
            href={`/insights/${s.slug}`}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
            className={cn(
              "absolute inset-0 block transition-opacity duration-[1000ms] ease-out motion-reduce:transition-none",
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <Media image={s.image} priority={i === 0} sizes="(min-width:1024px) 1352px, 100vw" />
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-5 pb-6 pt-24 text-white md:px-6",
                "translate-y-6 opacity-0 transition duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100",
                "[@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100",
              )}
            >
              {s.date ? <p className="text-xs leading-none">{s.date}</p> : null}
              <p className="mt-3 text-xl leading-7 md:text-[1.75rem] md:leading-9">{s.title}</p>
            </div>
          </Link>
        ))}
      </div>

      {count > 1 ? (
        <div className="mt-5 flex h-2 items-center justify-center gap-2" role="group" aria-label="Stories">
          {slides.map((s, i) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show story ${i + 1} of ${count}`}
              aria-current={i === index}
              className="relative grid size-2 place-items-center before:absolute before:-inset-2 before:content-['']"
            >
              <span className={cn("block size-2 rounded-full transition-colors duration-500", i === index ? "bg-ink" : "bg-ink/25 hover:bg-ink/50")} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
