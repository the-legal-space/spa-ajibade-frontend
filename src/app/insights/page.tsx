import type { Metadata } from "next";
import { Suspense } from "react";
import { getInsights, getPage } from "@/lib/api/endpoints";
import { InsightCategory } from "@/lib/api/schemas";
import { pageMetadata } from "@/lib/seo";
import { readPage, readString } from "@/lib/utils";
import { PageHero } from "@/components/sections/page-hero";
import { PageEnd } from "@/components/sections/page-end";
import { InsightCard } from "@/components/sections/cards";
import { FeaturedInsights } from "@/components/sections/featured-insights";
import { Heading, Section } from "@/components/ui/primitives";
import { FilterMenu, FilterTabs, ListingResults, Pagination } from "@/components/ui/listing-controls";
import { MotionList, MotionListItem } from "@/components/ui/motion-primitives";
import { Reveal } from "@/components/ui/reveal";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("insights");
  return pageMetadata(page.seo, { title: page.listingSection.title, path: "/insights" });
}

export default async function InsightsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const catParsed = InsightCategory.safeParse(readString(sp.category));
  const category = catParsed.success ? catParsed.data : undefined;
  const practiceArea = readString(sp.practiceArea)?.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)?.[0];
  const sort = readString(sp.sort) === "oldest" ? "oldest" : "newest";
  const page = readPage(sp.page);

  const [content, list] = await Promise.all([
    getPage("insights"),
    getInsights({ category, practiceArea, sort, page, pageSize: 15 }),
  ]);
  const current = { category, practiceArea, sort: sort === "newest" ? undefined : sort };
  const meta = list.meta ?? { page, totalPages: 1 };

  return (
    <>
      {content.hero ? <PageHero hero={content.hero} /> : null}
      {!content.hero && content.featured.length > 0 ? <FeaturedInsights items={content.featured} /> : null}
      {!content.hero && content.featured.length === 0 ? <div className="-mt-[var(--header-h)] h-[var(--header-h)] bg-ink" aria-hidden /> : null}

      <Section tone="mist" labelledBy="listing-heading" id="listing">
        <Heading as="h1" reveal={false}>
          <span id="listing-heading">{content.listingSection.title}</span>
        </Heading>
        <Reveal className="relative z-[35] mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterTabs options={content.categoryFilters} param="category" base="/insights" current={current} label="Filter by category" />
          <Suspense fallback={null}>
            <FilterMenu
              options={content.practiceAreaFilters}
              param="practiceArea"
              base="/insights"
              current={current}
              label="Practice Area"
            />
          </Suspense>
        </Reveal>

        <ListingResults>
        {list.data.length > 0 ? (
          <MotionList key={`${category}|${practiceArea}|${sort}|${page}`} className="mt-4 md:mt-10 grid min-w-0 gap-x-4 gap-y-4 md:gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {list.data.map((i) => (
              <MotionListItem key={i.id} className="min-w-0">
                <InsightCard insight={i} />
              </MotionListItem>
            ))}
          </MotionList>
        ) : (
          <p className="mt-10 rounded-xl bg-white p-10 text-center text-stone">Nothing has been published in this category yet.</p>
        )}

        <Pagination page={meta.page} totalPages={meta.totalPages} base="/insights" current={current} />
        </ListingResults>
      </Section>

      <PageEnd />
    </>
  );
}
