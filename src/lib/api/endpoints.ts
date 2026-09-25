import "server-only";
import { cache } from "react";
import { z } from "zod";
import { apiGet, apiList } from "./client";
import {
  InsightCard,
  InsightCategory,
  InsightDetail,
  JobSchema,
  OfficeSchema,
  PageSchemas,
  PersonDetail,
  PersonRole,
  PersonSummary,
  PracticeAreaCard,
  PracticeAreaDetail,
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
  (params: { role?: PersonRole; sort?: "seniority" | "name_asc" | "name_desc"; page?: number; pageSize?: number }) =>
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
  }) => apiList("/insights", InsightCard, { query: params, tags: ["insights"] }),
);

export const getInsight = cache((slug: string) =>
  apiGet(`/insights/${encodeURIComponent(slug)}`, InsightDetail, { tags: ["insights", `insight:${slug}`] }),
);

export const getOffices = cache(() =>
  apiList("/offices", OfficeSchema, { tags: ["offices"] }).then((r) => r.data),
);

export const getJobs = cache(() => apiList("/jobs", JobSchema, { tags: ["jobs"] }).then((r) => r.data));

export const getJob = cache((id: string) =>
  apiGet(`/jobs/${encodeURIComponent(id)}`, JobSchema, { tags: ["jobs", `job:${id}`] }),
);
