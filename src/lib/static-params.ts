import "server-only";
import { getInsights, getJobs, getPage, getPeople, getPracticeAreas } from "@/lib/api/endpoints";
import { MOCK_CSR_STORIES } from "@/lib/mock/csr-stories";

/**
 * Lists every page of each dynamic route, for the static export only (scripts/build-static.sh injects
 * `generateStaticParams` that call these). The normal server build never imports this file.
 */
export const staticParams = {
  insights: async () => {
    const slugs: string[] = [];
    for (let page = 1; ; page++) {
      const res = await getInsights({ page, pageSize: 50 });
      slugs.push(...res.data.map((i) => i.slug));
      if (page >= (res.meta?.totalPages ?? 1)) break;
    }
    return [...new Set(slugs)].map((slug) => ({ slug }));
  },
  people: async () => (await getPeople({ pageSize: Infinity })).data.map((p) => ({ slug: p.slug })),
  practiceAreas: async () => (await getPracticeAreas()).map((a) => ({ slug: a.slug })),
  // An empty list counts as "missing" for the export, so with no jobs listed one placeholder page is built (it 404s).
  careers: async () => {
    const ids = (await getJobs()).map((j) => ({ id: String(j.id) }));
    return ids.length > 0 ? ids : [{ id: "none" }];
  },
  recognitions: async () =>
    (await getPage("about")).awardsList.items.filter((i) => i.slug).map((i) => ({ slug: i.slug as string })),
  responsibleBusiness: async () => MOCK_CSR_STORIES.map((s) => ({ slug: s.slug })),
};
