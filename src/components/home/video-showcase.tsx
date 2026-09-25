import type { HomePage } from "@/lib/api/schemas";
import { VideoEmbed } from "@/components/sections/video-embed";

/**
 * Home video block. Hidden entirely until the firm adds a video URL in the CMS,
 * so the live site never shows a play button that does nothing.
 */
export function VideoShowcase({ showcase }: { showcase: HomePage["videoShowcase"] }) {
  if (!showcase.videoUrl) return null;
  return (
    <section className="bg-white py-12" aria-label="Video">
      <div className="container-site">
        <div className="rounded-3xl bg-mist p-3">
          <VideoEmbed url={showcase.videoUrl} title={showcase.caption ?? "Video"} poster={showcase.poster} />
        </div>
        {showcase.caption ? <p className="mx-auto mt-6 max-w-xl text-center font-serif text-xl">{showcase.caption}</p> : null}
      </div>
    </section>
  );
}
