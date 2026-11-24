// Static export only: scripts/build-static.sh copies this to src/app/data/insights.json/route.ts,
// which the export writes out as /data/insights.json for the Insights page's browser-side filters.
import { getAllInsights, getPeople } from "@/lib/api/endpoints";
import { CURATED_PUBLICATIONS } from "@/lib/curated-publications";
import type { InsightsIndex } from "@/components/static/listings";

export const dynamic = "force-static";

export async function GET() {
  const [items, people] = await Promise.all([getAllInsights(undefined, undefined, "newest"), getPeople({ sort: "name_asc", pageSize: Infinity })]);
  const index: InsightsIndex = {
    // The excerpt isn't shown on listing cards: leaving it out keeps the file smaller.
    items: items.map((card) => ({ ...card, excerpt: null })),
    curated: Object.fromEntries(Object.entries(CURATED_PUBLICATIONS).map(([slug, c]) => [slug, [...c.profile, ...c.more]])),
    authors: Object.fromEntries(people.data.map((p) => [p.slug, p.displayName])),
  };
  return Response.json(index);
}
