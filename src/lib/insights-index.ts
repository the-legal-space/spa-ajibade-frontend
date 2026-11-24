import type { InsightCard as Insight } from "@/lib/api/schemas";

/**
 * /data/insights.json: every insight plus each attorney's publication list, written by the static export
 * (src/static-export/insights-data.ts). The Node build has no such file; callers treat a failed load as "not available".
 */
export type InsightsIndex = {
  /** Every insight, newest first. */
  items: Insight[];
  /** Hand-picked publication lists (lib/curated-publications), keyed by person slug. */
  curated: Record<string, string[]>;
  /** Each attorney's insights as main author, co-author or named in the title, keyed by person slug. */
  byPerson?: Record<string, string[]>;
  /** Display names of everyone with a profile, keyed by slug. */
  authors: Record<string, string>;
};

let pending: Promise<InsightsIndex> | null = null;

/** Loads the file once per page view; a failed load can be retried by the next caller. */
export function loadInsightsIndex() {
  return (pending ??= fetch("/data/insights.json").then((r) => {
    if (!r.ok) throw new Error(`/data/insights.json: ${r.status}`);
    return r.json() as Promise<InsightsIndex>;
  })).catch((error) => {
    pending = null;
    throw error;
  });
}

/**
 * An attorney's publications, newest first: their curated list where one exists, else everything they wrote as main
 * author, co-author or named in the title (byPerson), else (an older file) what they are the main author of.
 */
export function publicationsOf(index: InsightsIndex, personSlug: string) {
  const listed = index.curated[personSlug] ?? index.byPerson?.[personSlug];
  const wanted = listed ? new Set(listed) : null;
  return index.items.filter((i) =>
    wanted ? wanted.has(i.slug) : i.author.type === "person" && i.author.person.slug === personSlug,
  );
}
