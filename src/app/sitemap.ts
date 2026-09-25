import type { MetadataRoute } from "next";
import { getInsights, getJobs, getPeople, getPracticeAreas } from "@/lib/api/endpoints";
import { SITE_URL } from "@/lib/env";

export const revalidate = 3600;

async function allPages<T>(fetchPage: (page: number) => Promise<{ data: T[]; meta?: { totalPages: number } }>) {
  const first = await fetchPage(1);
  const out = [...first.data];
  const total = Math.min(first.meta?.totalPages ?? 1, 20);
  for (let p = 2; p <= total; p++) out.push(...(await fetchPage(p)).data);
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = ["", "/about", "/practice-areas", "/people", "/insights", "/careers", "/faq", "/offices"].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  try {
    const [areas, people, insights, jobs] = await Promise.all([
      getPracticeAreas(),
      allPages((page) => getPeople({ page, pageSize: 50 })),
      allPages((page) => getInsights({ page, pageSize: 50 })),
      getJobs(),
    ]);
    return [
      ...statics,
      ...areas.map((a) => ({ url: `${SITE_URL}/practice-areas/${a.slug}`, priority: 0.7 })),
      ...people.map((p) => ({ url: `${SITE_URL}/people/${p.slug}`, priority: 0.6 })),
      ...insights.map((i) => ({ url: `${SITE_URL}/insights/${i.slug}`, lastModified: i.publishedAt ?? undefined, priority: 0.6 })),
      ...jobs.map((j) => ({ url: `${SITE_URL}/careers/${j.id}`, priority: 0.5 })),
    ];
  } catch {
    return statics;
  }
}
