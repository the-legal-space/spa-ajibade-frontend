import type { ApiImage } from "@/lib/api/schemas";

/**
 * Images exported from the SPA Ajibade Figma file (public/figma).
 *
 * Content images (people, practice areas, articles, hero, section photos, badges) always come
 * from the CMS first, so the firm can change them without a deploy. The Figma exports are only
 * a fallback for records whose image field is empty. Design textures and icons (map, marks,
 * callout and FAQ backgrounds, social icons) are part of the design and live here for good.
 */
const img = (url: string, width: number, height: number, alt = ""): ApiImage => ({ url, width, height, alt });

export const FIGMA = {
  heroHome: img("/figma/hero-bg.jpg", 2400, 1600, "Statue of Lady Justice in a law library"),
  aboutMap: "/figma/about-map-bg.png",
  videoMark: "/figma/video-mark-bg.png",
  videoPoster: "/figma/video-poster.jpg",
  videoPreview: "/figma/video-preview.webm",
  recognition: img("/figma/recognition.jpg", 1024, 1024, "Lawyer reviewing documents at her desk"),
  whyClients: img("/figma/why-clients.jpg", 1400, 2100, "Lawyer in discussion at his desk"),
  contactCallout: "/figma/contact-callout.jpg",
  faqPanel: "/figma/faq-panel.png",
  firmAvatar: "/figma/firm-avatar.png",
  badges: [
    { src: "/figma/badge-iflr-2024.png", alt: "IFLR1000 Recommended Firm 2024" },
    { src: "/figma/badge-iflr-2024-grey-a.png", overlay: "/figma/badge-iflr-2024-grey-b.png", alt: "IFLR1000 Recommended Firm 2024" },
    { src: "/figma/badge-chambers-2026.png", alt: "Chambers Global 2026, SPA Ajibade & Co ranked" },
    { src: "/figma/badge-chambers-2026.png", alt: "Chambers Global 2026, SPA Ajibade & Co ranked" },
  ],
  social: {
    instagram: "/figma/icons/instagram.svg",
    facebook: "/figma/icons/facebook.svg",
    x: "/figma/icons/x.svg",
    linkedin: "/figma/icons/linkedin.svg",
    youtube: "/figma/icons/youtube.svg",
  },
} as const;

const PEOPLE: Record<string, ApiImage> = {
  "babatunde-ajibade": img("/figma/people/babatunde-ajibade.jpg", 682, 682, "Portrait of Dr. Babatunde Ajibade, SAN"),
  "john-onyido": img("/figma/people/john-onyido.jpg", 900, 900, "Portrait of Dr. John Onyido"),
  "kolawole-mayomi": img("/figma/people/kolawole-mayomi.jpg", 682, 682, "Portrait of Dr. Kolawole Mayomi"),
};

const AVATARS: Record<string, string> = {
  "john-onyido": "/figma/avatar-onyido.png",
  "peter-olalere": "/figma/avatar-olalere.png",
};

const PRACTICE: Record<string, ApiImage> = {
  "corporate-finance-capital-markets": img("/figma/practice-corporate.jpg", 664, 526),
  "data-protection-privacy": img("/figma/practice-data-protection.jpg", 664, 526),
  "energy-natural-resources": img("/figma/practice-energy.jpg", 664, 526),
  "dispute-resolution-arbitration": img("/figma/practice-dispute-resolution.jpg", 811, 588),
  "intellectual-property": img("/figma/practice-intellectual-property.jpg", 810, 588),
  "real-estate-succession": img("/figma/practice-real-estate.jpg", 664, 526),
  tax: img("/figma/practice-tax.jpg", 664, 526),
};

const INSIGHTS: Record<string, ApiImage> = {
  "repositioning-and-promoting-energy-investments-between-south-africa-and-nigeria-a-perspective-on-trade-secrets": img("/figma/insight-1.jpg", 801, 1200),
  "the-rural-electrification-agency-renewable-electricity-and-the-mini-grid-regulation-2026-updates-and-prospects-for-investors": img("/figma/insight-2.jpg", 801, 1200),
  "inside-the-2025-annual-business-luncheon-what-industry-leaders-are-saying-about-nigerias-economy": img("/figma/insight-3.jpg", 874, 542),
  "regulatory-update-on-the-2026-supreme-court-practice-directions": img("/figma/insight-4.jpg", 650, 350),
};

/** CMS photo for a person, or the Figma export when the CMS has none. */
export function personPhoto(slug: string, cms: ApiImage | null | undefined): ApiImage | null {
  return cms?.url ? cms : (PEOPLE[slug] ?? null);
}

/** Small author avatar: CMS photo first, then the Figma avatar or portrait. */
export function personAvatar(slug: string, cms: ApiImage | null | undefined): ApiImage | null {
  if (cms?.url) return cms;
  const a = AVATARS[slug];
  return a ? img(a, 60, 60) : (PEOPLE[slug] ?? null);
}

export function practiceImage(slug: string, cms: ApiImage | null | undefined): ApiImage | null {
  return cms?.url ? cms : (PRACTICE[slug] ?? null);
}

export function insightCover(slug: string, cms: ApiImage | null | undefined): ApiImage | null {
  return cms?.url ? cms : (INSIGHTS[slug] ?? null);
}

/** CMS image when present, otherwise the given Figma fallback. */
export function cmsOr(cms: ApiImage | null | undefined, fallback: ApiImage): ApiImage {
  return cms?.url ? cms : fallback;
}
