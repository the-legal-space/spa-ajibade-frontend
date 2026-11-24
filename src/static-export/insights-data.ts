// Static export only: scripts/build-static.sh copies this to src/app/data/insights.json/route.ts,
// which the export writes out as /data/insights.json for the Insights page's browser-side filters,
// "View all" on a profile (?author=) and the search box.
import { getAllInsights, getInsight, getPeople } from "@/lib/api/endpoints";
import { CURATED_PUBLICATIONS } from "@/lib/curated-publications";
import type { InsightsIndex } from "@/lib/insights-index";

export const dynamic = "force-static";

/** "Dr. Babatunde Ajibade, SAN, FCIArb" → ["babatunde", "ajibade"]: first and last name, lower case, no accents. */
function nameParts(displayName: string) {
  const words = plain(displayName.replace(/,.*$/, "").replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, "")).split(/\s+/).filter(Boolean);
  return words.length >= 2 ? [words[0]!, words[words.length - 1]!] : null;
}

function plain(text: string) {
  return text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export async function GET() {
  const [items, people] = await Promise.all([getAllInsights(undefined, undefined, "newest"), getPeople({ sort: "name_asc", pageSize: Infinity })]);

  // Co-authors only come on each insight's own response (already fetched for its page). Read them a few at a time.
  const coAuthors = new Map<string, string[]>();
  for (let i = 0; i < items.length; i += 8) {
    await Promise.all(
      items.slice(i, i + 8).map(async (item) => {
        const detail = await getInsight(item.slug).catch(() => null);
        const slugs = (detail?.coAuthors ?? []).flatMap((a) => (a.type === "person" ? [a.person.slug] : []));
        if (slugs.length > 0) coAuthors.set(item.slug, slugs);
      }),
    );
  }

  // Everything each attorney wrote: as main author, as co-author, or named in the title ("... - Peter Olalere").
  const byPerson: Record<string, string[]> = {};
  for (const person of people.data) {
    const parts = nameParts(person.displayName);
    const named = parts ? parts.map((part) => new RegExp(`\\b${part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`)) : [];
    const mine = items.filter(
      (item) =>
        (item.author.type === "person" && item.author.person.slug === person.slug) ||
        coAuthors.get(item.slug)?.includes(person.slug) ||
        (named.length === 2 && named.every((re) => re.test(plain(item.title)))),
    );
    if (mine.length > 0) byPerson[person.slug] = mine.map((item) => item.slug);
  }

  const index: InsightsIndex = {
    // The excerpt isn't shown on listing cards: leaving it out keeps the file smaller.
    items: items.map((card) => ({ ...card, excerpt: null })),
    curated: Object.fromEntries(Object.entries(CURATED_PUBLICATIONS).map(([slug, c]) => [slug, [...c.profile, ...c.more]])),
    byPerson,
    authors: Object.fromEntries(people.data.map((p) => [p.slug, p.displayName])),
  };
  return Response.json(index);
}
