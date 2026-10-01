import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getInsight, getSite } from "@/lib/api/endpoints";
import { ApiNotFoundError } from "@/lib/api/client";
import { cleanHtml } from "@/lib/sanitize";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/env";
import { formatMonthYear, initials } from "@/lib/utils";
import { PageEnd } from "@/components/sections/page-end";
import { Chip, Heading } from "@/components/ui/primitives";
import { Media } from "@/components/ui/media";
import { VideoEmbed } from "@/components/sections/video-embed";
import { buttonClass } from "@/components/ui/button";
import { FIGMA, insightCover, personAvatar } from "@/lib/figma-assets";
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

/** Article page, following the "READ MORE" frame (white header, full-width cover, body, author). */
export default async function InsightPage({ params }: Props) {
  const { slug } = await params;
  const [i, site] = await Promise.all([load(slug), getSite()]);
  const body = cleanHtml(i.body);
  const date = formatMonthYear(i.publishedAt);
  const author =
    i.author.type === "person"
      ? {
          name: i.author.person.displayName,
          label: i.author.person.roleLabel,
          href: `/people/${i.author.person.slug}`,
          photo: personAvatar(i.author.person.slug, i.author.person.photo),
        }
      : { name: i.author.name, label: i.author.label, href: null, photo: { url: FIGMA.firmAvatar, alt: "", width: 60, height: 60 } };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: i.title,
    datePublished: i.publishedAt ?? undefined,
    author: { "@type": i.author.type === "person" ? "Person" : "Organization", name: author.name },
    publisher: { "@type": "Organization", name: site.settings.firmName, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/insights/${i.slug}`,
  };

  return (
    <>
      <article className="bg-white">
        <div className="container-site py-10 md:py-12">
          <Link href={i.backLink.href} className="inline-flex items-center gap-1.5 text-[13px] hover:underline">
            <ArrowLeft className="size-3.5" aria-hidden /> {i.backLink.label}
          </Link>

          <div className="mt-8 flex items-start justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
              {i.chips.map((c) => (
                  <Chip key={c} href={getInsightChipHref(i, c)} className="underline underline-offset-2">
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

          <Heading as="h1" size="h2" reveal={false} className="mt-5 w-full">
            {i.title}
          </Heading>

          <div className="mt-8">
            {i.format === "video" && i.videoUrl ? (
              <VideoEmbed url={i.videoUrl} title={i.title} poster={i.coverImage} />
            ) : (
              <div className="aspect-[1352/540] overflow-hidden">
                <Media image={insightCover(i.slug, i.coverImage)} priority sizes="100vw" />
              </div>
            )}
          </div>

          {i.excerpt && !body ? <p className="mt-8 text-[15px] leading-8 text-ink-800">{i.excerpt}</p> : null}
          {body ? <div className="prose-firm mt-8 text-[15px] leading-8" dangerouslySetInnerHTML={{ __html: body }} /> : null}
          {i.cta ? (
            <a href={i.cta.url} target="_blank" rel="noopener noreferrer" className={buttonClass("dark", "mt-8")}>
              {i.cta.label} <ArrowUpRight className="size-4" aria-hidden />
            </a>
          ) : null}

          <div className="mt-6 flex items-center gap-3">
            <span className="size-11 shrink-0 overflow-hidden rounded-full">
              {author.photo ? (
                <Media image={author.photo} alt="" sizes="44px" />
              ) : (
                <span className="grid size-full place-items-center bg-[#56697a] text-xs text-white">{initials(author.name)}</span>
              )}
            </span>
            <span className="leading-tight">
              {author.href ? (
                <Link href={author.href} className="block text-[13px] hover:underline">
                  {author.name}
                </Link>
              ) : (
                <span className="block text-[13px]">{author.name}</span>
              )}
              <span className="block text-[11px] text-stone">{author.label}</span>
            </span>
          </div>
        </div>
      </article>

      <PageEnd />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
