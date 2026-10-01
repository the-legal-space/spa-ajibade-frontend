"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import type { ApiImage } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { Media } from "@/components/ui/media";
import { useAutoplay } from "@/components/home/scroll-rail";

/**
 * Home hero background that cross-fades between the CMS hero images on its own, as in the
 * prototype ("Counsel To The Institutions..." with three dots under the subtitle).
 * The copy and buttons stay put; only the photograph changes.
 *
 * The slideshow only animates when the API returns two or more images. With one image it is a
 * still hero, and with none it falls back to the dark gradient, exactly like other pages.
 */
const SlideCtx = createContext<{ index: number; count: number; go: (i: number) => void }>({ index: 0, count: 0, go: () => {} });

export function HeroSlideshow({ count, delay = 5000, children }: { count: number; delay?: number; children: ReactNode }) {
  const [index, setIndex] = useState(0);
  const go = (i: number) => setIndex(((i % count) + count) % count);
  // The prototype never pauses the hero, so the hover/focus pause handlers are not attached;
  // it still stops in hidden tabs and for visitors who prefer reduced motion.
  useAutoplay(() => setIndex((i) => (i + 1) % Math.max(1, count)), { delay, enabled: count > 1 });
  return <SlideCtx.Provider value={{ index, count, go }}>{children}</SlideCtx.Provider>;
}

export function HeroSlides({ images, imageClassName }: { images: ApiImage[]; imageClassName?: string }) {
  const { index } = useContext(SlideCtx);
  return (
    <>
      {images.map((img, i) => (
        <div
          key={img.url + i}
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 transition-[opacity,transform] duration-[1400ms] ease-out motion-reduce:transition-none",
            i === index ? "scale-100 opacity-100" : "scale-[1.04] opacity-0",
          )}
        >
          <Media image={img} priority={i === 0} sizes="100vw" className={imageClassName} />
        </div>
      ))}
    </>
  );
}

export function HeroDots({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const { index, count, go } = useContext(SlideCtx);
  if (count < 2) return null;
  return (
    <div className={cn("flex h-2 items-center gap-2", className)} role="group" aria-label="Hero images">
      {Array.from({ length: count }, (_, i) => (
        <motion.button
          key={i}
          type="button"
          onClick={() => go(i)}
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.85 }}
          aria-label={`Show image ${i + 1} of ${count}`}
          aria-current={i === index}
          className="relative grid size-2 place-items-center before:absolute before:-inset-2 before:content-['']"
        >
          <span
            className={cn(
              "block size-2 rounded-full transition-colors duration-500",
              tone === "dark"
                ? i === index ? "bg-ink" : "bg-ink/25 hover:bg-ink/50"
                : i === index ? "bg-white" : "bg-white/40 hover:bg-white/70",
            )}
          />
        </motion.button>
      ))}
    </div>
  );
}
