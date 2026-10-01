import type { Hero } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { Media } from "@/components/ui/media";
import { SmartLink } from "@/components/ui/smart-link";
import { buttonClass } from "@/components/ui/button";
import { Heading } from "@/components/ui/primitives";
import { MotionP } from "@/components/ui/motion-p";
import { HeroDots, HeroSlides, HeroSlideshow } from "./hero-slideshow";

/**
 * Dark photographic hero used at the top of every page. It slides up under the
 * translucent sticky header (the -mt / pt pair), as in the designs.
 */
export function PageHero({
  hero,
  size = "md",
  children,
  top,
  imageClassName,
}: {
  hero: Hero;
  size?: "lg" | "md";
  children?: React.ReactNode;
  top?: React.ReactNode;
  /** Classes for the background photo, e.g. `object-top` to control the crop. */
  imageClassName?: string;
}) {
  // Keep legacy single-image fallbacks while preferring the API's image array.
  const seen = new Set<string>();
  const images = [hero.image, ...(hero.images ?? [])].filter((img): img is NonNullable<typeof img> => {
    if (!img?.url || seen.has(img.url)) return false;
    seen.add(img.url);
    return true;
  });

  return (
    <HeroSlideshow count={images.length}>
    <section data-header-theme="dark" className={cn("relative -mt-[var(--header-h)] overflow-hidden bg-ink text-white", size === "lg" ? "min-h-[600px] md:min-h-[666px]" : "min-h-[500px] md:min-h-[601px]")}>
      <div className="absolute inset-0">
        {images.length > 1 ? (
          <HeroSlides images={images} imageClassName={imageClassName} />
        ) : images[0] ? (
          <Media image={images[0]} priority sizes="100vw" className={imageClassName} />
        ) : (
          <div className="size-full bg-[radial-gradient(ellipse_at_70%_30%,#3a3a3a_0%,#141414_45%,#000_80%)]" aria-hidden />
        )}
        {/* Figma overlay: 50% black plus a left-to-right fade from 80% black behind the copy. */}
        <div className="absolute inset-0 bg-black/50" aria-hidden />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.8)_0.66%,rgba(0,0,0,0)_100%)]" aria-hidden />
      </div>

      <div className={cn("container-site relative flex flex-col justify-center pt-[var(--header-h)]", size === "lg" ? "min-h-[600px] md:min-h-[666px]" : "min-h-[500px] md:min-h-[601px]")}>
        <div className="max-w-[776px] py-16">
          {top ? <div className="mb-3 text-[13px] text-white/85">{top}</div> : null}
          <Heading as="h1" size="display">
            {hero.title}
          </Heading>
          {hero.subtitle ? (
            <MotionP className="mt-5 text-lg leading-8 text-mist md:text-xl md:leading-9">{hero.subtitle}</MotionP>
          ) : null}
          <HeroDots className="mt-5" />
          {children}
          {hero.primaryCta || hero.secondaryCta ? (
            <div className="mt-5 flex flex-wrap gap-3">
              {hero.primaryCta ? <SmartLink link={hero.primaryCta} className={buttonClass("light")} /> : null}
              {hero.secondaryCta ? <SmartLink link={hero.secondaryCta} className={buttonClass("ghostDark")} /> : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
    </HeroSlideshow>
  );
}

/** Compact dark header for detail pages (attorney, practice area, article). */
export function DetailHero({ eyebrow, title, children }: { eyebrow?: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <section data-header-theme="dark" className="relative -mt-[var(--header-h)] overflow-hidden bg-ink pt-[var(--header-h)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,#2a2a2a_0%,#000_60%)]" aria-hidden />
      <div className="container-site relative py-16 md:py-20">
        {eyebrow ? <div className="mb-4 text-sm text-white/70">{eyebrow}</div> : null}
        <Heading as="h1" size="display" className="max-w-4xl normal-case">
          {title}
        </Heading>
        {children}
      </div>
    </section>
  );
}
