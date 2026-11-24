// Static export only: scripts/build-static.sh copies this to src/app/data/people.json/route.ts,
// which the export writes out as /data/people.json for the People page's browser-side filters.
import { getPage, getPeople } from "@/lib/api/endpoints";
import { getCardDetails } from "@/lib/person-card";
import type { PersonSummary } from "@/lib/api/schemas";
import type { PeopleIndex } from "@/components/static/listings";

export const dynamic = "force-static";

export async function GET() {
  const content = await getPage("people");
  const everyone = new Map<string, PersonSummary>();
  const slugs = (people: PersonSummary[]) => people.map((p) => (everyone.set(p.slug, p), p.slug));
  const list = (params: Parameters<typeof getPeople>[0]) => getPeople({ ...params, pageSize: Infinity }).then((r) => slugs(r.data));

  const [roles, areas, nameAsc, nameDesc] = await Promise.all([
    Promise.all(content.roleFilters.filter((f) => f.value).map(async (f) => [f.value, await list({ role: f.value, sort: "seniority" })] as const)),
    Promise.all(content.practiceAreaFilters.filter((f) => f.value).map(async (f) => [f.value, await list({ practiceArea: f.value, sort: "seniority" })] as const)),
    list({ sort: "name_asc" }),
    list({ sort: "name_desc" }),
  ]);
  const people = [...everyone.values()];
  const index: PeopleIndex = {
    roles: Object.fromEntries(roles),
    areas: Object.fromEntries(areas),
    nameAsc,
    nameDesc,
    people: Object.fromEntries(people.map((p) => [p.slug, p])),
    details: await getCardDetails(people),
  };
  return Response.json(index);
}
