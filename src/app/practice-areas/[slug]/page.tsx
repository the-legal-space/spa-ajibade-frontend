import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getPracticeArea, getSite } from "@/lib/api/endpoints";
import { ApiNotFoundError } from "@/lib/api/client";
import { cleanHtml } from "@/lib/sanitize";
import { pageMetadata } from "@/lib/seo";
import { DetailHero } from "@/components/sections/page-hero";
import { PageEnd } from "@/components/sections/page-end";
import { InsightCard, PersonCard } from "@/components/sections/cards";
import { Heading, Section } from "@/components/ui/primitives";
import { Media } from "@/components/ui/media";
import { SmartLink } from "@/components/ui/smart-link";
import { navLabel } from "@/lib/utils";
import { buttonClass } from "@/components/ui/button";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  try {
    return await getPracticeArea(slug);
  } catch (e) {
    if (e instanceof ApiNotFoundError) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const area = await load(slug);
  return pageMetadata(area.seo, { title: area.title, description: area.summary, path: `/practice-areas/${slug}` });
}

// This page is not in the Figma yet; it follows the same visual language.
export default async function PracticeAreaPage({ params }: Props) {
  const { slug } = await params;
  const [area, site] = await Promise.all([load(slug), getSite()]);
  const body = cleanHtml(area.body);
  const back = navLabel(site.nav, "/practice-areas");
  const cta = site.contactCallout.primaryCta;

  return (
    <>
      <DetailHero
        eyebrow={
          back ? (
            <Link href="/practice-areas" className="hover:text-white">
              ← {back}
            </Link>
          ) : undefined
        }
        title={area.title}
      >
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">{area.summary}</p>
        {cta ? <SmartLink link={cta} practiceArea={area.slug} className={buttonClass("light", "mt-8")} /> : null}
      </DetailHero>

      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-[1fr_420px]">
          <div>
            {body ? <div className="prose-firm max-w-3xl" dangerouslySetInnerHTML={{ __html: body }} /> : <p className="prose-firm max-w-3xl">{area.summary}</p>}
            {area.keyServices.length > 0 ? (
              <div className="mt-10">
                <h2 className="font-serif text-2xl">Key services</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {area.keyServices.map((s) => (
                    <li key={s} className="flex gap-3 rounded-lg bg-mist p-4 text-[15px]">
                      <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-[420/480]">
            <Media image={area.image} sizes="(min-width:1024px) 420px, 100vw" />
          </div>
        </div>
      </Section>

      {area.contacts.length > 0 ? (
        <Section tone="mist" labelledBy="contacts-heading">
          <Heading>
            <span id="contacts-heading">Who To Speak To</span>
          </Heading>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {area.contacts.map((p) => (
              <li key={p.id}>
                <PersonCard person={p} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {area.relatedInsights.length > 0 ? (
        <Section tone="white" labelledBy="related-heading">
          <Heading>
            <span id="related-heading">Related Insights</span>
          </Heading>
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {area.relatedInsights.map((i) => (
              <li key={i.id}>
                <InsightCard insight={i} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <PageEnd />
    </>
  );
}
