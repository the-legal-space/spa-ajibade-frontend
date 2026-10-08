import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getInsight, getInsights, getSite } from "@/lib/api/endpoints";
import { ApiNotFoundError } from "@/lib/api/client";
import { cleanHtml } from "@/lib/sanitize";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/env";
import { cn, formatMonthYear } from "@/lib/utils";
import { PageEnd } from "@/components/sections/page-end";
import { InsightCard } from "@/components/sections/cards";
import { ScrollRail } from "@/components/home/scroll-rail";
import { Chip, Heading } from "@/components/ui/primitives";
import { Media } from "@/components/ui/media";
import { AuthorAvatar, authorView } from "@/components/ui/author";
import { VideoEmbed } from "@/components/sections/video-embed";
import { insightCover } from "@/lib/figma-assets";
import { getInsightChipHref } from "@/lib/insight-links";

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
  const meta = pageMetadata(undefined, {
    title: i.title,
    description: i.excerpt,
    path: `/insights/${slug}`,
  });
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: i.publishedAt ?? undefined,
      images: i.coverImage
        ? [
            {
              url: i.coverImage.sizes?.lg ?? i.coverImage.url,
              alt: i.coverImage.alt,
            },
          ]
        : undefined,
    },
  };
}

/** Article page, following the "READ MORE" frame (white header, full-width cover, body, author). */
export default async function InsightPage({ params }: Props) {
  const { slug } = await params;
  const [i, site, recentInsights] = await Promise.all([
    load(slug),
    getSite(),
    getInsights({ sort: "newest", page: 1, pageSize: 50 }),
  ]);
  const body = cleanHtml(i.body);
  const date = formatMonthYear(i.publishedAt);
  const readMore = i.cta;
  const relatedInsights = recentInsights.data
    .filter((insight) => insight.slug !== i.slug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
  // The author first, then each co-author in the order given (co-authors only come on the detail response).
  const authors = [i.author, ...i.coAuthors].map(authorView);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: i.title,
    datePublished: i.publishedAt ?? undefined,
    author: authors.map((a) => ({
      "@type": a.kind === "firm" ? "Organization" : "Person",
      name: a.name,
      ...(a.href ? { url: `${SITE_URL}${a.href}` } : {}),
    })),
    publisher: {
      "@type": "Organization",
      name: site.settings.firmName,
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/insights/${i.slug}`,
  };

  return (
    <>
      <article className="min-w-0 overflow-hidden bg-white">
        <div className="container-site min-w-0 py-10 md:py-12">
          <Link
            href={i.backLink.href}
            className="inline-flex items-center gap-1.5 text-[13px] hover:underline"
          >
            <ArrowLeft className="size-3.5" aria-hidden /> {i.backLink.label}
          </Link>

          <div className="mt-8 flex items-start justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
              {i.chips.map((c) => (
                <Chip
                  key={c}
                  href={getInsightChipHref(i, c)}
                  className="underline underline-offset-2"
                >
                  {c}
                </Chip>
              ))}
            </div>
            {date && i.publishedAt ? (
              <time dateTime={i.publishedAt}>
                <Chip>{date}</Chip>
              </time>
            ) : null}
          </div>

          <Heading
            as="h1"
            size="h2"
            reveal={false}
            balance={false}
            className="mt-5 block w-full max-w-full break-words text-[2.5rem] leading-[1.08] md:text-[3.5rem] md:leading-[1.05]"
          >
            {i.title}
          </Heading>

          <div className="mt-8">
            {i.format === "video" && i.videoUrl ? (
              <VideoEmbed
                url={i.videoUrl}
                title={i.title}
                poster={i.coverImage}
              />
            ) : (
              <div className="aspect-[1352/540] overflow-hidden">
                <Media
                  image={insightCover(i.slug, i.coverImage)}
                  priority
                  sizes="100vw"
                />
              </div>
            )}
          </div>

          {i.excerpt && !body ? (
            <p className="mt-8 text-[15px] leading-8 text-ink-800">
              {i.excerpt}
            </p>
          ) : null}
          {body ? (
            <div
              className="prose-firm mt-8 min-w-0 max-w-full overflow-wrap-anywhere text-[15px] leading-8"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          ) : null}
          {readMore ? (
            <a
              href={readMore.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-blue-700 underline underline-offset-4 hover:text-blue-900"
            >
              {i.format === "video" ? readMore.label || "Watch Video" : "Read More"}{" "}
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
            {authors.map((a, n) => {
              const inner = (
                <>
                  <AuthorAvatar view={a} className="size-11" sizes="44px" />
                  <span className="leading-tight">
                    <span className={cn("block text-[13px]", a.href && "group-hover/author:underline")}>{a.name}</span>
                    <span className="block text-[11px] text-stone">{a.label}</span>
                  </span>
                </>
              );
              return a.href ? (
                <Link key={`${a.name}-${n}`} href={a.href} className="group/author flex items-center gap-3">
                  {inner}
                </Link>
              ) : (
                <div key={`${a.name}-${n}`} className="flex items-center gap-3">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </article>

      {relatedInsights.length > 0 ? (
        <section
          className="overflow-hidden bg-mist py-8 text-ink md:py-[68px]"
          aria-labelledby="related-insights-heading"
        >
          <div className="container-site">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone">
                  More from the firm
                </p>
                <Heading className="mt-1 md:mt-2">
                  <span id="related-insights-heading">Recent Publications</span>
                </Heading>
              </div>
            </div>
            <ScrollRail label="Recent publications">
              {relatedInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[437px]"
                >
                  <InsightCard insight={insight} />
                </div>
              ))}
            </ScrollRail>
          </div>
        </section>
      ) : null}

      <PageEnd />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
