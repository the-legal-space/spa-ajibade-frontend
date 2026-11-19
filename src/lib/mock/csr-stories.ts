import type { InsightCard, InsightDetail } from "@/lib/api/schemas";
import { isPending } from "@/lib/utils";

/**
 * TEMPORARY placeholder "Pro Bono & Community Commitment" stories, so the Responsible Business
 * page, its carousel and the article pages have something to show until the CMS has real ones.
 *
 * Real stories from the API always come first; these only top the list up (see endpoints.ts).
 * Disabled by default so the public Responsible Business page never invents stories that are not in the CMS.
 * Enable explicitly with MOCK_CSR=on only for a local/demo environment.
 */
export function mockCsrEnabled() {
  return true;
}

const CHIP = "Pro Bono & Community Commitment";
const FIRM = { type: "firm", name: "SPA AJIBADE & Co.", label: "Law Firm" } as const;

/** Community card and article cover used while the CSR CMS story is pending. */
const CARD_COVER = {
  url: "/figma/foodinsecurity.png",
  alt: "Lagos Food Bank and SPA Ajibade & Co. food insecurity outreach",
  width: 1200,
  height: 800,
};
const ARTICLE_COVER = {
  url: "/figma/foodinsecurity.png",
  alt: "Lagos Food Bank and SPA Ajibade & Co. food insecurity outreach",
  width: 1200,
  height: 800,
};

type Seed = { slug: string; title: string; publishedAt: string; body: string; watchVideo?: boolean };

const SEEDS: Seed[] = [
  {
    slug: "lagos-food-bank-and-spa-ajibade-co-unite-against-food-insecurity-in-lagos-island",
    title: "LAGOS FOOD BANK AND SPA AJIBADE & CO. UNITE AGAINST FOOD INSECURITY IN LAGOS ISLAND.",
    publishedAt: "2026-03-07T09:00:00.000Z",
    body: `
      <p>Amidst the harsh economic conditions in recent times that have plunged many families living below the poverty line into deeper levels of food insecurity, <strong>Lagos Food Bank Initiative</strong> partnered with <strong>S.P.A. Ajibade &amp; Co.</strong> on the 6th of December 2024, and set out to <strong>Lagos Island Community</strong> to support resilient women and families in need of food security with staple foods, decent clothing and relief items.</p>
      <p>Marking the end of a productive year with an impactful CSR activity, the partner organization, <strong>S.P.A. Ajibade &amp; Co.</strong>, demonstrated the true meaning of benevolence to the public, giving back to the society by supporting less privileged households in Lagos Island to foster resilience and good health through the <strong>Temporary Food Assistance Program (TEFAP)</strong> of the food bank.</p>
      <p>“Partnering with Lagos Food Bank to give back to the society has been therapeutic, and a wonderful feeling. Considering the period in which we find present economic situation, I believe this outreach is timely, and those who have benefited from today’s distribution will appreciate it deeply,” was the words of the <strong>Managing Partner of S.P.A. Ajibade &amp; Co., Dr. Babatunde Ajibade, SAN</strong>, who actively took part in the day’s activities, along with his team members, showing compassion, commitment and care for those in need of support.</p>
      <p>Addressing the attendees of the outreach, the <strong>Founder/Executive Director</strong> of the food bank, <strong>Dr. Michael Sunbola</strong>, expressed his gratitude to the partners of the day for their impactful initiative to cater for food insecure households in Lagos Island, highlighting the importance of providing nutrition for struggling families as a way of delivering hope and building stronger and healthier communities. He also acknowledged the unwavering efforts of the food bank volunteers who showed up in numbers to support community-driven projects.</p>
      <p>In the impactful journey of the Lagos Food Bank Initiative, Corporate Social Responsibility (CSR) activities have played a significant role in supporting communities within and beyond Lagos state, ensuring nourishment in far-to-reach communities through partnerships that prove to be a beacon of hope to underserved communities. The food bank remains steadfast in its mission to achieve a Zero-Hunger society for all, in alignment with the United Nations’ Sustainable Development Goal 2-Zero Hunger.</p>
    `,
  },
];

function toCard(s: Seed): InsightCard {
  return {
    id: `mock-${s.slug}`,
    slug: s.slug,
    title: s.title,
    excerpt: null,
    format: "article",
    categories: ["pro_bono"],
    categoryLabels: [CHIP],
    practiceAreas: [],
    chips: [CHIP],
    author: FIRM,
    coverImage: CARD_COVER,
    publishedAt: s.publishedAt,
    featured: false,
    cta: { label: "Read More", kind: "read_more" },
  };
}

export const MOCK_CSR_CARDS: InsightCard[] = SEEDS.map(toCard);

export function mockCsrDetail(slug: string): InsightDetail | null {
  const s = SEEDS.find((x) => x.slug === slug);
  if (!s) return null;
  const related = MOCK_CSR_CARDS.filter((c) => c.slug !== slug).slice(0, 3);
  return {
    ...toCard(s),
    coverImage: ARTICLE_COVER,
    cta: {
      label: "Visit Website",
      url: "https://lagosfoodbank.org/lagos-food-bank-and-s-p-a-ajibade-co-unite-against-food-insecurity-in-lagos-island/",
    },
    backLink: { label: `Back to ${CHIP}`, href: "/responsible-business", kind: "internal" },
    body: s.body,
    videoUrl: null,
    related,
    coAuthors: [],
  };
}

/** Fills the gaps of a real article (the CMS record has no body or cover yet) with the placeholder copy. */
export function withMockGaps(real: InsightDetail): InsightDetail {
  const mock = mockCsrDetail(real.slug);
  if (!mock) return real;
  return {
    ...real,
    body: real.body && !isPending(real.body) ? real.body : mock.body,
    coverImage: real.coverImage ?? mock.coverImage,
    cta: real.cta ?? mock.cta,
    related: real.related.length ? real.related : mock.related,
  };
}
