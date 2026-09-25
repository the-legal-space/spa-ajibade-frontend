"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { ApiImage } from "@/lib/api/schemas";
import { Media } from "@/components/ui/media";

export function toEmbedUrl(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("youtube.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").pop();
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (u.hostname === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}?autoplay=1&rel=0`;
    if (u.hostname.endsWith("vimeo.com")) return `https://player.vimeo.com/video/${u.pathname.split("/").filter(Boolean).pop()}?autoplay=1`;
  } catch {
    /* not a URL */
  }
  return null;
}

/** Click-to-load video: no third-party player (or its cookies) until the visitor asks for it. */
export function VideoEmbed({ url, title, poster }: { url: string; title: string; poster?: ApiImage | null }) {
  const [playing, setPlaying] = useState(false);
  const embed = toEmbedUrl(url);
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-ink">
      {playing ? (
        embed ? (
          <iframe src={embed} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="size-full" />
        ) : (
          <video src={url} controls autoPlay className="size-full" />
        )
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label={`Play video: ${title}`}>
          <Media image={poster} placeholder="dark" sizes="100vw" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-20 place-items-center rounded-full bg-white/30 backdrop-blur transition group-hover:scale-105">
              <Play className="size-8 fill-white text-white" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
