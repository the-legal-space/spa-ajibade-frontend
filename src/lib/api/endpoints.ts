import "server-only";
import { cache } from "react";
import { z } from "zod";
import { ApiNotFoundError, apiGet, apiList } from "./client";
import { CURATED_PUBLICATIONS } from "@/lib/curated-publications";
import { MOCK_CSR_CARDS, mockCsrDetail, mockCsrEnabled, withMockGaps } from "@/lib/mock/csr-stories";
import {
  InsightCard,
  InsightCategory,
  InsightDetail,
  JobSchema,
  OfficeSchema,
  PageSchemas,
  PersonDetail,
  PersonSummary,
  PracticeAreaCard,
  PracticeAreaDetail,
  RecognitionDirectoryPage,
  SiteSchema,
  type PageKey,
  type PageOf,
} from "./schemas";

// React.cache dedupes identical calls within one render (layout + page + metadata).

export const getSite = cache(() => apiGet("/site", SiteSchema, { tags: ["site"] }));

export const getPage = cache(<K extends PageKey>(key: K): Promise<PageOf<K>> =>
  apiGet(`/pages/${key}`, PageSchemas[key] as z.ZodTypeAny, { tags: [`page:${key}`] }),
);

export const getPracticeAreas = cache(() =>
  apiList("/practice-areas", PracticeAreaCard, { tags: ["practice-areas"] }).then((r) => r.data),
);

export const getPracticeArea = cache((slug: string) =>
  apiGet(`/practice-areas/${encodeURIComponent(slug)}`, PracticeAreaDetail, {
    tags: ["practice-areas", `practice-area:${slug}`],
  }),
);

export const getPeople = cache(
  (params: { role?: string; practiceArea?: string; sort?: "seniority" | "name_asc" | "name_desc"; page?: number; pageSize?: number }) =>
    apiList("/people", PersonSummary, { query: params, tags: ["people"] }),
);

export const getPerson = cache((slug: string) =>
  apiGet(`/people/${encodeURIComponent(slug)}`, PersonDetail, { tags: ["people", `person:${slug}`] }),
);

export const getInsights = cache(
  (params: {
    category?: z.infer<typeof InsightCategory>;
    practiceArea?: string;
    sort?: "newest" | "oldest";
    page?: number;
    pageSize?: number;
    /** Person slug: only insights whose main author is this attorney. */
    author?: string;
  }) => {
    if (params.author) return byAuthor({ ...params, author: params.author });
    // Pro bono stories only: top the list up with placeholders while the CMS has few (dev/preview only).
    if (params.category === "pro_bono" && mockCsrEnabled()) return withMockStories(params);
    return apiList("/insights", InsightCard, { query: params, tags: ["insights"] });
  },
);

/** Every insight matching the filters: the API caps pages at 50, so walk them all. */
const getAllInsights = cache(async (category?: z.infer<typeof InsightCategory>, practiceArea?: string, sort?: "newest" | "oldest") => {
  const fetchPage = (page: number) =>
    apiList("/insights", InsightCard, { query: { category, practiceArea, sort, page, pageSize: 50 }, tags: ["insights"] });
  const first = await fetchPage(1);
  const rest = await Promise.all(Array.from({ length: Math.max(0, (first.meta?.totalPages ?? 1) - 1) }, (_, i) => fetchPage(i + 2)));
  return [first, ...rest].flatMap((r) => r.data);
});

/** The publications a profile shows: a curated list where one exists, else the API's own (newest first). */
export async function getProfilePublications(person: PersonDetail) {
  const curated = CURATED_PUBLICATIONS[person.slug];
  if (!curated) return (person.recentPublications ?? person.insights ?? []).slice(0, 3);
  const wanted = new Set(curated.profile);
  return (await getAllInsights()).filter((i) => wanted.has(i.slug));
}

async function byAuthor(params: { category?: z.infer<typeof InsightCategory>; practiceArea?: string; sort?: "newest" | "oldest"; page?: number; pageSize?: number; author: string }) {
  // The API has no author filter yet: filter the full list here, then paginate the result.
  // Curated attorneys get their hand-picked list; everyone else gets the insights they are the main author of.
  const curated = CURATED_PUBLICATIONS[params.author];
  const wanted = curated ? new Set([...curated.profile, ...curated.more]) : null;
  const mine = (await getAllInsights(params.category, params.practiceArea, params.sort)).filter((i) =>
    wanted ? wanted.has(i.slug) : i.author.type === "person" && i.author.person.slug === params.author,
  );
  const pageSize = params.pageSize ?? 9;
  const page = params.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(mine.length / pageSize));
  return {
    data: mine.slice((page - 1) * pageSize, page * pageSize),
    meta: { page, pageSize, total: mine.length, totalPages },
  };
}

async function withMockStories(params: { sort?: "newest" | "oldest"; page?: number; pageSize?: number }) {
  // The real set is small: fetch it whole, merge the placeholders in, then paginate the result here.
  const real = await apiList("/insights", InsightCard, { query: { category: "pro_bono", pageSize: 50 }, tags: ["insights"] });
  const pageSize = params.pageSize ?? 9;
  const page = params.page ?? 1;
  const realSlugs = new Set(real.data.map((r) => r.slug));
  const merged = [...real.data, ...MOCK_CSR_CARDS.filter((m) => !realSlugs.has(m.slug))];
  merged.sort((a, b) => {
    const diff = new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime();
    return params.sort === "oldest" ? -diff : diff;
  });
  const totalPages = Math.max(1, Math.ceil(merged.length / pageSize));
  return {
    data: merged.slice((page - 1) * pageSize, page * pageSize),
    meta: { page, pageSize, total: merged.length, totalPages },
  };
}

export const getInsight = cache(async (slug: string) => {
  const mock = mockCsrEnabled();
  try {
    const real = await apiGet(`/insights/${encodeURIComponent(slug)}`, InsightDetail, { tags: ["insights", `insight:${slug}`] });
    return mock ? withMockGaps(real) : real;
  } catch (error) {
    const fallback = mock && error instanceof ApiNotFoundError ? mockCsrDetail(slug) : null;
    if (fallback) return fallback;
    throw error;
  }
});

export const getOffices = cache(() =>
  apiList("/offices", OfficeSchema, { tags: ["offices"] }).then((r) => r.data),
);

export const getJobs = cache(() => apiList("/jobs", JobSchema, { tags: ["jobs"] }).then((r) => r.data));

export const getJob = cache((id: string) =>
  apiGet(`/jobs/${encodeURIComponent(id)}`, JobSchema, { tags: ["jobs", `job:${id}`] }),
);

export const getRecognitionDirectory = cache((slug: string) =>
  apiGet(`/recognitions/${encodeURIComponent(slug)}`, RecognitionDirectoryPage, {
    tags: ["recognitions", `recognition:${slug}`],
  }),
);
