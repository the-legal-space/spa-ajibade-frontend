import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { getPage, getPerson, getSite } from "@/lib/api/endpoints";
import { ApiNotFoundError } from "@/lib/api/client";
import { cleanHtml } from "@/lib/sanitize";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/env";
import { navLabel } from "@/lib/utils";
import { PageEnd } from "@/components/sections/page-end";
import { InsightCard } from "@/components/sections/cards";
import { Eyebrow, Heading, Section } from "@/components/ui/primitives";
import { Media } from "@/components/ui/media";
import { SocialIcon } from "@/components/ui/social-icons";
import { SmartLink } from "@/components/ui/smart-link";
import { buttonClass } from "@/components/ui/button";
import { ScrollRail } from "@/components/home/scroll-rail";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  try {
    return await getPerson(slug);
  } catch (e) {
    if (e instanceof ApiNotFoundError) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [p, site] = await Promise.all([load(slug), getSite()]);
  return pageMetadata(undefined, { title: p.displayName, description: `${p.displayName}, ${p.roleLabel}, ${site.settings.firmName}`, path: `/people/${slug}` });
}

/** Attorney profile, following the "ATTORNEY DETAILS" frame (white header, two columns). */
export default async function PersonPage({ params }: Props) {
  const { slug } = await params;
  const [p, site, home] = await Promise.all([load(slug), getSite(), getPage("home")]);
  const bio = cleanHtml(p.bio);
  const back = navLabel(site.nav, "/people");
  const mandate = site.contactCallout.primaryCta;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: [p.honorific, p.firstName, p.lastName].filter(Boolean).join(" "),
    honorificPrefix: p.honorific ?? undefined,
    honorificSuffix: p.postNominals ?? undefined,
    jobTitle: p.roleLabel,
    worksFor: { "@type": "LegalService", name: site.settings.firmName, url: SITE_URL },
    url: `${SITE_URL}/people/${p.slug}`,
    sameAs: p.linkedinUrl ? [p.linkedinUrl] : undefined,
  };

  return (
    <>
      <section className="bg-white">
        <div className="container-site grid gap-12 py-12 md:py-16 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            {back ? (
              <Link href="/people" className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-stone hover:text-ink">
                <ArrowLeft className="size-3.5" aria-hidden /> {back}
              </Link>
            ) : null}
            <p className="text-lg">{p.roleLabel}</p>
            <Heading as="h1" className="mt-2">
              {p.displayName}
            </Heading>
            <div className="mt-8 aspect-[395/390] w-full max-w-[395px] overflow-hidden">
              <Media image={p.photo} placeholder="portrait" name={p.displayName} alt={`Portrait of ${p.displayName}`} priority sizes="395px" />
            </div>
            {p.practiceAreas.length > 0 ? (
              <p className="mt-6 text-lg">
                {p.practiceAreas.map((a, i) => (
                  <span key={a.slug}>
                    {i > 0 ? ", " : null}
                    <Link href={`/practice-areas/${a.slug}`} className="hover:underline">
                      {a.title}
                    </Link>
                  </span>
                ))}
              </p>
            ) : null}
            {p.office ? <p className="mt-1 text-sm text-stone">{p.office.name}</p> : null}
            <div className="mt-5 flex flex-wrap gap-3">
              {mandate ? (
                <SmartLink link={mandate} className="grid size-[52px] place-items-center rounded-lg bg-mist hover:bg-mist-200" >
                  <Mail className="size-6" aria-hidden />
                  <span className="sr-only">{mandate.label}</span>
                </SmartLink>
              ) : null}
              {p.linkedinUrl ? (
                <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`${p.displayName} on LinkedIn`} className="grid size-[52px] place-items-center rounded-lg bg-mist hover:bg-mist-200">
                  <SocialIcon name="linkedin" className="size-6" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="lg:pt-10">
            {p.quote ? <blockquote className="mb-8 border-l-2 border-ink pl-5 font-serif text-2xl leading-snug">“{p.quote}”</blockquote> : null}
            {bio ? (
              <div className="prose-firm text-[15px] leading-7" dangerouslySetInnerHTML={{ __html: bio }} />
            ) : null}
            {mandate ? <SmartLink link={mandate} className={buttonClass("dark", "mt-8")} /> : null}
          </div>
        </div>
      </section>

      {p.insights.length > 0 ? (
        <Section tone="mist" labelledBy="person-insights">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              {home.insightsSection.eyebrow ? <Eyebrow>{home.insightsSection.eyebrow}</Eyebrow> : null}
              <Heading className="mt-2">
                <span id="person-insights">{home.insightsSection.title}</span>
              </Heading>
            </div>
            {home.insightsSection.cta ? <SmartLink link={home.insightsSection.cta} className={buttonClass("outline")} /> : null}
          </div>
          <div className="mt-10">
            <ScrollRail label={home.insightsSection.title}>
              {p.insights.map((i) => (
                <div key={i.id} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]">
                  <InsightCard insight={i} />
                </div>
              ))}
            </ScrollRail>
          </div>
        </Section>
      ) : null}

      <PageEnd />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
