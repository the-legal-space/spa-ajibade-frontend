import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInsight, getSite } from "@/lib/api/endpoints";
import { ApiNotFoundError } from "@/lib/api/client";
import { cleanHtml } from "@/lib/sanitize";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/env";
import { formatLongDate, initials, navLabel } from "@/lib/utils";
import { DetailHero } from "@/components/sections/page-hero";
import { PageEnd } from "@/components/sections/page-end";
import { InsightCard } from "@/components/sections/cards";
import { Heading, Section } from "@/components/ui/primitives";
import { Media } from "@/components/ui/media";
import { VideoEmbed } from "@/components/sections/video-embed";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  try {
    return await getInsight(slug);
  } catch (e) {
    if (e instanceof ApiNotFoundError) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const i = await load(slug);
  const meta = pageMetadata(undefined, { title: i.title, description: i.excerpt, path: `/insights/${slug}` });
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: i.publishedAt ?? undefined,
      images: i.coverImage ? [{ url: i.coverImage.sizes?.lg ?? i.coverImage.url, alt: i.coverImage.alt }] : undefined,
    },
  };
}

export default async function InsightPage({ params }: Props) {
  const { slug } = await params;
  const [i, site] = await Promise.all([load(slug), getSite()]);
  const body = cleanHtml(i.body);
  const back = navLabel(site.nav, "/insights");
  const authorName = i.author.type === "person" ? i.author.person.displayName : i.author.name;
  const authorLabel = i.author.type === "person" ? i.author.person.roleLabel : i.author.label;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: i.title,
    datePublished: i.publishedAt ?? undefined,
    author: { "@type": i.author.type === "person" ? "Person" : "Organization", name: authorName },
    publisher: { "@type": "Organization", name: site.settings.firmName, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/insights/${i.slug}`,
  };

  return (
    <>
      <DetailHero
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            {back ? (
              <Link href="/insights" className="hover:text-white">
                ← {back}
              </Link>
            ) : null}
            {i.categoryLabels.map((c, n) => (
              <Link key={c} href={`/insights?category=${i.categories[n]}`} className="rounded-[4px] border border-white/20 px-2.5 py-1 text-xs hover:bg-white/10">
                {c}
              </Link>
            ))}
          </div>
        }
        title={i.title}
      >
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/80">
          <span className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-[#56697a] text-[11px] text-white">{initials(authorName)}</span>
            {i.author.type === "person" ? (
              <Link href={`/people/${i.author.person.slug}`} className="hover:underline">
                {authorName}
              </Link>
            ) : (
              authorName
            )}
            <span className="text-white/50">· {authorLabel}</span>
          </span>
          {i.publishedAt ? <time dateTime={i.publishedAt}>{formatLongDate(i.publishedAt)}</time> : null}
        </div>
      </DetailHero>

      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          {i.format === "video" && i.videoUrl ? (
            <VideoEmbed url={i.videoUrl} title={i.title} poster={i.coverImage} />
          ) : i.coverImage ? (
            <div className="aspect-[16/9] overflow-hidden rounded-xl">
              <Media image={i.coverImage} priority sizes="(min-width:768px) 768px, 100vw" />
            </div>
          ) : null}
          {i.excerpt ? <p className="mt-10 font-serif text-xl leading-9 text-ink">{i.excerpt}</p> : null}
          {body ? <div className="prose-firm mt-8" dangerouslySetInnerHTML={{ __html: body }} /> : null}
          {i.practiceAreas.length > 0 ? (
            <div className="mt-12 border-t border-mist-200 pt-6">
              <p className="text-xs uppercase tracking-wider text-stone">Practice areas</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {i.practiceAreas.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/practice-areas/${a.slug}`} className="inline-block rounded-[4px] border border-mist-300 px-3 py-1.5 text-[13px] hover:border-ink">
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Section>

      {i.related.length > 0 ? (
        <Section tone="mist" labelledBy="related-heading">
          <Heading>
            <span id="related-heading">Related Insights</span>
          </Heading>
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {i.related.map((r) => (
              <li key={r.id}>
                <InsightCard insight={r} />
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
