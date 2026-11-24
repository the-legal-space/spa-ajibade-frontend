// Static export only: scripts/build-static.sh copies this over src/app/insights/page.tsx.
// The first page of all insights is built into the page; categories, practice areas, sorting, paging and
// an attorney's publications (?author=, from "View all" on a profile) filter in the browser.
import type { Metadata } from "next";
import { getInsights, getPage } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { PageEnd } from "@/components/sections/page-end";
import { FeaturedInsights } from "@/components/sections/featured-insights";
import { Section } from "@/components/ui/primitives";
import { StaticInsightsListing, WhenParam } from "@/components/static/listings";
import { RESPONSIBLE_BUSINESS_STORY_SLUG } from "@/lib/mock/csr-stories";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("insights");
  return pageMetadata(page.seo, { title: page.listingSection.title, path: "/insights" });
}

export default async function InsightsPage() {
  const [content, list] = await Promise.all([getPage("insights"), getInsights({ sort: "newest", page: 1, pageSize: 15 })]);
  const featured = content.featured.filter((i) => i.slug !== RESPONSIBLE_BUSINESS_STORY_SLUG);
  const items = list.data.filter((i) => i.slug !== RESPONSIBLE_BUSINESS_STORY_SLUG);
  const spacer = <div className="-mt-[var(--header-h)] h-[var(--header-h)] bg-ink" aria-hidden />;

  return (
    <>
      {/* An attorney's "View more" list shows only their publications: no hero or featured block. */}
      {content.hero ? (
        <WhenParam param="author" absent>
          <PageHero hero={content.hero} />
        </WhenParam>
      ) : featured.length > 0 ? (
        <WhenParam param="author" absent>
          <FeaturedInsights items={featured} />
        </WhenParam>
      ) : null}
      {!content.hero && featured.length === 0 ? spacer : <WhenParam param="author">{spacer}</WhenParam>}

      <Section tone="mist" labelledBy="listing-heading" id="listing">
        <StaticInsightsListing
          title={content.listingSection.title}
          categoryFilters={content.categoryFilters}
          practiceAreaFilters={content.practiceAreaFilters}
          initial={{ items, totalPages: list.meta?.totalPages ?? 1 }}
        />
      </Section>

      <PageEnd />
    </>
  );
}
