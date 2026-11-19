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
import { ReadingProgress } from "@/components/ui/reading-progress";
import { VideoEmbed } from "@/components/sections/video-embed";
import { insightCover } from "@/lib/figma-assets";
import { getInsightChipHref } from "@/lib/insight-links";
import { mockCsrDetail } from "@/lib/mock/csr-stories";

type Props = { params: Promise<{ slug: string }> };

const CSR_MEDIA_DIR = "/responsible-business-mockup-pics/";
const csrMediaPath = (filename: string) => `${CSR_MEDIA_DIR}${encodeURIComponent(filename)}`;
const CSR_MEDIA = [
  { type: "image", name: "A heartfelt thank you to our esteemed partner, SPA Ajibade & Co, @spa_ajibade for their unwaveri.jpg" },
  { type: "image", name: "A heartfelt thank you to our esteemed partner, SPA Ajibade & Co, @spa_ajibade for their unwaveri (1).jpg" },
  { type: "image", name: "A heartfelt thank you to our esteemed partner, SPA Ajibade & Co, @spa_ajibade for their unwaveri (2).jpg" },
  { type: "image", name: "A heartfelt thank you to our esteemed partner, SPA Ajibade & Co, @spa_ajibade for their unwaveri (3).jpg" },
  { type: "image", name: "A heartfelt thank you to our esteemed partner, SPA Ajibade & Co, @spa_ajibade for their unwaveri (4).jpg" },
  { type: "image", name: "A heartfelt thank you to our esteemed partner, SPA Ajibade & Co, @spa_ajibade for their unwaveri (5).jpg" },
  { type: "image", name: "A heartfelt thank you to our esteemed partner, SPA Ajibade & Co, @spa_ajibade for their unwaveri (6).jpg" },
  { type: "image", name: "A heartfelt thank you to our esteemed partner, SPA Ajibade & Co, @spa_ajibade for their unwaveri (7).jpg" },
  { type: "image", name: "A heartfelt thank you to our esteemed partner, SPA Ajibade & Co, @spa_ajibade for their unwaveri (8).jpg" },
  { type: "video", name: "A heartfelt thank you to our esteemed partner, SPA Ajibade & Co, @spa_ajibade for their unwaveri.mp4" },
  { type: "video", name: "A heartfelt thank you to our esteemed partner, SPA Ajibade & Co, @spa_ajibade for their unwaveri (1).mp4" },
  { type: "video", name: "A heartfelt thank you to our esteemed partner, SPA Ajibade & Co, @spa_ajibade for their unwaveri (2).mp4" },
  { type: "video", name: "A heartfelt thank you to our esteemed partner, SPA Ajibade & Co, @spa_ajibade for their unwaveri (3).mp4" },
  { type: "video", name: "AQOxv1dkpYCyQ2h2JIPPhv_14AifLt5Q3NJohw8PD6UtjqRHVKsyZrMsfeqJidwkw5aykfhc3XXdRJeUmob86yc.mp4" },
  { type: "video", name: "Today, we had the pleasure of hosting SPA Ajibade & Co @spa_ajibade at the food bank, and it was.mp4" },
  { type: "video", name: "WhatsApp Video 2026-11-17 at 15.31.20.mp4" },
] as const;

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
  const mockStory = mockCsrDetail(slug);
  if (mockStory) {
    return pageMetadata(undefined, {
      title: mockStory.title,
      description: mockStory.excerpt,
      path: `/insights/${slug}`,
    });
  }
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

function MockCsrArticle({ story }: { story: NonNullable<ReturnType<typeof mockCsrDetail>> }) {
  const body = cleanHtml(story.body);
  const date = formatMonthYear(story.publishedAt);

  return (
    <>
      <article className="min-w-0 overflow-hidden bg-white">
        <div className="container-site min-w-0 py-10 md:py-12">
          <Link
            href={story.backLink.href}
            className="inline-flex items-center gap-1.5 text-[13px] hover:underline"
          >
            <ArrowLeft className="size-3.5" aria-hidden /> {story.backLink.label}
          </Link>

          <div className="mt-8 flex items-start justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
              {story.chips.map((chip) => (
                <Chip key={chip} className="underline underline-offset-2">{chip}</Chip>
              ))}
            </div>
            {date && story.publishedAt ? (
              <time dateTime={story.publishedAt}><Chip>{date}</Chip></time>
            ) : null}
          </div>

          <h1 className="mt-5 block w-full max-w-full break-words font-sans text-[1.5rem] font-normal leading-[1.08] text-ink md:text-[2.5rem] md:leading-[1.05]">
            {story.title}
          </h1>

          <div
            role="region"
            aria-label="Lagos Food Bank outreach photos and videos"
            tabIndex={0}
            className="mt-8 -mx-5 overflow-x-auto px-5 pb-3 snap-x snap-mandatory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:mx-0 md:px-0"
          >
            <div className="flex w-max gap-1">
              {CSR_MEDIA.map((item) => {
                const src = csrMediaPath(item.name);
                return (
                  <div key={item.name} className="aspect-[4/3] w-[min(82vw,440px)] shrink-0 snap-start overflow-hidden bg-mist">
                    {item.type === "video" ? (
                      <video
                        src={src}
                        controls
                        playsInline
                        preload="metadata"
                        aria-label="Lagos Food Bank community outreach video"
                        className="size-full object-cover"
                      />
                    ) : (
                      <img
                        src={src}
                        alt="SPA Ajibade & Co. volunteering at the Lagos Food Bank"
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {body ? (
            <div
              className="prose-firm mt-8 min-w-0 max-w-full overflow-wrap-anywhere text-[15px] leading-8"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          ) : null}

          {story.cta ? (
            <a
              href={story.cta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-blue-700 underline underline-offset-4 hover:text-blue-900"
            >
              {story.cta.label} <ArrowUpRight className="size-4" aria-hidden />
            </a>
          ) : null}
        </div>
      </article>
      <PageEnd />
    </>
  );
}

/** Article page, following the "READ MORE" frame (white header, full-width cover, body, author). */
export default async function InsightPage({ params }: Props) {
  const { slug } = await params;
  const mockStory = mockCsrDetail(slug);
  if (mockStory) return <MockCsrArticle story={mockStory} />;

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
      <ReadingProgress />
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

          <h1 className="mt-5 block w-full max-w-full break-words font-sans text-[1.5rem] font-normal leading-[1.08] text-ink md:text-[2.5rem] md:leading-[1.05]">
            {i.title}
          </h1>

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
