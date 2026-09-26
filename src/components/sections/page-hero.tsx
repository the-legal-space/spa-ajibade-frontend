import type { Hero } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { Media } from "@/components/ui/media";
import { SmartLink } from "@/components/ui/smart-link";
import { buttonClass } from "@/components/ui/button";
import { Heading } from "@/components/ui/primitives";

/**
 * Dark photographic hero used at the top of every page. It slides up under the
 * translucent sticky header (the -mt / pt pair), as in the designs.
 */
export function PageHero({ hero, size = "md", children, top }: { hero: Hero; size?: "lg" | "md"; children?: React.ReactNode; top?: React.ReactNode }) {
  return (
    <section className={cn("relative -mt-[70px] overflow-hidden bg-ink text-white", size === "lg" ? "min-h-[600px] md:min-h-[680px]" : "min-h-[500px] md:min-h-[580px]")}>
      <div className="absolute inset-0">
        {hero.image ? (
          <Media image={hero.image} priority sizes="100vw" />
        ) : (
          <div className="size-full bg-[radial-gradient(ellipse_at_70%_30%,#3a3a3a_0%,#141414_45%,#000_80%)]" aria-hidden />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" aria-hidden />
      </div>

      <div className={cn("container-site relative flex flex-col justify-center pt-[70px]", size === "lg" ? "min-h-[600px] md:min-h-[680px]" : "min-h-[500px] md:min-h-[580px]")}>
        <div className="max-w-[720px] py-16">
          {top ? <div className="mb-3 text-[13px] text-white/85">{top}</div> : null}
          <Heading as="h1" size="display">
            {hero.title}
          </Heading>
          {hero.subtitle ? <p className="mt-4 max-w-[620px] text-lg leading-8 text-white/85 md:text-xl md:leading-9">{hero.subtitle}</p> : null}
          {children}
          {hero.primaryCta || hero.secondaryCta ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {hero.primaryCta ? <SmartLink link={hero.primaryCta} className={buttonClass("light")} /> : null}
              {hero.secondaryCta ? <SmartLink link={hero.secondaryCta} className={buttonClass("ghostDark")} /> : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** Compact dark header for detail pages (attorney, practice area, article). */
export function DetailHero({ eyebrow, title, children }: { eyebrow?: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <section className="relative -mt-[70px] overflow-hidden bg-ink pt-[70px] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,#2a2a2a_0%,#000_60%)]" aria-hidden />
      <div className="container-site relative py-16 md:py-20">
        {eyebrow ? <div className="mb-4 text-sm text-white/70">{eyebrow}</div> : null}
        <Heading as="h1" size="display" className="max-w-4xl">
          {title}
        </Heading>
        {children}
      </div>
    </section>
  );
}
