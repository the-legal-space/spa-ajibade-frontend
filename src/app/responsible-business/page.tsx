import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getInsights, getPage } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";
import { formatLongDate, readPage } from "@/lib/utils";
import { PageEnd } from "@/components/sections/page-end";
import { InsightCard } from "@/components/sections/cards";
import { CsrCarousel } from "@/components/sections/csr-carousel";
import { Pagination } from "@/components/ui/listing-controls";
import { MotionList, MotionListItem } from "@/components/ui/motion-primitives";
import { Reveal } from "@/components/ui/reveal";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPage("responsible-business");
  return pageMetadata(content.seo, {
    title: content.title,
    description: "How SPA Ajibade & Co. gives back through pro bono work and community commitment.",
    path: "/responsible-business",
  });
}

/** "Responsible Business" listing: the CSR carousel plus every Pro Bono & Community Commitment story. */
export default async function ResponsibleBusinessPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = readPage(sp.page);
  const [content, list] = await Promise.all([
    getPage("responsible-business"),
    getInsights({ category: "pro_bono", sort: "newest", page, pageSize: 9 }),
  ]);
  // The banner shows the first three stories on this page. Each slide uses its story's own cover,
  // otherwise the page's CMS carousel images in turn, so the banner is never empty.
  const banner = content.images.filter((img) => img?.url);
  // Up to three slides: a story's details appear on hover; when the CMS has more carousel images
  // than stories, the extra slides are image-only.
  const count = Math.min(3, Math.max(list.data.length, banner.length));
  const slides = Array.from({ length: count }, (_, n) => {
    const i = list.data[n];
    return {
      slug: i?.slug ?? null,
      title: i?.title ?? null,
      date: i ? formatLongDate(i.publishedAt) : null,
      image: (i?.coverImage?.url ? i.coverImage : banner[n % Math.max(1, banner.length)]) ?? null,
    };
  });
  const meta = list.meta ?? { page, totalPages: 1 };

  return (
    <>
      <section className="bg-white py-10 md:py-12" aria-labelledby="rb-heading">
        <div className="container-site">
          <Link href={content.backLink.href} className="inline-flex items-center gap-1.5 text-[13px] hover:underline">
            <ArrowLeft className="size-3.5" aria-hidden /> {content.backLink.label}
          </Link>
          <h1 id="rb-heading" className="mt-8 font-serif text-[2rem] font-normal uppercase leading-[1.15] text-balance md:text-[2.75rem]">
            {content.title}
          </h1>

          <Reveal>
            <CsrCarousel slides={slides} />
          </Reveal>

          {list.data.length > 0 ? (
            <MotionList className="mt-10 grid gap-x-4 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {list.data.map((i) => (
                <MotionListItem key={i.id}>
                  <InsightCard insight={i} />
                </MotionListItem>
              ))}
            </MotionList>
          ) : (
            <p className="mt-10 rounded-xl bg-mist p-10 text-center text-stone">No stories have been published yet.</p>
          )}

          <Pagination page={meta.page} totalPages={meta.totalPages} base="/responsible-business" current={{}} />
        </div>
      </section>

      <PageEnd />
    </>
  );
}
