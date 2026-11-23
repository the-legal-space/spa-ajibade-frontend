import type { ApiImage, Recognition, RecognitionDirectoryPage } from "@/lib/api/schemas";

/**
 * Chambers badges the firm supplied (public/awards/chambers), until they are in the CMS.
 * Once the CMS sends the same badge or award, its entry here changes nothing and can be deleted.
 */
const badge = (file: string, alt: string): ApiImage => ({ url: `/awards/chambers/${file}`, alt, width: 480, height: 403 });

const FIRM_2026 = badge("firm-2026.jpg", "Chambers Global 2026: SPA Ajibade & Co ranked");

/** Badges for awards that are in the CMS without one, keyed by award id. */
const AWARD_BADGES: Record<string, ApiImage> = {
  "6afe2c022a02201296139ca5": FIRM_2026, // Dispute Resolution, Band 3 (2026)
  "6afe2c042a02201296139cb0": FIRM_2026, // Intellectual Property & TMT, Band 4 (2026)
  "6afe2c062a02201296139cbb": badge("babatunde-ajibade-2026.jpg", "Chambers Global 2026: Babatunde Ajibade SAN ranked"),
  "6afe2c082a02201296139cc6": badge("john-onyido-2026.jpg", "Chambers Global 2026: John Onyido ranked"),
};

/** Rankings the CMS doesn't list yet, keyed by directory slug. Titles follow the CMS style ("Chambers Global: ..."). */
const EXTRA_AWARDS: Record<string, Array<{ id: string; title: string; year: number; badge: ApiImage }>> = {
  "chambers-global": [
    { id: "000000000000000000002025", title: "Chambers Global: Ranked Firm", year: 2025, badge: badge("firm-2025.jpg", "Chambers Global 2025: SPA Ajibade & Co ranked") },
    { id: "000000000000000000012025", title: "Chambers Global: Babatunde Ajibade", year: 2025, badge: badge("babatunde-ajibade-2025.jpg", "Chambers Global 2025: Babatunde Ajibade ranked") },
    { id: "000000000000000000022025", title: "Chambers Global: John Onyido", year: 2025, badge: badge("john-onyido-2025.jpg", "Chambers Global 2025: John Onyido ranked") },
    { id: "000000000000000000002024", title: "Chambers Global: Ranked Firm", year: 2024, badge: badge("firm-2024.jpg", "Chambers Global 2024: SPA Ajibade & Co ranked") },
    { id: "000000000000000000012024", title: "Chambers Global: Babatunde Ajibade", year: 2024, badge: badge("babatunde-ajibade-2024.jpg", "Chambers Global 2024: Babatunde Ajibade ranked") },
    { id: "000000000000000000022024", title: "Chambers Global: John Onyido", year: 2024, badge: badge("john-onyido-2024.jpg", "Chambers Global 2024: John Onyido ranked") },
  ],
};

/** A CMS badge always wins; the supplied one only fills a gap. */
export function withAwardBadge<T extends Pick<Recognition, "id" | "badge">>(award: T): T {
  return award.badge?.url || !AWARD_BADGES[award.id] ? award : { ...award, badge: AWARD_BADGES[award.id] };
}

/** Directory page data with supplied badges filled in and missing rankings added, newest year first. */
export function withAwardOverrides(page: RecognitionDirectoryPage): RecognitionDirectoryPage {
  const { name, slug } = page.directory;
  const titles = new Set(page.awards.map((a) => `${a.year}|${a.title}`));
  const extras = (EXTRA_AWARDS[slug] ?? [])
    .filter((a) => !titles.has(`${a.year}|${a.title}`)) // the CMS caught up: use its copy
    .map((a) => ({ ...a, directory: { name, slug } }));
  // Stable sort: within a year the CMS order is kept, and supplied rankings follow the CMS ones.
  const awards = [...page.awards.map(withAwardBadge), ...extras].sort((a, b) => b.year - a.year);
  return { ...page, awards };
}
