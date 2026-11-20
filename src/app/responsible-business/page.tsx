import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { PageEnd } from "@/components/sections/page-end";
import { ListingResults, Pagination } from "@/components/ui/listing-controls";
import { MotionList, MotionListItem } from "@/components/ui/motion-primitives";
import { Chip } from "@/components/ui/primitives";
import { Media } from "@/components/ui/media";
import { MOCK_CSR_STORIES } from "@/lib/mock/csr-stories";
import { formatMonthYear, readPage } from "@/lib/utils";
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

/** Responsible Business stories are listed separately from Insights & News. */
export default async function ResponsibleBusinessPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = readPage(params.page);
  const shownStories = MOCK_CSR_STORIES;
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
                <MotionListItem key={i.slug}>
                  <article className="flex h-full flex-col">
                    <Link
                      href={`/responsible-business/${i.slug}`}
                      className="relative block aspect-437/271 overflow-hidden rounded-sm"
                    >
                      <Media
                        image={i.coverImage}
                        alt=""
                        sizes="(min-width:1024px) 437px, (min-width:640px) 50vw, 85vw"
                      />
                    </Link>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Chip href={i.website.url} title={i.website.label} className="underline underline-offset-2">
                        {i.website.label}
                      </Chip>
                      <Chip compact className="shrink-0">{formatMonthYear(i.publishedAt)}</Chip>
                    </div>
                    <h2 className="mt-3 flex-1 text-base font-medium leading-7 text-ink">
                      <Link href={`/responsible-business/${i.slug}`} className="hover:underline">
                        {i.title}
                      </Link>
                    </h2>
                    <p className="mt-3 text-xs text-stone">{i.partner.name}</p>
                    <Link
                      href={`/responsible-business/${i.slug}`}
                      className="mt-3 inline-flex items-center gap-1 self-start rounded-sm border-[0.5px] border-gray px-3 py-2 text-xs leading-none text-ink hover:border-ink"
                    >
                      Read More <ArrowUpRight className="size-3.5" aria-hidden />
                    </Link>
                  </article>
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
