import { z } from "zod";

/**
 * Zod schemas for the public SPA Ajibade content API.
 * Mirrors https://spaaco.onrender.com/docs (OpenAPI 1.0.0).
 * Every response is parsed at the boundary so a shape change on the backend
 * fails loudly in one place instead of rendering `undefined` across the site.
 */

const nullableString = z.string().nullable();
const ObjectId = z.string().regex(/^[0-9a-f]{24}$/);
const Slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(140);

export const ImageSchema = z.object({
  url: z.string(),
  alt: z.string(),
  width: z.number(),
  height: z.number(),
  sizes: z
    .object({ sm: z.string(), md: z.string(), lg: z.string() })
    .partial()
    .optional(),
  focalPoint: z.object({ x: z.number(), y: z.number() }).optional(),
});
export type ApiImage = z.infer<typeof ImageSchema>;
export const NullableImage = ImageSchema.nullable();

export const LinkKind = z.enum(["internal", "external", "action"]);
export const LinkSchema = z.object({
  label: z.string(),
  href: z.string(),
  kind: LinkKind,
});
export type ApiLink = z.infer<typeof LinkSchema>;
export const NullableLink = LinkSchema.nullable();

/** Link that tolerates the API's `{ href: null, kind: null }` (and `cta: null`) placeholders. */
export const OptionalLooseLink = z
  .object({
    label: z.string(),
    href: nullableString.optional(),
    kind: LinkKind.nullable().optional(),
  })
  .nullable()
  .optional();

/**
 * CTA on insight cards. Its `kind` uses a card vocabulary ("read_more"…) rather than the nav
 * `LinkKind`, and the whole object is `null` on some articles — callers only read `label`.
 */
export const InsightCta = z
  .object({
    label: z.string(),
    href: nullableString.optional(),
    kind: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

export const SectionHeader = z.object({
  eyebrow: nullableString.optional(),
  title: z.string(),
  cta: NullableLink.optional(),
});
export type SectionHeader = z.infer<typeof SectionHeader>;

export const IconItem = z.object({
  icon: z.string(),
  title: z.string(),
  text: nullableString,
});
export type IconItem = z.infer<typeof IconItem>;

export const SeoSchema = z
  .object({
    title: nullableString,
    description: nullableString,
    ogImage: NullableImage.optional(),
  })
  .partial();
export type Seo = z.infer<typeof SeoSchema>;
export const SeoBasicSchema = z.object({ title: nullableString, description: nullableString });
export type SeoBasic = z.infer<typeof SeoBasicSchema>;

export const HeroSchema = z.object({
  title: z.string(),
  subtitle: nullableString.optional(),
  image: NullableImage.optional(),
  /**
   * Extra slides for the auto-advancing home hero. Not in the API yet (backend request:
   * `hero.images: Image[]`); optional so the site works before and after it ships.
   */
  images: z.array(ImageSchema).optional(),
  primaryCta: NullableLink.optional(),
  secondaryCta: NullableLink.optional(),
});
export type Hero = z.infer<typeof HeroSchema>;

export const FilterOption = z.object({ value: z.string(), label: z.string() });
export type FilterOption = z.infer<typeof FilterOption>;

export const PersonRole = z.enum([
  "managing_partner",
  "partner",
  "associate_partner",
  "senior_associate",
  "associate",
  "trainee_associate",
  "nysc_associate",
]);
export type PersonRole = z.infer<typeof PersonRole>;

export const InsightCategory = z.enum([
  "firm_news",
  "articles",
  "insights",
  "regulatory_updates",
  "news_updates",
  "media_coverage",
  "webinar_resources",
  // Added by the API after launch ("inside the 2025 annual business luncheon…" is categorised this way).
  "events",
  // "Pro Bono & Community Commitment": the stories behind the Responsible Business page.
  "pro_bono",
]);
export type InsightCategory = z.infer<typeof InsightCategory>;

export const PracticeAreaRef = z.object({
  /**
   * Person profiles and insight refs send only `slug` + `title`; the full card payloads add
   * `id` and `shortLabel`. Both are optional so either variant parses.
   */
  id: z.string().optional(),
  slug: z.string(),
  title: z.string(),
  shortLabel: z.string().optional(),
});
export type PracticeAreaRef = z.infer<typeof PracticeAreaRef>;
export const PracticeAreaLink = z.object({ slug: Slug, title: z.string() });

export const PracticeAreaCard = PracticeAreaRef.extend({
  summary: z.string(),
  image: NullableImage,
});
export type PracticeAreaCard = z.infer<typeof PracticeAreaCard>;

export const PersonSummary = z.object({
  id: z.string(),
  slug: z.string(),
  displayName: z.string(),
  role: PersonRole,
  roleLabel: z.string(),
  photo: NullableImage,
  linkedinUrl: nullableString,
  cardBio: nullableString,
  practiceAreas: z.array(PracticeAreaLink),
});
export type PersonSummary = z.infer<typeof PersonSummary>;

export const OfficeRef = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
});
export type OfficeRef = z.infer<typeof OfficeRef>;
export const FooterOffice = z.object({ id: ObjectId, slug: Slug, name: z.string(), address: z.string(), phone: nullableString, email: nullableString });
// The API used to send `enabled`; it was removed when the real subscribe endpoint shipped. The form is always shown.
export const SiteNewsletter = z.object({ title: z.string(), note: z.string() });

export const InsightAuthor = z.discriminatedUnion("type", [
  // An attorney with a profile on the site.
  z.object({ type: z.literal("person"), person: PersonSummary }),
  // A named writer with no profile (former staff, guest authors). The photo can be missing.
  z.object({ type: z.literal("writer"), name: z.string(), label: z.string(), photo: NullableImage }),
  // The firm itself.
  z.object({ type: z.literal("firm"), name: z.string(), label: z.string() }),
]);
export type InsightAuthor = z.infer<typeof InsightAuthor>;

export const InsightCard = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: nullableString,
  format: z.enum(["article", "video"]),
  categories: z.array(InsightCategory),
  categoryLabels: z.array(z.string()),
  practiceAreas: z.array(PracticeAreaRef),
  chips: z.array(z.string()),
  author: InsightAuthor,
  coverImage: NullableImage,
  publishedAt: nullableString,
  featured: z.boolean(),
  cta: InsightCta,
});
export type InsightCard = z.infer<typeof InsightCard>;

export const InsightDetail = InsightCard.extend({
  cta: z.object({ label: z.string(), url: z.string() }).nullable(),
  backLink: LinkSchema,
  body: nullableString,
  videoUrl: nullableString,
  related: z.array(InsightCard),
  // Co-authors, in display order (only on the detail response; cards show the main author alone).
  coAuthors: z.array(InsightAuthor).default([]),
});
export type InsightDetail = z.infer<typeof InsightDetail>;

export const PracticeAreaDetail = PracticeAreaCard.extend({
  /** Long-form HTML intro (the API renamed the old `body` to `overview`). */
  overview: nullableString.optional(),
  body: nullableString.optional(),
  /** The API replaced `keyServices: string[]` with titled `coreServices[{ title, description }]`. */
  coreServices: z
    .array(
      z.object({ title: z.string(), description: nullableString.optional() }),
    )
    .optional(),
  keyServices: z.array(z.string()).optional(),
  /** A single lead contact replaces the old `contacts` list. */
  lead: PersonSummary.nullable().optional(),
  contacts: z.array(PersonSummary).optional(),
  /** The API now names this list `recentPublications`. */
  recentPublications: z.array(InsightCard).optional(),
  relatedInsights: z.array(InsightCard).optional(),
  homeSummary: z.string().optional(),
  heroIntro: z.string().optional(),
  heroImages: z.array(ImageSchema).optional(),
  approach: z.object({ text: z.string(), points: z.array(z.string()) }).nullable().optional(),
  industries: z.array(z.object({ name: z.string(), slug: Slug })).optional(),
  siblings: z.array(PracticeAreaLink).optional(),
  seo: SeoBasicSchema.optional(),
});
export type PracticeAreaDetail = z.infer<typeof PracticeAreaDetail>;

export const PersonDetail = PersonSummary.extend({
  firstName: z.string(),
  lastName: z.string(),
  honorific: nullableString,
  postNominals: nullableString,
  instagramUrl: nullableString.optional(),
  email: nullableString.optional(),
  bio: nullableString,
  quote: nullableString,
  primaryPracticeArea: PracticeAreaLink.nullable().optional(),
  education: z.object({ intro: nullableString, entries: z.array(z.object({ qualification: z.string(), year: z.number().nullable() })) }).optional(),
  memberships: z.array(z.string()).optional(),
  office: OfficeRef.nullable(),
  /** The API now names this list `recentPublications`; both keys are accepted. */
  insights: z.array(InsightCard).optional(),
  recentPublications: z.array(InsightCard).optional(),
});
export type PersonDetail = z.infer<typeof PersonDetail>;

export const OfficeSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  address: z.string(),
  hours: z.string(),
  phone: nullableString,
  email: nullableString,
  coordinates: z.object({ lat: z.number(), lng: z.number() }).nullable(),
  directionsUrl: nullableString,
});
export type Office = z.infer<typeof OfficeSchema>;

export const RecognitionDirectory = z.object({
  name: z.string(),
  slug: z.string(),
});
export type RecognitionDirectory = z.infer<typeof RecognitionDirectory>;

/**
 * A recognition badge. The API now nests the awarding body under `directory`
 * (`{ name: "IFLR 1000", slug: "iflr-1000" }`) and no longer sends `organization`/`tab`;
 * those two stay optional so older payloads keep parsing.
 */
export const Recognition = z.object({
  id: z.string(),
  title: z.string(),
  year: z.number().nullable().optional(),
  badge: NullableImage.optional(),
  url: nullableString.optional(),
  directory: RecognitionDirectory.nullable().optional(),
  organization: nullableString.optional(),
  tab: z.string().optional(),
});
export type Recognition = z.infer<typeof Recognition>;

export const RecognitionDirectoryRef = z.object({
  id: ObjectId,
  name: z.string(),
  slug: Slug,
  logo: NullableImage,
});

export const RecognitionAward = z.object({
  id: ObjectId,
  title: z.string(),
  year: z.number().int(),
  badge: NullableImage,
  directory: RecognitionDirectory,
});

export const RecognitionDirectoryPage = z.object({
  directory: RecognitionDirectoryRef,
  hero: HeroSchema,
  awardsEyebrow: z.string(),
  awards: z.array(RecognitionAward),
});
export type RecognitionDirectoryPage = z.infer<typeof RecognitionDirectoryPage>;

export const FaqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});
export type Faq = z.infer<typeof FaqSchema>;

export const JobSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  practiceArea: PracticeAreaRef.nullable(),
  description: z.string(),
  experience: nullableString,
  employmentType: z.string(),
  employmentTypeLabel: z.string(),
  workMode: z.string(),
  workModeLabel: z.string(),
  office: OfficeRef.nullable(),
  closingDate: nullableString,
  chips: z.array(z.string()),
});
export type Job = z.infer<typeof JobSchema>;

export const Socials = z.object({
  instagram: nullableString,
  facebook: nullableString,
  x: nullableString,
  linkedin: nullableString,
  youtube: nullableString,
});
export type Socials = z.infer<typeof Socials>;

export const NavItem = LinkSchema.extend({ children: z.array(LinkSchema) });
export type NavItem = z.infer<typeof NavItem>;

export const SiteSchema = z.object({
  settings: z.object({
    firmName: z.string(),
    legalDescriptor: z.string(),
    tagline: z.string(),
    foundedYear: z.number(),
    phone: nullableString,
    email: nullableString,
    socials: Socials,
    copyright: z.string(),
  }),
  nav: z.array(NavItem),
  footer: z.object({
    tagline: z.string(),
    links: z.array(LinkSchema),
    practiceAreas: z.array(PracticeAreaRef),
    offices: z.array(FooterOffice),
    legalLinks: z.array(LinkSchema),
    newsletter: SiteNewsletter,
    socials: Socials,
    copyright: z.string(),
  }),
  faqSection: z.object({
    eyebrow: nullableString,
    title: z.string(),
    items: z.array(FaqSchema),
    stillHaveQuestions: z.object({
      title: z.string(),
      text: z.string(),
      actions: z.array(LinkSchema),
    }),
  }),
  contactCallout: z.object({
    title: z.string(),
    text: z.string(),
    primaryCta: NullableLink,
    secondaryCta: NullableLink,
  }),
});
export type Site = z.infer<typeof SiteSchema>;

/* ---------- Composed pages ---------- */

const seo = { seo: SeoSchema.optional() };

export const HomePage = z.object({
  key: z.literal("home"),
  hero: HeroSchema,
  aboutFirm: z.object({
    title: z.string(),
    paragraphs: z.array(z.string()),
    cta: NullableLink,
  }),
  videoShowcase: z.object({
    videoUrl: nullableString,
    poster: NullableImage,
    caption: nullableString.optional(),
  }),
  /**
   * Recognition band. The API replaced `recognitionTabs` + `recognitions{achievements,recognizedBy}`
   * with one `recognitionSection` carrying a single `badges` list.
   */
  recognitionSection: z.object({
    eyebrow: nullableString.optional(),
    title: nullableString.optional(),
    cta: OptionalLooseLink,
    image: NullableImage.optional(),
    badges: z.array(Recognition),
  }),
  practiceSection: SectionHeader,
  practiceAreas: z.array(PracticeAreaCard),
  leadershipSection: SectionHeader,
  leadership: z.array(PersonSummary),
  whyChooseUs: z.object({
    eyebrow: nullableString,
    title: z.string(),
    text: z.string(),
    points: z.array(IconItem),
    image: NullableImage,
  }),
  insightsSection: SectionHeader,
  latestInsights: z.array(InsightCard),
  ...seo,
});
export type HomePage = z.infer<typeof HomePage>;

export const AboutPage = z.object({
  key: z.literal("about"),
  hero: HeroSchema,
  story: z.object({
    eyebrow: nullableString,
    title: z.string(),
    paragraphs: z.array(z.string()),
    quote: nullableString,
    quotePerson: PersonSummary.nullable(),
    profileDownload: z.object({ leadText: z.string(), linkLabel: z.string(), document: z.object({ url: z.string(), title: z.string(), bytes: z.number(), mimeType: z.literal("application/pdf") }).nullable() }).nullable().optional(),
  }),
  stats: z.object({
    title: z.string(),
    items: z.array(
      z.object({ value: z.string(), caption: z.string(), label: z.string() }),
    ),
  }),
  missionSection: z.object({
    eyebrow: nullableString,
    title: z.string(),
    image: NullableImage,
    items: z.array(z.object({ title: z.string(), body: z.string() })),
  }),
  principles: z.object({
    eyebrow: nullableString,
    title: z.string(),
    image: NullableImage,
    items: z.array(IconItem),
  }),
  awardsList: z.object({
    eyebrow: nullableString,
    title: z.string(),
    image: NullableImage,
    items: z.array(
      z.object({
        name: z.string(),
        slug: z.string().optional(),
        // The API stopped sending `url` on every award; only linked ones carry it.
        url: nullableString.optional(),
      }),
    ),
  }),
  ...seo,
});
export type AboutPage = z.infer<typeof AboutPage>;

export const PracticeAreasPage = z.object({
  key: z.literal("practice-areas"),
  hero: HeroSchema,
  gridSection: SectionHeader,
  practiceAreas: z.array(PracticeAreaCard),
  csrBanner: z
    .object({
      title: z.string(),
      text: z.string(),
      /** The API now sends `images: Image[]`; `image` is kept for older payloads. */
      image: NullableImage.optional(),
      images: z.array(ImageSchema).optional(),
      cta: NullableLink,
    })
    .nullable(),
  ...seo,
});
export type PracticeAreasPage = z.infer<typeof PracticeAreasPage>;

export const PeoplePage = z.object({
  key: z.literal("people"),
  hero: HeroSchema,
  directorySection: SectionHeader,
  roleFilters: z.array(FilterOption),
  practiceAreaFilters: z.array(FilterOption),
  ...seo,
});
export type PeoplePage = z.infer<typeof PeoplePage>;

export const InsightsPage = z.object({
  key: z.literal("insights"),
  hero: HeroSchema.nullable(),
  featured: z.array(InsightCard),
  categoryFilters: z.array(FilterOption),
  practiceAreaFilters: z.array(FilterOption),
  listingSection: SectionHeader,
  ...seo,
});
export type InsightsPage = z.infer<typeof InsightsPage>;

export const CareersPage = z.object({
  key: z.literal("careers"),
  hero: HeroSchema,
  jobsSection: z.object({
    eyebrow: nullableString.optional(),
    title: z.string(),
    cta: NullableLink.optional(),
    emptyState: z.object({ title: z.string(), body: z.string(), ctaLabel: z.string() }).nullable().optional(),
  }),
  jobs: z.array(JobSchema),
  ...seo,
});
export type CareersPage = z.infer<typeof CareersPage>;

export const FaqPage = z.object({
  key: z.literal("faq"),
  hero: HeroSchema,
  ...seo,
});
export type FaqPage = z.infer<typeof FaqPage>;

export const OfficesPage = z.object({
  key: z.literal("offices"),
  hero: HeroSchema,
  offices: z.array(OfficeSchema),
  ...seo,
});
export type OfficesPage = z.infer<typeof OfficesPage>;

/** "Responsible Business" (CSR): page title, carousel images and back link. The stories themselves are insights tagged `pro_bono`. */
export const ResponsibleBusinessPage = z.object({
  key: z.literal("responsible-business"),
  title: z.string(),
  images: z.array(ImageSchema),
  backLink: LinkSchema,
  ...seo,
});
export type ResponsibleBusinessPage = z.infer<typeof ResponsibleBusinessPage>;

export const PageSchemas = {
  home: HomePage,
  about: AboutPage,
  "practice-areas": PracticeAreasPage,
  people: PeoplePage,
  insights: InsightsPage,
  careers: CareersPage,
  faq: FaqPage,
  offices: OfficesPage,
  "responsible-business": ResponsibleBusinessPage,
} as const;
export type PageKey = keyof typeof PageSchemas;
export type PageOf<K extends PageKey> = z.infer<(typeof PageSchemas)[K]>;

/* ---------- Envelopes ---------- */

export const PaginationMeta = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});
export type PaginationMeta = z.infer<typeof PaginationMeta>;

export const SearchResults = z.object({
  practiceAreas: z.array(PracticeAreaCard),
  people: z.array(PersonSummary),
  insights: z.array(InsightCard),
});
export type SearchResults = z.infer<typeof SearchResults>;

export const ApiErrorBody = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z
      .array(z.object({ path: z.string(), message: z.string() }))
      .optional(),
  }),
});
export type ApiErrorBody = z.infer<typeof ApiErrorBody>;

export const SubmissionReceipt = z.object({ reference: z.string() });
