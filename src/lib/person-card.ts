import "server-only";
import type { PersonSummary } from "@/lib/api/schemas";
import { getPerson } from "@/lib/api/endpoints";
import { cleanHtml } from "@/lib/sanitize";
import { isPending } from "@/lib/utils";

export type PersonCardDetails = {
  practiceAreas: { slug: string; title: string }[];
  summary: string | null;
};

function excerpt(html: string | null | undefined, max = 170) {
  if (!html || isPending(html)) return null;
  const text = cleanHtml(html).replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  if (!text) return null;
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.]$/, "")}…`;
}

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
        const quote = d.quote && !isPending(d.quote) ? `“${d.quote.trim().replace(/^“|”$/g, "")}”` : null;
        return [p.slug, { practiceAreas: d.practiceAreas.map((a) => ({ slug: a.slug, title: a.title })), summary: excerpt(d.bio) ?? quote }] as const;
      } catch {
        return [p.slug, { practiceAreas: [], summary: null }] as const;
      }
    }),
  );
  return Object.fromEntries(entries);
}
