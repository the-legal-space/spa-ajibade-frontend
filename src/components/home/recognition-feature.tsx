import Link from "next/link";
import type { HomePage } from "@/lib/api/schemas";
import { FIGMA, cmsOr } from "@/lib/figma-assets";
import { Media } from "@/components/ui/media";
import { Eyebrow, Heading } from "@/components/ui/primitives";
import { buttonClass } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

/**
 * Home "Recognition" band from the Figma: heading, a strip of award badges that slides
 * continuously (marquee, pauses on hover), a "View Our Recognitions" button and a photo.
 */
type Badge = {
  src: string;
  alt: string;
  overlay?: string;
  href?: string | null;
};

export function RecognitionFeature({
  section,
}: {
  section: HomePage["recognitionSection"];
}) {
  // Badges come from the CMS recognition records; the Figma set is only used when none has an image.
  const fromCms: Badge[] = section.badges
    .filter((r) => r.badge?.url)
    .map((r) => {
      const organization = r.organization || r.directory?.name || "";
      const badge = r.badge!;
      return {
        src: badge.url,
        alt:
          badge.alt ||
          `${organization ? `${organization}: ` : ""}${r.title}${r.year ? ` ${r.year}` : ""}`,
        href: r.url ?? null,
      };
    });
  const base: Badge[] =
    fromCms.length > 0 ? fromCms : FIGMA.badges.map((b) => ({ ...b }));
  // Repeat the set so the strip is always wider than its window, then double it for a seamless loop.
  const set: Badge[] = [];
  while (set.length < 8) set.push(...base);
  return (
    <section
      className="bg-mist py-16 text-ink md:py-[68px]"
      aria-labelledby="recognition-heading"
    >
      <div className="container-site grid items-center gap-10 lg:grid-cols-[811fr_497fr] lg:gap-11">
        <div className="flex min-w-0 flex-col items-start gap-6">
          <Eyebrow>{section.eyebrow || "Recognition"}</Eyebrow>
          <Heading>
            <span id="recognition-heading">
              {section.title ||
                "Ranked Among Nigeria's Top Firms By Key Global Legal Institutions."}
            </span>
          </Heading>
          <Reveal className="w-full max-w-[601px]">
          <div
            className="pause-on-hover relative h-[124px] w-full overflow-hidden"
            aria-label="Awards and rankings"
            role="region"
          >
            <ul className="animate-marquee flex w-max">
              {[...set, ...set].map((b, i) => (
                <li
                  key={i}
                  aria-hidden={i >= base.length}
                  className="mr-[38px] flex h-[124px] w-[122px] shrink-0 items-center justify-center border-[1.24px] border-mist bg-white"
                >
                  <BadgeImage
                    badge={b}
                    decorative={i >= base.length}
                    tabbable={i < base.length}
                  />
                </li>
              ))}
            </ul>
          </div>
          </Reveal>
          <Reveal className="max-md:w-full">
            <Link href="/about#recognition" className={buttonClass("dark")}>
              {section.cta?.label || "View Our Recognitions"}
            </Link>
          </Reveal>
        </div>
        <Reveal className="h-[360px] overflow-hidden rounded-[24px] md:h-[488px]">
          <Media
            image={cmsOr(section.image, FIGMA.recognition)}
            sizes="(min-width:1024px) 35vw, 100vw"
          />
        </Reveal>
      </div>
    </section>
  );
}

function BadgeImage({
  badge,
  decorative,
  tabbable,
}: {
  badge: Badge;
  decorative: boolean;
  tabbable: boolean;
}) {
  const inner = (
    <span className="relative block size-[84px]">
      <img
        src={badge.src}
        alt={decorative ? "" : badge.alt}
        className="absolute inset-0 size-full object-contain"
        loading="lazy"
      />
      {badge.overlay ? (
        <img
          src={badge.overlay}
          alt=""
          className="absolute inset-0 size-full object-contain"
          loading="lazy"
        />
      ) : null}
    </span>
  );
  if (!badge.href) return inner;
  return (
    <a
      href={badge.href}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={tabbable ? undefined : -1}
      className="block transition-opacity hover:opacity-80"
    >
      {inner}
    </a>
  );
}
