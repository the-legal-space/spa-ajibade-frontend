import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import {
  getPage,
  getPracticeArea,
  getSite,
} from "@/lib/api/endpoints";
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
import { MotionList, MotionListItem } from "@/components/ui/motion-primitives";
import { personPhoto } from "@/lib/figma-assets";

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
  return pageMetadata(area.seo, {
    title: area.title,
    description: area.summary,
    path: `/practice-areas/${slug}`,
  });
}

/** Practice area detail, following the "LEARN MORE PRACTICE AREA" frames. */
export default async function PracticeAreaPage({ params }: Props) {
  const { slug } = await params;
  const [area, site, listing, home] = await Promise.all([
    load(slug),
    getSite(),
    getPage("practice-areas"),
    getPage("home"),
  ]);
  const body = cleanHtml(area.overview ?? area.body);
  // Titled services replaced the old plain-string list; fall back so older payloads still render.
  const coreServices = area.coreServices?.length
    ? area.coreServices
    : (area.keyServices ?? []).map((title) => ({ title, description: null }));
  const contacts = area.lead ? [area.lead] : (area.contacts ?? []);
  const related = area.recentPublications ?? area.relatedInsights ?? [];
  const allAreas = area.siblings ?? [];
  const areasLabel = navLabel(site.nav, "/practice-areas");

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
            <Link
              href="/practice-areas"
              className="inline-flex items-center gap-1.5 hover:text-white"
            >
              <ArrowLeft className="size-3.5" aria-hidden /> Back to{" "}
              {areasLabel.toLowerCase()}
            </Link>
          ) : null
        }
      />

      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-[264px_1fr] lg:gap-5">
          <aside className="space-y-8">
            {allAreas.length > 0 ? (
              <nav
                aria-label={areasLabel ?? "Practice areas"}
                className="border-t-4 border-ink bg-mist px-6 py-7"
              >
                {areasLabel ? (
                  <p className="font-serif text-xl">{areasLabel}</p>
                ) : null}
                <ul className="mt-4 space-y-3">
                  {allAreas.map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/practice-areas/${a.slug}`}
                        aria-current={a.slug === area.slug ? "page" : undefined}
                        className={cn(
                          "text-[12px] underline underline-offset-2",
                          a.slug === area.slug
                            ? "font-semibold text-ink"
                            : "text-ink-700 hover:text-ink",
                        )}
                      >
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
            {contacts.map((p) => (
              <ContactCard key={p.id} person={p} />
            ))}
          </aside>

          <div className="min-w-0">
            {body ? (
              <div
                className="prose-firm text-[15px] leading-7 md:text-base md:leading-8"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            ) : (
              <p className="text-base leading-8 text-ink-800">{area.summary}</p>
            )}

            {coreServices.length > 0 ? (
              <div className="mt-8">
                <h2 className="font-serif text-xl">Core Services</h2>
                <MotionList className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {coreServices.map((s) => (
                    <MotionListItem
                      key={s.title}
                      className="flex min-h-35 flex-col justify-between rounded-xl bg-mist p-4 transition-shadow duration-200 hover:shadow-xs"
                    >
                      <PracticeMark />
                      <div className="mt-6">
                        <p className="font-serif text-lg leading-snug">
                          {s.title}
                        </p>
                        {s.description ? (
                          <p className="mt-2 text-sm leading-6 text-ink-700">
                            {s.description}
                          </p>
                        ) : null}
                      </div>
                    </MotionListItem>
                  ))}
                </MotionList>
              </div>
            ) : null}

            {area.approach ? (
              <section className="mt-8 border-t border-mist-200 pt-5" aria-labelledby="approach-heading">
                <h2 id="approach-heading" className="font-serif text-xl">Our Approach</h2>
                {area.approach.text ? (
                  <p className="mt-3 text-[15px] leading-7 text-ink-800 md:text-base md:leading-8">
                    {area.approach.text}
                  </p>
                ) : null}
                {area.approach.points.length > 0 ? (
                  <ul className="mt-3">
                    {area.approach.points.map((point, index) => (
                      <li
                        key={`${point}-${index}`}
                        // No line under the last point: the next section already draws one above itself.
                        className={`flex items-center gap-2 py-3 text-sm leading-6 text-ink-800 ${index < area.approach!.points.length - 1 ? "border-b border-mist-200" : ""}`}
                      >
                        <PracticeMark />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ) : null}

            {area.industries?.length ? (
              <section className="mt-8 border-t border-mist-200 pt-5" aria-labelledby="industries-heading">
                <h2 id="industries-heading" className="font-serif text-xl">Industries we serve</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {area.industries.map((industry) => (
                    <li key={industry.slug} className="flex min-h-29.5 flex-col justify-between rounded-xl bg-mist p-4">
                      <PracticeMark />
                      <span className="font-serif text-base leading-snug">{industry.name}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      </Section>

      {related.length > 0 ? (
        <Section tone="mist" labelledBy="related-heading">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              {home.insightsSection.eyebrow ? (
                <Eyebrow>{home.insightsSection.eyebrow}</Eyebrow>
              ) : null}
              <Heading className="mt-1 md:mt-2">
                <span id="related-heading">{home.insightsSection.title}</span>
              </Heading>
            </div>
            {home.insightsSection.cta ? (
              <SmartLink
                link={{
                  ...home.insightsSection.cta,
                  href: `/insights?practiceArea=${area.slug}`,
                }}
                className={buttonClass("outline")}
              />
            ) : null}
          </div>
          <div className="mt-10">
            <ScrollRail label={home.insightsSection.title}>
              {related.map((i) => (
                <div
                  key={i.id}
                  className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
                >
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

function PracticeMark() {
  return (
    <Image
      src="/figma/video-mark-bg.png"
      alt=""
      aria-hidden
      width={24}
      height={24}
      className="size-4 shrink-0 object-contain"
    />
  );
}

function ContactCard({ person }: { person: PersonSummary }) {
  return (
    <div className="group">
      <Link
        href={`/people/${person.slug}`}
        className="block aspect-264/280 overflow-hidden rounded-md"
      >
        <Media
          image={personPhoto(person.slug, person.photo)}
          placeholder="portrait"
          name={person.displayName}
          alt={`Portrait of ${person.displayName}`}
          sizes="264px"
          className="object-top transition duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <Link
        href={`/people/${person.slug}`}
        className="mt-2 block text-[13px] font-medium hover:underline"
      >
        {person.displayName}
      </Link>
      <p className="text-[11px] text-stone">{person.roleLabel}</p>
      <div className="mt-2 flex gap-2">
        {person.linkedinUrl ? (
          <a
            href={person.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${person.displayName} on LinkedIn`}
            className="grid size-8 place-items-center rounded-md bg-mist transition-colors hover:bg-mist-200"
          >
            <SocialIcon name="linkedin" className="size-4" />
          </a>
        ) : null}
        <Link
          href={`/people/${person.slug}`}
          aria-label={`Contact ${person.displayName}`}
          className="grid size-8 place-items-center rounded-md bg-mist transition-colors hover:bg-mist-200"
        >
          <Mail className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
