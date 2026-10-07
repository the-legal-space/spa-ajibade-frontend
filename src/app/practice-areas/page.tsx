import type { Metadata } from "next";
import { getPage } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { PageEnd } from "@/components/sections/page-end";
import { HeroDots, HeroSlides, HeroSlideshow } from "@/components/sections/hero-slideshow";
import { PracticeAreaCard } from "@/components/sections/cards";
import { Eyebrow, Heading } from "@/components/ui/primitives";
import { Media } from "@/components/ui/media";
import { SmartLink } from "@/components/ui/smart-link";
import { buttonClass } from "@/components/ui/button";
import { MotionList, MotionListItem } from "@/components/ui/motion-primitives";
import { FIGMA } from "@/lib/figma-assets";
import { Reveal } from "@/components/ui/reveal";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("practice-areas");
  return pageMetadata(page.seo, {
    title: page.hero.title,
    description: page.hero.subtitle,
    path: "/practice-areas",
  });
}

export default async function PracticeAreasPage() {
  const page = await getPage("practice-areas");
  const csr = page.csrBanner;
  // The CSR banner is a carousel of the CMS images (older payloads send a single `image`).
  const csrSeen = new Set<string>();
  const csrImages = [csr?.image, ...(csr?.images ?? [])].filter((img): img is NonNullable<typeof img> => {
    if (!img?.url || csrSeen.has(img.url)) return false;
    csrSeen.add(img.url);
    return true;
  });

  return (
    <>
      <PageHero hero={page.hero} />

      {/* Figma "Map Image": the world map sits behind the copy to show the firm's reach
          across Nigeria and beyond. No max-width of the old 4xl so the heading sets in two lines. */}
      <section
        id="practice-areas"
        aria-labelledby="grid-heading"
        className="relative overflow-hidden bg-mist py-8 text-ink md:py-[68px]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-no-repeat opacity-[0.08] [background-position:right_-20vw_top_-8vw] [background-size:max(1100px,120vw)_auto]"
          style={{ backgroundImage: `url(${FIGMA.aboutMap})` }}
        />
        <div className="container-site relative">
          {page.gridSection.eyebrow ? (
            <Eyebrow>{page.gridSection.eyebrow}</Eyebrow>
          ) : null}
          <Heading className="mt-1 max-w-[1200px] font-serif md:mt-2">
            <span id="grid-heading">{page.gridSection.title}</span>
          </Heading>
          <MotionList className="mt-4 md:mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {page.practiceAreas.map((a) => (
              <MotionListItem key={a.id}>
                <PracticeAreaCard area={a} />
              </MotionListItem>
            ))}
          </MotionList>
        </div>
      </section>

      {csr ? (
        <section className="bg-white py-12" aria-labelledby="csr-heading">
          <div className="container-site">
            <Reveal className="relative overflow-hidden rounded-xl bg-ink text-white">
              <HeroSlideshow count={csrImages.length}>
              <div className="absolute inset-0">
                {csrImages.length > 1 ? (
                  <HeroSlides images={csrImages} />
                ) : (
                  <Media image={csrImages[0] ?? null} placeholder="dark" sizes="100vw" />
                )}
                <div className="absolute inset-0 bg-black/50" aria-hidden />
              </div>
              <div className="relative mx-auto flex min-h-[440px] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
                <Heading>
                  <span id="csr-heading">{csr.title}</span>
                </Heading>
                <p className="mt-4 text-[12px] leading-8 text-white/85">
                  {csr.text}
                </p>
                <HeroDots className="mt-5" />
                {csr.cta ? (
                  <SmartLink
                    link={csr.cta}
                    className={buttonClass("ghostDark", "mt-6")}
                  />
                ) : null}
              </div>
              </HeroSlideshow>
            </Reveal>
          </div>
        </section>
      ) : null}

      <PageEnd />
    </>
  );
}
