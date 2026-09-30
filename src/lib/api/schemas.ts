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
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  sizes: z.object({ sm: z.string(), md: z.string(), lg: z.string() }),
  focalPoint: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }),
});
export type ApiImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
  sizes?: { sm?: string; md?: string; lg?: string };
  focalPoint?: { x: number; y: number };
};
export const NullableImage = ImageSchema.nullable();

export const LinkKind = z.enum(["internal", "external", "action"]);
export const LinkSchema = z.object({ label: z.string(), href: z.string(), kind: LinkKind });
export type ApiLink = z.infer<typeof LinkSchema>;
export const NullableLink = LinkSchema.nullable();

export const SectionHeader = z.object({
  eyebrow: nullableString,
  title: z.string(),
  cta: NullableLink,
});
export type SectionHeader = z.infer<typeof SectionHeader>;

export const IconItem = z.object({ icon: z.string(), title: z.string(), text: nullableString });
export type IconItem = z.infer<typeof IconItem>;

export const SeoSchema = z.object({
  title: nullableString,
  description: nullableString,
  ogImage: NullableImage,
});
export type Seo = z.infer<typeof SeoSchema>;

export const SeoBasicSchema = z.object({ title: nullableString, description: nullableString });
export type SeoBasic = z.infer<typeof SeoBasicSchema>;

export const HeroSchema = z.object({
  title: z.string(),
  subtitle: nullableString,
  images: z.array(ImageSchema),
  primaryCta: NullableLink,
  secondaryCta: NullableLink,
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
]);
export type PersonRole = z.infer<typeof PersonRole>;

export const InsightCategory = z.enum([
  "firm_news",
  "articles",
  "insights",
  "regulatory_updates",
  "news_updates",
  "events",
  "pro_bono",
]);
export type InsightCategory = z.infer<typeof InsightCategory>;

export const PracticeAreaRef = z.object({
  id: ObjectId,
  slug: Slug,
  title: z.string(),
  shortLabel: z.string(),
});
export type PracticeAreaRef = z.infer<typeof PracticeAreaRef>;

export const PracticeAreaLink = z.object({ slug: Slug, title: z.string() });

export const PracticeAreaCard = PracticeAreaRef.extend({
  summary: z.string(),
  image: NullableImage,
});
export type PracticeAreaCard = z.infer<typeof PracticeAreaCard>;

export const PersonSummary = z.object({
  id: ObjectId,
  slug: Slug,
  displayName: z.string(),
  role: PersonRole,
  roleLabel: z.string(),
  photo: NullableImage,
  linkedinUrl: nullableString,
  cardBio: nullableString,
  practiceAreas: z.array(PracticeAreaLink),
});
export type PersonSummary = z.infer<typeof PersonSummary>;

export const OfficeRef = z.object({ id: ObjectId, slug: Slug, name: z.string() });
export type OfficeRef = z.infer<typeof OfficeRef>;

export const FooterOffice = z.object({
  id: ObjectId,
  slug: Slug,
  name: z.string(),
  address: z.string(),
  phone: nullableString,
  email: nullableString,
});
export const SiteNewsletter = z.object({ title: z.string(), note: z.string(), enabled: z.boolean() });

export const InsightAuthor = z.discriminatedUnion("type", [
  z.object({ type: z.literal("person"), person: PersonSummary }),
  z.object({ type: z.literal("firm"), name: z.string(), label: z.string() }),
]);
export type InsightAuthor = z.infer<typeof InsightAuthor>;

export const InsightCard = z.object({
  id: ObjectId,
  slug: Slug,
  title: z.string(),
  excerpt: nullableString,
  format: z.enum(["article", "video"]),
  categories: z.array(InsightCategory).min(1),
  categoryLabels: z.array(z.string()),
  practiceAreas: z.array(PracticeAreaRef),
  chips: z.array(z.string()).max(2),
  author: InsightAuthor,
  coverImage: NullableImage,
  publishedAt: nullableString,
  featured: z.boolean(),
  cta: z.object({ label: z.string(), kind: z.enum(["read_more", "watch_video"]) }),
});
export type InsightCard = z.infer<typeof InsightCard>;

export const InsightDetail = InsightCard.omit({ cta: true }).extend({
  cta: z.object({ label: z.string(), url: z.string() }).nullable(),
  backLink: LinkSchema,
  body: nullableString,
  videoUrl: nullableString,
  related: z.array(InsightCard).max(3),
});
export type InsightDetail = z.infer<typeof InsightDetail>;

export const PracticeAreaLead = z.object({
  id: ObjectId,
  slug: Slug,
  displayName: z.string(),
  role: PersonRole,
  roleLabel: z.string(),
  photo: NullableImage,
  linkedinUrl: nullableString,
  cardBio: nullableString,
  practiceAreas: z.array(PracticeAreaLink),
  email: nullableString,
});

export const PracticeAreaDetail = PracticeAreaCard.extend({
  homeSummary: z.string(),
  heroIntro: z.string(),
  heroImages: z.array(ImageSchema),
  overview: nullableString,
  coreServices: z.array(z.object({ title: z.string(), description: z.string() })).min(1).max(6),
  approach: z.object({ text: z.string(), points: z.array(z.string()) }).nullable(),
  industries: z.array(z.object({ name: z.string(), slug: Slug })),
  lead: PracticeAreaLead.nullable(),
  siblings: z.array(PracticeAreaLink),
  recentPublications: z.array(InsightCard).max(6),
  seo: SeoBasicSchema,
});
export type PracticeAreaDetail = z.infer<typeof PracticeAreaDetail>;

export const PersonDetail = PersonSummary.extend({
  firstName: z.string(),
  lastName: z.string(),
  honorific: nullableString,
  postNominals: nullableString,
  instagramUrl: nullableString,
  email: nullableString,
  bio: nullableString,
  quote: nullableString,
  primaryPracticeArea: PracticeAreaLink.nullable(),
  education: z.object({
    intro: nullableString,
    entries: z.array(z.object({ qualification: z.string(), year: z.number().int().nullable() })),
  }),
  memberships: z.array(z.string()),
  office: OfficeRef.nullable(),
  recentPublications: z.array(InsightCard).max(6),
});
export type PersonDetail = z.infer<typeof PersonDetail>;

export const OfficeSchema = z.object({
  id: ObjectId,
  slug: Slug,
  name: z.string(),
  address: z.string(),
  hours: z.string(),
  phone: nullableString,
  email: nullableString,
  coordinates: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).nullable(),
  directionsUrl: nullableString,
});
export type Office = z.infer<typeof OfficeSchema>;

export const Recognition = z.object({
  id: ObjectId,
  organization: z.string(),
  title: z.string(),
  year: z.number().nullable(),
  badge: NullableImage,
  url: nullableString,
  tab: z.string(),
});
export type Recognition = z.infer<typeof Recognition>;

export const Award = z.object({
  id: ObjectId,
  title: z.string(),
  year: z.number().int(),
  badge: NullableImage,
  directory: z.object({ name: z.string(), slug: Slug }),
});
export type Award = z.infer<typeof Award>;

export const FaqSchema = z.object({ id: ObjectId, question: z.string(), answer: z.string() });
export type Faq = z.infer<typeof FaqSchema>;

export const JobSchema = z.object({
  id: ObjectId,
  slug: Slug,
  title: z.string(),
  practiceArea: PracticeAreaRef.nullable(),
  description: z.string(),
  experience: nullableString,
  employmentType: z.enum(["full_time", "part_time", "contract", "internship", "nysc"]),
  employmentTypeLabel: z.string(),
  workMode: z.enum(["onsite", "hybrid", "remote"]),
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
    foundedYear: z.number().int(),
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

const seo = { seo: SeoSchema };

export const HomePage = z.object({
  key: z.literal("home"),
  hero: HeroSchema,
  aboutFirm: z.object({ title: z.string(), paragraphs: z.array(z.string()), cta: NullableLink }),
  videoShowcase: z.object({
    videoUrl: nullableString,
    poster: NullableImage,
    caption: nullableString.optional(),
  }),
  recognitionSection: z.object({
    eyebrow: nullableString,
    title: z.string(),
    cta: z.object({ label: z.string(), href: nullableString, kind: LinkKind.nullable() }),
    image: NullableImage,
    badges: z.array(Award),
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
    profileDownload: z.object({
      leadText: z.string(),
      linkLabel: z.string(),
      document: z.object({ url: z.string(), title: z.string(), bytes: z.number().int().positive(), mimeType: z.literal("application/pdf") }).nullable(),
    }).nullable(),
  }),
  stats: z.object({
    title: z.string(),
    items: z.array(z.object({ value: z.string(), caption: z.string(), label: z.string() })),
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
    items: z.array(z.object({ name: z.string(), slug: z.string() })),
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
    .object({ title: z.string(), text: z.string(), images: z.array(ImageSchema), cta: NullableLink })
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
    eyebrow: nullableString,
    title: z.string(),
    cta: NullableLink,
    emptyState: z.object({ title: z.string(), body: z.string(), ctaLabel: z.string() }).nullable(),
  }),
  jobs: z.array(JobSchema),
  ...seo,
});
export type CareersPage = z.infer<typeof CareersPage>;

export const FaqPage = z.object({ key: z.literal("faq"), hero: HeroSchema, ...seo });
export type FaqPage = z.infer<typeof FaqPage>;

export const OfficesPage = z.object({
  key: z.literal("offices"),
  hero: HeroSchema,
  offices: z.array(OfficeSchema),
  ...seo,
});
export type OfficesPage = z.infer<typeof OfficesPage>;

export const PageSchemas = {
  home: HomePage,
  about: AboutPage,
  "practice-areas": PracticeAreasPage,
  people: PeoplePage,
  insights: InsightsPage,
  careers: CareersPage,
  faq: FaqPage,
  offices: OfficesPage,
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
  practiceAreas: z.array(PracticeAreaCard).max(5),
  people: z.array(PersonSummary).max(5),
  insights: z.array(InsightCard).max(5),
});
export type SearchResults = z.infer<typeof SearchResults>;

export const ApiErrorBody = z.object({
  error: z.object({
    code: z.enum(["VALIDATION_ERROR", "UNAUTHENTICATED", "FORBIDDEN", "NOT_FOUND", "CONFLICT", "PAYLOAD_TOO_LARGE", "UNSUPPORTED_MEDIA_TYPE", "FILE_REJECTED", "RATE_LIMITED", "INTERNAL"]),
    message: z.string(),
    details: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
  }),
});
export type ApiErrorBody = z.infer<typeof ApiErrorBody>;

export const SubmissionReceipt = z.object({ reference: z.string().regex(/^(ENQ|MSG|APP)-[0-9A-HJ-NP-Z]{6}$/) });
