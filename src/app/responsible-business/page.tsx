import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getInsights } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";
import { formatLongDate, readPage } from "@/lib/utils";
import { insightCover } from "@/lib/figma-assets";
import { PageEnd } from "@/components/sections/page-end";
import { InsightCard } from "@/components/sections/cards";
import { CsrCarousel } from "@/components/sections/csr-carousel";
import { Pagination } from "@/components/ui/listing-controls";
import { MotionList, MotionListItem } from "@/components/ui/motion-primitives";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const DESCRIPTION = "How SPA Ajibade & Co. gives back through pro bono work and community commitment.";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(undefined, { title: "Responsible Business", description: DESCRIPTION, path: "/responsible-business" });
}

/** "Responsible Business" listing: the CSR carousel plus every Pro Bono & Community Commitment story. */
export default async function ResponsibleBusinessPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = readPage(sp.page);
  const list = await getInsights({ category: "pro_bono", sort: "newest", page, pageSize: 9 });
  // The banner shows the first three stories on this page; images come from each story's CMS cover.
  const slides = list.data.slice(0, 3).map((i) => ({
    slug: i.slug,
    title: i.title,
    date: formatLongDate(i.publishedAt),
    image: insightCover(i.slug, i.coverImage),
  }));
  const meta = list.meta ?? { page, totalPages: 1 };

  return (
    <>
      <section className="bg-white py-10 md:py-12" aria-labelledby="rb-heading">
        <div className="container-site">
          <Link href="/practice-areas" className="inline-flex items-center gap-1.5 text-[13px] hover:underline">
            <ArrowLeft className="size-3.5" aria-hidden /> Back to Practice Areas
          </Link>
          <h1 id="rb-heading" className="mt-8 font-serif text-[2rem] font-normal uppercase leading-[1.15] text-balance md:text-[2.75rem]">
            Responsible Business
          </h1>

          <CsrCarousel slides={slides} />

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
