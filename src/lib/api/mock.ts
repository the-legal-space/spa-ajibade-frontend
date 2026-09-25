/**
 * Offline fixtures based on the live API content of 25 Sep 2026 (images were null then too).
 * Dates and one video format are adjusted so every card state can be seen locally.
 * Used only when SPA_API_MOCK=1, for local development without the backend.
 */

const lagos = { id: "6ab58ce6dbdbf2ec0fbcbe4d", slug: "lagos", name: "Lagos" };
const abuja = { id: "6ab58ce6dbdbf2ec0fbcbe58", slug: "abuja", name: "Abuja" };
const ibadan = { id: "6ab58ce6dbdbf2ec0fbcbe65", slug: "ibadan", name: "Ibadan" };

const pa = (id: string, slug: string, title: string, shortLabel: string, summary: string) => ({
  id,
  slug,
  title,
  shortLabel,
  summary,
  image: null,
});

const practiceAreas = [
  pa("6ab58ce7dbdbf2ec0fbcbe6c", "company-secretarial", "Company Secretarial", "Company Secretarial",
    "When a business must fulfill its statutory obligations, the firm expertly manages all company secretarial duties, including board and shareholder governance, comprehensive CAC filings, and ensuring full regulatory compliance with laws and standards."),
  pa("6ab58ce7dbdbf2ec0fbcbe73", "corporate-finance-capital-markets", "Corporate Finance & Capital Markets", "Corporate",
    "When a business needs to raise capital, restructure, or meet regulatory requirements, the firm guides it through securities issuance, corporate restructuring, and filings with the Securities and Exchange Commission."),
  pa("6ab58ce7dbdbf2ec0fbcbe78", "data-protection-privacy", "Data Protection & Privacy", "Data Privacy",
    "When a company collects or manages personal data, it ensures compliance with the Nigeria Data Protection Act 2023 by providing comprehensive support, including conducting audits, drafting policies, and managing responses in the event of a data breach."),
  pa("6ab58ce7dbdbf2ec0fbcbe7d", "dispute-resolution-arbitration", "Dispute Resolution & Arbitration", "Dispute Resolution",
    "When a disagreement threatens to disrupt a business, a contract, or a relationship, the firm steps in to resolve it, whether that means representing a client in court, before an arbitral tribunal, or through negotiated settlement, across commercial, shareholder, and regulatory disputes."),
  pa("6ab58ce7dbdbf2ec0fbcbe7f", "energy-natural-resources", "Energy & Natural Resources", "Energy",
    "When a project involves power generation, distribution, or oil and gas, the firm advises on the regulatory approvals and compliance needed to get it built and keep it running, from electricity sector rules to mini-grid and rural electrification."),
  pa("6ab58ce7dbdbf2ec0fbcbe82", "intellectual-property", "Intellectual Property", "Intellectual Property",
    "When a business wants to protect its creations such as a brand, invention, or original content, our firm expertly handles the full process of registration, licensing, and enforcement to keep ownership rights fully protected and secure."),
  pa("6ab58ce8dbdbf2ec0fbcbe84", "real-estate-succession", "Real Estate & Succession", "Real Estate",
    "When a client is buying property, resolving a landlord-tenant dispute, or planning what happens to their estate, the firm manages the legal work that makes the transaction or transition sound."),
  pa("6ab58ce8dbdbf2ec0fbcbe86", "tax", "Tax", "Tax",
    "When a business needs to understand or meet its tax obligations, the firm advises on compliance and represents clients in disputes with tax authorities, protecting their financial position along the way."),
  pa("6ab58ce8dbdbf2ec0fbcbe88", "telecommunications-regulatory", "Telecommunications Regulatory", "Telecoms",
    "When a business operates in or enters the telecommunications sector, the firm advises on licensing, spectrum and compliance with NCC regulations, from market entry to ongoing regulatory obligations."),
];
const ref = (p: (typeof practiceAreas)[number]) => ({ id: p.id, slug: p.slug, title: p.title, shortLabel: p.shortLabel });
const paBySlug = (slug: string) => practiceAreas.find((p) => p.slug === slug)!;

const person = (id: string, slug: string, displayName: string, role: string, roleLabel: string) => ({
  id,
  slug,
  displayName,
  role,
  roleLabel,
  photo: null,
  linkedinUrl: null,
});
const people = [
  person("6ab58ce8dbdbf2ec0fbcbe8a", "babatunde-ajibade", "Dr. Babatunde Ajibade, SAN", "managing_partner", "Managing Partner"),
  person("6ab58ce8dbdbf2ec0fbcbe8c", "john-onyido", "Dr. John Onyido", "partner", "Partner"),
  person("6ab58ce8dbdbf2ec0fbcbe8e", "kolawole-mayomi", "Dr. Kolawole Mayomi", "partner", "Partner"),
  person("6ab58ce8dbdbf2ec0fbcbe90", "peter-olalere", "Peter Olalere", "associate_partner", "Associate Partner"),
  person("6ab58ce8dbdbf2ec0fbcbe92", "bolaji-gabari", "Bolaji Gabari", "associate_partner", "Associate Partner"),
  person("6ab58ce8dbdbf2ec0fbcbe94", "magnus-ejelonu", "Dr. Magnus Ejelonu", "associate_partner", "Associate Partner"),
  person("6ab58ce8dbdbf2ec0fbcbe96", "moruf-sowunmi", "Moruf Sowunmi", "associate_partner", "Associate Partner"),
  person("6ab58ce9dbdbf2ec0fbcbe98", "emmanuel-bassey", "Emmanuel Bassey", "senior_associate", "Senior Associate"),
  person("6ab58ce9dbdbf2ec0fbcbe9a", "david-essien", "David Essien", "senior_associate", "Senior Associate"),
];
const firmAuthor = { type: "firm", name: "SPA AJIBADE & Co.", label: "Law Firm" };

const insights = [
  {
    id: "6ab58ceadbdbf2ec0fbcbea2",
    slug: "regulatory-update-on-the-2026-supreme-court-practice-directions",
    title: "Regulatory Update On The 2026 Supreme Court Practice Directions",
    excerpt: null,
    format: "article",
    categories: ["regulatory_updates"],
    categoryLabels: ["Regulatory Updates"],
    practiceAreas: [ref(paBySlug("dispute-resolution-arbitration"))],
    chips: ["Regulatory Updates", "Dispute Resolution & Arbitration"],
    author: firmAuthor,
    coverImage: null,
    publishedAt: "2026-05-14T09:00:00.000Z",
    featured: false,
    cta: { label: "Read More", kind: "read_more" },
  },
  {
    id: "6ab58ceadbdbf2ec0fbcbea0",
    slug: "inside-the-2025-annual-business-luncheon-what-industry-leaders-are-saying-about-nigerias-economy",
    title: "Inside the 2025 Annual Business Luncheon: What Industry Leaders Are Saying About Nigeria's Economy",
    excerpt: null,
    format: "video",
    categories: ["webinar_resources", "firm_news"],
    categoryLabels: ["Webinar Resources", "Firm News"],
    practiceAreas: [],
    chips: ["Webinar Resources", "Firm News"],
    author: firmAuthor,
    coverImage: null,
    publishedAt: "2026-06-20T09:00:00.000Z",
    featured: true,
    cta: { label: "Watch Video", kind: "watch_video" },
  },
  {
    id: "6ab58ce9dbdbf2ec0fbcbe9e",
    slug: "the-rural-electrification-agency-renewable-electricity-and-the-mini-grid-regulation-2026-updates-and-prospects-for-investors",
    title: "The Rural Electrification Agency, Renewable Electricity and the Mini-Grid Regulation 2026: Updates and Prospects for Investors.",
    excerpt: null,
    format: "article",
    categories: ["articles"],
    categoryLabels: ["Articles"],
    practiceAreas: [ref(paBySlug("energy-natural-resources"))],
    chips: ["Articles", "Energy & Natural Resources"],
    author: { type: "person", person: people[3] },
    coverImage: null,
    publishedAt: "2026-07-02T09:00:00.000Z",
    featured: true,
    cta: { label: "Read More", kind: "read_more" },
  },
  {
    id: "6ab58ce9dbdbf2ec0fbcbe9c",
    slug: "repositioning-and-promoting-energy-investments-between-south-africa-and-nigeria-a-perspective-on-trade-secrets",
    title: "Repositioning and Promoting Energy Investments Between South Africa and Nigeria: A Perspective on Trade Secrets.",
    excerpt:
      "The focus of this brief is specifically on a bilateral energy investment relationship between Nigeria and South Africa: two nations that represent, by any objective commercial assessment, the most logical and most strategically significant energy partnership on the African continent…",
    format: "article",
    categories: ["articles"],
    categoryLabels: ["Articles"],
    practiceAreas: [ref(paBySlug("energy-natural-resources"))],
    chips: ["Articles", "Energy & Natural Resources"],
    author: { type: "person", person: people[1] },
    coverImage: null,
    publishedAt: "2026-06-01T09:00:00.000Z",
    featured: true,
    cta: { label: "Read More", kind: "read_more" },
  },
];

const offices = [
  { ...lagos, address: "Suite 201, SPAACO House, 27A Macarthy Street, Onikan", hours: "8:00 AM to 4:00 PM, Monday to Friday", phone: null, email: null, coordinates: null, directionsUrl: null },
  { ...abuja, address: "2nd Floor, Left Wing, Commercial Plaza, Gudu", hours: "8:00 AM to 4:00 PM, Monday to Friday", phone: null, email: null, coordinates: null, directionsUrl: null },
  { ...ibadan, address: "Top Floor Suite, SPAACO House, 138 Liberty Stadium Road", hours: "8:00 AM to 4:00 PM, Monday to Friday", phone: null, email: null, coordinates: null, directionsUrl: null },
];

const jobDescription =
  "<p>We're looking for an Associate to join our Corporate Finance &amp; Capital Markets practice. You'll work directly with partners on securities offerings, corporate restructurings, and regulatory filings for clients across banking, energy, and infrastructure, supporting due diligence, drafting, and filings on live transactions, advising clients on compliance with SEC and CAMA requirements, and working directly with senior counsel rather than as part of a rotating pool.</p><p>We're looking for someone with 2 to 4 years post-call experience, ideally in corporate finance or capital markets, called to the Nigerian Bar, with strong drafting and analytical skills, and comfortable working directly with clients and partners from an early stage.</p>";
const job = (id: string, slug: string, title: string) => ({
  id,
  slug,
  title,
  practiceArea: ref(paBySlug("corporate-finance-capital-markets")),
  description: jobDescription,
  experience: "2–4 years experience",
  employmentType: "full_time",
  employmentTypeLabel: "Full-time",
  workMode: "hybrid",
  workModeLabel: "Hybrid",
  office: lagos,
  closingDate: null,
  chips: ["2–4 years experience", "Full-time", "Hybrid", "Lagos"],
});
const jobs = [job("6ab58cebdbdbf2ec0fbcbeb6", "associate", "Associate"), job("6ab58cebdbdbf2ec0fbcbeb8", "nysc-associate", "NYSC Associate")];

const pending = "<p>[PENDING FROM FIRM]</p>";
const faqs = [
  { id: "6ab58ceadbdbf2ec0fbcbeac", question: "How do I schedule a consultation?", answer: pending },
  {
    id: "6ab58cebdbdbf2ec0fbcbeae",
    question: "What types of matters does the firm handle?",
    answer:
      "<p>The firm provides expert advice on a wide range of legal matters including dispute resolution and arbitration, corporate finance and capital markets, real estate and succession planning, energy and natural resources, intellectual property rights, data protection regulations, and tax law. Their comprehensive services are designed to support clients through complex legal challenges in these diverse areas.</p>",
  },
  { id: "6ab58cebdbdbf2ec0fbcbeb0", question: "Does the firm work with international clients?", answer: pending },
  { id: "6ab58cebdbdbf2ec0fbcbeb2", question: "How is client confidentiality handled?", answer: pending },
  { id: "6ab58cebdbdbf2ec0fbcbeb4", question: "How long does a typical matter take?", answer: pending },
];

const socials = { instagram: null, facebook: null, x: null, linkedin: null, youtube: null };
const copyright = "©2026 by SPA Ajibade & Co. All Rights Reserved.";
const mandate = { label: "Discuss a Mandate", href: "action:mandate", kind: "action" };
const internal = (label: string, href: string) => ({ label, href, kind: "internal" });
const seo = { title: null, description: null, ogImage: null };
const hero = (title: string, subtitle: string, secondary: { label: string; href: string; kind: string }) => ({
  title,
  subtitle,
  image: null,
  primaryCta: mandate,
  secondaryCta: secondary,
});

const site = {
  settings: {
    firmName: "SPA Ajibade & Co.",
    legalDescriptor: "Legal Practitioners, Arbitrators and Notaries Public",
    tagline: "Counsel to the institutions building Nigeria's economy.",
    foundedYear: 1967,
    phone: "(+234) 80000000000",
    email: "frontoffice@spaajibade.com",
    socials,
    copyright,
  },
  nav: [
    { ...internal("Home", "/"), children: [] },
    { ...internal("About Us", "/about"), children: [] },
    { ...internal("Practice Areas", "/practice-areas"), children: practiceAreas.map((p) => internal(p.title, `/practice-areas/${p.slug}`)) },
    { ...internal("Our People", "/people"), children: [] },
    { ...internal("Insights & News", "/insights"), children: [] },
    { ...internal("Careers", "/careers"), children: [] },
    { ...internal("FAQ's", "/faq"), children: [] },
    { ...internal("Our Offices", "/offices"), children: [] },
  ],
  footer: {
    tagline: "Counsel to the institutions building Nigeria's economy.",
    links: [
      internal("Home", "/"),
      internal("About Us", "/about"),
      internal("Practice Areas", "/practice-areas"),
      internal("Our People", "/people"),
      internal("Insights & News", "/insights"),
      internal("Careers", "/careers"),
      internal("FAQ's", "/faq"),
      internal("Our Offices", "/offices"),
    ],
    practiceAreas: practiceAreas.slice(1).map(ref),
    offices: [lagos, abuja, ibadan],
    socials,
    copyright,
  },
  faqSection: {
    eyebrow: "FAQ's",
    title: "Answers Before You Reach Out.",
    items: faqs,
    stillHaveQuestions: {
      title: "Still have questions?",
      text: "Speak with someone directly, or start a conversation with our assistant for a quick answer.",
      actions: [
        { label: "Chat with us", href: "action:chat", kind: "action" },
        { label: "Message the firm", href: "action:message", kind: "action" },
        { label: "Call the firm", href: "action:call", kind: "action" },
      ],
    },
  },
  contactCallout: {
    title: "Start With A Conversation, Not A Form.",
    text: "Speak with the firm directly, whether it's a new mandate, a question about an existing matter, or something you're not sure fits either.",
    primaryCta: mandate,
    secondaryCta: internal("View our offices", "/offices"),
  },
};

const recognition = (id: string, organization: string, title: string, year: number) => ({
  id,
  organization,
  title,
  year,
  badge: null,
  url: null,
  tab: "achievements",
});

const pages: Record<string, unknown> = {
  home: {
    key: "home",
    hero: hero(
      "Counsel To The Institutions Building Nigeria's Economy.",
      "For over five decades, we have advised governments, financial institutions and multinational corporations on capital markets transactions, complex disputes and the regulatory frameworks that shape commerce in Nigeria.",
      internal("Explore Our Practice Areas", "/practice-areas"),
    ),
    aboutFirm: {
      title: "A Firm Built On Integrity, Proven In Outcomes.",
      paragraphs: [
        "S. P. A. Ajibade & Co was founded in 1967. The Firm is managed by Dr. B. A. M. Ajibade, SAN as the Managing Partner together with six (6) other Partners, Dr. J. C. Onyido, Dr. K. Mayomi, Mrs. B. Gabari, Mr. P. O. Olalere and Dr. M. Ejelonu and Mr. M. Sowunmi. The Firm is focused on the following areas of practice: Dispute Resolution, Intellectual Property & Telecommunications, Corporate Finance & Capital Markets, Real Estate & Succession, Energy & Natural Resources.",
        "At S. P. A. Ajibade & Co, maintaining the integrity of the legal profession by ethically satisfying every client's specific needs and interests, whilst ensuring the continuous growth and development of the Firm is the core of daily practice.",
      ],
      cta: internal("Learn more about our history", "/about"),
    },
    videoShowcase: { videoUrl: null, poster: null },
    recognitionTabs: { achievementsLabel: "Our Achievements", recognizedByLabel: "Independently Recognized By" },
    recognitions: {
      achievements: [
        recognition("6ab58ceadbdbf2ec0fbcbea4", "IFLR1000", "Recommended Firm", 2024),
        recognition("6ab58ceadbdbf2ec0fbcbea6", "IFLR1000", "Recommended Firm", 2024),
        recognition("6ab58ceadbdbf2ec0fbcbea8", "Chambers Global", "Ranked in Global", 2026),
        recognition("6ab58ceadbdbf2ec0fbcbeaa", "Chambers Global", "Ranked in Global", 2026),
      ],
      recognizedBy: [],
    },
    practiceSection: { eyebrow: "Services", title: "Focused Practice Areas.", cta: internal("Explore Our Practice Areas", "/practice-areas") },
    practiceAreas: practiceAreas.slice(1, 8),
    leadershipSection: { eyebrow: "Our People", title: "Behind Every Victory Is A Leadership You Can Trust", cta: internal("View full directory", "/people") },
    leadership: people.slice(0, 3),
    whyChooseUs: {
      eyebrow: "Why Clients Choose SPA Ajibade",
      title: "Scale Hasn't Changed How We Treat A Matter.",
      text: "Across every office and every practice area, the standard stays the same, direct access to the advisor handling your matter, not a rotating team.",
      points: [
        { icon: "award", title: "Proven Track Record", text: null },
        { icon: "shield-plus", title: "Trial-Tested Attorneys", text: null },
        { icon: "handshake", title: "Client-Centered Focus", text: null },
        { icon: "folder-lock", title: "Confidential Handling", text: null },
      ],
      image: null,
    },
    insightsSection: { eyebrow: "Insights and News", title: "Recent Publications", cta: internal("View all insights", "/insights") },
    latestInsights: insights,
    seo,
  },
  about: {
    key: "about",
    hero: hero("Who We Are", "Integrity isn't a value we list, it's the reason clients keep coming back.", internal("Meet Our People", "/people")),
    story: {
      eyebrow: "Our Story",
      title: "Integrity And Commitment Build Client Trust.",
      paragraphs: [
        "The firm started in 1967, at a time when Nigerian businesses had few local options for the kind of legal counsel that large transactions and disputes required. Almost sixty years later, that gap has closed, but the reason clients still come to S. P. A. Ajibade & Co. hasn't changed.",
        "We've handled disputes that took years to resolve and transactions that closed in weeks. We've advised on capital markets deals, aviation matters, energy projects, intellectual property disputes, data protection compliance, and everything in between. The work rarely looks the same twice.",
        "What's stayed constant is how we approach it: with judgment built over decades, not shortcuts learned from templates. Clients don't come to us because we're the oldest firm in the room, they come because when something is actually at stake, they want someone who's handled it before and will tell them the truth about it.",
        "Today, that means offices in Lagos, Abuja, and Ibadan, and a practice that spans far more ground than \"corporate and commercial law\" ever really captured.",
      ],
      quote: "law is a profession, not an occupation.",
      quotePerson: people[0],
    },
    stats: {
      title: "Decades Of Practice, Measured In Outcomes.",
      items: [
        { value: "59+ Years", caption: "Advising across every major sector", label: "Advisory" },
        { value: "3 Offices", caption: "Lagos, Abuja, Ibadan", label: "Presence" },
        { value: "15+ Areas", caption: "Covering all commercial practice", label: "Practice" },
        { value: "700+ Matters", caption: "Cross-border and domestic", label: "Handled" },
      ],
    },
    missionSection: {
      eyebrow: "Mission, Vision & Values",
      title: "What Drives Our Practice And Why Clients Trust Us.",
      image: null,
      items: [
        { title: "Our Mission", body: "Our mission is to provide legal counsel clients can trust, with clarity, integrity, and commitment. We measure success by outcomes that serve clients' interests, not transaction size or dispute complexity. As Nigeria's commercial landscape evolves, our guidance adapts, but our legal standards remain constant." },
        { title: "Our Vision", body: "[PENDING FROM FIRM]" },
        { title: "Our Values", body: "[PENDING FROM FIRM]" },
        { title: "Our Asset", body: "[PENDING FROM FIRM]" },
      ],
    },
    principles: {
      eyebrow: "Principles That Guide Every Matter",
      title: "Built On Principle, Proven Over Nearly Six Decades Of Practice.",
      image: null,
      items: [
        { icon: "shield-check", title: "Integrity in practice", text: "Our clients trust us to act with responsibility, discretion, and respect for the law." },
        { icon: "handshake", title: "Commitment to clients", text: "Every client deserves focused attention, genuine care & strong representation." },
        { icon: "award", title: "Excellence in service", text: "We pursue excellence in every interaction and every outcome we work toward." },
        { icon: "eye", title: "Trust & transparency", text: "Setting realistic expectations, and building relationships grounded in confidence." },
        { icon: "gavel", title: "Strength in advocacy", text: "We represent our clients with confidence, resilience, and strategic determination." },
        { icon: "scale", title: "Justice with purpose", text: "Always focused on protecting rights and advancing our clients' best interests." },
      ],
    },
    awardsList: {
      eyebrow: "Recognition",
      title: "Award-Winning Legal Services",
      image: null,
      items: [
        { name: "IFLR 1000", url: null },
        { name: "Chambers Global", url: null },
        { name: "Legal 500", url: null },
        { name: "Who's Who Legal", url: null },
      ],
    },
    seo,
  },
  "practice-areas": {
    key: "practice-areas",
    hero: hero("Our Practice Areas", "We've covered enough ground to know that no two matters are really the same.", internal("Meet Our People", "/people")),
    gridSection: { eyebrow: "Confidence, resilience, and strategic precision", title: "We Are Driven By A Clear Purpose To Protect Rights & Pursue Fair Outcomes.", cta: null },
    practiceAreas,
    csrBanner: {
      title: "Pro Bono & Community Commitment",
      text: "Beyond advising clients, we take an active role in strengthening the legal environment and supporting the communities we work in.",
      image: null,
      cta: null,
    },
    seo,
  },
  people: {
    key: "people",
    hero: hero(
      "Get To Know Our Attorneys",
      "Meet the attorneys behind our firm's trusted reputation for strong counsel, thoughtful representation, strategic advocacy, and unwavering commitment to every client we serve.",
      internal("About Us", "/about"),
    ),
    directorySection: { eyebrow: "Our People", title: "Behind Every Victory Is A Leadership You Can Trust", cta: null },
    roleFilters: [
      { value: "", label: "Our Attorneys" },
      { value: "partner", label: "Partners" },
      { value: "associate_partner", label: "Associate Partners" },
      { value: "senior_associate", label: "Senior Associates" },
      { value: "associate", label: "Associates" },
      { value: "nysc_associate", label: "NYSC Associates" },
    ],
    seo,
  },
  insights: {
    key: "insights",
    hero: null,
    featured: insights.filter((i) => i.featured),
    categoryFilters: [
      { value: "", label: "All insights & news" },
      { value: "firm_news", label: "Firm News" },
      { value: "articles", label: "Articles" },
      { value: "insights", label: "Insights" },
      { value: "regulatory_updates", label: "Regulatory Updates" },
      { value: "news_updates", label: "News Updates" },
      { value: "media_coverage", label: "Media Coverage" },
      { value: "webinar_resources", label: "Webinar Resources" },
    ],
    listingSection: { eyebrow: null, title: "Insights & News", cta: null },
    seo,
  },
  careers: {
    key: "careers",
    hero: hero(
      "Practice Law, Not Just A Role.",
      "At SPA Ajibade, associates work directly with partners on matters that matter, not behind layers of a rotating team.",
      internal("Our People", "/people"),
    ),
    jobsSection: { eyebrow: null, title: "Careers", cta: null },
    jobs,
    seo,
  },
  faq: {
    key: "faq",
    hero: hero(
      "Frequently Asked Questions",
      "Straight answers to what people most often ask before reaching out, about the firm, how matters work, and what to expect.",
      internal("View our offices", "/offices"),
    ),
    seo,
  },
  offices: {
    key: "offices",
    hero: {
      ...hero("Wherever You Find Us.", "Three offices, one standard of counsel.", internal("View our offices", "/offices")),
      secondaryCta: { label: "Chat with us", href: "action:chat", kind: "action" },
    },
    offices,
    seo,
  },
};

function list<T>(items: T[], params: URLSearchParams) {
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(params.get("pageSize") ?? 9)));
  const total = items.length;
  return {
    data: items.slice((page - 1) * pageSize, page * pageSize),
    meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

export function mockResponse(fullPath: string): unknown | null {
  const [path = "", qs = ""] = fullPath.split("?");
  const params = new URLSearchParams(qs);
  const seg = path.split("/").filter(Boolean);

  if (path === "/site") return { data: site };
  if (seg[0] === "pages" && seg[1]) return seg[1] in pages ? { data: pages[seg[1]] } : null;

  if (seg[0] === "practice-areas") {
    if (!seg[1]) return { data: practiceAreas };
    const p = practiceAreas.find((x) => x.slug === seg[1]);
    if (!p) return null;
    return {
      data: {
        ...p,
        body: null,
        keyServices: [],
        contacts: [],
        relatedInsights: insights.filter((i) => i.practiceAreas.some((r) => r.slug === p.slug)),
        seo: { title: null, description: null },
      },
    };
  }

  if (seg[0] === "people") {
    if (!seg[1]) {
      const role = params.get("role");
      let items = role ? people.filter((p) => p.role === role || (role === "partner" && p.role === "managing_partner")) : people;
      const sort = params.get("sort");
      if (sort === "name_asc") items = [...items].sort((a, b) => a.displayName.localeCompare(b.displayName));
      if (sort === "name_desc") items = [...items].sort((a, b) => b.displayName.localeCompare(a.displayName));
      return list(items, params);
    }
    const p = people.find((x) => x.slug === seg[1]);
    if (!p) return null;
    const [first = "", ...rest] = p.displayName.replace(/^Dr\. /, "").replace(/, SAN$/, "").split(" ");
    return {
      data: {
        ...p,
        firstName: first,
        lastName: rest.join(" "),
        honorific: p.displayName.startsWith("Dr.") ? "Dr." : null,
        postNominals: p.displayName.endsWith("SAN") ? "SAN" : null,
        bio: null,
        quote: p.slug === "babatunde-ajibade" ? "law is a profession, not an occupation." : null,
        practiceAreas: [],
        office: lagos,
        insights: insights.filter((i) => i.author.type === "person" && "person" in i.author && i.author.person?.slug === p.slug),
      },
    };
  }

  if (seg[0] === "insights") {
    if (!seg[1]) {
      const cat = params.get("category");
      const pas = params.get("practiceArea");
      let items = insights.filter((i) => (!cat || i.categories.includes(cat)) && (!pas || i.practiceAreas.some((r) => r.slug === pas)));
      items = [...items].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
      if (params.get("sort") === "oldest") items.reverse();
      return list(items, params);
    }
    const i = insights.find((x) => x.slug === seg[1]);
    if (!i) return null;
    return { data: { ...i, body: pending, videoUrl: null, related: insights.filter((x) => x.id !== i.id).slice(0, 3) } };
  }

  if (seg[0] === "offices") return { data: offices };
  if (seg[0] === "faqs") return { data: faqs };
  if (seg[0] === "jobs") {
    if (!seg[1]) return { data: jobs };
    const j = jobs.find((x) => x.id === seg[1]);
    return j ? { data: j } : null;
  }
  return null;
}
