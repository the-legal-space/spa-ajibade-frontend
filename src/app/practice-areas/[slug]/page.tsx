import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { getPage, getPracticeArea, getPracticeAreas, getSite } from "@/lib/api/endpoints";
import { ApiNotFoundError } from "@/lib/api/client";
import type { PersonSummary } from "@/lib/api/schemas";
import { cleanHtml } from "@/lib/sanitize";
import { pageMetadata } from "@/lib/seo";
import { cn, navLabel } from "@/lib/utils";
import { PageHero } from "@/components/sections/page-hero";
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

/** Practice area detail, following the "LEARN MORE PRACTICE AREA" frames. */
export default async function PracticeAreaPage({ params }: Props) {
  const { slug } = await params;
  const [area, site, allAreas, listing, home] = await Promise.all([
    load(slug),
    getSite(),
    getPracticeAreas(),
    getPage("practice-areas"),
    getPage("home"),
  ]);
  const body = cleanHtml(area.body);
  const areasLabel = navLabel(site.nav, "/practice-areas");
  const mark = (
    <svg viewBox="0 0 32 32" className="size-4 text-stone" aria-hidden>
      <path d="M5 6 L16 16 L5 26 M27 6 L16 16 L27 26" fill="none" stroke="currentColor" strokeWidth="3.5" />
    </svg>
  );

  return (
    <>
      {/* Hero reuses the CTAs the firm set on the Practice Areas page, with this area's own copy and image. */}
      <PageHero
        hero={{
          title: area.title,
          subtitle: area.summary,
          image: area.image,
          primaryCta: listing.hero.primaryCta,
          secondaryCta: listing.hero.secondaryCta,
        }}
        top={
          areasLabel ? (
            <Link href="/practice-areas" className="inline-flex items-center gap-1.5 hover:text-white">
              <ArrowLeft className="size-3.5" aria-hidden /> Back to {areasLabel.toLowerCase()}
            </Link>
          ) : null
        }
      />

      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-[264px_1fr] lg:gap-5">
          <aside className="space-y-8">
            {allAreas.length > 0 ? (
              <nav aria-label={areasLabel ?? "Practice areas"} className="border-t-4 border-ink bg-mist px-6 py-7">
                {areasLabel ? <p className="font-serif text-xl">{areasLabel}</p> : null}
                <ul className="mt-4 space-y-3">
                  {allAreas.map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/practice-areas/${a.slug}`}
                        aria-current={a.slug === area.slug ? "page" : undefined}
                        className={cn("text-[12px] underline underline-offset-2", a.slug === area.slug ? "font-semibold text-ink" : "text-ink-700 hover:text-ink")}
                      >
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
            {area.contacts.map((p) => (
              <ContactCard key={p.id} person={p} />
            ))}
          </aside>

          <div className="min-w-0">
            {body ? (
              <div className="prose-firm text-[15px] leading-7 md:text-base md:leading-8" dangerouslySetInnerHTML={{ __html: body }} />
            ) : (
              <p className="text-base leading-8 text-ink-800">{area.summary}</p>
            )}

            {area.keyServices.length > 0 ? (
              <div className="mt-8">
                <h2 className="font-serif text-xl">Core Services</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {area.keyServices.map((s) => (
                    <li key={s} className="flex min-h-[140px] flex-col justify-between rounded-xl bg-mist p-4">
                      {mark}
                      <p className="mt-6 font-serif text-lg leading-snug">{s}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </Section>

      {area.relatedInsights.length > 0 ? (
        <Section tone="mist" labelledBy="related-heading">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              {home.insightsSection.eyebrow ? <Eyebrow>{home.insightsSection.eyebrow}</Eyebrow> : null}
              <Heading className="mt-2">
                <span id="related-heading">{home.insightsSection.title}</span>
              </Heading>
            </div>
            {home.insightsSection.cta ? (
              <SmartLink link={{ ...home.insightsSection.cta, href: `/insights?practiceArea=${area.slug}` }} className={buttonClass("outline")} />
            ) : null}
          </div>
          <div className="mt-10">
            <ScrollRail label={home.insightsSection.title}>
              {area.relatedInsights.map((i) => (
                <div key={i.id} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]">
                  <InsightCard insight={i} />
                </div>
              ))}
            </ScrollRail>
          </div>
        </Section>
      ) : null}

      <PageEnd />
    </>
  );
}

function ContactCard({ person }: { person: PersonSummary }) {
  return (
    <div>
      <Link href={`/people/${person.slug}`} className="block aspect-[264/280] overflow-hidden">
        <Media image={person.photo} placeholder="portrait" name={person.displayName} alt={`Portrait of ${person.displayName}`} sizes="264px" />
      </Link>
      <Link href={`/people/${person.slug}`} className="mt-2 block text-[13px] font-medium hover:underline">
        {person.displayName}
      </Link>
      <p className="text-[11px] text-stone">{person.roleLabel}</p>
      <div className="mt-2 flex gap-2">
        {person.linkedinUrl ? (
          <a href={person.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`${person.displayName} on LinkedIn`} className="grid size-8 place-items-center rounded-md bg-mist hover:bg-mist-200">
            <SocialIcon name="linkedin" className="size-4" />
          </a>
        ) : null}
        <Link href={`/people/${person.slug}`} aria-label={`Contact ${person.displayName}`} className="grid size-8 place-items-center rounded-md bg-mist hover:bg-mist-200">
          <Mail className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
