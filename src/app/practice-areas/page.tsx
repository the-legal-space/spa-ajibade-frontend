import type { Metadata } from "next";
import { getPage } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { PageEnd } from "@/components/sections/page-end";
import { PracticeAreaCard } from "@/components/sections/cards";
import { Eyebrow, Heading, Section } from "@/components/ui/primitives";
import { Media } from "@/components/ui/media";
import { SmartLink } from "@/components/ui/smart-link";
import { buttonClass } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("practice-areas");
  return pageMetadata(page.seo, { title: page.hero.title, description: page.hero.subtitle, path: "/practice-areas" });
}

export default async function PracticeAreasPage() {
  const page = await getPage("practice-areas");
  const csr = page.csrBanner;

  return (
    <>
      <PageHero hero={page.hero} />

      <Section tone="mist" labelledBy="grid-heading">
        {page.gridSection.eyebrow ? <Eyebrow>{page.gridSection.eyebrow}</Eyebrow> : null}
        <Heading className="mt-2 max-w-4xl">
          <span id="grid-heading">{page.gridSection.title}</span>
        </Heading>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {page.practiceAreas.map((a) => (
            <li key={a.id}>
              <PracticeAreaCard area={a} />
            </li>
          ))}
        </ul>
      </Section>

      {csr ? (
        <section className="bg-white py-12" aria-labelledby="csr-heading">
          <div className="container-site">
            <div className="relative overflow-hidden rounded-xl bg-ink text-white">
              <div className="absolute inset-0">
                <Media image={csr.image} placeholder="dark" sizes="100vw" />
                <div className="absolute inset-0 bg-black/50" aria-hidden />
              </div>
              <div className="relative mx-auto flex min-h-[440px] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
                <Heading>
                  <span id="csr-heading">{csr.title}</span>
                </Heading>
                <p className="mt-4 text-lg leading-8 text-white/85">{csr.text}</p>
                {csr.cta ? <SmartLink link={csr.cta} className={buttonClass("ghostDark", "mt-6")} /> : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <PageEnd />
    </>
  );
}
