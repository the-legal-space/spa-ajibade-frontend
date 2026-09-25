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
import { FilterTabs, Pagination } from "@/components/ui/listing-controls";
import { SortMenu } from "@/components/ui/sort-menu";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("insights");
  return pageMetadata(page.seo, { title: page.listingSection.title, description: "Articles, regulatory updates, firm news and webinars from SPA Ajibade & Co.", path: "/insights" });
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
    getInsights({ category, practiceArea, sort, page, pageSize: 9 }),
  ]);
  const current = { category, practiceArea, sort: sort === "newest" ? undefined : sort };
  const meta = list.meta ?? { page, totalPages: 1 };

  return (
    <>
      {content.hero ? <PageHero hero={content.hero} /> : null}
      {!content.hero && content.featured.length > 0 ? <FeaturedInsights items={content.featured} /> : null}
      {!content.hero && content.featured.length === 0 ? <div className="-mt-[70px] h-[70px] bg-ink" aria-hidden /> : null}

      <Section tone="mist" labelledBy="listing-heading" id="listing">
        <Heading as="h1">
          <span id="listing-heading">{content.listingSection.title}</span>
        </Heading>
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <FilterTabs options={content.categoryFilters} param="category" base="/insights" current={current} label="Filter by category" />
          <Suspense fallback={null}>
            <SortMenu options={SORTS} defaultValue="newest" />
          </Suspense>
        </div>

        {list.data.length > 0 ? (
          <ul className="mt-8 grid gap-x-4 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {list.data.map((i) => (
              <li key={i.id}>
                <InsightCard insight={i} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 rounded-xl bg-white p-10 text-center text-stone">Nothing has been published in this category yet.</p>
        )}

        <Pagination page={meta.page} totalPages={meta.totalPages} base="/insights" current={current} />
      </Section>

      <PageEnd />
    </>
  );
}
