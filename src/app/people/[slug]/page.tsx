import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { getPerson } from "@/lib/api/endpoints";
import { ApiNotFoundError } from "@/lib/api/client";
import { cleanHtml } from "@/lib/sanitize";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/env";
import { PageEnd } from "@/components/sections/page-end";
import { InsightCard } from "@/components/sections/cards";
import { Heading, Section } from "@/components/ui/primitives";
import { Media } from "@/components/ui/media";
import { SocialIcon } from "@/components/ui/social-icons";
import { ActionButton } from "@/components/ui/smart-link";
import { buttonClass } from "@/components/ui/button";

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
  const p = await load(slug);
  return pageMetadata(undefined, { title: p.displayName, description: `${p.displayName}, ${p.roleLabel} at SPA Ajibade & Co.`, path: `/people/${slug}` });
}

// Attorney details exist in Figma as a flow ("ATTORNEY DETAILS"); this follows the same visual language.
export default async function PersonPage({ params }: Props) {
  const { slug } = await params;
  const p = await load(slug);
  const bio = cleanHtml(p.bio);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: [p.honorific, p.firstName, p.lastName].filter(Boolean).join(" "),
    honorificPrefix: p.honorific ?? undefined,
    honorificSuffix: p.postNominals ?? undefined,
    jobTitle: p.roleLabel,
    worksFor: { "@type": "LegalService", name: "SPA Ajibade & Co.", url: SITE_URL },
    url: `${SITE_URL}/people/${p.slug}`,
    sameAs: p.linkedinUrl ? [p.linkedinUrl] : undefined,
  };

  return (
    <>
      <section className="relative -mt-[70px] bg-ink pt-[70px] text-white">
        <div className="container-site grid gap-10 py-14 md:grid-cols-[360px_1fr] md:py-20 lg:gap-16">
          <div className="aspect-square overflow-hidden rounded-2xl">
            <Media image={p.photo} placeholder="portrait" name={p.displayName} alt={`Portrait of ${p.displayName}`} priority sizes="360px" />
          </div>
          <div className="flex flex-col justify-center">
            <Link href="/people" className="text-sm text-white/70 hover:text-white">
              ← Our People
            </Link>
            <Heading as="h1" size="display" className="mt-4">
              {p.displayName}
            </Heading>
            <p className="mt-3 text-lg text-white/85">{p.roleLabel}</p>
            {p.office ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-white/70">
                <MapPin className="size-4" aria-hidden /> {p.office.name} office
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ActionButton action="action:mandate" className={buttonClass("light")}>
                Discuss a Mandate
              </ActionButton>
              {p.linkedinUrl ? (
                <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("ghostDark")}>
                  <SocialIcon name="linkedin" className="size-4" /> LinkedIn
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            {p.quote ? (
              <blockquote className="mb-10 border-l-2 border-ink pl-6 font-serif text-2xl leading-snug md:text-3xl">“{p.quote}”</blockquote>
            ) : null}
            {bio ? (
              <div className="prose-firm max-w-3xl" dangerouslySetInnerHTML={{ __html: bio }} />
            ) : (
              <p className="text-stone">A full profile for {p.displayName} will be published soon.</p>
            )}
          </div>
          <aside className="space-y-8">
            {p.practiceAreas.length > 0 ? (
              <div>
                <h2 className="font-serif text-xl">Practice areas</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {p.practiceAreas.map((a) => (
                    <li key={a.slug}>
                      <Link href={`/practice-areas/${a.slug}`} className="inline-block rounded-[4px] border border-mist-300 px-3 py-1.5 text-[13px] hover:border-ink">
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </Section>

      {p.insights.length > 0 ? (
        <Section tone="mist" labelledBy="person-insights">
          <Heading>
            <span id="person-insights">Insights by {p.firstName}</span>
          </Heading>
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {p.insights.map((i) => (
              <li key={i.id}>
                <InsightCard insight={i} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <PageEnd faq={false} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
