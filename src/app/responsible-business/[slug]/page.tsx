import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Chip } from "@/components/ui/primitives";
import { PageEnd } from "@/components/sections/page-end";
import { MOCK_CSR_STORIES } from "@/lib/mock/csr-stories";
import { cleanHtml } from "@/lib/sanitize";
import { formatMonthYear } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

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

function getStory(slug: string) {
  const story = MOCK_CSR_STORIES.find((item) => item.slug === slug);
  if (!story) notFound();
  return story;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = getStory(slug);
  return pageMetadata(undefined, {
    title: story.title,
    description: "SPA Ajibade & Co. community outreach with Lagos Food Bank.",
    path: `/responsible-business/${slug}`,
  });
}

export default async function ResponsibleBusinessStoryPage({ params }: Props) {
  const { slug } = await params;
  const story = getStory(slug);
  const date = formatMonthYear(story.publishedAt);
  const body = cleanHtml(story.body);

  return (
    <>
      <article className="min-w-0 overflow-hidden bg-white">
        <div className="container-site min-w-0 py-10 md:py-12">
          <Link
            href="/responsible-business"
            className="inline-flex items-center gap-1.5 text-[13px] hover:underline"
          >
            <ArrowLeft className="size-3.5" aria-hidden /> Back to Responsible Business
          </Link>

          <div className="mt-8 flex items-start justify-between gap-4">
            <Chip href={story.website.url} target="_blank" title={story.website.label} className="underline underline-offset-2">
              {story.website.label}
            </Chip>
            {date ? (
              <time dateTime={story.publishedAt}>
                <Chip>{date}</Chip>
              </time>
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

          <div
            className="prose-firm mt-8 min-w-0 max-w-full overflow-wrap-anywhere text-[15px] leading-8"
            dangerouslySetInnerHTML={{ __html: body }}
          />

          <a
            href={story.website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-blue-700 underline underline-offset-4 hover:text-blue-900"
          >
            Visit Website <ArrowUpRight className="size-4" aria-hidden />
          </a>
        </div>
      </article>
      <PageEnd />
    </>
  );
}
