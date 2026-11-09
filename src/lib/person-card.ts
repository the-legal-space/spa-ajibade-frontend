import "server-only";
import type { PersonSummary } from "@/lib/api/schemas";
import { getPerson } from "@/lib/api/endpoints";
import { cleanHtml } from "@/lib/sanitize";
import { personCardSummary } from "@/lib/person-card-summary";

export type PersonCardDetails = {
  /** In API order: the primary area comes first. */
  practiceAreas: { slug: string; title: string }[];
  summary: string | null;
};

/**
 * Extra content for the partner card hover panel (Figma "HOVER ANIMATION"): practice areas and a
 * one-line summary. The list endpoint doesn't carry these, so each profile is read (cached per
 * request and by the API client). A failed read just means a panel without those lines.
 */
export async function getCardDetails(people: PersonSummary[]): Promise<Record<string, PersonCardDetails>> {
  const entries = await Promise.all(
    people.map(async (p) => {
      try {
        const d = await getPerson(p.slug);
        return [
          p.slug,
          {
            practiceAreas: d.practiceAreas,
            summary: personCardSummary(cleanHtml(d.bio), d.quote),
          },
        ] as const;
      } catch {
        return [p.slug, { practiceAreas: p.practiceAreas, summary: null }] as const;
      }
    }),
  );
  return Object.fromEntries(entries);
}
