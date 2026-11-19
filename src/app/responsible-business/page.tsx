import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { PageEnd } from "@/components/sections/page-end";
import { InsightCard } from "@/components/sections/cards";
import { ListingResults, Pagination } from "@/components/ui/listing-controls";
import { MotionList, MotionListItem } from "@/components/ui/motion-primitives";
import { MOCK_CSR_CARDS } from "@/lib/mock/csr-stories";
import { readPage } from "@/lib/utils";

const CSR_CARD_COVER = {
  url: "/figma/foodinsecurity.png",
  alt: "Lagos Food Bank and SPA Ajibade & Co. community outreach",
  width: 1200,
  height: 800,
};
const PAGE_SIZE = 15;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateMetadata(): Metadata {
  return pageMetadata(undefined, {
    title: "RESPONSIBLE BUSINESS",
    description:
      "How SPA Ajibade & Co. gives back through pro bono work and community commitment.",
    path: "/responsible-business",
  });
}

/** Mock Responsible Business listing while the CMS story is being prepared. */
export default async function ResponsibleBusinessPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = readPage(params.page);
  const shownStories = MOCK_CSR_CARDS;
  const totalPages = Math.max(1, Math.ceil(shownStories.length / PAGE_SIZE));
  const pageStories = shownStories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <section className="bg-white py-10 md:py-12" aria-labelledby="rb-heading">
        <div className="container-site">
          <Link
            href="/practice-areas"
            className="inline-flex items-center gap-1.5 text-[13px] hover:underline"
          >
            <ArrowLeft className="size-3.5" aria-hidden />{" "}
            Back to Practice Areas
          </Link>
          <h1
            id="rb-heading"
            className="mt-8 font-sans text-[2rem] font-normal uppercase leading-[1.15] text-balance md:text-[2.75rem]"
          >
            RESPONSIBLE BUSINESS
          </h1>

          <ListingResults>
          {pageStories.length > 0 ? (
            <MotionList className="mt-10 grid gap-x-4 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {pageStories.map((i) => (
                <MotionListItem key={i.id}>
                  <InsightCard
                    insight={{
                      ...i,
                      coverImage: CSR_CARD_COVER,
                    }}
                    linkable
                  />
                </MotionListItem>
              ))}
            </MotionList>
          ) : (
            <p className="mt-10 rounded-xl bg-mist p-10 text-center text-stone">
              No stories have been published yet.
            </p>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            base="/responsible-business"
            current={{}}
          />
          </ListingResults>
        </div>
      </section>

      <PageEnd />
    </>
  );
}
