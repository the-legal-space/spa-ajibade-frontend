"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { HomePage } from "@/lib/api/schemas";
import { FIGMA } from "@/lib/figma-assets";
import { toEmbedUrl } from "@/components/sections/video-embed";
import { MotionP } from "@/components/ui/motion-p";
import { TRANSITIONS } from "@/lib/motion";
import { Reveal } from "@/components/ui/reveal";

const DEFAULT_CAPTION = "Our Managing Partner on what fifty-nine years of practice has taught us.";

/**
 * Home video block from the Figma (frame "Floating Scroll Control"): the firm's crossed mark
 * at 10% behind a framed, muted preview clip with a glass play button and a Fraunces caption.
 * The play button opens the full video when the CMS has a video URL; until then it pauses and
 * resumes the preview, so it never does nothing.
 */
export function VideoShowcase({ showcase }: { showcase: HomePage["videoShowcase"] }) {
  const preview = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(false);
  const caption = showcase.caption || DEFAULT_CAPTION;
  // "Fifty-Nine" must not break across lines ("Fifty-" / "Nine"): swap the hyphen for a non-breaking one.
  const shownCaption = caption.replace(/(fifty)-(nine)/gi, "$1\u2011$2");
  const embed = showcase.videoUrl ? toEmbedUrl(showcase.videoUrl) : null;

  useEffect(() => {
    const v = preview.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      setPaused(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onPlay = () => {
    if (showcase.videoUrl) {
      preview.current?.pause();
      setOpen(true);
      return;
    }
    const v = preview.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  const label = showcase.videoUrl ? `Play video: ${caption}` : paused ? "Play the preview" : "Pause the preview";

  return (
    <section className="relative overflow-hidden bg-white" aria-label="Video">
      {/* Figma "Favicon 1": the crossed mark, full bleed at 10% opacity. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${FIGMA.videoMark})` }}
      />
      <div className="container-site relative flex flex-col items-center gap-6 pb-6 pt-4 md:gap-11 md:py-[68px]">
        <Reveal className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[12px] border-8 border-[rgba(156,155,155,0.2)] sm:aspect-video md:border-[16px] lg:aspect-auto lg:h-[759px]">
          <video
            ref={preview}
            className="absolute inset-0 size-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={FIGMA.videoPoster}
            aria-hidden
            tabIndex={-1}
          >
            <source src={FIGMA.videoPreview} type="video/webm" />
          </video>
          <div aria-hidden className="absolute inset-0 bg-black/20" />
          <motion.button
            type="button"
            onClick={onPlay}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            transition={TRANSITIONS.hover}
            className="relative rounded-[68px] border-[6px] border-white/30 bg-white/20 p-2.5 backdrop-blur-sm md:p-3.5"
            aria-label={label}
          >
            {paused || showcase.videoUrl ? (
              <svg viewBox="0 0 44 44" className="size-9 md:size-11" aria-hidden>
                <path
                  d="M13.86 6.25C11.66 4.86 8.8 6.44 8.8 9.04v25.92c0 2.6 2.86 4.18 5.06 2.79l20.56-12.96c2.05-1.3 2.05-4.29 0-5.58L13.86 6.25Z"
                  fill="white"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 44 44" className="size-9 md:size-11" aria-hidden>
                <rect x="11" y="8" width="7" height="28" rx="2" fill="white" />
                <rect x="26" y="8" width="7" height="28" rx="2" fill="white" />
              </svg>
            )}
          </motion.button>
        </Reveal>
        <MotionP className="max-w-[666px] text-center font-serif text-xl leading-7 md:text-2xl md:leading-[28px]">{shownCaption}</MotionP>
      </div>

      <AnimatePresence>
        {open && showcase.videoUrl ? (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={caption}
          >
            <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl bg-ink" onClick={(e) => e.stopPropagation()}>
              {embed ? (
                <iframe src={embed} title={caption} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="size-full" />
              ) : (
                <video src={showcase.videoUrl} controls autoPlay className="size-full" />
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Close video"
            >
              <X className="size-5" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
