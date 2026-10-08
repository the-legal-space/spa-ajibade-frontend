import type { InsightCard, InsightDetail } from "@/lib/api/schemas";
import { isPending } from "@/lib/utils";

/**
 * TEMPORARY placeholder "Pro Bono & Community Commitment" stories, so the Responsible Business
 * page, its carousel and the article pages have something to show until the CMS has real ones.
 *
 * Real stories from the API always come first; these only top the list up (see endpoints.ts).
 * Enabled for local development and Vercel preview deployments, disabled on Vercel production.
 * Override with MOCK_CSR=on or MOCK_CSR=off.
 */
export function mockCsrEnabled() {
  const flag = process.env.MOCK_CSR;
  if (flag === "on") return true;
  if (flag === "off") return false;
  return process.env.VERCEL_ENV !== "production";
}

const CHIP = "Pro Bono & Community Commitment";
const FIRM = { type: "firm", name: "SPA AJIBADE & Co.", label: "Law Firm" } as const;

/** Card thumbnail in the designs: the Supreme Court photo. */
const CARD_COVER = { url: "/figma/insight-4.jpg", alt: "Supreme Court of Nigeria", width: 650, height: 350 };
/** Article cover in the designs: the smiling family (the same photo the CMS uses for the CSR banner). */
const ARTICLE_COVER = {
  url: "https://res.cloudinary.com/dbyep6ijw/image/upload/v1790849443/spa-ajibade/uh5r98c08riehpjzfmpl.png",
  alt: "A smiling family of four at home",
  width: 928,
  height: 618,
};

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

type Seed = { slug: string; title: string; publishedAt: string; body: string; watchVideo?: boolean };

const SEEDS: Seed[] = [
  {
    // The one story that already exists in the CMS; the API copy wins when present.
    slug: "spa-ajibade-co-sponsors-team-titans-an-american-flag-football-team",
    title: "SPA AJIBADE & Co. Sponsors Team Titans, an American Flag Football Team",
    publishedAt: "2025-09-16T09:00:00.000Z",
    body: `<p>${LOREM}</p>`,
    watchVideo: true,
  },
  {
    slug: "free-legal-clinic-for-small-business-owners-in-lagos",
    title: "SPA AJIBADE & Co. Hosts a Free Legal Clinic for Small Business Owners in Lagos",
    publishedAt: "2026-05-14T09:00:00.000Z",
    body: "<p>Our lawyers spent a Saturday at the Lagos office advising small business owners on company registration, contracts, tenancy and tax compliance, free of charge.</p><p>More than sixty entrepreneurs attended one-to-one sessions, and several matters will continue as pro bono engagements.</p>",
  },
  {
    slug: "legal-literacy-programme-with-local-schools",
    title: "Firm Partners With Local Schools on a Legal Literacy Programme",
    publishedAt: "2026-04-02T09:00:00.000Z",
    body: "<p>Members of the firm are visiting secondary schools to introduce students to their rights, the Nigerian legal system and careers in law.</p><p>The programme runs every term and is led by our associates, with partners joining for the closing sessions.</p>",
  },
  {
    slug: "pro-bono-team-secures-release-of-wrongfully-detained-applicants",
    title: "Pro Bono Team Secures the Release of Wrongfully Detained Applicants",
    publishedAt: "2026-03-11T09:00:00.000Z",
    body: "<p>Working with a partner non-profit, our dispute resolution lawyers obtained the release of several applicants held without charge.</p><p>The firm continues to take on access-to-justice matters alongside its commercial practice.</p>",
  },
  {
    slug: "community-health-outreach-in-ibadan",
    title: "SPA AJIBADE & Co. Supports the Annual Community Health Outreach in Ibadan",
    publishedAt: "2026-02-20T09:00:00.000Z",
    body: "<p>Our Ibadan office volunteered at this year's community health outreach, providing free legal guidance alongside medical screenings.</p><p>Volunteers helped residents with documentation, tenancy questions and family matters.</p>",
  },
  {
    slug: "mentoring-law-students-at-the-nigerian-law-school",
    title: "Our Lawyers Mentor Law Students at the Nigerian Law School",
    publishedAt: "2026-01-28T09:00:00.000Z",
    body: "<p>Partners and associates took part in a mentorship day at the Nigerian Law School, speaking about advocacy, commercial practice and building a career at the Bar.</p>",
  },
  {
    slug: "learning-materials-for-rural-primary-schools-in-abuja",
    title: "Firm Donates Learning Materials to Rural Primary Schools Around Abuja",
    publishedAt: "2025-12-12T09:00:00.000Z",
    body: "<p>Staff across our three offices contributed books, stationery and school supplies, delivered to primary schools in communities outside Abuja.</p>",
  },
  {
    slug: "tenancy-rights-workshop-for-onikan-residents",
    title: "Free Tenancy Rights Workshop for Residents of Onikan",
    publishedAt: "2025-11-19T09:00:00.000Z",
    body: "<p>Our real estate team ran a free workshop explaining tenancy agreements, notices and the steps open to tenants and landlords when disputes arise.</p>",
  },
  {
    slug: "access-to-justice-week-with-the-nigerian-bar-association",
    title: "SPA AJIBADE & Co. Joins the Nigerian Bar Association's Access to Justice Week",
    publishedAt: "2025-10-24T09:00:00.000Z",
    body: "<p>The firm joined the Nigerian Bar Association's Access to Justice Week, offering free consultations and reviewing matters referred by partner organisations.</p>",
  },
  {
    slug: "scholarship-fund-for-aspiring-lawyers",
    title: "Firm Launches a Scholarship Fund for Aspiring Lawyers",
    publishedAt: "2025-09-30T09:00:00.000Z",
    body: "<p>The new fund will support law students from underserved backgrounds with tuition and mentorship from our lawyers.</p>",
  },
  {
    slug: "data-protection-awareness-for-community-groups",
    title: "Data Protection Awareness Sessions for Community Groups",
    publishedAt: "2025-08-21T09:00:00.000Z",
    body: "<p>Our data protection team held free sessions for community organisations on handling personal data lawfully under the Nigeria Data Protection Act 2023.</p>",
  },
  {
    slug: "volunteer-day-at-a-children-s-home",
    title: "Volunteer Day at a Children's Home in Lagos",
    publishedAt: "2025-07-17T09:00:00.000Z",
    body: "<p>Staff from every practice group spent a day volunteering at a children's home, from painting classrooms to reading with the children.</p>",
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
    cta: s.watchVideo ? { label: "Watch Video", url: "https://www.youtube.com" } : null,
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
