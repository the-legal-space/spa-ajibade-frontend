import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiNotFoundError } from "@/lib/api/client";
import { getRecognitionDirectory } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";
import { PageEnd } from "@/components/sections/page-end";
import { Eyebrow, Heading } from "@/components/ui/primitives";
import { Media } from "@/components/ui/media";
import { SmartLink } from "@/components/ui/smart-link";
import { buttonClass } from "@/components/ui/button";
import { HeroSlides, HeroSlideshow } from "@/components/sections/hero-slideshow";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  try {
    return await getRecognitionDirectory(slug);
  } catch (error) {
    if (error instanceof ApiNotFoundError) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await load(slug);
  return pageMetadata(undefined, {
    title: page.hero.title,
    description: page.hero.subtitle,
    path: `/recognitions/${slug}`,
  });
}

export default async function RecognitionDirectoryPage({ params }: Props) {
  const { slug } = await params;
  const page = await load(slug);
  const images = page.hero.images ?? [];

  return (
    <>
      <HeroSlideshow count={images.length}>
        <section data-header-theme="dark" className="relative -mt-[var(--header-h)] min-h-[400px] overflow-hidden bg-ink text-white md:min-h-[493px]">
          <div className="absolute inset-0">
            {images.length > 1 ? (
              <HeroSlides images={images} />
            ) : images[0] ? (
              <Media image={images[0]} priority sizes="100vw" />
            ) : (
              <div className="size-full bg-[radial-gradient(ellipse_at_75%_20%,#4b351e_0%,#160e08_48%,#000_90%)]" aria-hidden />
            )}
            <div className="absolute inset-0 bg-black/55" aria-hidden />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.22)_100%)]" aria-hidden />
          </div>
          <div className="container-site relative flex min-h-[400px] items-center pt-[var(--header-h)] md:min-h-[493px]">
            <div className="max-w-[776px] py-12">
              <Heading as="h1" size="display" reveal={false}>
                {page.hero.title}
              </Heading>
              {page.hero.subtitle ? (
                <p className="mt-5 text-lg leading-8 text-mist md:text-xl md:leading-9">
                  {page.hero.subtitle}
                </p>
              ) : null}
              {page.hero.primaryCta || page.hero.secondaryCta ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  {page.hero.primaryCta ? (
                    <SmartLink link={page.hero.primaryCta} className={buttonClass("light")} />
                  ) : null}
                  {page.hero.secondaryCta ? (
                    <SmartLink link={page.hero.secondaryCta} className={buttonClass("ghostDark")} />
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </HeroSlideshow>

      <section className="bg-white py-8 text-ink md:py-12" aria-labelledby="directory-awards">
        <div className="container-site">
          <Eyebrow>
            <span id="directory-awards">{page.awardsEyebrow}</span>
          </Eyebrow>
          <ul className="mt-5 border-t border-mist-200">
            {page.awards.map((award) => (
              <li key={award.id} className="grid min-h-[92px] grid-cols-[minmax(0,1fr)_52px_64px] items-center gap-3 border-b border-mist-200 py-3 md:grid-cols-[minmax(0,1fr)_90px_76px] md:gap-6">
                <h2 className="font-serif text-base leading-snug md:text-xl">
                  {award.title}
                </h2>
                <span className="text-center text-sm font-semibold md:text-base">
                  {award.year}
                </span>
                <div className="size-14 justify-self-end md:size-16">
                  <Media
                    image={award.badge}
                    alt={award.badge?.alt || `${award.title} badge`}
                    className="object-contain"
                    placeholder="pattern"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PageEnd />
    </>
  );
}