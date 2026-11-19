import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getInsights, getPage, insightHasArticle } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";
import { formatLongDate, readPage } from "@/lib/utils";
import { PageEnd } from "@/components/sections/page-end";
import { InsightCard } from "@/components/sections/cards";
import { CsrCarousel } from "@/components/sections/csr-carousel";
import { ListingResults, Pagination } from "@/components/ui/listing-controls";
import { MotionList, MotionListItem } from "@/components/ui/motion-primitives";
import { Reveal } from "@/components/ui/reveal";

const CSR_CARD_COVER = {
  url: "/figma/csr-lagos-food-bank.jpg",
  alt: "Lagos Food Bank and SPA Ajibade & Co. community outreach",
  width: 437,
  height: 271,
};
const CSR_CARD_SLUG = "lagos-food-bank-and-spa-ajibade-co-unite-against-food-insecurity-in-lagos-island";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPage("responsible-business");
  return pageMetadata(content.seo, {
    title: content.title,
    description:
      "How SPA Ajibade & Co. gives back through pro bono work and community commitment.",
    path: "/responsible-business",
  });
}

/** A real CMS cover, not one of the bundled Figma placeholders used for card thumbnails. */
function hasOwnCover(i: { coverImage?: { url: string } | null } | undefined) {
  const url = i?.coverImage?.url;
  return !!url && !url.startsWith("/figma/");
}

/** "Responsible Business" listing: the CSR carousel plus every Pro Bono & Community Commitment story. */
export default async function ResponsibleBusinessPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = readPage(sp.page);
  const [content, list] = await Promise.all([
    getPage("responsible-business"),
    getInsights({ category: "pro_bono", sort: "newest", page, pageSize: 15 }),
  ]);
  const stories = list.data.filter((story) => story.slug !== "spa-ajibade-co-sponsors-team-titans-an-american-flag-football-team");
  const lagosFoodBankStory = stories.find((story) => story.slug === CSR_CARD_SLUG);
  const shownStories = lagosFoodBankStory
    ? stories
    : [
        {
          id: "lagos-food-bank-csr",
          slug: CSR_CARD_SLUG,
          title: "LAGOS FOOD BANK AND SPA AJIBADE & CO. UNITE AGAINST FOOD INSECURITY IN LAGOS ISLAND.",
          excerpt: null,
          format: "article" as const,
          categories: ["pro_bono" as const],
          categoryLabels: ["Pro Bono & Community Commitment"],
          practiceAreas: [],
          chips: ["Pro Bono & Community Commitment"],
          author: { type: "firm" as const, name: "SPA AJIBADE & Co.", label: "Law Firm" },
          coverImage: CSR_CARD_COVER,
          publishedAt: "2026-03-07T09:00:00.000Z",
          featured: false,
          cta: { label: "Read More", kind: "read_more" as const },
        },
        ...stories,
      ];
  // The banner shows the first three stories on this page. Each slide uses its story's own CMS cover,
  // otherwise the page's CMS carousel images in turn (bundled placeholder thumbnails don't count),
  // so the banner is never empty.
  const banner = content.images.filter((img) => img?.url);
  // Up to three slides: a story's details appear on hover; when the CMS has more carousel images
  // than stories, the extra slides are image-only.
  const count = Math.min(3, Math.max(shownStories.length, banner.length));
  const linkable = new Set(
    (await Promise.all(shownStories.map(async (i) => ((await insightHasArticle(i.slug)) ? i.slug : null)))).filter(
      (slug): slug is string => slug !== null,
    ),
  );
  const slides = Array.from({ length: count }, (_, n) => {
    const i = shownStories[n];
    return {
      slug: i?.slug ?? null,
      linkable: !!i && linkable.has(i.slug),
      title: i?.title ?? null,
      date: i ? formatLongDate(i.publishedAt) : null,
      image:
        (i?.slug === CSR_CARD_SLUG
          ? CSR_CARD_COVER
          : hasOwnCover(i)
          ? i?.coverImage
          : (banner[n % Math.max(1, banner.length)] ?? i?.coverImage)) ?? null,
    };
  });
  const meta = list.meta ?? { page, totalPages: 1 };

  return (
    <>
      <section className="bg-white py-10 md:py-12" aria-labelledby="rb-heading">
        <div className="container-site">
          <Link
            href={content.backLink.href}
            className="inline-flex items-center gap-1.5 text-[13px] hover:underline"
          >
            <ArrowLeft className="size-3.5" aria-hidden />{" "}
            {content.backLink.label}
          </Link>
          <h1
            id="rb-heading"
            className="mt-8 font-serif text-[2rem] font-normal uppercase leading-[1.15] text-balance md:text-[2.75rem]"
          >
            {content.title}
          </h1>

          <Reveal>
            <CsrCarousel slides={slides} />
          </Reveal>

          <ListingResults>
          {shownStories.length > 0 ? (
            <MotionList key={meta.page} className="mt-10 grid gap-x-4 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {shownStories.map((i, index) => (
                <MotionListItem key={i.id}>
                  <InsightCard
                    insight={{
                      ...i,
                      coverImage:
                        i.slug === CSR_CARD_SLUG
                          ? CSR_CARD_COVER
                          : hasOwnCover(i)
                            ? i.coverImage
                            : banner[index % Math.max(1, banner.length)] ?? i.coverImage,
                    }}
                    linkable={linkable.has(i.slug)}
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
            page={meta.page}
            totalPages={meta.totalPages}
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
