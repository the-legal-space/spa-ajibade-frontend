import Link from "next/link";
import type { HomePage } from "@/lib/api/schemas";
import { FIGMA } from "@/lib/figma-assets";
import { Media } from "@/components/ui/media";
import { Eyebrow, Heading } from "@/components/ui/primitives";
import { buttonClass } from "@/components/ui/button";

/**
 * Home "Recognition" band from the Figma: heading, a strip of award badges that slides
 * continuously (marquee, pauses on hover), a "View Our Recognitions" button and a photo.
 */
export function RecognitionFeature({ tabs }: { tabs: HomePage["recognitionTabs"] }) {
  const badges = [...FIGMA.badges, ...FIGMA.badges];
  return (
    <section className="bg-mist py-16 text-ink md:py-[68px]" aria-labelledby="recognition-heading">
      <div className="container-site grid items-center gap-10 lg:grid-cols-[811fr_497fr] lg:gap-11">
        <div className="flex min-w-0 flex-col items-start gap-6">
          <Eyebrow>{tabs.eyebrow || "Recognition"}</Eyebrow>
          <Heading>
            <span id="recognition-heading">{tabs.title || "Ranked Among Nigeria's Top Firms By Key Global Legal Institutions."}</span>
          </Heading>
          <div className="pause-on-hover relative h-[124px] w-full max-w-[601px] overflow-hidden" aria-label="Awards and rankings" role="region">
            <ul className="animate-marquee flex w-max">
              {[...badges, ...badges].map((b, i) => (
                <li
                  key={i}
                  aria-hidden={i >= FIGMA.badges.length}
                  className="mr-[38px] flex h-[124px] w-[122px] shrink-0 items-center justify-center border-[1.24px] border-mist bg-white"
                >
                  <span className="relative block size-[84px]">
                    <img src={b.src} alt={i < FIGMA.badges.length ? b.alt : ""} className="absolute inset-0 size-full object-contain" loading="lazy" />
                    {"overlay" in b && b.overlay ? (
                      <img src={b.overlay} alt="" className="absolute inset-0 size-full object-contain" loading="lazy" />
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <Link href="/about#recognition" className={buttonClass("dark")}>
            {tabs.cta?.label || "View Our Recognitions"}
          </Link>
        </div>
        <div className="h-[320px] overflow-hidden rounded-[24px] md:h-[488px]">
          <Media image={FIGMA.recognition} alt={tabs.image?.alt ?? FIGMA.recognition.alt} sizes="(min-width:1024px) 35vw, 100vw" />
        </div>
      </div>
    </section>
  );
}
