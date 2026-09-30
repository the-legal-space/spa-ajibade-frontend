import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { getInsights, getPage, getPerson, getSite } from "@/lib/api/endpoints";
import { personPhoto } from "@/lib/figma-assets";
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
  const [p, site, home, all] = await Promise.all([
    load(slug),
    getSite(),
    getPage("home"),
    getInsights({ pageSize: 50 }).catch(() => null),
  ]);
  // The person endpoint's publication list is empty today even for authors, so articles are
  // also matched on the author of each published insight. Duplicates are dropped.
  const authored = (all?.data ?? []).filter((i) => i.author.type === "person" && i.author.person.slug === p.slug);
  const insights = [...p.recentPublications, ...authored].filter((i, idx, arr) => arr.findIndex((x) => x.id === i.id) === idx);
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
            <div className="mt-8 aspect-[395/390] w-full max-w-[395px] overflow-hidden bg-card-blue">
              <Media image={personPhoto(p.slug, p.photo)} placeholder="portrait" name={p.displayName} alt={`Portrait of ${p.displayName}`} priority sizes="395px" />
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
              ) : (
                <span className="grid size-[52px] place-items-center rounded-lg bg-mist text-ink/40" title="LinkedIn profile coming soon">
                  <SocialIcon name="linkedin" className="size-6" />
                </span>
              )}
            </div>
          </div>

          <div className="lg:pt-10">
            {p.quote ? <blockquote className="mb-8 border-l-2 border-ink pl-5 font-serif text-2xl leading-snug">“{p.quote}”</blockquote> : null}
            {bio ? (
              <div className="prose-firm text-[15px] leading-7" dangerouslySetInnerHTML={{ __html: bio }} />
            ) : null}
            {p.education.intro || p.education.entries.length > 0 ? (
              <section className="mt-10" aria-labelledby="education-heading">
                <h2 id="education-heading" className="font-serif text-xl">Education</h2>
                {p.education.intro ? <p className="mt-3 text-[15px] leading-7 text-ink-800">{p.education.intro}</p> : null}
                {p.education.entries.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {p.education.entries.map((entry) => (
                      <li key={`${entry.qualification}-${entry.year ?? ""}`} className="flex items-baseline justify-between gap-4 border-b border-mist-200 pb-3 text-sm">
                        <span>{entry.qualification}</span>
                        {entry.year ? <span className="shrink-0 text-stone">{entry.year}</span> : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ) : null}
            {p.memberships.length > 0 ? (
              <section className="mt-8" aria-labelledby="memberships-heading">
                <h2 id="memberships-heading" className="font-serif text-xl">Memberships</h2>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-ink-800">
                  {p.memberships.map((membership) => <li key={membership}>{membership}</li>)}
                </ul>
              </section>
            ) : null}
            {mandate ? <SmartLink link={mandate} className={buttonClass("dark", "mt-8")} /> : null}
          </div>
        </div>
      </section>

      {insights.length > 0 ? (
        <Section tone="mist" labelledBy="person-insights">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              {home.insightsSection.eyebrow ? <Eyebrow>{home.insightsSection.eyebrow}</Eyebrow> : null}
              <Heading className="mt-2">
                <span id="person-insights">Publications by {p.displayName}</span>
              </Heading>
            </div>
            {home.insightsSection.cta ? <SmartLink link={home.insightsSection.cta} className={buttonClass("outline")} /> : null}
          </div>
          <div className="mt-10">
            <ScrollRail label={`Publications by ${p.displayName}`}>
              {insights.map((i) => (
                <div key={i.id} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[437px]">
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
